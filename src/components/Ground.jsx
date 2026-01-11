import { usePlane } from '@react-three/cannon';
import { GROUND_SIZE } from '../constants/gameConstants';

export function Ground({ onPointerMove, onClick, onContextMenu }) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  return (
    <mesh
      ref={ref}
      receiveShadow
      onPointerMove={onPointerMove}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <meshStandardMaterial color="#4a5568" />
    </mesh>
  );
}

// 无限地面（用于飞行模式）
export function InfiniteGround() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 50]} />
      <meshStandardMaterial color="#2d5a27" />
    </mesh>
  );
}

// 网格辅助线
export function GridHelper() {
  return (
    <gridHelper
      args={[GROUND_SIZE, GROUND_SIZE, '#718096', '#2d3748']}
      position={[0, 0.01, 0]}
    />
  );
}

export default Ground;
