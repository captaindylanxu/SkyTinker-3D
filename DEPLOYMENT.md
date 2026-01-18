# 部署指南

## 快速部署到 Vercel

### 1. 准备工作

确保你的代码已推送到 GitHub 仓库。

### 2. 部署前端到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测到 Vite 项目
5. 点击 "Deploy"

### 3. 配置排行榜（可选）

如果你想启用排行榜功能：

1. 按照 `SUPABASE_SETUP.md` 创建 Supabase 项目
2. 在 Vercel 项目设置中添加环境变量：
   - 进入项目 → Settings → Environment Variables
   - 添加 `VITE_SUPABASE_URL`
   - 添加 `VITE_SUPABASE_ANON_KEY`
3. 重新部署项目（Vercel 会自动触发）

### 4. 不使用排行榜

如果不配置 Supabase：
- 游戏仍然可以正常运行
- 新手引导会显示"跳过"选项
- 排行榜按钮不会显示
- 本地最高分仍然会保存

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 环境变量

### 必需（仅排行榜功能）
- `VITE_SUPABASE_URL`: Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名密钥

### 本地开发
创建 `.env` 文件：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Vercel 部署
在 Vercel 项目设置中添加环境变量。

## 更新部署

只需推送代码到 GitHub，Vercel 会自动部署：

```bash
git add .
git commit -m "Update game"
git push origin main
```

## 性能优化建议

1. **启用 Vercel Analytics**（可选）
   - 在 Vercel 项目设置中启用
   - 监控访问量和性能

2. **CDN 缓存**
   - Vercel 自动处理静态资源缓存
   - 无需额外配置

3. **图片优化**
   - 使用 WebP 格式
   - 压缩 PNG/SVG 文件

## 故障排除

### 部署失败
- 检查 `package.json` 中的构建命令
- 查看 Vercel 部署日志

### 排行榜不工作
- 检查环境变量是否正确配置
- 查看浏览器控制台错误信息
- 确认 Supabase 数据库表已创建

### 游戏加载慢
- 检查网络连接
- 清除浏览器缓存
- 使用 Vercel Analytics 分析性能

## 成本估算

- **Vercel**: 免费版足够（100GB 带宽/月）
- **Supabase**: 免费版足够（500MB 数据库，2GB 带宽/月）
- **总成本**: $0/月（免费版）

## 扩展建议

如果游戏流行，可以考虑：
1. 升级到 Vercel Pro（$20/月）- 更多带宽
2. 升级到 Supabase Pro（$25/月）- 更大数据库
3. 添加 CDN 加速（Cloudflare 免费版）
