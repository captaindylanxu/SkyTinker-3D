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
function FlappyVehicle({ parts, onPositionUpdate, onExplode, isExploded, isVIP, obstacles = [] }) {
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

  // 计算中心偏移
  const centerOffset = useMemo(() => {
    if (parts.length === 0) return [0, 0, 0];
    
    let sumX = 0, sumY = 0, sumZ = 0;
    parts.forEach(part => {
      sumX += part.position[0];
      sumY += part.position[1];
      sumZ += part.position[2];
    });
    
    return [sumX / parts.length, sumY / parts.length, sumZ / parts.length];
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

  // 检查是否有引擎
  const hasEngine = totalPower > 0;

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
    angularDamping: ANGULAR_DAMPING,
    onCollide: handleCollide,
  }), groupRef, [shapes, totalMass]);

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

    // 推力基于引擎总功率，但在高度上限时不施加向上的力
    if (isFlapping.current && hasEngine && currentPos[1] < MAX_HEIGHT) {
      const flapPower = FLAP_FORCE * totalPower;
      api.applyForce([0, flapPower, 0], [0, 0, 0]);
      api.applyTorque([0, 0, FLAP_TORQUE]);
    } else {
      api.applyTorque([0, 0, -FLAP_TORQUE * 0.3]);
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
  const { vehicleParts, isExploded, isVIP, setExploded, setGameOver, isReviving, clearReviving, score } = useGameStore();
  const [vehiclePos, setVehiclePos] = useState({ x: 0, y: 10 });
  const [explodedParts, setExplodedParts] = useState([]);
  const [explosionPos, setExplosionPos] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [reviveKey, setReviveKey] = useState(0); // 用于强制重新挂载FlappyVehicle
  const hasTriggeredExplosion = useRef(false);

  const handlePositionUpdate = useCallback((x, y) => {
    setVehiclePos({ x, y });
  }, []);

  const handleExplode = useCallback((parts, position) => {
    setExplodedParts(parts);
    setExplosionPos(position);
    setShowExplosion(true);
  }, []);

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

  // 处理续命：重新挂载飞行器
  useEffect(() => {
    if (isReviving) {
      setExplodedParts([]);
      setExplosionPos(null);
      setShowExplosion(false);
      setObstacles([]);
      hasTriggeredExplosion.current = false;
      setReviveKey(prev => prev + 1);
      clearReviving();
    }
  }, [isReviving, clearReviving]);

  if (vehicleParts.length === 0) return null;

  return (
    <>
      <SideCamera 
        targetX={vehiclePos.x} 
        targetY={vehiclePos.y} 
        frozen={isExploded}
      />
      
      <FlappyVehicle 
        key={reviveKey}
        parts={vehicleParts} 
        onPositionUpdate={handlePositionUpdate}
        onExplode={handleExplode}
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
