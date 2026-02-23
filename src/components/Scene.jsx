import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import useGameStore from '../store/useGameStore';
import { GAME_MODES, FLAPPY_CONFIG } from '../constants/gameConstants';
import Environment from './Environment';
import BuildingSystem from './BuildingSystem';
import FlightSystem from './FlightSystem';
import { Ground, GridHelper, InfiniteGround } from './Ground';
import StageIndicator from './UI/StageIndicator';

function SceneContent() {
  const { gameMode } = useGameStore();
  const isBuildMode = gameMode === GAME_MODES.BUILD_MODE;

  return (
    <>
      {/* 环境（天空、灯光） */}
      <Suspense fallback={null}>
        <Environment />
      </Suspense>

      {/* 物理世界 - 使用 key 强制重新创建 */}
      <Physics 
        key={gameMode} 
        gravity={[0, FLAPPY_CONFIG.GRAVITY, 0]} 
        defaultContactMaterial={{ friction: 0.5, restitution: 0.1 }}
      >
        {/* 建造模式 */}
        {isBuildMode && (
          <>
            <BuildingSystem />
            <GridHelper />
          </>
        )}
        
        {/* 飞行模式 */}
        {!isBuildMode && (
          <>
            <InfiniteGround />
            <FlightSystem />
          </>
        )}
      </Physics>

      {/* 相机控制器 - 仅建造模式 */}
      {isBuildMode && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      )}
    </>
  );
}

export function Scene() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [10, 10, 25], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <SceneContent />
      </Canvas>
      <StageIndicator />
    </>
  );
}

export default Scene;
