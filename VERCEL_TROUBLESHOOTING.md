# Vercel 环境变量故障排除

## 当前状态
❌ 环境变量显示 Missing
❌ Supabase configured: false

## 🎯 立即执行的步骤

### 1. 检查 Vercel 环境变量配置

进入 Vercel Dashboard → 你的项目 → Settings → Environment Variables

**必须确认以下几点：**

#### ✓ 变量名称正确
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
注意：必须有 `VITE_` 前缀！

#### ✓ 变量值正确
- **VITE_SUPABASE_URL**: `https://zwtxjoamnjhuveaxwlbv.supabase.co`
- **VITE_SUPABASE_ANON_KEY**: 以 `eyJ` 开头的长字符串（约 267 个字符）

#### ✓ 应用到 Production 环境
点击每个变量查看详情，确保 "Environments" 部分勾选了：
- ✅ Production
- ✅ Preview
- ✅ Development

**如果没有勾选 Production，这就是问题所在！**

### 2. 清除缓存并重新部署

这是最关键的步骤！环境变量更改后，必须重新部署才能生效。

#### 方法 A：通过 Vercel Dashboard（推荐）

1. 进入 **Deployments** 标签
2. 找到最新的部署（顶部第一个）
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. ⚠️ **重要**：**取消勾选** "Use existing Build Cache"
6. 点击 **"Redeploy"** 按钮
7. 等待部署完成（1-2 分钟）

#### 方法 B：通过 Git 推送

```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "Redeploy for env vars"
git push origin main
```

### 3. 验证部署

部署完成后：

1. 访问你的网站
2. 打开开发者工具（F12）
3. 查看 Console 标签
4. 应该看到：
   ```
   🔧 Supabase Config: {
     url: "https://zwtxjoamnjhuveaxwlbv...",
     keyLength: 267,
     keyPrefix: "eyJhbGciOi...",
     envMode: "production",
     isDev: false,
     isProd: true
   }
   ✅ Supabase configured: true
   ```

## 🔍 常见问题

### Q1: 我已经设置了环境变量，为什么还是 Missing？

**A**: 环境变量是在**构建时**注入的，不是运行时。设置后必须重新部署。

### Q2: 我已经重新部署了，还是 Missing？

**A**: 可能的原因：
1. 环境变量没有应用到 Production 环境
2. 使用了构建缓存（必须取消勾选 "Use existing Build Cache"）
3. 变量名称错误（必须有 `VITE_` 前缀）

### Q3: 本地开发正常，Vercel 部署后不正常？

**A**: 本地使用 `.env` 文件，Vercel 使用 Dashboard 中的环境变量。两者是独立的。

### Q4: 如何确认环境变量已经应用到 Production？

**A**: 
1. Vercel Dashboard → Settings → Environment Variables
2. 点击变量名称查看详情
3. 查看 "Environments" 部分是否勾选了 Production

## 📸 截图参考

### 正确的环境变量配置应该是：

```
Name: VITE_SUPABASE_URL
Value: https://zwtxjoamnjhuveaxwlbv.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（很长的字符串）
Environments: ✓ Production ✓ Preview ✓ Development
```

### 重新部署时的设置：

```
Redeploy to Production
☐ Use existing Build Cache  ← 必须取消勾选！
```

## 🎯 快速检查清单

在重新部署之前，确认以下所有项目：

- [ ] 变量名称：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- [ ] 变量值：URL 和 Key 都正确，无空格
- [ ] 应用环境：Production 已勾选
- [ ] 重新部署：取消勾选 "Use existing Build Cache"
- [ ] 等待完成：部署状态显示 "Ready"

## 💡 调试技巧

### 查看构建日志

1. Vercel Dashboard → Deployments
2. 点击最新的部署
3. 查看 "Building" 阶段的日志
4. 搜索 "VITE_SUPABASE" 看是否有相关信息

### 查看部署详情

1. 点击部署查看详情
2. 查看 "Environment Variables" 部分
3. 确认变量是否被识别

## 🆘 如果以上都不行

1. **删除并重新创建环境变量**
   - 在 Vercel Dashboard 中删除现有的环境变量
   - 重新添加，确保名称和值都正确
   - 确保勾选 Production
   - 重新部署

2. **检查 Vercel 项目设置**
   - 确认 Framework Preset 是 "Vite"
   - 确认 Build Command 是 "npm run build" 或 "vite build"
   - 确认 Output Directory 是 "dist"

3. **联系 Vercel 支持**
   - 如果以上都不行，可能是 Vercel 平台问题
   - 可以在 Vercel Dashboard 中提交支持请求

## 📚 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase 客户端配置](https://supabase.com/docs/reference/javascript/initializing)
