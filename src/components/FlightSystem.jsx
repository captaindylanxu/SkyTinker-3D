import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCompoundBody } from '@react-three/cannon';
import useGameStore from '../store/useGameStore';
import { PART_TYPES, PART_TIERS, PART_STATS, FLAPPY_CONFIG } from '../constants/gameConstants';
import { FuselageModel, EngineModel, WingModel, CockpitModel } from './models/RobloxParts';
import ObstacleManager from './ObstacleManager';
import SideCamera from './SideCamera';
import ExplodedParts from './ExplodedParts';
import ExplosionEffect from './ExplosionEffect';
import { useSound } from '../hooks/useSound';

// 根据零件类型返回对应的 3D 模型
function PartModel({ type, tier }) {
  const isVIP = tier === PART_TIERS.VIP;
  
  switch (type) {
    case PART_TYPES.FUSELAGE:
      return <FuselageModel isVIP={isVIP} />;
    case PART_TYPES.ENGINE:
      return <EngineModel isVIP={isVIP} />;
    case PART_TYPES.WING:
      return <WingModel isVIP={isVIP} />;
    case PART_TYPES.COCKPIT:
      return <CockpitModel isVIP={isVIP} />;
    default:
      return <FuselageModel isVIP={isVIP} />;
  }
}

const {
  FORWARD_SPEED,
  FLAP_FORCE,
  FLAP_TORQUE,
  ANGULAR_DAMPING,
  COLLISION_THRESHOLD_NORMAL,
  COLLISION_THRESHOLD_VIP,
  MAX_HEIGHT,
  MIN_HEIGHT,
} = FLAPPY_CONFIG;

// 获取零件几何参数
const getPartArgs = (type) => {
  switch (type) {
    case PART_TYPES.WING:
      return [2, 0.2, 1];
    case PART_TYPES.ENGINE:
      return [0.6, 0.6, 1.2];
    case PART_TYPES.COCKPIT:
      return [0.8, 0.8, 0.8];
    case PART_TYPES.FUSELAGE:
    default:
      return [1, 1, 1];
  }
};

// 获取零件属性（重量、推力）
const getPartStats = (type, tier = PART_TIERS.NORMAL) => {
  return PART_STATS[type]?.[tier] || { weight: 1, power: 0, color: '#6b7280' };
};

// Flappy Bird 风格载具
function FlappyVehicle({ parts, onPositionUpdate, onExplode, isExploded, isVIP, obstacles = [], onStabilityUpdate }) {
  const { addScore, setExploded, setGameOver } = useGameStore();
  const { playFlap, playCrash, playScore } = useSound();
  const groupRef = useRef();
  const isFlapping = useRef(false);
  const wasFlapping = useRef(false);
  
  const position = useRef([0, 10, 0]);
  const velocity = useRef([0, 0, 0]);
  const lastScoreX = useRef(0);
  const hasExploded = useRef(false);

  // VIP 玩家更耐撞
  const collisionThreshold = isVIP ? COLLISION_THRESHOLD_VIP : COLLISION_THRESHOLD_NORMAL;

  useEffect(() => {
    const handleDown = (e) => {
      if (e.code === 'Space' || e.type === 'mousedown' || e.type === 'touchstart') {
        e.preventDefault();
        if (!isFlapping.current) {
          playFlap();
        }
        isFlapping.current = true;
      }
    };

    const handleUp = (e) => {
      if (e.code === 'Space' || e.type === 'mouseup' || e.type === 'touchend') {
        isFlapping.current = false;
      }
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, [playFlap]);

  // 计算中心偏移（使用加权平均，与物理引擎的重心计算一致）
  const centerOffset = useMemo(() => {
    if (parts.length === 0) return [0, 0, 0];
    
    let sumX = 0, sumY = 0, sumZ = 0;
    let totalWeight = 0;
    
    parts.forEach(part => {
      const stats = getPartStats(part.type, part.tier);
      const weight = stats.weight || 1;
      sumX += part.position[0] * weight;
      sumY += part.position[1] * weight;
      sumZ += part.position[2] * weight;
      totalWeight += weight;
    });
    
    return [sumX / totalWeight, sumY / totalWeight, sumZ / totalWeight];
  }, [parts]);

  // 计算总推力（基于引擎数量和等级）
  const totalPower = useMemo(() => {
    return parts
      .filter(p => p.type === PART_TYPES.ENGINE)
      .reduce((sum, p) => {
        const stats = getPartStats(p.type, p.tier);
        return sum + stats.power;
      }, 0);
  }, [parts]);

  // 计算总升力（基于机翼数量和等级）
  const totalLift = useMemo(() => {
    return parts
      .filter(p => p.type === PART_TYPES.WING)
      .reduce((sum, p) => {
        const stats = getPartStats(p.type, p.tier);
        return sum + (stats.lift || 0);
      }, 0);
  }, [parts]);

  // 检查是否有驾驶座
  const hasCockpit = useMemo(() => {
    return parts.some(p => p.type === PART_TYPES.COCKPIT);
  }, [parts]);

  // 检查是否有引擎
  const hasEngine = totalPower > 0;
  
  // 检查是否可以飞行（需要驾驶座和引擎）
  const canFly = hasEngine && hasCockpit;

  // 计算飞行器的稳定性
  const stability = useMemo(() => {
    if (parts.length === 0) return { score: 0, balanced: false, wingBalance: 0 };
    
    // 计算重心
    let centerX = 0, centerY = 0, centerZ = 0;
    let totalWeight = 0;
    
    parts.forEach(part => {
      const stats = getPartStats(part.type, part.tier);
      const weight = stats.weight || 1;
      centerX += part.position[0] * weight;
      centerY += part.position[1] * weight;
      centerZ += part.position[2] * weight;
      totalWeight += weight;
    });
    
    centerX /= totalWeight;
    centerY /= totalWeight;
    centerZ /= totalWeight;
    
    // 计算机翼平衡（左右对称性）
    const wings = parts.filter(p => p.type === PART_TYPES.WING);
    let wingBalance = 1.0;
    
    if (wings.length > 0) {
      // 计算机翼相对于重心的Z轴偏移
      const wingOffsets = wings.map(w => w.position[2] - centerZ);
      const leftWings = wingOffsets.filter(z => z < -0.5).length;
      const rightWings = wingOffsets.filter(z => z > 0.5).length;
      const centerWings = wingOffsets.filter(z => Math.abs(z) <= 0.5).length;
      
      // 对称性越好，平衡度越高
      if (leftWings > 0 && rightWings > 0) {
        const ratio = Math.min(leftWings, rightWings) / Math.max(leftWings, rightWings);
        wingBalance = 0.5 + ratio * 0.5; // 0.5-1.0
      } else if (centerWings > 0) {
        wingBalance = 0.7; // 中间机翼提供一些稳定性
      } else {
        wingBalance = 0.3; // 单侧机翼很不稳定
      }
    } else {
      wingBalance = 0.2; // 没有机翼非常不稳定
    }
    
    // 计算质量分布的均匀性
    let massDistribution = 0;
    parts.forEach(part => {
      const stats = getPartStats(part.type, part.tier);
      const weight = stats.weight || 1;
      const dx = part.position[0] - centerX;
      const dy = part.position[1] - centerY;
      const dz = part.position[2] - centerZ;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      massDistribution += distance * weight;
    });
    massDistribution /= totalWeight;
    
    // 质量分布越均匀越好（但不能太集中）
    const distributionScore = Math.min(1.0, massDistribution / 2.0);
    
    // 综合稳定性评分 (0-1)
    const score = (wingBalance * 0.6 + distributionScore * 0.4);
    
    return {
      score,
      balanced: score > 0.6,
      wingBalance,
      centerOfMass: [centerX, centerY, centerZ],
    };
  }, [parts]);

  // 根据稳定性调整角阻尼
  const effectiveAngularDamping = useMemo(() => {
    // 稳定性越高，角阻尼越大，飞行器越不容易翻转
    const baseAngularDamping = ANGULAR_DAMPING;
    const stabilityMultiplier = 0.3 + stability.score * 1.5; // 0.3-1.8倍
    return baseAngularDamping * stabilityMultiplier;
  }, [stability]);

  // 更新稳定性评分到父组件
  useEffect(() => {
    if (onStabilityUpdate) {
      onStabilityUpdate(stability);
    }
  }, [stability, onStabilityUpdate]);

  // 计算总质量（基于零件等级）
  const totalMass = useMemo(() => 
    parts.reduce((sum, p) => {
      const stats = getPartStats(p.type, p.tier);
      return sum + stats.weight;
    }, 0),
    [parts]
  );

  // 构建复合形状
  const shapes = useMemo(() => {
    return parts.map(part => {
      const args = getPartArgs(part.type);
      return {
        type: 'Box',
        position: [
          part.position[0] - centerOffset[0],
          part.position[1] - centerOffset[1],
          part.position[2] - centerOffset[2]
        ],
        rotation: part.rotation || [0, 0, 0],
        args,
      };
    });
  }, [parts, centerOffset]);

  // 处理碰撞
  const handleCollide = useCallback((e) => {
    if (hasExploded.current) return;
    
    const vel = velocity.current;
    const speed = Math.sqrt(vel[0] ** 2 + vel[1] ** 2 + vel[2] ** 2);
    
    // VIP 玩家碰撞阈值更高
    if (speed > collisionThreshold) {
      triggerExplosion();
    }
  }, [parts, centerOffset, collisionThreshold, onExplode, setExploded, setGameOver, playCrash]);

  // 触发爆炸的统一函数
  const triggerExplosion = useCallback(() => {
    if (hasExploded.current) return;
    
    hasExploded.current = true;
    isFlapping.current = false;
    playCrash();
    
    const pos = position.current;
    const explodedParts = parts.map(part => ({
      ...part,
      worldPosition: [
        pos[0] + part.position[0] - centerOffset[0],
        pos[1] + part.position[1] - centerOffset[1],
        pos[2] + part.position[2] - centerOffset[2],
      ]
    }));
    
    setExploded();
    onExplode(explodedParts, [...pos]);
    
    setTimeout(() => setGameOver(), 1500);
  }, [parts, centerOffset, onExplode, setExploded, setGameOver, playCrash]);

  // 备用碰撞检测（基于位置，用于移动端）
  const checkManualCollision = useCallback((pos) => {
    if (hasExploded.current || !obstacles || obstacles.length === 0) return false;
    
    const vehicleRadius = isVIP ? 2.5 : 1.5; // VIP 有更大的容错
    
    for (const obs of obstacles) {
      // 检查是否在障碍物的 X 范围内
      const obstacleHalfWidth = 1.5; // OBSTACLE_WIDTH / 2
      if (Math.abs(pos[0] - obs.x) < obstacleHalfWidth + vehicleRadius) {
        // 检查是否在缝隙外
        const gapTop = obs.gapY + obs.gapSize / 2;
        const gapBottom = obs.gapY - obs.gapSize / 2;
        
        if (pos[1] > gapTop - vehicleRadius || pos[1] < gapBottom + vehicleRadius) {
          return true; // 碰撞了
        }
      }
    }
    return false;
  }, [obstacles, isVIP]);

  // 创建复合刚体
  const [, api] = useCompoundBody(() => ({
    mass: totalMass,
    position: [0, 10, 0],
    shapes,
    linearDamping: 0.1,
    angularDamping: effectiveAngularDamping,
    onCollide: handleCollide,
  }), groupRef, [shapes, totalMass, effectiveAngularDamping]);

  useEffect(() => {
    const unsubPos = api.position.subscribe((p) => {
      position.current = p;
      onPositionUpdate(p[0], p[1]);
    });
    const unsubVel = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    
    return () => {
      unsubPos();
      unsubVel();
    };
  }, [api, onPositionUpdate]);

  useFrame(() => {
    if (hasExploded.current || isExploded) return;

    const currentVel = velocity.current;
    const currentPos = position.current;

    // 备用碰撞检测（针对移动端物理引擎可能失效的情况）
    if (checkManualCollision(currentPos)) {
      triggerExplosion();
      return;
    }

    // 高度限制
    let clampedY = currentPos[1];
    let clampedVelY = currentVel[1];
    
    if (currentPos[1] > MAX_HEIGHT) {
      clampedY = MAX_HEIGHT;
      clampedVelY = Math.min(clampedVelY, 0); // 阻止继续上升
    }
    if (currentPos[1] < MIN_HEIGHT) {
      clampedY = MIN_HEIGHT;
    }

    api.velocity.set(FORWARD_SPEED, clampedVelY, 0);

    // 锁定Z轴位置和高度限制
    if (Math.abs(currentPos[2]) > 0.1 || currentPos[1] !== clampedY) {
      api.position.set(currentPos[0], clampedY, 0);
    }

    if (currentPos[0] - lastScoreX.current >= 1) {
      const points = Math.floor(currentPos[0] - lastScoreX.current);
      addScore(points);
      if (points > 0) playScore();
      lastScoreX.current = currentPos[0];
    }

    // 如果没有驾驶座或引擎，无法飞行
    if (!canFly) {
      // 快速下坠
      api.applyForce([0, -totalMass * 5, 0], [0, 0, 0]);
      return;
    }

    // 推力基于引擎总功率，但在高度上限时不施加向上的力
    if (isFlapping.current && hasEngine && currentPos[1] < MAX_HEIGHT) {
      const flapPower = FLAP_FORCE * totalPower;
      api.applyForce([0, flapPower, 0], [0, 0, 0]);
      
      // 根据稳定性调整扭矩
      // 稳定性低的飞行器会产生更大的旋转
      const torqueMultiplier = 2.0 - stability.score; // 1.0-2.0倍
      api.applyTorque([0, 0, FLAP_TORQUE * torqueMultiplier]);
    } else {
      // 稳定性高的飞行器会自动回正
      const stabilizingTorque = -FLAP_TORQUE * 0.3 * stability.score;
      api.applyTorque([0, 0, stabilizingTorque]);
    }

    // 机翼提供持续升力（抵消部分重力）
    // 升力与速度相关，速度越快升力越大
    if (totalLift > 0) {
      const speed = Math.abs(currentVel[0]);
      const liftForce = totalLift * speed * 0.8; // 升力系数
      api.applyForce([0, liftForce, 0], [0, 0, 0]);
      
      // 机翼还提供稳定力矩（抵抗翻转）
      // 这模拟了机翼的气动稳定性
      if (stability.wingBalance > 0.5) {
        const stabilizingForce = (stability.wingBalance - 0.5) * 2.0 * speed;
        api.applyTorque([0, 0, -stabilizingForce * 0.5]);
      }
    }
  });

  if (isExploded) return null;

  return (
    <group ref={groupRef}>
      {/* 旋转整个载具，让机头朝向前进方向（X轴正方向） */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        {parts.map((part, index) => {
          const localPos = [
            part.position[0] - centerOffset[0],
            part.position[1] - centerOffset[1],
            part.position[2] - centerOffset[2]
          ];

          return (
            <group
              key={part.id || index}
              position={localPos}
              rotation={part.rotation || [0, 0, 0]}
            >
              <PartModel type={part.type} tier={part.tier} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function FlightSystem() {
  const { vehicleParts, isExploded, isVIP, setExploded, setGameOver, setStabilityScore } = useGameStore();
  const [vehiclePos, setVehiclePos] = useState({ x: 0, y: 10 });
  const [explodedParts, setExplodedParts] = useState([]);
  const [explosionPos, setExplosionPos] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const hasTriggeredExplosion = useRef(false);

  const handlePositionUpdate = useCallback((x, y) => {
    setVehiclePos({ x, y });
  }, []);

  const handleExplode = useCallback((parts, position) => {
    setExplodedParts(parts);
    setExplosionPos(position);
    setShowExplosion(true);
  }, []);

  // 处理稳定性更新
  const handleStabilityUpdate = useCallback((stability) => {
    setStabilityScore(stability.score);
  }, [setStabilityScore]);

  // 注册障碍物位置（用于备用碰撞检测）
  const registerObstacle = useCallback((obs) => {
    setObstacles(prev => {
      const exists = prev.find(o => o.id === obs.id);
      if (exists) return prev;
      return [...prev, obs];
    });
  }, []);

  const unregisterObstacle = useCallback((id) => {
    setObstacles(prev => prev.filter(o => o.id !== id));
  }, []);

  if (vehicleParts.length === 0) return null;

  return (
    <>
      <SideCamera 
        targetX={vehiclePos.x} 
        targetY={vehiclePos.y} 
        frozen={isExploded}
      />
      
      <FlappyVehicle 
        parts={vehicleParts} 
        onPositionUpdate={handlePositionUpdate}
        onExplode={handleExplode}
        onStabilityUpdate={handleStabilityUpdate}
        isExploded={isExploded}
        isVIP={isVIP}
        obstacles={obstacles}
      />
      
      {isExploded && explodedParts.length > 0 && explosionPos && (
        <ExplodedParts 
          parts={explodedParts} 
          explosionCenter={explosionPos}
        />
      )}
      
      {showExplosion && explosionPos && (
        <ExplosionEffect 
          position={explosionPos} 
          onComplete={() => setShowExplosion(false)}
        />
      )}
      
      <ObstacleManager 
        vehicleX={vehiclePos.x}
        onRegisterObstacle={registerObstacle}
        onUnregisterObstacle={unregisterObstacle}
      />
    </>
  );
}

export default FlightSystem;
