# 本地测试指南

## 方案 1：不配置排行榜（最快）

如果你只想测试游戏功能，不需要排行榜：

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器**
   - 访问 http://localhost:5173
   - 会看到新手引导弹窗
   - 点击"跳过"即可开始游戏
   - 排行榜按钮不会显示（因为未配置）

3. **测试功能**
   - ✅ 建造模式
   - ✅ 飞行模式
   - ✅ 本地最高分记录
   - ✅ VIP 功能
   - ✅ 音效
   - ✅ 多语言
   - ❌ 排行榜（需要配置 Supabase）

## 方案 2：配置完整排行榜功能

### 步骤 1：创建 Supabase 项目（5 分钟）

1. 访问 https://supabase.com 并注册/登录
2. 点击 "New Project"
3. 填写信息：
   - Name: `flappy-vehicle` (或任意名称)
   - Database Password: 设置一个强密码（记住它）
   - Region: 选择离你最近的区域
4. 点击 "Create new project"，等待 2 分钟

### 步骤 2：创建数据库表（2 分钟）

1. 在 Supabase 项目中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下 SQL 代码：

```sql
-- 创建排行榜表
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_id TEXT UNIQUE NOT NULL,
  player_name TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_leaderboard_high_score ON leaderboard(high_score DESC);
CREATE INDEX idx_leaderboard_player_id ON leaderboard(player_id);

-- 启用行级安全
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow public read access"
  ON leaderboard FOR SELECT TO public USING (true);

-- 允许所有人插入
CREATE POLICY "Allow public insert"
  ON leaderboard FOR INSERT TO public WITH CHECK (true);

-- 允许更新
CREATE POLICY "Allow update own record"
  ON leaderboard FOR UPDATE TO public USING (true) WITH CHECK (true);
```

4. 点击 "Run" 执行 SQL
5. 看到 "Success. No rows returned" 表示成功

### 步骤 3：获取 API 密钥（1 分钟）

1. 点击左侧菜单的 "Settings" → "API"
2. 找到以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一长串以 `eyJhbGci...` 开头的字符串

### 步骤 4：配置本地环境变量（1 分钟）

1. 打开项目根目录的 `.env` 文件
2. 填入你的配置：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. 保存文件

### 步骤 5：重启开发服务器

```bash
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

### 步骤 6：测试排行榜功能

1. 打开 http://localhost:5173
2. 应该会看到新手引导弹窗
3. 输入玩家 ID（如：`pilot123`）
4. 输入昵称（如：`测试玩家`）
5. 点击"开始游戏"
6. 右上角应该会显示 "🏆 排行榜" 按钮
7. 玩游戏，游戏结束后分数会自动提交
8. 点击排行榜按钮查看排名

## 测试清单

### 基础功能
- [ ] 游戏可以正常启动
- [ ] 建造模式可以放置零件
- [ ] 删除模式可以删除零件
- [ ] 可以切换到飞行模式
- [ ] 飞机可以飞行和控制
- [ ] 碰撞检测正常工作
- [ ] 游戏结束弹窗显示
- [ ] 音效正常播放

### 排行榜功能（需要配置 Supabase）
- [ ] 新手引导弹窗显示
- [ ] 可以创建玩家 ID
- [ ] ID 重复检测工作
- [ ] 排行榜按钮显示
- [ ] 可以查看排行榜
- [ ] 游戏结束后分数自动提交
- [ ] 个人排名显示正确

### 多语言
- [ ] 界面文字显示正确
- [ ] 切换浏览器语言后文字改变

### 手机端
- [ ] 工具栏不遮挡内容
- [ ] 触摸控制正常
- [ ] 删除模式按钮可用
- [ ] 游戏结束按钮可点击

## 常见问题

### Q: 新手引导一直显示"检查中..."
**A:** 检查：
1. `.env` 文件是否正确配置
2. Supabase URL 和 Key 是否正确
3. 浏览器控制台是否有错误信息

### Q: 排行榜按钮不显示
**A:** 这是正常的，说明：
- 未配置 Supabase，或
- 配置有误

可以点击新手引导的"跳过"按钮继续游戏。

### Q: 提交分数失败
**A:** 检查：
1. Supabase 数据库表是否创建成功
2. RLS 策略是否正确设置
3. 浏览器控制台的错误信息

### Q: 如何清除本地数据重新测试
**A:** 打开浏览器控制台，执行：
```javascript
localStorage.clear()
location.reload()
```

## 调试技巧

### 查看 Supabase 数据

1. 在 Supabase 项目中，点击 "Table Editor"
2. 选择 "leaderboard" 表
3. 可以看到所有提交的分数

### 查看浏览器控制台

按 F12 打开开发者工具，查看：
- Console: 错误信息
- Network: API 请求
- Application → Local Storage: 本地存储的数据

### 测试不同玩家

1. 清除 localStorage
2. 刷新页面
3. 创建新的玩家 ID

## 准备推送到 Vercel

测试完成后：

1. **确认 .gitignore 正确**
   ```bash
   cat .gitignore
   ```
   应该包含 `.env`

2. **提交代码**
   ```bash
   git add .
   git commit -m "Add leaderboard feature"
   git push origin main
   ```

3. **在 Vercel 配置环境变量**
   - 进入 Vercel 项目设置
   - Settings → Environment Variables
   - 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
   - 重新部署

4. **测试线上版本**
   - 访问 Vercel 提供的 URL
   - 重复上述测试流程

## 性能测试

### 本地性能
```bash
npm run build
npm run preview
```
访问 http://localhost:4173 测试生产版本性能

### 检查包大小
```bash
npm run build
```
查看 `dist` 文件夹大小，应该在 1-2MB 左右

## 下一步

- ✅ 本地测试通过
- ✅ 功能正常工作
- ✅ 准备推送到 GitHub
- ✅ 在 Vercel 配置环境变量
- ✅ 部署到生产环境
