import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FLAPPY_CONFIG } from '../constants/gameConstants';

const { CAMERA_OFFSET_Z, CAMERA_OFFSET_X, CAMERA_HEIGHT } = FLAPPY_CONFIG;

export function SideCamera({ targetX, targetY, frozen = false }) {
  const { camera } = useThree();
  const smoothX = useRef(0);
  const smoothY = useRef(CAMERA_HEIGHT);
  const frozenPos = useRef(null);

  useFrame(() => {
    // 冻结时保持位置
    if (frozen) {
      if (!frozenPos.current) {
        frozenPos.current = { x: smoothX.current, y: smoothY.current };
      }
      return;
    }

    // 平滑跟随
    smoothX.current += (targetX + CAMERA_OFFSET_X - smoothX.current) * 0.05;
    smoothY.current += (Math.max(targetY, 5) - smoothY.current) * 0.03;

    // 侧视视角：相机在Z轴上，看向X轴方向
    camera.position.set(smoothX.current, smoothY.current, CAMERA_OFFSET_Z);
    camera.lookAt(smoothX.current + 10, smoothY.current, 0);
  });

  return null;
}

export default SideCamera;
