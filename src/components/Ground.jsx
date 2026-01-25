import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { GROUND_SIZE, BUILD_AREA_LIMIT } from '../constants/gameConstants';

export function Ground({ onPointerMove, onClick, onContextMenu }) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  return (
    <>
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
      
      {/* 建造区域边界指示 */}
      <lineSegments position={[0, 0.02, 0]}>
        <edgesGeometry 
          attach="geometry" 
          args={[new THREE.PlaneGeometry(BUILD_AREA_LIMIT * 2, BUILD_AREA_LIMIT * 2)]} 
        />
        <lineBasicMaterial attach="material" color="#fbbf24" linewidth={2} />
      </lineSegments>
    </>
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
    <>
      {/* 主网格 */}
      <gridHelper
        args={[GROUND_SIZE, GROUND_SIZE, '#718096', '#2d3748']}
        position={[0, 0.01, 0]}
      />
      {/* 建造区域高亮边框 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[BUILD_AREA_LIMIT * 2 - 0.1, BUILD_AREA_LIMIT * 2, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={2} />
      </mesh>
    </>
  );
}

export default Ground;
