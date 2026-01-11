import { Sky, Stars } from '@react-three/drei';

export function Environment() {
  return (
    <>
      {/* 天空盒 */}
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.5}
        azimuth={0.25}
      />
      
      {/* 星星（可选，夜间效果） */}
      <Stars
        radius={100}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
}

export default Environment;
