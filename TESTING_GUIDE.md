# 测试指南 / Testing Guide

## 本地测试步骤 / Local Testing Steps

### 1. 启动开发服务器 / Start Dev Server
```bash
npm run dev
```
服务器将在 http://localhost:5174 运行

### 2. 测试账号系统 / Test Account System

#### 首次访问 / First Visit
- ✅ 应该看到欢迎界面（AccountModal）
- ✅ 有三个选项：创建新账号、找回账号、跳过

#### 创建新账号 / Create New Account
1. 点击"创建新账号"
2. 输入昵称（必填，最多20字符）
3. 输入4位PIN码（可选，用于账号找回）
4. 点击"创建"
5. ✅ 成功后应该自动关闭弹窗，进入教程

#### 测试昵称排重 / Test Nickname Uniqueness
1. 尝试创建已存在的昵称
2. ✅ 应该显示错误："该昵称已被使用"

#### 找回账号 / Recover Account
1. 点击"找回账号"
2. 输入已存在的昵称
3. 输入正确的PIN码
4. ✅ 成功后应该恢复账号信息

#### 测试PIN验证 / Test PIN Validation
1. 输入正确的昵称但错误的PIN
2. ✅ 应该显示："PIN 码错误"

### 3. 测试教程系统 / Test Tutorial System

#### 教程步骤 / Tutorial Steps
1. **欢迎界面** - 显示欢迎信息
2. **选择零件** - 等待用户点击工具栏中的零件
   - ✅ 选择零件后自动进入下一步
3. **放置零件** - 等待用户在地面放置零件
   - ✅ 放置后显示鼓励动画，自动进入下一步
4. **堆叠建造** - 说明如何堆叠零件
5. **删除模式** - 说明如何删除零件
6. **准备起飞** - 等待用户点击"开始飞行"
   - ✅ 进入飞行模式后自动进入下一步
7. **控制飞行** - 说明飞行控制
8. **完成** - 显示鼓励信息

#### 教程功能 / Tutorial Features
- ✅ 可以点击"跳过教程"
- ✅ 可以点击"上一步"/"下一步"导航
- ✅ 自动检测用户操作并推进进度
- ✅ 显示进度（X / 8）

### 4. 测试排行榜 / Test Leaderboard

#### 显示排行榜 / Display Leaderboard
1. 点击左上角的"🏆 排行榜"按钮
2. ✅ 应该显示排行榜弹窗
3. ✅ 显示前100名玩家
4. ✅ 前三名显示奖牌图标（🥇🥈🥉）
5. ✅ 当前玩家高亮显示
6. ✅ 显示玩家排名

#### 提交分数 / Submit Score
1. 完成一次游戏
2. ✅ 如果分数高于历史最高分，自动提交到排行榜
3. ✅ 游戏结束界面显示"🎉 新纪录！"

### 5. 测试多语言 / Test Multi-language

#### 支持的语言 / Supported Languages
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- English (en)
- 日本語 (ja)
- 한국어 (ko)
- Deutsch (de)
- Русский (ru)
- Français (fr)

#### 测试方法 / Testing Method
1. 修改浏览器语言设置
2. 刷新页面
3. ✅ 界面应该显示对应语言

### 6. 测试数据持久化 / Test Data Persistence

#### LocalStorage 数据 / LocalStorage Data
- `flappy-vehicle-storage`: 玩家信息、教程进度、VIP状态
- `flappy-vehicle-highscore`: 本地最高分

#### 测试步骤 / Testing Steps
1. 创建账号并完成教程
2. 刷新页面
3. ✅ 不应该再显示账号创建界面
4. ✅ 不应该再显示教程
5. 清除浏览器数据
6. 刷新页面
7. ✅ 应该重新显示账号创建界面和教程

## 常见问题 / Common Issues

### 排行榜不显示 / Leaderboard Not Showing
- 检查 `.env` 文件是否正确配置
- 检查 Supabase URL 和 ANON_KEY 是否正确
- 打开浏览器控制台查看错误信息

### 教程卡住 / Tutorial Stuck
- 检查是否完成了当前步骤的要求操作
- 可以点击"跳过教程"跳过
- 清除 localStorage 重新开始

### 账号创建失败 / Account Creation Failed
- 检查昵称是否已存在
- 检查 PIN 码是否为4位数字
- 检查网络连接和 Supabase 配置

## 调试信息 / Debug Info

打开浏览器控制台（F12），可以看到：
- Supabase 配置状态
- 排行榜渲染信息
- 教程步骤变化
- 账号操作结果

## 部署前检查清单 / Pre-deployment Checklist

- [ ] 本地测试所有功能正常
- [ ] 账号创建和找回功能正常
- [ ] 教程系统正常运行
- [ ] 排行榜正常显示和提交
- [ ] 多语言切换正常
- [ ] 移动端兼容性测试
- [ ] 清除所有 console.log 调试信息（可选）
- [ ] 更新 `.env.example` 文件
- [ ] 确认 `.gitignore` 包含 `.env`
- [ ] 在 Vercel 中配置环境变量
