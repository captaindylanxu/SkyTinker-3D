# 快速开始 / Quick Start Guide

## 🚀 本地开发 / Local Development

### 1. 启动服务 / Start Server
```bash
npm run dev
```
访问: http://localhost:5174

### 2. 配置 Supabase（可选）/ Configure Supabase (Optional)

如果需要排行榜功能，请配置 Supabase：

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Supabase 配置：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. 重启开发服务器

详细设置请查看: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📱 功能概览 / Features Overview

### 账号系统 / Account System
- **首次访问**: 显示欢迎界面
- **创建账号**: 昵称 + 可选PIN码
- **找回账号**: 昵称 + PIN验证
- **跳过**: 直接开始游戏（不参与排行榜）

### 新手引导 / Tutorial
- **自动检测**: 智能识别用户操作
- **可跳过**: 随时跳过教程
- **8个步骤**: 从建造到飞行的完整指导

### 排行榜 / Leaderboard
- **位置**: 左上角 🏆 按钮
- **功能**: 查看全球前100名
- **自动提交**: 新纪录自动上传

### 多语言 / Languages
- 自动检测浏览器语言
- 支持8种语言

## 🎮 游戏玩法 / How to Play

### 建造模式 / Build Mode
1. 点击工具栏选择零件
2. 点击地面或已有零件放置
3. 点击"删除模式"可删除零件
4. 点击"清空全部"重新开始

### 飞行模式 / Flight Mode
1. 点击"🚀 开始飞行"
2. 按住空格键或点击屏幕上升
3. 穿过障碍物的缝隙
4. 尽可能飞得更远

## 🔧 常用命令 / Common Commands

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

## 📚 文档索引 / Documentation Index

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase数据库设置
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel部署指南
- [LOCAL_TESTING.md](./LOCAL_TESTING.md) - 本地测试指南
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 功能测试清单
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 实现总结

## 🐛 故障排除 / Troubleshooting

### 排行榜不显示
1. 检查 `.env` 文件是否存在
2. 检查 Supabase URL 和 Key 是否正确
3. 打开浏览器控制台查看错误

### 教程卡住
1. 完成当前步骤的要求操作
2. 或点击"跳过教程"
3. 或清除浏览器 localStorage 重新开始

### 账号创建失败
1. 检查昵称是否已存在
2. 检查 PIN 码是否为4位数字
3. 检查网络连接

## 💡 提示 / Tips

- **首次测试**: 建议先跳过账号创建，熟悉游戏后再创建
- **教程**: 建议完成教程，了解所有功能
- **建造**: 至少需要1个引擎才能飞行
- **堆叠**: 点击零件表面可以堆叠建造
- **删除**: 移动端使用"删除模式"按钮

## 🎯 下一步 / Next Steps

1. ✅ 本地测试所有功能
2. ✅ 配置 Supabase（如需排行榜）
3. ✅ 阅读部署文档
4. 🚀 部署到 Vercel

---

**需要帮助?** 查看详细文档或检查浏览器控制台错误信息
