# 教程跳转问题调试指南 / Tutorial Navigation Issue Debug Guide

## 🐛 问题现象 / Issue Symptoms

完成教程或点击跳过教程后，没有自动跳转回建造模式。

---

## 🔍 调试步骤 / Debug Steps

### 1. 清除浏览器缓存

**重要**: 浏览器可能缓存了旧的 JavaScript 代码。

#### Chrome/Edge
1. 打开开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或者：
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存的图片和文件"
3. 点击"清除数据"

#### Firefox
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存"
3. 点击"立即清除"

#### Safari
1. 按 `Cmd+Option+E`
2. 或者 Safari > 清除历史记录

### 2. 清除 localStorage

在浏览器控制台 (F12) 中执行：

```javascript
localStorage.clear();
location.reload();
```

### 3. 使用隐私模式/无痕模式

1. 打开新的隐私/无痕窗口
2. 访问 http://localhost:5173
3. 测试教程功能

### 4. 检查控制台错误

1. 打开开发者工具 (F12)
2. 切换到 Console 标签
3. 查看是否有红色错误信息
4. 截图并报告错误

### 5. 验证状态更新

在浏览器控制台中执行以下代码来检查状态：

```javascript
// 获取当前状态
const state = window.__ZUSTAND_STORE__;
console.log('Current state:', {
  tutorialStep: state.tutorialStep,
  gameMode: state.gameMode,
  isGameOver: state.isGameOver,
  isExploded: state.isExploded,
});
```

### 6. 手动测试状态更新

在控制台中手动调用函数：

```javascript
// 获取 store
const useGameStore = window.__ZUSTAND_STORE__;

// 测试 completeTutorial
useGameStore.getState().completeTutorial();

// 检查状态
console.log('After completeTutorial:', {
  tutorialStep: useGameStore.getState().tutorialStep,
  gameMode: useGameStore.getState().gameMode,
});
```

---

## 🔧 可能的原因 / Possible Causes

### 1. 浏览器缓存

**症状**: 代码已更新，但浏览器仍使用旧代码

**解决**: 清除缓存并硬性重新加载

### 2. localStorage 冲突

**症状**: 旧的持久化数据干扰新逻辑

**解决**: 清除 localStorage

### 3. React 状态未更新

**症状**: 状态更新了但 UI 没有重新渲染

**解决**: 检查组件是否正确订阅状态

### 4. 代码未正确保存

**症状**: 修改没有生效

**解决**: 检查文件是否保存，重启开发服务器

---

## ✅ 验证修复 / Verify Fix

### 测试完成教程

1. 清除浏览器数据
```javascript
localStorage.clear();
location.reload();
```

2. 完整走完教程（8个步骤）

3. 在步骤 8 点击"开始游戏"

4. **预期结果**:
   - ✅ 教程弹窗消失
   - ✅ 显示工具栏（底部）
   - ✅ 可以选择零件
   - ✅ 顶部显示"🚀 开始飞行"按钮

5. **如果失败**:
   - 打开控制台查看错误
   - 检查状态：
   ```javascript
   console.log('gameMode:', useGameStore.getState().gameMode);
   console.log('tutorialStep:', useGameStore.getState().tutorialStep);
   ```

### 测试跳过教程

1. 清除浏览器数据

2. 在任意教程步骤点击"跳过教程"

3. **预期结果**:
   - ✅ 教程弹窗消失
   - ✅ 显示工具栏
   - ✅ 在建造模式

---

## 🔍 深度调试 / Deep Debugging

### 添加调试日志

在 `src/store/useGameStore.js` 中添加日志：

```javascript
completeTutorial: () => {
  console.log('completeTutorial called');
  const newState = { 
    tutorialStep: -1,
    gameMode: GAME_MODES.BUILD_MODE,
    isGameOver: false,
    isExploded: false,
  };
  console.log('Setting state:', newState);
  set(newState);
  console.log('State after set:', get());
},
```

### 检查 Zustand 订阅

在 `src/components/UI/TutorialOverlay.jsx` 中添加日志：

```javascript
const { tutorialStep, completeTutorial } = useGameStore();

useEffect(() => {
  console.log('TutorialOverlay: tutorialStep changed to', tutorialStep);
}, [tutorialStep]);
```

### 检查组件重新渲染

在 `src/components/Scene.jsx` 中添加日志：

```javascript
const { gameMode } = useGameStore();

useEffect(() => {
  console.log('Scene: gameMode changed to', gameMode);
}, [gameMode]);
```

---

## 📊 状态检查清单 / State Checklist

完成教程后，检查以下状态：

```javascript
const state = useGameStore.getState();

console.table({
  'Tutorial Step': state.tutorialStep,        // 应该是 -1
  'Game Mode': state.gameMode,                // 应该是 'BUILD_MODE'
  'Is Game Over': state.isGameOver,          // 应该是 false
  'Is Exploded': state.isExploded,           // 应该是 false
  'Vehicle Parts': state.vehicleParts.length, // 应该 > 0
});
```

---

## 🚀 快速修复尝试 / Quick Fix Attempts

### 方法 1: 强制刷新

```bash
# 停止服务器
Ctrl+C

# 清除 node_modules/.vite 缓存
rm -rf node_modules/.vite

# 重启服务器
npm run dev
```

### 方法 2: 完全重建

```bash
# 停止服务器
Ctrl+C

# 清除构建缓存
rm -rf node_modules/.vite
rm -rf dist

# 重新安装依赖（如果需要）
npm install

# 重启服务器
npm run dev
```

### 方法 3: 检查代码是否正确

```bash
# 查看 completeTutorial 函数
grep -A 5 "completeTutorial:" src/store/useGameStore.js

# 应该看到：
# completeTutorial: () => set({ 
#   tutorialStep: -1,
#   gameMode: GAME_MODES.BUILD_MODE,
#   isGameOver: false,
#   isExploded: false,
# }),
```

---

## 📝 报告问题 / Report Issue

如果问题仍然存在，请提供以下信息：

1. **浏览器信息**
   - 浏览器名称和版本
   - 操作系统

2. **控制台错误**
   - 截图或复制错误信息

3. **状态信息**
   ```javascript
   console.log(useGameStore.getState());
   ```

4. **重现步骤**
   - 详细描述如何重现问题

5. **已尝试的解决方法**
   - 列出已经尝试过的调试步骤

---

## 💡 临时解决方案 / Workaround

如果自动跳转不工作，用户可以手动切换：

1. 完成教程后
2. 点击顶部的"🔧 停止模拟"按钮
3. 手动切换回建造模式

---

**调试提示**: 
- 始终先清除缓存
- 使用隐私模式测试
- 检查控制台错误
- 验证状态更新

---

**最后更新**: 2026-01-18  
**版本**: 2.1.2  
**状态**: 🔍 调试中 / Debugging
