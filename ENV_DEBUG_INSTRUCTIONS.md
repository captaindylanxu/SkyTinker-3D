# 环境变量可视化调试

## 🎯 我添加了什么

在页面右上角添加了一个**可视化调试面板**，会实时显示环境变量的状态。

## 📋 等待部署完成后

1. **访问 Vercel 部署的网站**
2. **查看右上角的调试面板**

### 你会看到以下信息：

```
🔍 环境变量调试

MODE: production

VITE_SUPABASE_URL:
https://zwtxjoamnjhuveaxwlbv.supabase.co  ← 绿色表示正常

VITE_SUPABASE_ANON_KEY:
eyJhbGciOiJIUzI1NiIsI... (长度: 208)  ← 绿色表示正常

✅ 环境变量正常  ← 绿色边框
```

或者：

```
🔍 环境变量调试

MODE: production

VITE_SUPABASE_URL:
❌ 未设置  ← 红色表示异常

VITE_SUPABASE_ANON_KEY:
❌ 未设置  ← 红色表示异常

❌ 环境变量异常  ← 红色边框
```

## 🔍 根据结果判断

### 情况 A：显示 "✅ 环境变量正常"（绿色边框）

说明环境变量已经正确注入！如果还是连接不上 Supabase，可能是：
- Supabase 服务本身的问题
- 网络问题
- Key 的权限问题

### 情况 B：显示 "❌ 环境变量异常"（红色边框）

说明环境变量没有被注入到构建中。需要检查：

1. **Vercel 项目设置**
   - Settings → General → Output Directory 是否是 `dist`
   - Settings → General → Framework Preset 是否是 `Vite`

2. **删除并重新创建环境变量**
   - Settings → Environment Variables
   - 删除现有的两个变量
   - 等待 10 秒
   - 重新添加
   - 确保勾选 Production

3. **清除缓存重新部署**
   - Deployments → 最新部署 → Redeploy
   - 取消勾选 "Use existing Build Cache"

## 📸 请截图

部署完成后，请截图：
1. **右上角的调试面板**
2. **浏览器控制台**（F12 → Console）

这样我就能准确判断问题所在了！

## 🗑️ 删除调试组件

问题解决后，可以删除调试组件：

1. 从 `src/App.jsx` 中删除：
   ```jsx
   import EnvDebug from './components/EnvDebug';
   // ...
   <EnvDebug />
   ```

2. 删除文件：
   - `src/components/EnvDebug.jsx`
   - `src/lib/supabase-test.js`

## 💡 为什么这样做？

之前我们只能通过控制台查看环境变量，但现在：
- ✅ 直接在页面上显示，更直观
- ✅ 颜色编码，一眼就能看出问题
- ✅ 显示详细信息（长度、值等）
- ✅ 不需要打开开发者工具

这样能快速定位问题是在 Vercel 配置还是代码层面。
