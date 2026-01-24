# 建造机制改进文档

## 问题分析

### 1. 搭建对飞行影响不大
之前的系统中：
- ✅ 引擎数量影响推力
- ❌ 机翼只影响重量，没有升力效果
- ❌ 驾驶座只是装饰，不是必需品
- ❌ 机身只增加重量

### 2. 零件连接性缺失
- ❌ 可以在空中放置不连接的零件
- ❌ 没有视觉反馈提示断开连接
- ❌ 不符合物理逻辑

## 解决方案

### 1. 机翼升力系统 ✅

**实现位置**: `src/components/FlightSystem.jsx`

```javascript
// 计算总升力（基于机翼数量和等级）
const totalLift = useMemo(() => {
  return parts
    .filter(p => p.type === PART_TYPES.WING)
    .reduce((sum, p) => {
      const stats = getPartStats(p.type, p.tier);
      return sum + (stats.lift || 0);
    }, 0);
}, [parts]);

// 在 useFrame 中应用升力
if (totalLift > 0) {
  const speed = Math.abs(currentVel[0]);
  const liftForce = totalLift * speed * 0.8; // 升力系数
  api.applyForce([0, liftForce, 0], [0, 0, 0]);
}
```

**效果**:
- 机翼提供持续升力，抵消部分重力
- 升力与速度相关，速度越快升力越大
- 普通机翼: lift = 1.0
- VIP机翼: lift = 2.0

### 2. 驾驶座必需性 ✅

**实现位置**: `src/components/FlightSystem.jsx`

```javascript
// 检查是否有驾驶座
const hasCockpit = useMemo(() => {
  return parts.some(p => p.type === PART_TYPES.COCKPIT);
}, [parts]);

// 检查是否可以飞行（需要驾驶座和引擎）
const canFly = hasEngine && hasCockpit;

// 在 useFrame 中检查
if (!canFly) {
  // 快速下坠
  api.applyForce([0, -totalMass * 5, 0], [0, 0, 0]);
  return;
}
```

**效果**:
- 没有驾驶座无法飞行，会快速坠落
- 必须同时拥有引擎和驾驶座才能正常飞行

### 3. 零件连接性检查 ✅

**实现位置**: `src/store/useGameStore.js`

```javascript
// 检查零件连接性 - 使用BFS确保所有零件相互连接
checkPartsConnectivity: () => {
  const parts = get().vehicleParts;
  if (parts.length <= 1) return { connected: true, disconnectedParts: [] };
  
  // 检查两个零件是否相邻（共享一个面）
  const areAdjacent = (pos1, pos2) => {
    const dx = Math.abs(pos1[0] - pos2[0]);
    const dy = Math.abs(pos1[1] - pos2[1]);
    const dz = Math.abs(pos1[2] - pos2[2]);
    
    // 相邻意味着在一个轴上相差GRID_SIZE，其他轴相同
    return (
      (dx === GRID_SIZE && dy === 0 && dz === 0) ||
      (dx === 0 && dy === GRID_SIZE && dz === 0) ||
      (dx === 0 && dy === 0 && dz === GRID_SIZE)
    );
  };
  
  // BFS从第一个零件开始
  const visited = new Set();
  const queue = [parts[0]];
  visited.add(`${parts[0].position[0]},${parts[0].position[1]},${parts[0].position[2]}`);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    parts.forEach(part => {
      const key = `${part.position[0]},${part.position[1]},${part.position[2]}`;
      if (!visited.has(key) && areAdjacent(current.position, part.position)) {
        visited.add(key);
        queue.push(part);
      }
    });
  }
  
  // 找出未连接的零件
  const disconnectedParts = parts.filter(part => {
    const key = `${part.position[0]},${part.position[1]},${part.position[2]}`;
    return !visited.has(key);
  });
  
  return {
    connected: disconnectedParts.length === 0,
    disconnectedParts: disconnectedParts.map(p => p.position),
  };
}
```

**算法说明**:
- 使用广度优先搜索(BFS)从第一个零件开始遍历
- 检查零件是否在六个方向上相邻（共享面）
- 返回所有未连接的零件位置

### 4. 视觉反馈 ✅

**实现位置**: 
- `src/components/VehiclePart.jsx` - 红色边框
- `src/components/UI/Toolbar.jsx` - 警告提示
- `src/components/UI/Toolbar.css` - 样式

**断开连接的零件显示**:
```javascript
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
```

**工具栏警告**:
```javascript
{hasWarnings && totalParts > 0 && (
  <div className="toolbar-warnings">
    {!connectivity.connected && (
      <div className="warning-item disconnected">
        ⚠️ 有零件未连接！
      </div>
    )}
    {!hasEngine && (
      <div className="warning-item missing-part">
        ⚠️ 需要引擎才能飞行！
      </div>
    )}
    {!hasCockpit && (
      <div className="warning-item missing-part">
        ⚠️ 需要驾驶座才能飞行！
      </div>
    )}
  </div>
)}
```

## 零件属性总结

### 机身 (Fuselage)
- **普通**: 重量 2.0
- **VIP**: 重量 1.0 (减轻50%)

### 机翼 (Wing)
- **普通**: 重量 0.5, 升力 1.0
- **VIP**: 重量 0.2, 升力 2.0 (更轻更强)

### 引擎 (Engine)
- **普通**: 重量 3.0, 推力 1.0
- **VIP**: 重量 1.0, 推力 2.5 (更轻更强)

### 驾驶座 (Cockpit)
- **普通**: 重量 1.5, 必需品
- **VIP**: 重量 0.5, 必需品

## 游戏平衡

### 最佳配置建议
1. **最小可飞行配置**: 1个驾驶座 + 1个引擎
2. **平衡配置**: 1个驾驶座 + 2个引擎 + 2个机翼 + 2个机身
3. **高性能配置**: 1个驾驶座 + 3个引擎 + 4个机翼

### VIP优势
- 所有零件更轻（减少50-80%重量）
- 引擎推力提升150%
- 机翼升力提升100%
- 更容易建造高性能飞行器

## 国际化支持

已添加警告文本的多语言支持：
- 🇨🇳 简体中文
- 🇹🇼 繁体中文
- 🇺🇸 英语
- 🇯🇵 日语
- 🇰🇷 韩语
- 🇩🇪 德语
- 🇷🇺 俄语
- 🇫🇷 法语

## 测试建议

1. **连接性测试**:
   - 放置两个不相邻的零件，应显示红色警告
   - 连接所有零件后，警告应消失

2. **飞行测试**:
   - 只有引擎无驾驶座：应快速坠落
   - 只有驾驶座无引擎：应快速坠落
   - 有驾驶座和引擎：应能正常飞行
   - 添加机翼：应更容易保持高度

3. **升力测试**:
   - 无机翼：需要频繁按空格保持高度
   - 2个机翼：应更容易保持高度
   - 4个机翼：应能轻松保持高度甚至缓慢上升

## 文件修改清单

- ✅ `src/components/FlightSystem.jsx` - 添加升力系统和驾驶座检查
- ✅ `src/components/BuildingSystem.jsx` - 添加连接性检查和视觉反馈
- ✅ `src/components/VehiclePart.jsx` - 添加断开连接的红色边框
- ✅ `src/components/UI/Toolbar.jsx` - 添加警告提示UI
- ✅ `src/components/UI/Toolbar.css` - 添加警告样式
- ✅ `src/store/useGameStore.js` - 添加连接性检查函数
- ✅ `src/i18n/locales.js` - 添加警告文本的多语言支持
- ✅ `src/constants/gameConstants.js` - 已有机翼升力属性配置

## 总结

这次改进让建造系统更有意义：
1. **机翼有实际作用** - 提供升力，影响飞行性能
2. **驾驶座成为必需品** - 没有驾驶座无法飞行
3. **零件必须连接** - 符合物理逻辑，有视觉反馈
4. **更好的游戏体验** - 玩家需要思考如何搭配零件
