import { useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { PART_TYPES, PART_TIERS, PART_STATS } from '../constants/gameConstants';
import { FuselageModel, EngineModel, WingModel, CockpitModel } from './models/RobloxParts';

// 获取零件碰撞盒大小
const getPartArgs = (type) => {
  switch (type) {
    case PART_TYPES.WING:
      return [2, 0.2, 1];
    case PART_TYPES.ENGINE:
      return [0.6, 0.6, 0.6];
    case PART_TYPES.COCKPIT:
      return [0.6, 0.8, 0.5];
    case PART_TYPES.FUSELAGE:
    default:
      return [1, 1, 1];
  }
};

// 根据零件类型返回对应的 3D 模型
function PartModel({ type, tier }) {
  const isVIP = tier === PART_TIERS.VIP;
  
  switch (type) {
    case PART_TYPES.FUSELAGE:
      return <FuselageModel isVIP={isVIP} />;
    case PART_TYPES.ENGINE:
      return <EngineModel isVIP={isVIP} />;
    case PART_TYPES.WING:
      return <WingModel isVIP={isVIP} />;
    case PART_TYPES.COCKPIT:
      return <CockpitModel isVIP={isVIP} />;
    default:
      return <FuselageModel isVIP={isVIP} />;
  }
}

// 单个爆炸后的零件
function ExplodedPart({ type, tier, position, impulse, angularVelocity }) {
  const args = getPartArgs(type);

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args,
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  useEffect(() => {
    api.applyImpulse(impulse, [0, 0, 0]);
    api.angularVelocity.set(...angularVelocity);
  }, [api, impulse, angularVelocity]);

  return (
    <group ref={ref}>
      {/* 保持与飞行时相同的旋转 */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <PartModel type={type} tier={tier} />
      </group>
    </group>
  );
}

export function ExplodedParts({ parts, explosionCenter }) {
  return (
    <group>
      {parts.map((part, index) => {
        const dx = part.worldPosition[0] - explosionCenter[0];
        const dy = part.worldPosition[1] - explosionCenter[1];
        const dz = part.worldPosition[2] - explosionCenter[2];
        
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const explosionForce = 8 + Math.random() * 12;
        
        const impulse = [
          (dx / dist + (Math.random() - 0.5) * 0.5) * explosionForce,
          (dy / dist + Math.random() * 0.5 + 0.5) * explosionForce,
          (dz / dist + (Math.random() - 0.5) * 0.5) * explosionForce,
        ];
        
        const angularVelocity = [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
        ];

        return (
          <ExplodedPart
            key={part.id || index}
            type={part.type}
            tier={part.tier}
            position={part.worldPosition}
            impulse={impulse}
            angularVelocity={angularVelocity}
          />
        );
      })}
    </group>
  );
}

export default ExplodedParts;
