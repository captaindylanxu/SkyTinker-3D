# React Hooks 错误修复 / React Hooks Error Fix

## 🐛 错误信息 / Error Message

```
Uncaught Error: Rendered fewer hooks than expected. 
This may be caused by an accidental early return statement.
```

---

## 🔍 问题分析 / Problem Analysis

### 错误原因 / Root Cause

在 `TutorialOverlay.jsx` 组件中，**Hooks 的调用顺序不正确**。

### 错误的代码结构

```javascript
export function TutorialOverlay() {
  // ✅ Hooks 1-3: 正确
  const { ... } = useGameStore();
  const { t } = useI18n();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);

  // ❌ Early return - 在 useEffect 之前！
  if (tutorialStep === -1) return null;
  if (!currentStep) return null;

  // ❌ Hooks 4-5: 在 early return 之后！
  useEffect(() => { ... }, [currentStep.highlight]);
  useEffect(() => { ... }, [currentStep, ...]);
  
  // ...
}
```

### React Hooks 规则

**React Hooks 必须遵守的规则**：

1. ✅ **只在顶层调用 Hooks**
   - 不要在循环、条件或嵌套函数中调用

2. ✅ **Hooks 必须在所有 early return 之前调用**
   - 确保每次渲染时 Hooks 的调用顺序一致

3. ✅ **Hooks 的数量必须保持一致**
   - 不能根据条件增加或减少 Hooks 的数量

---

## ✅ 解决方案 / Solution

### 修复后的代码结构

```javascript
export function TutorialOverlay() {
  // ✅ 所有 Hooks 在最前面
  const { ... } = useGameStore();
  const { t } = useI18n();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);

  // ✅ 安全地获取 currentStep（不使用 early return）
  const currentStep = TUTORIAL_STEPS[tutorialStep] || null;

  // ✅ useEffect 1: 检查 currentStep 是否存在
  useEffect(() => {
    if (!currentStep || !currentStep.highlight) {
      setHighlightRect(null);
      return;
    }
    // ...
  }, [currentStep?.highlight]);

  // ✅ useEffect 2: 检查 currentStep 是否存在
  useEffect(() => {
    if (!currentStep || !currentStep.waitFor) return;
    // ...
  }, [currentStep, ...]);

  // ✅ Early return 在所有 Hooks 之后
  if (tutorialStep === -1 || !currentStep) return null;

  // ✅ 其他函数和 JSX
  const handleNext = () => { ... };
  return <div>...</div>;
}
```

---

## 🔧 具体修改 / Specific Changes

### 修改 1: 移除 early return

**修改前**:
```javascript
// 如果教程已完成，不显示
if (tutorialStep === -1) return null;

const currentStep = TUTORIAL_STEPS[tutorialStep];
if (!currentStep) return null;
```

**修改后**:
```javascript
// 安全地获取 currentStep
const currentStep = TUTORIAL_STEPS[tutorialStep] || null;
```

### 修改 2: 在 useEffect 中检查

**修改前**:
```javascript
useEffect(() => {
  if (!currentStep.highlight) {
    setHighlightRect(null);
    return;
  }
  // ...
}, [currentStep.highlight]);
```

**修改后**:
```javascript
useEffect(() => {
  if (!currentStep || !currentStep.highlight) {
    setHighlightRect(null);
    return;
  }
  // ...
}, [currentStep?.highlight]);
```

### 修改 3: 在所有 Hooks 之后 return

**添加**:
```javascript
// 在所有 useEffect 之后
// 如果教程已完成或没有当前步骤，不显示
if (tutorialStep === -1 || !currentStep) return null;
```

---

## 📊 修复前后对比 / Before & After Comparison

### 修复前的执行流程

```
1. 调用 useGameStore() ✅
2. 调用 useI18n() ✅
3. 调用 useState() x2 ✅
4. if (tutorialStep === -1) return null ❌ Early return!
5. useEffect() ❌ 永远不会执行（如果 tutorialStep === -1）
6. useEffect() ❌ 永远不会执行（如果 tutorialStep === -1）
```

**问题**: React 期望每次渲染都调用相同数量的 Hooks，但由于 early return，有时调用 4 个 Hooks，有时调用 6 个 Hooks。

### 修复后的执行流程

```
1. 调用 useGameStore() ✅
2. 调用 useI18n() ✅
3. 调用 useState() x2 ✅
4. 调用 useEffect() x2 ✅
5. if (tutorialStep === -1) return null ✅ 在所有 Hooks 之后
```

**结果**: 每次渲染都调用相同数量的 Hooks（6 个），符合 React 规则。

---

## 🎯 为什么这样修复有效 / Why This Fix Works

### 1. Hooks 调用顺序一致

无论 `tutorialStep` 的值是什么，都会调用相同数量的 Hooks：
- `useGameStore()` - 总是调用
- `useI18n()` - 总是调用
- `useState()` x2 - 总是调用
- `useEffect()` x2 - 总是调用

### 2. 条件逻辑在 Hooks 内部

条件检查移到了 useEffect 内部：
```javascript
useEffect(() => {
  if (!currentStep) return; // ✅ 在 Hook 内部检查
  // ...
}, [currentStep]);
```

### 3. Early return 在最后

所有 Hooks 调用完成后才进行 early return：
```javascript
// 所有 Hooks 已调用
if (tutorialStep === -1 || !currentStep) return null;
```

---

## ✅ 测试验证 / Testing Verification

### 测试步骤

1. 清除浏览器缓存
```bash
Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
```

2. 清除 localStorage
```javascript
localStorage.clear();
location.reload();
```

3. 打开控制台 (F12)

4. 测试教程功能
   - 完成教程
   - 跳过教程

### 预期结果

- ✅ 没有 React Hooks 错误
- ✅ 控制台显示调试日志：
  ```
  🎓 completeTutorial called
  🎓 Setting state: {...}
  🎓 State after set: -1 BUILD_MODE
  ```
- ✅ 自动切换到建造模式
- ✅ 显示工具栏

---

## 📚 React Hooks 最佳实践 / React Hooks Best Practices

### 1. 始终在顶层调用 Hooks

```javascript
// ✅ 正确
function Component() {
  const [state, setState] = useState(0);
  useEffect(() => { ... }, []);
  
  if (condition) return null;
  return <div>...</div>;
}

// ❌ 错误
function Component() {
  if (condition) return null;
  
  const [state, setState] = useState(0); // 错误！
  return <div>...</div>;
}
```

### 2. 条件逻辑在 Hooks 内部

```javascript
// ✅ 正确
useEffect(() => {
  if (!data) return;
  // 处理 data
}, [data]);

// ❌ 错误
if (data) {
  useEffect(() => {
    // 处理 data
  }, [data]);
}
```

### 3. 使用 ESLint 插件

安装 `eslint-plugin-react-hooks` 来自动检测 Hooks 规则违规：

```bash
npm install eslint-plugin-react-hooks --save-dev
```

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 🔍 相关资源 / Related Resources

- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [React Hooks FAQ](https://react.dev/reference/react/hooks#rules-of-hooks)
- [ESLint Plugin React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

---

## 📝 相关文件 / Related Files

### 修改的文件

**src/components/UI/TutorialOverlay.jsx**
- 移除 early return（在 Hooks 之前）
- 在 useEffect 中添加 null 检查
- 在所有 Hooks 之后添加 early return

---

## 🎉 总结 / Summary

### 问题
❌ React Hooks 错误：Hooks 在 early return 之后调用

### 原因
❌ 违反了 React Hooks 规则：Hooks 必须在所有 early return 之前调用

### 解决
✅ 将所有 Hooks 移到组件顶部，early return 移到最后

### 结果
✅ 没有 React 错误
✅ 教程完成后正确切换到建造模式
✅ 代码符合 React 最佳实践

---

**修复完成！** 🎉

现在 React Hooks 错误已修复，教程完成后应该能正确切换到建造模式了！

---

**最后更新**: 2026-01-18  
**版本**: 2.1.3  
**状态**: ✅ React Hooks 错误已修复 / React Hooks Error Fixed
