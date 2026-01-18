# Vercel 环境变量配置指南

## 问题：Supabase configured: false

### 原因分析
即使在 Vercel 设置了环境变量，仍然显示 `Supabase configured: false`，通常是因为：

1. ❌ 环境变量设置后没有重新部署
2. ❌ 环境变量没有应用到正确的环境
3. ❌ 构建缓存导致使用了旧的环境变量
4. ❌ 环境变量名称或值有误

## ✅ 正确配置步骤

### 1. 确认环境变量名称
在 Vercel 项目设置中，确保使用以下名称（必须有 `VITE_` 前缀）：

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 2. 确认环境变量值
- **VITE_SUPABASE_URL**: `https://zwtxjoamnjhuveaxwlbv.supabase.co`
- **VITE_SUPABASE_ANON_KEY**: 以 `eyJ` 开头的长字符串

### 3. 选择正确的环境
在添加环境变量时，确保勾选了：
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. 重新部署（重要！）

环境变量更改后，**必须**触发新的部署：

#### 方法 1：通过 Vercel Dashboard
1. 进入项目的 "Deployments" 页面
2. 找到最新的部署
3. 点击右侧的 "..." 菜单
4. 选择 "Redeploy"
5. 勾选 "Use existing Build Cache" 的选项要**取消勾选**
6. 点击 "Redeploy"

#### 方法 2：通过 Git 推送
```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

#### 方法 3：通过 Vercel CLI
```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 重新部署
vercel --prod
```

### 5. 验证部署

部署完成后：

1. 打开部署的网站
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签
4. 应该看到：
   ```
   Supabase Config: {
     url: "https://zwtxjoamnjhuveaxwlbv...",
     keyLength: 267,
     keyPrefix: "eyJhbGciOi..."
   }
   Supabase configured: true
   ```

## 🔍 调试步骤

### 检查环境变量是否生效

在部署的网站控制台中运行：

```javascript
// 检查环境变量
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
```

### 如果仍然显示 undefined

1. **清除构建缓存**
   - 在 Vercel Dashboard 重新部署时，取消勾选 "Use existing Build Cache"

2. **检查 .gitignore**
   - 确保 `.env` 文件在 `.gitignore` 中（不要提交到 Git）
   - Vercel 会使用 Dashboard 中设置的环境变量

3. **检查 Vercel 项目设置**
   - 进入 Settings → Environment Variables
   - 确认变量存在且值正确
   - 确认应用到了 Production 环境

4. **查看构建日志**
   - 在 Deployments 页面点击最新部署
   - 查看 "Building" 阶段的日志
   - 搜索 "VITE_SUPABASE" 确认变量是否被识别

## 📝 常见错误

### 错误 1：忘记 VITE_ 前缀
❌ `SUPABASE_URL`  
✅ `VITE_SUPABASE_URL`

Vite 只会将 `VITE_` 前缀的环境变量暴露给客户端代码。

### 错误 2：环境变量值有空格
确保复制粘贴时没有多余的空格：
❌ `https://xxx.supabase.co ` (末尾有空格)  
✅ `https://xxx.supabase.co`

### 错误 3：使用了错误的 Key
确保使用的是 **anon/public** key，不是 service_role key：
- ✅ anon key: 以 `eyJ` 开头，可以在客户端使用
- ❌ service_role key: 不应该暴露在客户端

### 错误 4：没有重新部署
环境变量更改后，旧的部署不会自动更新，必须触发新的部署。

## 🎯 快速修复清单

- [ ] 确认环境变量名称有 `VITE_` 前缀
- [ ] 确认环境变量值正确（无空格、无换行）
- [ ] 确认应用到了 Production 环境
- [ ] 清除构建缓存并重新部署
- [ ] 等待部署完成（通常 1-2 分钟）
- [ ] 刷新网站并检查控制台

## 🔗 相关链接

- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase 项目设置](https://app.supabase.com)

## 💡 提示

如果本地开发正常（`npm run dev`），但 Vercel 部署后不正常，99% 是因为：
1. 环境变量没有在 Vercel 中设置
2. 设置后没有重新部署
3. 构建缓存导致使用了旧配置

**解决方案**：清除缓存并重新部署！
