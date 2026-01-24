import { PART_TYPES, PART_TIERS, PART_STATS } from '../constants/gameConstants';
import { FuselageModel, EngineModel, WingModel, CockpitModel } from './models/RobloxParts';

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

// 静态零件（建造模式）
export function StaticVehiclePart({ 
  type, 
  tier = PART_TIERS.NORMAL, 
  position, 
  rotation = [0, 0, 0], 
  isDisconnected = false,
  onClick, 
  onContextMenu, 
  onPointerMove 
}) {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onPointerMove={onPointerMove}
    >
      <PartModel type={type} tier={tier} />
      
      {/* 断开连接警告 - 红色闪烁边框 */}
      {isDisconnected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

// 预览零件（半透明）
export function PreviewPart({ type, tier = PART_TIERS.NORMAL, position, valid = true }) {
  const baseColor = PART_STATS[type]?.[tier]?.color || '#6b7280';
  // 有效位置显示绿色，无效位置显示红色
  const color = valid ? '#22ff22' : '#ff2222';
  
  // 预览使用简单的半透明方块
  const getPreviewSize = () => {
    switch (type) {
      case PART_TYPES.WING:
        return [2, 0.2, 1];
      case PART_TYPES.ENGINE:
        return [0.6, 0.6, 0.6];
      case PART_TYPES.COCKPIT:
        return [0.6, 0.8, 0.5];
      default:
        return [1, 1, 1];
    }
  };

  return (
    <mesh position={position}>
      <boxGeometry args={getPreviewSize()} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={valid ? 0.5 : 0.3}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default StaticVehiclePart;
