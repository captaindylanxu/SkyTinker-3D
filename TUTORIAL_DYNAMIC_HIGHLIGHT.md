# 教程高亮框动态定位实现 / Tutorial Dynamic Highlight Implementation

## 🎯 问题描述 / Problem Description

**用户反馈**: "现在这个框还是不对，你可能得再考虑一下适配不同形状的屏幕和浏览器窗口大小。现在这个高亮框是在最底部"

### 根本原因 / Root Cause

使用固定的 CSS 定位（`bottom: 20px`, `height: 200px`）无法适配：
- ❌ 不同屏幕尺寸
- ❌ 不同浏览器窗口大小
- ❌ 工具栏的动态高度（内容多少会影响高度）
- ❌ 响应式布局变化

---

## ✅ 解决方案 / Solution

### 核心思路

从**静态 CSS 定位**改为**动态 JavaScript 定位**：
1. 使用 `getBoundingClientRect()` 获取元素的实际位置和大小
2. 动态设置高亮框的 `top`, `left`, `width`, `height`
3. 监听窗口大小变化，实时更新位置
4. 适配所有屏幕尺寸和窗口大小

---

## 🔧 技术实现 / Technical Implementation

### 1. JavaScript 动态获取位置

```javascript
const [highlightRect, setHighlightRect] = useState(null);

useEffect(() => {
  if (!currentStep.highlight) {
    setHighlightRect(null);
    return;
  }

  const updateHighlightPosition = () => {
    let element = null;
    
    // 根据不同的高亮目标选择元素
    if (currentStep.highlight === '.toolbar') {
      element = document.querySelector('.toolbar');
    } else if (currentStep.highlight === '.delete-mode-btn') {
      // 高亮整个工具栏（因为删除按钮在工具栏内）
      element = document.querySelector('.toolbar');
    } else if (currentStep.highlight === '.toggle-button') {
      element = document.querySelector('.mode-toggle');
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  // 初始获取位置
  updateHighlightPosition();

  // 监听窗口大小变化
  window.addEventListener('resize', updateHighlightPosition);
  
  // 延迟更新（等待DOM渲染）
  const timer = setTimeout(updateHighlightPosition, 100);

  return () => {
    window.removeEventListener('resize', updateHighlightPosition);
    clearTimeout(timer);
  };
}, [currentStep.highlight]);
```

### 2. 动态应用样式

```jsx
<div 
  className="tutorial-highlight" 
  data-highlight={currentStep.highlight}
  style={{
    top: `${highlightRect.top}px`,
    left: `${highlightRect.left}px`,
    width: `${highlightRect.width}px`,
    height: `${highlightRect.height}px`,
  }}
/>
```

### 3. CSS 简化

```css
/* 高亮区域 - 使用 fixed 定位 + 动态样式 */
.tutorial-highlight {
  position: fixed;
  pointer-events: none;
  z-index: 1801;
  border: 3px solid #fbbf24;
  border-radius: 12px;
  background: transparent;
  animation: pulse 2s ease-in-out infinite;
  transition: all 0.3s ease;
}

/* 画布高亮 - 仍使用静态定位（居中） */
.tutorial-highlight[data-highlight="canvas"] {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
}
```

---

## 📊 对比分析 / Comparison

### 旧方案：静态 CSS 定位

```css
.tutorial-highlight[data-highlight=".toolbar"] {
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 200px;
}
```

**问题**:
- ❌ 固定的 `bottom` 值不适配所有屏幕
- ❌ 固定的 `height` 不匹配动态内容
- ❌ 窗口大小变化时位置错误
- ❌ 需要为每个屏幕尺寸写媒体查询

### 新方案：动态 JavaScript 定位

```javascript
const rect = element.getBoundingClientRect();
setHighlightRect({
  top: rect.top,
  left: rect.left,
  width: rect.width,
  height: rect.height,
});
```

**优势**:
- ✅ 自动适配所有屏幕尺寸
- ✅ 精确匹配元素的实际位置和大小
- ✅ 窗口大小变化时自动更新
- ✅ 不需要复杂的媒体查询

---

## 🎨 工作原理 / How It Works

### 1. 初始化

```
组件挂载
    ↓
useEffect 触发
    ↓
查找目标元素 (querySelector)
    ↓
获取元素位置 (getBoundingClientRect)
    ↓
设置高亮框位置 (setHighlightRect)
    ↓
渲染高亮框
```

### 2. 窗口大小变化

```
用户调整窗口大小
    ↓
resize 事件触发
    ↓
重新获取元素位置
    ↓
更新高亮框位置
    ↓
高亮框平滑过渡到新位置 (transition)
```

### 3. 教程步骤变化

```
用户进入下一步
    ↓
currentStep.highlight 改变
    ↓
useEffect 重新执行
    ↓
获取新目标元素位置
    ↓
更新高亮框位置
```

---

## 🔍 getBoundingClientRect() 详解

### 返回值

```javascript
{
  top: 100,      // 元素顶部距离视口顶部的距离
  left: 50,      // 元素左侧距离视口左侧的距离
  width: 800,    // 元素的宽度
  height: 200,   // 元素的高度
  right: 850,    // 元素右侧距离视口左侧的距离
  bottom: 300,   // 元素底部距离视口顶部的距离
}
```

### 为什么使用 fixed 定位？

```css
position: fixed;
```

因为 `getBoundingClientRect()` 返回的是相对于**视口**的位置，所以高亮框也必须使用 `fixed` 定位（相对于视口）。

---

## 🎯 特殊处理 / Special Cases

### 1. 画布高亮

画布不是固定的 DOM 元素，所以仍使用静态定位：

```jsx
{currentStep.highlight === 'canvas' && (
  <div 
    className="tutorial-highlight" 
    data-highlight="canvas"
  />
)}
```

```css
.tutorial-highlight[data-highlight="canvas"] {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
}
```

### 2. 删除模式按钮

删除按钮在工具栏内部，所以高亮整个工具栏：

```javascript
if (currentStep.highlight === '.delete-mode-btn') {
  element = document.querySelector('.toolbar');
}
```

### 3. 延迟更新

等待 DOM 渲染完成后再获取位置：

```javascript
const timer = setTimeout(updateHighlightPosition, 100);
```

---

## 🚀 性能优化 / Performance Optimization

### 1. 防抖处理

可以添加防抖来减少 resize 事件的触发频率：

```javascript
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const debouncedUpdate = debounce(updateHighlightPosition, 100);
window.addEventListener('resize', debouncedUpdate);
```

### 2. CSS 过渡

使用 CSS transition 让位置变化更平滑：

```css
.tutorial-highlight {
  transition: all 0.3s ease;
}
```

### 3. 清理监听器

组件卸载时移除事件监听器：

```javascript
return () => {
  window.removeEventListener('resize', updateHighlightPosition);
  clearTimeout(timer);
};
```

---

## ✅ 测试验证 / Testing Verification

### 测试场景

1. **不同屏幕尺寸**
   - 桌面端（1920x1080）
   - 笔记本（1366x768）
   - 平板（768x1024）
   - 手机（375x667）

2. **窗口大小变化**
   - 拖动浏览器窗口边缘
   - 全屏/退出全屏
   - 开发者工具打开/关闭

3. **不同教程步骤**
   - 步骤2: 选择零件（工具栏）
   - 步骤3: 放置零件（画布）
   - 步骤5: 删除模式（工具栏）
   - 步骤6: 开始飞行（顶部按钮）

### 预期效果

- ✅ 高亮框始终精确覆盖目标元素
- ✅ 窗口大小变化时自动调整
- ✅ 所有屏幕尺寸都正确显示
- ✅ 位置变化平滑过渡

---

## 🎨 视觉效果 / Visual Effect

### 桌面端（大屏幕）

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ 工具栏 (高亮)                  ┃  │
│  ┃ [删除模式按钮]                 ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────────────────────┘
```

### 移动端（小屏幕）

```
┌─────────────────┐
│                 │
│                 │
│                 │
│                 │
│  ┏━━━━━━━━━━━┓ │
│  ┃ 工具栏    ┃ │
│  ┃ [删除]    ┃ │
│  ┗━━━━━━━━━━━┛ │
└─────────────────┘
```

---

## 📝 相关文件 / Related Files

### 修改的文件

1. **src/components/UI/TutorialOverlay.jsx**
   - 添加 `highlightRect` 状态
   - 添加 `useEffect` 动态获取位置
   - 更新 JSX 使用动态样式

2. **src/components/UI/TutorialOverlay.css**
   - 移除固定定位样式
   - 简化 CSS 规则
   - 保留动画和过渡效果

---

## 💡 未来改进 / Future Improvements

### 1. 防抖优化

```javascript
import { debounce } from 'lodash';

const debouncedUpdate = debounce(updateHighlightPosition, 100);
```

### 2. IntersectionObserver

监听元素可见性，只在可见时更新：

```javascript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    updateHighlightPosition();
  }
});
```

### 3. ResizeObserver

监听元素大小变化（比 window resize 更精确）：

```javascript
const resizeObserver = new ResizeObserver(() => {
  updateHighlightPosition();
});
resizeObserver.observe(element);
```

---

## 🎉 总结 / Summary

### 问题
❌ 固定 CSS 定位无法适配不同屏幕和窗口大小

### 原因
❌ 使用固定的 `bottom`, `height` 值

### 解决
✅ 使用 JavaScript 动态获取元素位置

### 结果
✅ 完美适配所有屏幕尺寸
✅ 窗口大小变化时自动调整
✅ 精确匹配目标元素位置

---

**修复完成！** 🎉

现在高亮框能自动适配任何屏幕尺寸和窗口大小了！

---

**最后更新**: 2026-01-18  
**版本**: 2.1.0  
**状态**: ✅ 动态定位已实现 / Dynamic Positioning Implemented
