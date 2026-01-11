import { useState, useCallback } from 'react';
import useGameStore from '../store/useGameStore';
import { GRID_SIZE, GAME_MODES } from '../constants/gameConstants';
import { Ground } from './Ground';
import { StaticVehiclePart, PreviewPart } from './VehiclePart';

// 将坐标对齐到网格
const snapToGrid = (value) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// 计算放置位置（在表面上方）
const calculatePlacementPosition = (point, normal) => {
  const x = snapToGrid(point.x + normal.x * 0.5);
  const y = snapToGrid(Math.max(0.5, point.y + normal.y * 0.5));
  const z = snapToGrid(point.z + normal.z * 0.5);
  return [x, y, z];
};

export function BuildingSystem() {
  const [previewPosition, setPreviewPosition] = useState(null);
  
  const {
    gameMode,
    selectedPartType,
    selectedPartTier,
    vehicleParts,
    addPart,
    removePartAtPosition,
    hasPartAtPosition,
    canAddPart,
  } = useGameStore();

  const isBuildMode = gameMode === GAME_MODES.BUILD_MODE;
  const canAdd = canAddPart(selectedPartType);

  // 处理鼠标移动 - 更新预览位置
  const handlePointerMove = useCallback((event) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    
    const { point, face } = event;
    if (!face) return;
    
    const position = calculatePlacementPosition(point, face.normal);
    setPreviewPosition(position);
  }, [isBuildMode]);

  // 处理左键点击 - 放置零件
  const handleClick = useCallback((event) => {
    if (!isBuildMode || !previewPosition || !canAdd) return;
    event.stopPropagation();
    
    if (hasPartAtPosition(previewPosition)) return;
    
    addPart({
      type: selectedPartType,
      tier: selectedPartTier,
      position: previewPosition,
      rotation: [0, 0, 0],
    });
  }, [isBuildMode, previewPosition, selectedPartType, selectedPartTier, addPart, hasPartAtPosition, canAdd]);

  // 处理右键点击 - 删除零件
  const handleContextMenu = useCallback((event) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    
    const { point, face } = event;
    if (!face) return;
    
    const x = snapToGrid(point.x);
    const y = snapToGrid(Math.max(0.5, point.y));
    const z = snapToGrid(point.z);
    
    removePartAtPosition([x, y, z]);
  }, [isBuildMode, removePartAtPosition]);

  // 处理零件上的点击事件
  const handlePartClick = useCallback((event) => {
    if (!isBuildMode || !canAdd) return;
    event.stopPropagation();
    
    const { face, point } = event;
    if (!face) return;
    
    const position = calculatePlacementPosition(point, face.normal);
    
    if (!hasPartAtPosition(position)) {
      addPart({
        type: selectedPartType,
        tier: selectedPartTier,
        position,
        rotation: [0, 0, 0],
      });
    }
  }, [isBuildMode, selectedPartType, selectedPartTier, addPart, hasPartAtPosition, canAdd]);

  // 处理零件上的右键点击
  const handlePartContextMenu = useCallback((event, part) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    
    removePartAtPosition(part.position);
  }, [isBuildMode, removePartAtPosition]);

  return (
    <group>
      <Ground
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      
      {vehicleParts.map((part) => (
        <StaticVehiclePart
          key={part.id}
          type={part.type}
          tier={part.tier}
          position={part.position}
          rotation={part.rotation}
          onClick={handlePartClick}
          onContextMenu={(e) => handlePartContextMenu(e, part)}
        />
      ))}
      
      {/* 只有可以添加时才显示预览 */}
      {previewPosition && canAdd && (
        <PreviewPart 
          type={selectedPartType} 
          tier={selectedPartTier}
          position={previewPosition} 
        />
      )}
    </group>
  );
}

export default BuildingSystem;
