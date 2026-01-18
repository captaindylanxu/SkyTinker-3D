# ✈️ Flappy Vehicle Builder

一个基于 React + Three.js 的 3D 飞行建造游戏，支持全球排行榜和多语言。

A 3D flight building game based on React + Three.js with global leaderboard and multi-language support.

![Game Preview](public/captaindylan.png)

---

## 🎮 游戏特色 / Game Features

### 🔧 建造系统 / Building System
- 精确网格对齐放置
- 智能堆叠功能
- 多种零件类型（机身、机翼、引擎、驾驶座）
- VIP 专属金色零件

### ✈️ 飞行系统 / Flight System
- 真实物理引擎
- 动态障碍物生成
- 碰撞检测（桌面 + 移动端优化）
- 音效系统

### 👤 账号系统 / Account System
- 创建账号（昵称 + 可选PIN码）
- 账号找回（昵称 + PIN验证）
- 昵称唯一性验证
- UUID 自动生成

### 🏆 全球排行榜 / Global Leaderboard
- 实时排名更新
- 前100名展示
- 自动提交新纪录
- 玩家排名显示

### 📚 新手引导 / Tutorial System
- 8步完整教程
- 自动检测用户操作
- 鼓励性文案和动画
- 可跳过

### 🌍 多语言支持 / Multi-language
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- English (en)
- 日本語 (ja)
- 한국어 (ko)
- Deutsch (de)
- Русский (ru)
- Français (fr)

---

## 🚀 快速开始 / Quick Start

### 安装依赖 / Install Dependencies
```bash
npm install
```

### 启动开发服务器 / Start Dev Server
```bash
npm run dev
```

访问: http://localhost:5173

### 配置 Supabase (可选) / Configure Supabase (Optional)

如果需要排行榜功能：

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

---

## 📦 技术栈 / Tech Stack

- **前端框架**: React 18 + Vite
- **3D 渲染**: React Three Fiber (@react-three/fiber, @react-three/drei)
- **物理引擎**: @react-three/rapier
- **状态管理**: Zustand (with persist middleware)
- **后端服务**: Supabase (PostgreSQL)
- **部署平台**: Vercel

---

## 📁 项目结构 / Project Structure

```
src/
├── components/
│   ├── UI/
│   │   ├── AccountModal.jsx      # 账号系统
│   │   ├── TutorialOverlay.jsx   # 新手引导
│   │   ├── Leaderboard.jsx       # 排行榜
│   │   ├── GameOverModal.jsx     # 游戏结束
│   │   ├── Toolbar.jsx           # 工具栏
│   │   └── ...
│   ├── BuildingSystem.jsx        # 建造系统
│   ├── FlightSystem.jsx          # 飞行系统
│   └── ...
├── services/
│   └── leaderboard.js            # 排行榜 API
├── store/
│   └── useGameStore.js           # 全局状态
├── i18n/
│   ├── locales.js                # 多语言翻译
│   └── useI18n.js                # 语言管理
├── lib/
│   └── supabase.js               # Supabase 配置
└── ...
```

---

## 🎯 游戏玩法 / How to Play

### 建造模式 / Build Mode
1. 点击工具栏选择零件类型
2. 点击地面或已有零件放置
3. 点击零件表面可以堆叠建造
4. 使用"删除模式"删除零件
5. 至少需要1个引擎才能飞行

### 飞行模式 / Flight Mode
1. 点击"🚀 开始飞行"
2. 按住空格键或点击屏幕上升
3. 松开下降
4. 穿过障碍物的缝隙得分
5. 避免碰撞障碍物和地面

---

## 📚 文档 / Documentation

- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 数据库设置
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel 部署指南
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 功能测试指南
- [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) - 验证清单
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 实现总结
- [STATUS_REPORT.md](./STATUS_REPORT.md) - 项目状态报告

---

## 🔧 开发命令 / Development Commands

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

---

## 🚀 部署 / Deployment

### 部署到 Vercel

1. 推送代码到 GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push
```

2. 在 Vercel 中导入项目

3. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. 部署

详细步骤请查看: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🐛 故障排除 / Troubleshooting

### 排行榜不显示
- 检查 `.env` 文件是否存在
- 检查 Supabase URL 和 Key 是否正确
- 打开浏览器控制台查看错误

### 教程卡住
- 完成当前步骤的要求操作
- 或点击"跳过教程"
- 或清除浏览器 localStorage

### 账号创建失败
- 检查昵称是否已存在
- 检查 PIN 码是否为4位数字
- 检查网络连接

---

## 📝 更新日志 / Changelog

### v1.0.0 (2026-01-18)
- ✅ 完整的账号系统（创建/找回）
- ✅ 8步新手引导系统
- ✅ 全球排行榜功能
- ✅ 8种语言支持
- ✅ 移动端优化
- ✅ 音效系统
- ✅ VIP 系统
- ✅ 数据持久化

---

## 📄 许可证 / License

MIT License

---

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

Welcome to submit Issues and Pull Requests!

---

## 📧 联系 / Contact

如有问题或建议，请通过 GitHub Issues 联系。

For questions or suggestions, please contact via GitHub Issues.

---

**享受游戏！/ Enjoy the game!** ✈️🎮
