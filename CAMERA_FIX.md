# 相机跟随问题修复

## 问题描述

当飞行器结构很大时，在飞行模式下屏幕上看不到飞行器。

## 原因分析

1. **重心计算不一致**: 
   - 原来的 `centerOffset` 使用简单平均计算
   - 物理引擎使用加权平均（按质量）计算重心
   - 两者不一致导致视觉模型和物理刚体位置不匹配

2. **相机视野不足**:
   - 原来的相机距离（Z=25）对于大型飞行器不够
   - FOV=60度视野较窄

## 解决方案

### 1. 修复重心计算 ✅

**文件**: `src/components/FlightSystem.jsx`

```javascript
// 修改前：简单平均
const centerOffset = useMemo(() => {
  let sumX = 0, sumY = 0, sumZ = 0;
  parts.forEach(part => {
    sumX += part.position[0];
    sumY += part.position[1];
    sumZ += part.position[2];
  });
  return [sumX / parts.length, sumY / parts.length, sumZ / parts.length];
}, [parts]);

// 修改后：加权平均（与物理引擎一致）
const centerOffset = useMemo(() => {
  let sumX = 0, sumY = 0, sumZ = 0;
  let totalWeight = 0;
  
  parts.forEach(part => {
    const stats = getPartStats(part.type, part.tier);
    const weight = stats.weight || 1;
    sumX += part.position[0] * weight;
    sumY += part.position[1] * weight;
    sumZ += part.position[2] * weight;
    totalWeight += weight;
  });
  
  return [sumX / totalWeight, sumY / totalWeight, sumZ / totalWeight];
}, [parts]);
```

### 2. 增加相机距离 ✅

**文件**: `src/constants/gameConstants.js`

```javascript
// 修改前
CAMERA_OFFSET_Z: 25,
CAMERA_OFFSET_X: -5,

// 修改后
CAMERA_OFFSET_Z: 35,  // 增加距离
CAMERA_OFFSET_X: -8,  // 稍微向后偏移
```

### 3. 扩大相机视野 ✅

**文件**: `src/components/Scene.jsx`

```javascript
// 修改前
camera={{ position: [10, 10, 25], fov: 60 }}

// 修改后
camera={{ position: [10, 10, 25], fov: 75, near: 0.1, far: 1000 }}
```

### 4. 简化相机逻辑 ✅

**文件**: `src/components/SideCamera.jsx`

移除了额外的相机距离调整，使用配置中的固定值：

```javascript
// 修改前
const cameraZ = CAMERA_OFFSET_Z + 10;
camera.position.set(smoothX.current, smoothY.current, cameraZ);

// 修改后
camera.position.set(smoothX.current, smoothY.current, CAMERA_OFFSET_Z);
```

### 5. 添加调试标记 ✅

在开发模式下，在飞行器重心位置显示一个紫色线框球体，方便调试：

```javascript
{process.env.NODE_ENV === 'development' && (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[0.3, 16, 16]} />
    <meshBasicMaterial color="#ff00ff" wireframe />
  </mesh>
)}
```

## 测试建议

1. **小型飞行器**: 1-3个零件，应该能正常看到
2. **中型飞行器**: 4-8个零件，应该能完整显示
3. **大型飞行器**: 9-12个零件，应该能看到整体
4. **不对称飞行器**: 零件分布不均匀，重心偏移较大的情况

## 技术细节

### 为什么要使用加权平均？

物理引擎（cannon.js）在创建复合刚体时，会根据每个形状的质量自动计算重心。如果视觉模型使用简单平均，而物理刚体使用加权平均，两者的中心点会不一致，导致：

- 视觉模型在一个位置
- 物理刚体（相机跟随的目标）在另一个位置
- 结果：相机跟随物理刚体，但看不到视觉模型

### 相机参数说明

- **FOV (Field of View)**: 75度，比原来的60度更宽，能看到更大范围
- **near**: 0.1，近裁剪面，太近的物体不渲染
- **far**: 1000，远裁剪面，太远的物体不渲染
- **CAMERA_OFFSET_Z**: 35，相机距离飞行器的Z轴距离
- **CAMERA_OFFSET_X**: -8，相机在X轴上的偏移（负值表示在飞行器后方）

## 文件修改清单

- ✅ `src/components/FlightSystem.jsx` - 修复重心计算，添加调试标记
- ✅ `src/components/SideCamera.jsx` - 简化相机逻辑
- ✅ `src/components/Scene.jsx` - 扩大相机视野
- ✅ `src/constants/gameConstants.js` - 增加相机距离

## 预期效果

修复后，无论飞行器大小和形状如何，都应该能在屏幕上看到完整的飞行器。相机会正确跟随飞行器的物理重心，视觉模型也会正确地围绕重心渲染。
