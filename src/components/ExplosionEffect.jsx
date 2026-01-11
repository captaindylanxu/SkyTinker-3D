import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 单个爆炸粒子
function Particle({ position, velocity, color, size }) {
  const ref = useRef();
  const vel = useRef(new THREE.Vector3(...velocity));
  const life = useRef(1);

  useFrame((_, delta) => {
    if (!ref.current) return;
    
    // 更新位置
    ref.current.position.add(vel.current.clone().multiplyScalar(delta));
    
    // 重力
    vel.current.y -= 15 * delta;
    
    // 衰减
    life.current -= delta * 0.8;
    ref.current.scale.setScalar(Math.max(0, life.current) * size);
    
    // 旋转
    ref.current.rotation.x += delta * 5;
    ref.current.rotation.y += delta * 3;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function ExplosionEffect({ position, onComplete }) {
  const [particles, setParticles] = useState([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 生成粒子
    const newParticles = [];
    const colors = ['#ff6b35', '#f7c59f', '#ffaa00', '#ff4444', '#ffffff'];
    
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.3) * Math.PI;
      const speed = 5 + Math.random() * 15;
      
      newParticles.push({
        id: i,
        position: [...position],
        velocity: [
          Math.cos(angle) * Math.cos(elevation) * speed,
          Math.sin(elevation) * speed + 5,
          Math.sin(angle) * Math.cos(elevation) * speed,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.2 + Math.random() * 0.4,
      });
    }
    
    setParticles(newParticles);
  }, [position]);

  useFrame(() => {
    // 2秒后清除
    if (Date.now() - startTime.current > 2000) {
      onComplete?.();
    }
  });

  return (
    <group>
      {particles.map(p => (
        <Particle
          key={p.id}
          position={p.position}
          velocity={p.velocity}
          color={p.color}
          size={p.size}
        />
      ))}
    </group>
  );
}

export default ExplosionEffect;
