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
function FlappyVehicle({ parts, onPositionUpdate, onExplode, isExploded, isVIP }) {
  const { addScore, setExploded, setGameOver } = useGameStore();
  const groupRef = useRef();
  const isFlapping = useRef(false);
  
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
  }, []);

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
      hasExploded.current = true;
      isFlapping.current = false;
      
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
    }
  }, [parts, centerOffset, collisionThreshold, onExplode, setExploded, setGameOver]);

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
      addScore(Math.floor(currentPos[0] - lastScoreX.current));
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
  const { vehicleParts, isExploded, isVIP } = useGameStore();
  const [vehiclePos, setVehiclePos] = useState({ x: 0, y: 10 });
  const [explodedParts, setExplodedParts] = useState([]);
  const [explosionPos, setExplosionPos] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);

  const handlePositionUpdate = useCallback((x, y) => {
    setVehiclePos({ x, y });
  }, []);

  const handleExplode = useCallback((parts, position) => {
    setExplodedParts(parts);
    setExplosionPos(position);
    setShowExplosion(true);
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
        isExploded={isExploded}
        isVIP={isVIP}
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
      
      <ObstacleManager vehicleX={vehiclePos.x} />
    </>
  );
}

export default FlightSystem;
