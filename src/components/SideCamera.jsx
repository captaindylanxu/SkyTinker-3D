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

    // 平滑跟随，相机稍微拉远一点以便看到分散的零件
    smoothX.current += (targetX + CAMERA_OFFSET_X - smoothX.current) * 0.05;
    // 相机高度跟随飞机，但保持一定距离
    const targetCamY = Math.max(targetY, 8);
    smoothY.current += (targetCamY - smoothY.current) * 0.03;

    // 侧视视角：相机在Z轴上，看向X轴方向
    // 增加相机距离以便看到更大范围
    const cameraZ = CAMERA_OFFSET_Z + 10;
    camera.position.set(smoothX.current, smoothY.current, cameraZ);
    camera.lookAt(smoothX.current + 10, targetY, 0);
  });

  return null;
}

export default SideCamera;
