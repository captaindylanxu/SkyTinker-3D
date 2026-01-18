# Vercel 环境变量调试步骤

## 🎯 我刚才做了什么

为了帮助诊断为什么环境变量在 Vercel 上不生效，我添加了以下文件：

### 1. `vercel.json` - Vercel 配置文件
明确告诉 Vercel 这是一个 Vite 项目，使用正确的构建命令。

### 2. `check-env.js` - 构建时环境变量检查脚本
在构建时打印环境变量的状态，帮助我们看到 Vercel 是否正确注入了环境变量。

### 3. 更新 `vite.config.js`
添加了 `define` 配置，显式地将环境变量注入到构建中。

### 4. 更新 `package.json`
修改了 build 脚本，在构建前运行检查脚本。

## 📋 现在你需要做什么

### 步骤 1：等待 Vercel 自动部署

我已经推送了代码到 GitHub，Vercel 应该会自动触发新的部署。

1. 打开 Vercel Dashboard
2. 进入 Deployments 页面
3. 等待新的部署开始（应该已经在进行中）

### 步骤 2：查看构建日志（重要！）

这次部署会在构建日志中显示环境变量的状态：

1. 点击正在进行的部署
2. 查看 "Building" 阶段的日志
3. **寻找以下输出**：

```
🔍 Checking environment variables at build time...
VITE_SUPABASE_URL: ✓ Set 或 ✗ Missing
VITE_SUPABASE_ANON_KEY: ✓ Set 或 ✗ Missing
```

### 步骤 3：根据日志结果判断

#### 情况 A：日志显示 "✓ Set"

如果构建日志显示：
```
✅ All environment variables are present at build time!
```

说明环境变量在构建时是存在的，问题可能在 Vite 的处理上。

**解决方案**：我已经在 `vite.config.js` 中添加了显式的 `define` 配置，应该能解决。

#### 情况 B：日志显示 "✗ Missing"

如果构建日志显示：
```
❌ Environment variables are missing at build time!
```

说明 Vercel 没有正确注入环境变量。可能的原因：

1. **环境变量设置有问题**
   - 检查是否有拼写错误
   - 检查是否有隐藏的空格或特殊字符

2. **Vercel 项目配置问题**
   - 可能需要在 Vercel Dashboard 中重新连接 GitHub 仓库
   - 可能需要删除并重新创建环境变量

### 步骤 4：验证部署结果

部署完成后：

1. 访问你的网站
2. 打开开发者工具（F12）
3. 查看 Console
4. 应该看到：
   ```
   🔧 Supabase Config: { ... }
   ✅ Supabase configured: true
   ```

## 🔍 如果还是不行

### 方案 1：删除并重新创建环境变量

有时候 Vercel 的环境变量会出现缓存问题：

1. 在 Vercel Dashboard → Settings → Environment Variables
2. **删除** `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
3. 等待几秒钟
4. **重新添加**这两个变量：
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://zwtxjoamnjhuveaxwlbv.supabase.co`
   - Environments: ✓ Production ✓ Preview ✓ Development
   
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完整的 key）
   - Environments: ✓ Production ✓ Preview ✓ Development

5. 重新部署（不使用缓存）

### 方案 2：检查 Vercel 项目设置

1. Vercel Dashboard → Settings → General
2. 检查 "Framework Preset"：应该是 "Vite" 或 "Other"
3. 检查 "Build & Development Settings"：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 方案 3：使用 Vercel CLI 本地测试

```bash
# 安装 Vercel CLI
npm i -g vercel

# 链接项目
vercel link

# 拉取环境变量到本地
vercel env pull .env.local

# 查看拉取的环境变量
cat .env.local

# 本地构建测试
npm run build
```

这样可以确认 Vercel 是否真的有这些环境变量。

## 📸 请提供以下信息

如果还是不行，请提供：

1. **构建日志截图**
   - 特别是 `check-env.js` 的输出部分

2. **Vercel 项目设置截图**
   - Settings → General → Framework Preset
   - Settings → General → Build & Development Settings

3. **环境变量详情截图**
   - 点击每个环境变量查看完整配置

## 💡 为什么会这样？

Vite 的环境变量处理有时候在某些部署平台上会有问题，特别是：

1. **构建时替换**：Vite 在构建时会将 `import.meta.env.VITE_*` 替换为实际值
2. **环境变量注入时机**：如果 Vercel 在 Vite 读取环境变量之后才注入，就会失败
3. **缓存问题**：Vercel 的构建缓存可能导致使用旧的配置

我添加的 `define` 配置可以强制 Vite 从 `process.env` 读取环境变量，这样更可靠。

## 🎯 下一步

等待 Vercel 部署完成，然后：
1. 查看构建日志
2. 告诉我看到了什么
3. 我会根据日志结果提供进一步的解决方案
