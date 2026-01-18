# Vercel 配置完整检查清单

## 🔍 问题诊断

环境变量在构建时存在，但运行时不存在。这通常是 Vercel 项目配置的问题。

## 📋 完整检查步骤

### 1. 检查 Framework Preset

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **General**
4. 找到 **Framework Preset** 部分

**应该设置为**：
- ✅ `Vite` 
- 或 ✅ `Other`（如果没有 Vite 选项）

**不应该是**：
- ❌ `Create React App`
- ❌ `Next.js`
- ❌ 其他框架

### 2. 检查 Build & Development Settings

在同一个 Settings → General 页面，找到 **Build & Development Settings**：

#### Build Command
```
npm run build
```
或者留空（使用 package.json 中的默认命令）

#### Output Directory
```
dist
```
⚠️ **非常重要**：Vite 的输出目录是 `dist`，不是 `build`

#### Install Command
```
npm install
```
或者留空

### 3. 检查 Node.js Version

在 Settings → General，找到 **Node.js Version**：

**推荐版本**：
- ✅ `18.x`（推荐）
- ✅ `20.x`
- ❌ 不要使用太旧的版本（如 14.x）

### 4. 检查环境变量的详细配置

进入 **Settings** → **Environment Variables**

对于每个环境变量（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）：

#### 点击变量查看详情，确认：

1. **Name**（名称）
   ```
   VITE_SUPABASE_URL
   ```
   ⚠️ 必须完全匹配，区分大小写

2. **Value**（值）
   - URL: `https://zwtxjoamnjhuveaxwlbv.supabase.co`
   - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完整的 208 字符）
   - ⚠️ 确保没有前后空格
   - ⚠️ 确保没有换行符
   - ⚠️ 确保没有引号（不要加 `"` 或 `'`）

3. **Environments**（环境）
   - ✅ Production（必须勾选！）
   - ✅ Preview
   - ✅ Development

4. **Target**（目标）
   - 应该显示你的项目名称
   - 如果有多个项目，确保选择了正确的项目

### 5. 检查是否有 .vercelignore 文件

在项目根目录检查是否有 `.vercelignore` 文件：

```bash
# 如果存在，确保没有忽略 .env 相关的配置
# .vercelignore 不应该包含：
# .env
# .env.*
```

### 6. 检查 Git 集成

1. Settings → Git
2. 确认 **Connected Git Repository** 是正确的仓库
3. 确认 **Production Branch** 是 `main`（或你使用的主分支）

### 7. 删除并重新创建环境变量（重要！）

有时候 Vercel 的环境变量会有缓存问题：

1. **删除现有的环境变量**
   - Settings → Environment Variables
   - 点击 `VITE_SUPABASE_URL` 右侧的 "..." → Delete
   - 点击 `VITE_SUPABASE_ANON_KEY` 右侧的 "..." → Delete
   - 确认删除

2. **等待 10 秒**

3. **重新添加环境变量**
   - 点击 "Add New" 或 "Add Environment Variable"
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://zwtxjoamnjhuveaxwlbv.supabase.co`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - 点击 "Save"
   
   - 再次点击 "Add New"
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dHhqb2FtbmpodXZlYXh3bGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTIyODgsImV4cCI6MjA4NDI2ODI4OH0.kt9odd3uDARzZ3mlls3zjgHuiJC4A3hyYVtEtDTIea0`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - 点击 "Save"

### 8. 强制重新部署（清除所有缓存）

1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击 "..." → **Redeploy**
4. ⚠️ **取消勾选** "Use existing Build Cache"
5. 点击 "Redeploy"

### 9. 检查部署日志

部署完成后，查看构建日志：

1. 点击部署查看详情
2. 查看 "Building" 阶段
3. 应该看到：
   ```
   🔍 Checking environment variables at build time...
   VITE_SUPABASE_URL: ✓ Set
   VITE_SUPABASE_ANON_KEY: ✓ Set
   ```

### 10. 检查运行时环境变量

部署完成后，访问网站：

1. 打开开发者工具（F12）
2. 查看 Console
3. 应该看到：
   ```
   🔍 All import.meta.env: {
     VITE_SUPABASE_URL: "https://zwtxjoamnjhuveaxwlbv.supabase.co",
     VITE_SUPABASE_ANON_KEY: "eyJ...",
     ...
   }
   ```

## 🎯 最可能的问题

根据经验，最常见的问题是：

### 问题 1：Output Directory 设置错误
- ❌ 设置为 `build`
- ✅ 应该是 `dist`

### 问题 2：环境变量没有应用到 Production
- 在环境变量详情中，Production 没有勾选

### 问题 3：Framework Preset 错误
- 设置为了其他框架（如 Create React App）
- 应该是 Vite 或 Other

### 问题 4：环境变量值有问题
- 包含了多余的空格
- 包含了引号
- 被截断了

### 问题 5：构建缓存
- 使用了旧的构建缓存
- 需要清除缓存重新部署

## 📸 请提供以下截图

如果以上步骤都检查了还是不行，请提供：

1. **Settings → General 页面截图**
   - Framework Preset
   - Build & Development Settings
   - Node.js Version

2. **Settings → Environment Variables 页面截图**
   - 显示所有环境变量的列表

3. **点击 VITE_SUPABASE_URL 的详情截图**
   - 显示 Name、Value、Environments

4. **最新部署的构建日志截图**
   - Building 阶段的完整日志

5. **网站控制台截图**
   - 显示 import.meta.env 的内容

## 🔧 备用方案：使用 Vercel CLI

如果 Dashboard 配置有问题，可以尝试使用 CLI：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 添加环境变量
vercel env add VITE_SUPABASE_URL production
# 输入值：https://zwtxjoamnjhuveaxwlbv.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 输入值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 查看环境变量
vercel env ls

# 部署
vercel --prod
```

## 💡 调试技巧

### 在 vite.config.js 中打印环境变量

我们已经在 `vite.config.js` 中使用了 `loadEnv`，但可以添加更多调试：

```javascript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔧 Vite Config Debug:')
  console.log('  Mode:', mode)
  console.log('  CWD:', process.cwd())
  console.log('  All VITE_ vars:', Object.keys(env).filter(k => k.startsWith('VITE_')))
  console.log('  VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'Set' : 'Missing')
  console.log('  VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
  
  // ...
})
```

这些日志会出现在 Vercel 的构建日志中。

## 🎯 下一步

1. 按照上面的清单逐项检查
2. 特别注意 **Output Directory** 和 **Framework Preset**
3. 尝试删除并重新创建环境变量
4. 清除缓存重新部署
5. 提供截图以便进一步诊断
