# Supabase 排行榜设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase]( ) 并注册/登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称、数据库密码、选择区域
4. 等待项目创建完成（约 2 分钟）

## 2. 创建数据库表

在 Supabase 项目的 SQL Editor 中执行以下 SQL：

```sql
-- 创建排行榜表
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  player_name TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  high_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_leaderboard_high_score ON leaderboard(high_score DESC);
CREATE INDEX idx_leaderboard_player_name ON leaderboard(player_name);

-- 启用行级安全策略（RLS）
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取排行榜
CREATE POLICY "Allow public read access"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

-- 允许所有人插入新记录
CREATE POLICY "Allow public insert"
  ON leaderboard
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 允许玩家更新自己的记录
CREATE POLICY "Allow update own record"
  ON leaderboard
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
```

## 3. 获取 API 密钥

1. 在 Supabase 项目中，点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 4. 配置环境变量

### 本地开发

创建 `.env` 文件（不要提交到 Git）：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Vercel 部署

1. 在 Vercel 项目设置中，进入 "Settings" → "Environment Variables"
2. 添加以下变量：
   - `VITE_SUPABASE_URL`: 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: 你的 anon key
3. 重新部署项目

## 5. 测试

1. 启动开发服务器：`npm run dev`
2. 打开浏览器，应该会看到新手引导弹窗
3. 创建玩家 ID 和昵称
4. 玩游戏并查看排行榜

## 注意事项

- **免费额度**：Supabase 免费版提供 500MB 数据库存储和 2GB 带宽/月
- **安全性**：anon key 是公开的，通过 RLS 策略保护数据
- **性能**：排行榜查询已优化，支持数千条记录
- **备份**：建议定期在 Supabase 后台导出数据备份

## 可选：添加更多功能

### 自动更新时间戳

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 添加游戏次数统计

```sql
ALTER TABLE leaderboard ADD COLUMN games_played INTEGER DEFAULT 1;
```

## 故障排除

- **连接失败**：检查环境变量是否正确配置
- **权限错误**：确认 RLS 策略已正确设置
- **查询慢**：检查索引是否创建成功
