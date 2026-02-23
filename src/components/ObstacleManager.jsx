import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import useGameStore from '../store/useGameStore';
import { FLAPPY_CONFIG, LEVEL_CONFIG, getThemeByStage } from '../constants/gameConstants';

const {
  OBSTACLE_SPAWN_DISTANCE,
  OBSTACLE_WIDTH,
  OBSTACLE_HEIGHT,
  CLEANUP_DISTANCE,
} = FLAPPY_CONFIG;

// 单个障碍物管子 - 使用稳定的 key 和位置
function ObstaclePipe({ x, y, height, isTop, colorTheme }) {
  const actualY = isTop ? y + height / 2 : y - height / 2;
  
  // 使用 colorTheme 决定管子颜色，回退到默认绿色
  const color = colorTheme
    ? (isTop ? colorTheme.top : colorTheme.bottom)
    : (isTop ? '#16a34a' : '#15803d');

  const [ref] = useBox(() => ({
    type: 'Static',
    position: [x, actualY, 0],
    args: [OBSTACLE_WIDTH, height, OBSTACLE_WIDTH],
    // 增加碰撞检测的精度
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
  }), undefined, [x, actualY, height]);

  return (
    <mesh 
      ref={ref} 
      position={[x, actualY, 0]}
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[OBSTACLE_WIDTH, height, OBSTACLE_WIDTH]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 一对障碍物（上下管子）- 使用 memo 避免不必要的重渲染
function ObstaclePair({ id, x, gapY, gapSize, colorTheme }) {
  const topPipeBottom = gapY + gapSize / 2;
  const topPipeHeight = OBSTACLE_HEIGHT;
  
  const bottomPipeTop = gapY - gapSize / 2;
  const bottomPipeHeight = Math.max(0, bottomPipeTop);

  return (
    <group key={id}>
      {/* 上方管子 */}
      <ObstaclePipe
        x={x}
        y={topPipeBottom}
        height={topPipeHeight}
        isTop={true}
        colorTheme={colorTheme}
      />
      {/* 下方管子 */}
      {bottomPipeHeight > 0.5 && (
        <ObstaclePipe
          x={x}
          y={bottomPipeTop}
          height={bottomPipeHeight}
          isTop={false}
          colorTheme={colorTheme}
        />
      )}
      {/* 缝隙指示器（可选，调试用） */}
      <mesh position={[x, gapY, 0]}>
        <boxGeometry args={[0.3, gapSize * 0.8, OBSTACLE_WIDTH * 0.5]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export function ObstacleManager({ vehicleX, onRegisterObstacle, onUnregisterObstacle }) {
  const [obstacles, setObstacles] = useState([]);
  const lastSpawnX = useRef(OBSTACLE_SPAWN_DISTANCE);
  const obstacleIdRef = useRef(0);
  const { isVIP, currentStage, getCurrentDifficultyProfile } = useGameStore();

  // 生成新障碍物
  useFrame(() => {
    const spawnThreshold = vehicleX + OBSTACLE_SPAWN_DISTANCE;
    
    if (spawnThreshold > lastSpawnX.current) {
      // 获取当前关卡的难度配置
      const difficultyProfile = getCurrentDifficultyProfile();
      const gapSize = isVIP ? difficultyProfile.gapSize.vip : difficultyProfile.gapSize.normal;
      const spacing = difficultyProfile.spacing;
      const [gapMinY, gapMaxY] = difficultyProfile.gapYRange;

      // 获取当前关卡的颜色主题
      const colorTheme = getThemeByStage(currentStage, LEVEL_CONFIG.OBSTACLE_COLOR_THEMES);

      const newX = lastSpawnX.current + spacing;
      const gapY = gapMinY + Math.random() * (gapMaxY - gapMinY);
      
      obstacleIdRef.current += 1;
      
      const newObstacle = {
        id: obstacleIdRef.current,
        x: newX,
        gapY,
        gapSize,
        colorTheme,
      };
      
      setObstacles(prev => [...prev, newObstacle]);
      
      // 注册障碍物用于备用碰撞检测
      if (onRegisterObstacle) {
        onRegisterObstacle(newObstacle);
      }
      
      lastSpawnX.current = newX;
    }

    // 清理已经过去的障碍物
    setObstacles(prev => {
      const toRemove = prev.filter(obs => obs.x <= vehicleX - CLEANUP_DISTANCE);
      const toKeep = prev.filter(obs => obs.x > vehicleX - CLEANUP_DISTANCE);
      
      // 注销被清理的障碍物
      if (onUnregisterObstacle) {
        toRemove.forEach(obs => onUnregisterObstacle(obs.id));
      }
      
      return toKeep;
    });
  });

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      setObstacles([]);
      lastSpawnX.current = OBSTACLE_SPAWN_DISTANCE;
      obstacleIdRef.current = 0;
    };
  }, []);

  return (
    <group>
      {obstacles.map(obs => (
        <ObstaclePair
          key={`obstacle-${obs.id}`}
          id={obs.id}
          x={obs.x}
          gapY={obs.gapY}
          gapSize={obs.gapSize}
          colorTheme={obs.colorTheme}
        />
      ))}
    </group>
  );
}

export default ObstacleManager;
