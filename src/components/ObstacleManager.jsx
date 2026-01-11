import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import useGameStore from '../store/useGameStore';
import { FLAPPY_CONFIG } from '../constants/gameConstants';

const {
  OBSTACLE_SPAWN_DISTANCE,
  OBSTACLE_SPACING,
  OBSTACLE_WIDTH,
  OBSTACLE_HEIGHT,
  GAP_SIZE_NORMAL,
  GAP_SIZE_VIP,
  GAP_MIN_Y,
  GAP_MAX_Y,
  CLEANUP_DISTANCE,
} = FLAPPY_CONFIG;

// 单个障碍物管子
function ObstaclePipe({ position, height, isTop }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [
      position[0],
      isTop ? position[1] + height / 2 : position[1] - height / 2,
      0
    ],
    args: [OBSTACLE_WIDTH, height, OBSTACLE_WIDTH],
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[OBSTACLE_WIDTH, height, OBSTACLE_WIDTH]} />
      <meshStandardMaterial color={isTop ? '#16a34a' : '#15803d'} />
    </mesh>
  );
}

// 一对障碍物（上下管子）
function ObstaclePair({ x, gapY, gapSize }) {
  const topPipeBottom = gapY + gapSize / 2;
  const topPipeHeight = OBSTACLE_HEIGHT;
  
  const bottomPipeTop = gapY - gapSize / 2;
  const bottomPipeHeight = bottomPipeTop;

  return (
    <group>
      <ObstaclePipe
        position={[x, topPipeBottom, 0]}
        height={topPipeHeight}
        isTop={true}
      />
      {bottomPipeHeight > 0 && (
        <ObstaclePipe
          position={[x, bottomPipeTop, 0]}
          height={bottomPipeHeight}
          isTop={false}
        />
      )}
      <mesh position={[x, gapY, 0]}>
        <boxGeometry args={[0.5, gapSize, OBSTACLE_WIDTH]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export function ObstacleManager({ vehicleX }) {
  const [obstacles, setObstacles] = useState([]);
  const lastSpawnX = useRef(OBSTACLE_SPAWN_DISTANCE);
  const { isVIP } = useGameStore();

  // VIP 玩家获得更大的缝隙
  const gapSize = isVIP ? GAP_SIZE_VIP : GAP_SIZE_NORMAL;

  useFrame(() => {
    const spawnThreshold = vehicleX + OBSTACLE_SPAWN_DISTANCE;
    
    if (spawnThreshold > lastSpawnX.current) {
      const newX = lastSpawnX.current + OBSTACLE_SPACING;
      const gapY = GAP_MIN_Y + Math.random() * (GAP_MAX_Y - GAP_MIN_Y);
      
      setObstacles(prev => [...prev, {
        id: Date.now(),
        x: newX,
        gapY,
        gapSize,
      }]);
      
      lastSpawnX.current = newX;
    }

    setObstacles(prev => 
      prev.filter(obs => obs.x > vehicleX - CLEANUP_DISTANCE)
    );
  });

  useEffect(() => {
    return () => {
      setObstacles([]);
      lastSpawnX.current = OBSTACLE_SPAWN_DISTANCE;
    };
  }, []);

  return (
    <group>
      {obstacles.map(obs => (
        <ObstaclePair
          key={obs.id}
          x={obs.x}
          gapY={obs.gapY}
          gapSize={obs.gapSize}
        />
      ))}
    </group>
  );
}

export default ObstacleManager;
