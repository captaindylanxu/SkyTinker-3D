# 教程完成功能验证指南

## 已修复的问题

### 1. React Hooks 错误
- **问题**: "Rendered fewer hooks than expected"
- **原因**: Early return 在 useEffect 之前
- **修复**: 将所有 Hooks 移到组件顶部

### 2. TypeError 错误
- **问题**: "Cannot read properties of null (reading 'highlight')"
- **原因**: useEffect 依赖数组使用 `currentStep.highlight`，但 currentStep 可能为 null
- **修复**: 改为 `currentStep?.highlight` 使用可选链

### 3. 教程完成后不返回建造模式
- **问题**: 完成或跳过教程后仍停留在当前模式
- **修复**: 在 `completeTutorial()` 和 `skipTutorial()` 中添加状态重置：
  - `gameMode: GAME_MODES.BUILD_MODE`
  - `isGameOver: false`
  - `isExploded: false`

## 验证步骤

### 清除缓存（重要！）
1. 打开浏览器开发者工具 (F12 或 Cmd+Option+I)
2. 右键点击刷新按钮，选择"清空缓存并硬性重新加载"
3. 或者在 Application/Storage 标签中清除 localStorage

### 测试完成教程
1. 刷新页面，开始新手教程
2. 按照步骤完成所有教程内容
3. 点击"完成"按钮
4. **预期结果**: 
   - 教程界面消失
   - 自动返回建造模式
   - 可以正常选择和放置零件

### 测试跳过教程
1. 清除 localStorage 重新开始
2. 在教程任意步骤点击"跳过"按钮
3. **预期结果**:
   - 教程界面消失
   - 自动返回建造模式
   - 可以正常使用所有功能

### 查看调试日志
打开浏览器控制台，应该能看到：
- `🎓 completeTutorial called` (完成教程时)
- `⏭️ skipTutorial called` (跳过教程时)
- `🎓 Setting state: ...` (状态更新信息)
- `🎓 State after set: ...` (更新后的状态)

## 如果仍有问题

### 检查控制台错误
- 是否还有 React Hooks 错误？
- 是否有 TypeError？
- 是否有其他 JavaScript 错误？

### 检查状态
在控制台输入以下命令查看当前状态：
```javascript
// 查看教程步骤
localStorage.getItem('flappy-vehicle-storage')
```

### 强制重置
如果需要完全重置，在控制台执行：
```javascript
localStorage.clear()
location.reload()
```

## 技术细节

### 状态管理 (useGameStore.js)
```javascript
completeTutorial: () => {
  console.log('🎓 completeTutorial called');
  const newState = { 
    tutorialStep: -1,
    gameMode: GAME_MODES.BUILD_MODE,
    isGameOver: false,
    isExploded: false,
  };
  set(newState);
}
```

### 组件渲染逻辑 (TutorialOverlay.jsx)
```javascript
// 所有 Hooks 在顶部
const currentStep = TUTORIAL_STEPS[tutorialStep] || null;
useEffect(...) // 高亮位置更新
useEffect(...) // 自动检测进度

// Early return 在最后
if (tutorialStep === -1 || !currentStep) return null;
```

## 当前状态
- ✅ React Hooks 错误已修复
- ✅ TypeError 已修复
- ✅ 教程完成逻辑已添加
- ✅ 调试日志已添加
- ⏳ 等待用户验证功能是否正常
