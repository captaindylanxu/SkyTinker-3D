import { useState, useCallback, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import { GRID_SIZE, GAME_MODES } from '../constants/gameConstants';
import { Ground } from './Ground';
import { StaticVehiclePart, PreviewPart } from './VehiclePart';
import { useSound } from '../hooks/useSound';

// 将坐标对齐到网格中心
const snapToGrid = (value) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// 根据点击的面来确定放置方向
const getFaceDirection = (normal) => {
  const absX = Math.abs(normal.x);
  const absY = Math.abs(normal.y);
  const absZ = Math.abs(normal.z);
  
  if (absY >= absX && absY >= absZ) {
    return { axis: 'y', sign: Math.sign(normal.y) || 1 };
  } else if (absX >= absZ) {
    return { axis: 'x', sign: Math.sign(normal.x) || 1 };
  } else {
    return { axis: 'z', sign: Math.sign(normal.z) || 1 };
  }
};

// 计算在现有零件上的放置位置
const calculateStackPosition = (partPosition, faceNormal) => {
  const direction = getFaceDirection(faceNormal);
  const offset = GRID_SIZE;
  
  const newPosition = [...partPosition];
  
  switch (direction.axis) {
    case 'x':
      newPosition[0] += direction.sign * offset;
      break;
    case 'y':
      newPosition[1] += direction.sign * offset;
      break;
    case 'z':
      newPosition[2] += direction.sign * offset;
      break;
  }
  
  return newPosition;
};

// 计算地面上的放置位置
const calculateGroundPosition = (point) => {
  const x = snapToGrid(point.x);
  const y = GRID_SIZE / 2; // 零件中心在地面上方半个网格
  const z = snapToGrid(point.z);
  return [x, y, z];
};

export function BuildingSystem() {
  const [previewPosition, setPreviewPosition] = useState(null);
  const [previewValid, setPreviewValid] = useState(true);
  const hoveredPartRef = useRef(null);
  const hoveredFaceRef = useRef(null);
  const { playPlace, playRemove } = useSound();
  
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

  // 处理地面上的鼠标移动
  const handleGroundPointerMove = useCallback((event) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    
    hoveredPartRef.current = null;
    hoveredFaceRef.current = null;
    
    const position = calculateGroundPosition(event.point);
    const isOccupied = hasPartAtPosition(position);
    
    setPreviewPosition(position);
    setPreviewValid(!isOccupied);
  }, [isBuildMode, hasPartAtPosition]);

  // 处理地面点击 - 放置零件
  const handleGroundClick = useCallback((event) => {
    if (!isBuildMode || !canAdd) return;
    event.stopPropagation();
    
    const position = calculateGroundPosition(event.point);
    
    if (hasPartAtPosition(position)) return;
    
    addPart({
      type: selectedPartType,
      tier: selectedPartTier,
      position,
      rotation: [0, 0, 0],
    });
    playPlace();
  }, [isBuildMode, selectedPartType, selectedPartTier, addPart, hasPartAtPosition, canAdd, playPlace]);

  // 处理零件上的鼠标移动 - 用于堆叠预览
  const handlePartPointerMove = useCallback((event, part) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    
    const { face } = event;
    if (!face) return;
    
    hoveredPartRef.current = part;
    hoveredFaceRef.current = face.normal;
    
    const position = calculateStackPosition(part.position, face.normal);
    const isOccupied = hasPartAtPosition(position);
    
    // 确保不会放到地面以下
    if (position[1] < GRID_SIZE / 2) {
      position[1] = GRID_SIZE / 2;
    }
    
    setPreviewPosition(position);
    setPreviewValid(!isOccupied);
  }, [isBuildMode, hasPartAtPosition]);

  // 处理零件上的点击 - 堆叠放置
  const handlePartClick = useCallback((event, part) => {
    if (!isBuildMode || !canAdd) return;
    event.stopPropagation();
    
    const { face } = event;
    if (!face) return;
    
    const position = calculateStackPosition(part.position, face.normal);
    
    // 确保不会放到地面以下
    if (position[1] < GRID_SIZE / 2) {
      position[1] = GRID_SIZE / 2;
    }
    
    if (hasPartAtPosition(position)) return;
    
    addPart({
      type: selectedPartType,
      tier: selectedPartTier,
      position,
      rotation: [0, 0, 0],
    });
    playPlace();
  }, [isBuildMode, selectedPartType, selectedPartTier, addPart, hasPartAtPosition, canAdd, playPlace]);

  // 处理右键点击 - 删除零件
  const handlePartContextMenu = useCallback((event, part) => {
    if (!isBuildMode) return;
    event.stopPropagation();
    event.nativeEvent?.preventDefault();
    
    removePartAtPosition(part.position);
    playRemove();
  }, [isBuildMode, removePartAtPosition, playRemove]);

  // 鼠标离开时清除预览
  const handlePointerLeave = useCallback(() => {
    setPreviewPosition(null);
    hoveredPartRef.current = null;
    hoveredFaceRef.current = null;
  }, []);

  return (
    <group>
      <Ground
        onPointerMove={handleGroundPointerMove}
        onClick={handleGroundClick}
        onPointerLeave={handlePointerLeave}
      />
      
      {vehicleParts.map((part) => (
        <StaticVehiclePart
          key={part.id}
          type={part.type}
          tier={part.tier}
          position={part.position}
          rotation={part.rotation}
          onPointerMove={(e) => handlePartPointerMove(e, part)}
          onClick={(e) => handlePartClick(e, part)}
          onContextMenu={(e) => handlePartContextMenu(e, part)}
        />
      ))}
      
      {/* 预览零件 */}
      {previewPosition && canAdd && (
        <PreviewPart 
          type={selectedPartType} 
          tier={selectedPartTier}
          position={previewPosition}
          valid={previewValid}
        />
      )}
    </group>
  );
}

export default BuildingSystem;
