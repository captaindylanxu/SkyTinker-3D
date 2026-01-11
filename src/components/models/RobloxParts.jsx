import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Roblox 风格颜色配置
const COLORS = {
  // 机身颜色
  fuselageBlue: '#2563eb',
  fuselageOrange: '#ea580c',
  fuselageBrown: '#78350f',
  
  // 引擎颜色
  engineRed: '#dc2626',
  engineYellow: '#eab308',
  engineRing: '#0ea5e9',
  
  // 机翼颜色
  wingBlue: '#3b82f6',
  wingTip: '#f97316',
  
  // 驾驶座颜色
  cockpitBrown: '#92400e',
  goggleLens: '#67e8f9',
  goggleFrame: '#ca8a04',
  skin: '#fcd9b6',
  scarf: '#f5f5f4',
  
  // VIP 金色
  gold: '#ffd700',
  goldDark: '#b8860b',
};

// ==================== 机身 (Fuselage) ====================
export function FuselageModel({ isVIP = false }) {
  const color = isVIP ? COLORS.gold : COLORS.fuselageBlue;
  const accentColor = isVIP ? COLORS.goldDark : COLORS.fuselageOrange;
  
  return (
    <group>
      {/* 主体方块 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* 顶部装饰条 */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.95, 0.15, 0.95]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      
      {/* 底部装饰条 */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.95, 0.15, 0.95]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      
      {/* 侧面铆钉装饰 */}
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0, 0.46]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
          <meshStandardMaterial color={COLORS.fuselageBrown} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ==================== 引擎 (Engine) - 螺旋桨背包风格 ====================
export function EngineModel({ isVIP = false }) {
  const propellerRef = useRef();
  const ringColor = isVIP ? COLORS.gold : COLORS.engineRing;
  const bodyColor = isVIP ? COLORS.goldDark : COLORS.fuselageBrown;
  
  // 螺旋桨旋转动画
  useFrame((_, delta) => {
    if (propellerRef.current) {
      propellerRef.current.rotation.z += delta * 15;
    }
  });
  
  return (
    <group>
      {/* 背包主体 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* 圆环框架 */}
      <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.05, 8, 16]} />
        <meshStandardMaterial color={ringColor} metalness={0.4} />
      </mesh>
      
      {/* 螺旋桨组 */}
      <group ref={propellerRef} position={[0, 0, -0.35]}>
        {/* 中心轴 */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
          <meshStandardMaterial color={COLORS.engineRed} />
        </mesh>
        
        {/* 三片桨叶 */}
        {[0, 120, 240].map((angle, i) => (
          <group key={i} rotation={[0, 0, THREE.MathUtils.degToRad(angle)]}>
            <mesh position={[0.18, 0, 0]} castShadow>
              <boxGeometry args={[0.25, 0.08, 0.03]} />
              <meshStandardMaterial color={COLORS.engineYellow} />
            </mesh>
            {/* 桨叶尖端 */}
            <mesh position={[0.32, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.06, 0.03]} />
              <meshStandardMaterial color={COLORS.engineRed} />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* 排气管装饰 */}
      <mesh position={[0.2, 0.15, 0.1]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
      <mesh position={[-0.2, 0.15, 0.1]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
    </group>
  );
}

// ==================== 机翼 (Wing) ====================
export function WingModel({ isVIP = false }) {
  const mainColor = isVIP ? COLORS.gold : COLORS.wingBlue;
  const tipColor = isVIP ? COLORS.goldDark : COLORS.wingTip;
  
  return (
    <group>
      {/* 主翼面 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.12, 0.8]} />
        <meshStandardMaterial color={mainColor} />
      </mesh>
      
      {/* 翼尖（左） */}
      <mesh position={[-0.85, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.14, 0.6]} />
        <meshStandardMaterial color={tipColor} />
      </mesh>
      
      {/* 翼尖（右） */}
      <mesh position={[0.85, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.14, 0.6]} />
        <meshStandardMaterial color={tipColor} />
      </mesh>
      
      {/* 翼面加强筋 */}
      {[-0.4, 0, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.07, 0]} castShadow>
          <boxGeometry args={[0.08, 0.04, 0.75]} />
          <meshStandardMaterial color={COLORS.fuselageBrown} />
        </mesh>
      ))}
    </group>
  );
}

// ==================== 驾驶座 (Cockpit) - 飞行员角色 ====================
export function CockpitModel({ isVIP = false }) {
  const clothColor = isVIP ? COLORS.gold : COLORS.fuselageBlue;
  
  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* 头部 */}
      <group position={[0, 0.25, 0]}>
        {/* 脸 */}
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.45, 0.4]} />
          <meshStandardMaterial color={COLORS.skin} />
        </mesh>
        
        {/* 飞行帽 */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.25, 0.45]} />
          <meshStandardMaterial color={COLORS.cockpitBrown} />
        </mesh>
        
        {/* 护耳（左） */}
        <mesh position={[-0.28, 0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.25, 0.35]} />
          <meshStandardMaterial color={COLORS.cockpitBrown} />
        </mesh>
        
        {/* 护耳（右） */}
        <mesh position={[0.28, 0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.25, 0.35]} />
          <meshStandardMaterial color={COLORS.cockpitBrown} />
        </mesh>
        
        {/* 飞行眼镜框架 */}
        <mesh position={[0, 0.28, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.15, 0.08]} />
          <meshStandardMaterial color={COLORS.goggleFrame} metalness={0.5} />
        </mesh>
        
        {/* 左镜片 */}
        <mesh position={[-0.12, 0.28, 0.25]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 8]} />
          <meshStandardMaterial 
            color={COLORS.goggleLens} 
            transparent 
            opacity={0.7}
            metalness={0.3}
          />
        </mesh>
        
        {/* 右镜片 */}
        <mesh position={[0.12, 0.28, 0.25]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 8]} />
          <meshStandardMaterial 
            color={COLORS.goggleLens} 
            transparent 
            opacity={0.7}
            metalness={0.3}
          />
        </mesh>
        
        {/* 眼睛 */}
        <mesh position={[-0.1, 0.05, 0.21]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.21]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* 微笑 */}
        <mesh position={[0, -0.08, 0.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        
        {/* 腮红 */}
        <mesh position={[-0.15, -0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f9a8d4" />
        </mesh>
        <mesh position={[0.15, -0.02, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f9a8d4" />
        </mesh>
      </group>
      
      {/* 围巾 */}
      <mesh position={[0, -0.05, 0.05]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={COLORS.scarf} />
      </mesh>
      
      {/* 围巾飘带 */}
      <mesh position={[0.15, -0.05, -0.3]} rotation={[0.3, 0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.4]} />
        <meshStandardMaterial color={COLORS.scarf} />
      </mesh>
      
      {/* 身体 */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.35]} />
        <meshStandardMaterial color={clothColor} />
      </mesh>
      
      {/* 背带 */}
      <mesh position={[-0.15, -0.35, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.04]} />
        <meshStandardMaterial color={COLORS.cockpitBrown} />
      </mesh>
      <mesh position={[0.15, -0.35, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.04]} />
        <meshStandardMaterial color={COLORS.cockpitBrown} />
      </mesh>
      
      {/* 背带扣 */}
      <mesh position={[-0.15, -0.25, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.03]} />
        <meshStandardMaterial color={COLORS.goggleFrame} metalness={0.6} />
      </mesh>
      <mesh position={[0.15, -0.25, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.03]} />
        <meshStandardMaterial color={COLORS.goggleFrame} metalness={0.6} />
      </mesh>
    </group>
  );
}

export default { FuselageModel, EngineModel, WingModel, CockpitModel };
