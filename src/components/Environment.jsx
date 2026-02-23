import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/useGameStore';
import { LEVEL_CONFIG } from '../constants/gameConstants';

// Initial theme (stage 1)
const INITIAL_THEME = LEVEL_CONFIG.BACKGROUND_THEMES[1];

export function Environment() {
  const getCurrentBackgroundTheme = useGameStore((s) => s.getCurrentBackgroundTheme);
  const currentStage = useGameStore((s) => s.currentStage);

  // Refs for smooth interpolation
  const currentValues = useRef({
    sunX: INITIAL_THEME.sky.sunPosition[0],
    sunY: INITIAL_THEME.sky.sunPosition[1],
    sunZ: INITIAL_THEME.sky.sunPosition[2],
    inclination: INITIAL_THEME.sky.inclination,
    azimuth: INITIAL_THEME.sky.azimuth,
    ambientIntensity: INITIAL_THEME.ambientIntensity,
    directionalIntensity: INITIAL_THEME.directionalIntensity,
    starsCount: INITIAL_THEME.stars.count,
    starsFade: INITIAL_THEME.stars.fade,
    starsSpeed: INITIAL_THEME.stars.speed,
  });

  const targetThemeRef = useRef(INITIAL_THEME);
  const prevStageRef = useRef(currentStage);

  // R3F component refs
  const skyRef = useRef();
  const starsRef = useRef();
  const ambientRef = useRef();
  const directionalRef = useRef();

  // Update target when stage changes
  if (currentStage !== prevStageRef.current) {
    targetThemeRef.current = getCurrentBackgroundTheme();
    prevStageRef.current = currentStage;
  }

  useFrame((_, delta) => {
    const target = targetThemeRef.current;
    const cur = currentValues.current;
    const duration = LEVEL_CONFIG.BG_TRANSITION_DURATION;
    // lerp factor: approach target over `duration` seconds
    const alpha = Math.min(1, delta / duration);

    // Lerp sky parameters
    cur.sunX = THREE.MathUtils.lerp(cur.sunX, target.sky.sunPosition[0], alpha);
    cur.sunY = THREE.MathUtils.lerp(cur.sunY, target.sky.sunPosition[1], alpha);
    cur.sunZ = THREE.MathUtils.lerp(cur.sunZ, target.sky.sunPosition[2], alpha);
    cur.inclination = THREE.MathUtils.lerp(cur.inclination, target.sky.inclination, alpha);
    cur.azimuth = THREE.MathUtils.lerp(cur.azimuth, target.sky.azimuth, alpha);

    // Lerp light intensities
    cur.ambientIntensity = THREE.MathUtils.lerp(cur.ambientIntensity, target.ambientIntensity, alpha);
    cur.directionalIntensity = THREE.MathUtils.lerp(cur.directionalIntensity, target.directionalIntensity, alpha);

    // Lerp stars parameters (count is integer, fade is boolean snap)
    cur.starsCount = Math.round(THREE.MathUtils.lerp(cur.starsCount, target.stars.count, alpha));
    cur.starsFade = target.stars.fade; // boolean — snap to target
    cur.starsSpeed = THREE.MathUtils.lerp(cur.starsSpeed, target.stars.speed, alpha);

    // Apply to Sky
    if (skyRef.current) {
      skyRef.current.material.uniforms.sunPosition.value.set(cur.sunX, cur.sunY, cur.sunZ);
      if (skyRef.current.material.uniforms.inclination) {
        skyRef.current.material.uniforms.inclination.value = cur.inclination;
      }
      if (skyRef.current.material.uniforms.azimuth) {
        skyRef.current.material.uniforms.azimuth.value = cur.azimuth;
      }
    }

    // Apply to lights
    if (ambientRef.current) {
      ambientRef.current.intensity = cur.ambientIntensity;
    }
    if (directionalRef.current) {
      directionalRef.current.intensity = cur.directionalIntensity;
    }
  });

  const cur = currentValues.current;

  return (
    <>
      {/* 天空盒 */}
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={[cur.sunX, cur.sunY, cur.sunZ]}
        inclination={cur.inclination}
        azimuth={cur.azimuth}
      />

      {/* 星星 */}
      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={cur.starsCount}
        factor={4}
        saturation={0}
        fade={cur.starsFade}
        speed={cur.starsSpeed}
      />

      {/* 环境光 */}
      <ambientLight ref={ambientRef} intensity={cur.ambientIntensity} />

      {/* 主光源 */}
      <directionalLight
        ref={directionalRef}
        position={[10, 20, 10]}
        intensity={cur.directionalIntensity}
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
