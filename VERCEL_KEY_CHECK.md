# Vercel 环境变量 Key 长度问题

## 🔍 发现的问题

从构建日志看到：
```
Key length: 208
```

但是一个完整的 Supabase anon key 通常是 **267 个字符**左右。

## 📋 检查步骤

### 1. 获取完整的 Supabase Anon Key

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目：`zwtxjoamnjhuveaxwlbv`
3. 进入 **Settings** → **API**
4. 找到 **Project API keys** 部分
5. 复制 **anon** / **public** key（不是 service_role key！）

### 2. 验证 Key 的完整性

一个完整的 Supabase anon key 应该：
- 以 `eyJ` 开头
- 包含两个点 `.` 分隔三个部分
- 总长度约 **250-300 个字符**
- 格式：`eyJxxx.eyJyyy.zzz`

示例（不是真实的 key）：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dHhqb2FtbmpodXZlYXh3bGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTIyODgsImV4cCI6MjA4NDI2ODI4OH0.kt9odd3uDARzZ3mlls3zjgHuiJC4A3hyYVtEtDTIea0
```

### 3. 更新 Vercel 环境变量

1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 点击 `VITE_SUPABASE_ANON_KEY` 右侧的 **"..."** → **Edit**
3. **删除旧的值**
4. **粘贴完整的新 key**
   - ⚠️ 确保没有多余的空格
   - ⚠️ 确保没有换行符
   - ⚠️ 确保复制了完整的 key（从 `eyJ` 开始到最后一个字符）
5. 确保勾选了 **Production**、**Preview**、**Development**
6. 点击 **Save**

### 4. 重新部署

1. Deployments → 最新部署 → "..." → Redeploy
2. 取消勾选 "Use existing Build Cache"
3. 点击 Redeploy

### 5. 验证

部署完成后，查看构建日志，应该看到：
```
Key length: 267  ← 或者类似的长度（250-300）
```

然后访问网站，控制台应该显示：
```
✅ Supabase configured: true
```

## 🎯 为什么 Key 长度很重要？

Supabase 的 anon key 是一个 JWT (JSON Web Token)，包含三个部分：

1. **Header**（头部）：算法和类型信息
2. **Payload**（载荷）：项目信息、权限、过期时间等
3. **Signature**（签名）：验证 token 的完整性

如果 key 被截断（只有 208 个字符），可能缺少签名部分，导致：
- Supabase 客户端无法验证 token
- 连接失败
- 显示 "configured: false"

## 💡 常见错误

### 错误 1：复制时没有选中完整的 key
在 Supabase Dashboard 复制时，确保：
- 点击 "Copy" 按钮（不要手动选择）
- 或者手动选择时，从第一个字符选到最后一个字符

### 错误 2：粘贴时添加了换行符
在 Vercel 的文本框中粘贴时：
- 确保是单行
- 没有换行符
- 没有多余的空格

### 错误 3：使用了错误的 key
确保使用的是：
- ✅ **anon** / **public** key（可以在客户端使用）
- ❌ 不是 **service_role** key（只能在服务器端使用）

## 🔗 相关链接

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase API Keys 文档](https://supabase.com/docs/guides/api/api-keys)

## 📸 截图参考

在 Supabase Dashboard 的 Settings → API 页面，你应该看到：

```
Project API keys

anon / public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dHhqb2FtbmpodXZlYXh3bGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTIyODgsImV4cCI6MjA4NDI2ODI4OH0.kt9odd3uDARzZ3mlls3zjgHuiJC4A3hyYVtEtDTIea0
[Copy] [Reveal]

service_role / secret
[Hidden - Do not use in client-side code]
```

点击 **anon / public** 旁边的 **Copy** 按钮，然后粘贴到 Vercel。
