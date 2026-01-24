# 飞行稳定性系统文档

## 概述

实现了一个完整的飞行稳定性系统，让飞行器的搭建结构真正影响飞行表现。不平衡的飞行器会不停翻转，难以操控。

## 核心机制

### 1. 稳定性计算 ✅

**实现位置**: `src/components/FlightSystem.jsx`

```javascript
const stability = useMemo(() => {
  // 计算重心
  let centerX = 0, centerY = 0, centerZ = 0;
  let totalWeight = 0;
  
  parts.forEach(part => {
    const stats = getPartStats(part.type, part.tier);
    const weight = stats.weight || 1;
    centerX += part.position[0] * weight;
    centerY += part.position[1] * weight;
    centerZ += part.position[2] * weight;
    totalWeight += weight;
  });
  
  centerX /= totalWeight;
  centerY /= totalWeight;
  centerZ /= totalWeight;
  
  // 计算机翼平衡（左右对称性）
  const wings = parts.filter(p => p.type === PART_TYPES.WING);
  let wingBalance = 1.0;
  
  if (wings.length > 0) {
    const wingOffsets = wings.map(w => w.position[2] - centerZ);
    const leftWings = wingOffsets.filter(z => z < -0.5).length;
    const rightWings = wingOffsets.filter(z => z > 0.5).length;
    
    // 对称性越好，平衡度越高
    if (leftWings > 0 && rightWings > 0) {
      const ratio = Math.min(leftWings, rightWings) / Math.max(leftWings, rightWings);
      wingBalance = 0.5 + ratio * 0.5; // 0.5-1.0
    } else if (centerWings > 0) {
      wingBalance = 0.7; // 中间机翼提供一些稳定性
    } else {
      wingBalance = 0.3; // 单侧机翼很不稳定
    }
  } else {
    wingBalance = 0.2; // 没有机翼非常不稳定
  }
  
  // 综合稳定性评分 (0-1)
  const score = (wingBalance * 0.6 + distributionScore * 0.4);
  
  return { score, balanced: score > 0.6, wingBalance };
}, [parts]);
```

**评分标准**:
- **0.8-1.0**: 优秀 - 机翼完全对称，质量分布均匀
- **0.6-0.8**: 良好 - 机翼基本对称，有一定稳定性
- **0.4-0.6**: 一般 - 机翼不太对称，会有些晃动
- **0.0-0.4**: 较差 - 机翼严重不对称或没有机翼，会不停翻转

### 2. 动态角阻尼 ✅

根据稳定性动态调整角阻尼：

```javascript
const effectiveAngularDamping = useMemo(() => {
  const baseAngularDamping = ANGULAR_DAMPING;
  const stabilityMultiplier = 0.3 + stability.score * 1.5; // 0.3-1.8倍
  return baseAngularDamping * stabilityMultiplier;
}, [stability]);
```

**效果**:
- 稳定性高（0.8+）: 角阻尼 1.5-1.8倍，飞行器很稳定，不易翻转
- 稳定性中（0.5）: 角阻尼 1.05倍，飞行器有些晃动
- 稳定性低（0.2）: 角阻尼 0.6倍，飞行器会不停翻转

### 3. 扭矩调整 ✅

根据稳定性调整推力产生的扭矩：

```javascript
if (isFlapping.current && hasEngine && currentPos[1] < MAX_HEIGHT) {
  const flapPower = FLAP_FORCE * totalPower;
  api.applyForce([0, flapPower, 0], [0, 0, 0]);
  
  // 稳定性低的飞行器会产生更大的旋转
  const torqueMultiplier = 2.0 - stability.score; // 1.0-2.0倍
  api.applyTorque([0, 0, FLAP_TORQUE * torqueMultiplier]);
} else {
  // 稳定性高的飞行器会自动回正
  const stabilizingTorque = -FLAP_TORQUE * 0.3 * stability.score;
  api.applyTorque([0, 0, stabilizingTorque]);
}
```

**效果**:
- 稳定性高: 推力产生的扭矩小，不按空格时会自动回正
- 稳定性低: 推力产生的扭矩大，容易翻转

### 4. 机翼气动稳定性 ✅

机翼提供额外的稳定力矩：

```javascript
if (totalLift > 0) {
  const speed = Math.abs(currentVel[0]);
  const liftForce = totalLift * speed * 0.8;
  api.applyForce([0, liftForce, 0], [0, 0, 0]);
  
  // 机翼提供稳定力矩（抵抗翻转）
  if (stability.wingBalance > 0.5) {
    const stabilizingForce = (stability.wingBalance - 0.5) * 2.0 * speed;
    api.applyTorque([0, 0, -stabilizingForce * 0.5]);
  }
}
```

**效果**:
- 对称机翼会产生稳定力矩，抵抗翻转
- 速度越快，稳定效果越明显

## UI显示

### 稳定性指示器 ✅

**实现位置**: `src/components/UI/Toolbar.jsx`

显示内容：
- 稳定性进度条（0-100%）
- 稳定性等级（优秀/良好/一般/较差）
- 颜色编码：
  - 绿色（#22c55e）: 优秀
  - 蓝色（#3b82f6）: 良好
  - 黄色（#fbbf24）: 一般
  - 红色（#ef4444）: 较差
- 提示文本：稳定性低于0.6时显示"左右对称放置机翼可提高稳定性"

### 样式 ✅

**实现位置**: `src/components/UI/Toolbar.css`

```css
.stability-indicator {
  width: 100%;
  padding: 10px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
}

.stability-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 4px;
}
```

## 新手引导

### 新增步骤 ✅

**步骤5: 飞行稳定性**
- 标题: "✈️ 飞行稳定性"
- 描述: "左右对称放置机翼可以提高飞行稳定性。不平衡的飞行器会不停翻转，难以操控！"
- 高亮: 稳定性指示器
- 目的: 让玩家理解稳定性的重要性

### 教程步骤更新

总步骤数从8步增加到9步：
1. 欢迎
2. 选择零件
3. 放置零件
4. 堆叠建造
5. **飞行稳定性** ⭐ 新增
6. 删除零件
7. 准备起飞
8. 控制飞行
9. 完成

## 国际化支持

### 新增翻译键 ✅

```javascript
stability: {
  title: '飞行稳定性',
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
  hint: '💡 提示：左右对称放置机翼可提高稳定性',
}
```

已支持语言：
- 🇨🇳 简体中文
- 🇹🇼 繁体中文
- 🇺🇸 英语
- 🇯🇵 日语
- 🇰🇷 韩语
- 🇩🇪 德语
- 🇷🇺 俄语
- 🇫🇷 法语

## 游戏平衡

### 推荐配置

**高稳定性配置**:
```
驾驶座（中心）
  |
机身-机身-机身
  |   |   |
机翼 引擎 机翼（左右对称）
```
稳定性评分: 0.85+

**中等稳定性配置**:
```
驾驶座
  |
引擎-机翼
  |
机身
```
稳定性评分: 0.5-0.7

**低稳定性配置**:
```
驾驶座-引擎-机翼（单侧）
```
稳定性评分: 0.3-0.4

### 飞行表现对比

| 稳定性 | 角阻尼 | 扭矩倍数 | 飞行表现 |
|--------|--------|----------|----------|
| 0.9 | 1.65x | 1.1x | 非常稳定，容易控制 |
| 0.7 | 1.35x | 1.3x | 较稳定，有些晃动 |
| 0.5 | 1.05x | 1.5x | 不太稳定，需要技巧 |
| 0.3 | 0.75x | 1.7x | 很不稳定，不停翻转 |
| 0.1 | 0.45x | 1.9x | 极度不稳定，几乎无法控制 |

## 技术实现

### 状态管理 ✅

**新增状态**: `src/store/useGameStore.js`

```javascript
stabilityScore: 0,
setStabilityScore: (score) => set({ stabilityScore: score }),
```

### 数据流

```
FlappyVehicle (计算稳定性)
    ↓
onStabilityUpdate 回调
    ↓
FlightSystem (handleStabilityUpdate)
    ↓
setStabilityScore (更新store)
    ↓
Toolbar (显示稳定性指示器)
```

## 测试场景

### 1. 对称机翼测试
- 放置驾驶座和引擎在中心
- 在左右两侧各放置1个机翼
- 预期: 稳定性 0.8+，飞行平稳

### 2. 单侧机翼测试
- 放置驾驶座和引擎
- 只在一侧放置机翼
- 预期: 稳定性 0.3-，飞行器会向一侧翻转

### 3. 无机翼测试
- 只放置驾驶座和引擎
- 预期: 稳定性 0.2-，飞行器会剧烈翻转

### 4. 复杂结构测试
- 建造多层结构，机翼对称分布
- 预期: 稳定性取决于机翼对称性

## 文件修改清单

- ✅ `src/components/FlightSystem.jsx` - 稳定性计算和物理效果
- ✅ `src/components/UI/Toolbar.jsx` - 稳定性指示器UI
- ✅ `src/components/UI/Toolbar.css` - 稳定性指示器样式
- ✅ `src/components/UI/TutorialOverlay.jsx` - 新增稳定性教程步骤
- ✅ `src/store/useGameStore.js` - 稳定性状态管理
- ✅ `src/i18n/locales.js` - 稳定性相关翻译

## 总结

这个系统让飞行器的设计变得更有意义：

1. **真实的物理反馈** - 不平衡的设计会导致翻转
2. **策略性建造** - 玩家需要考虑机翼的对称性
3. **视觉反馈** - 实时显示稳定性评分
4. **教学引导** - 新手教程明确告诉玩家如何设计
5. **深度玩法** - 高级玩家可以优化设计追求完美稳定性

现在玩家会明白：
- 为什么需要机翼
- 为什么机翼要对称放置
- 如何设计一个好飞的飞行器
- 稳定性对飞行的实际影响
