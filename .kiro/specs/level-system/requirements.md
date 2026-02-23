# 需求文档：关卡系统（Level System）

## 简介

为飞行建造游戏引入关卡/阶段系统。玩家在飞行模式中，每飞行一定距离即进入新的关卡阶段。随着关卡推进，游戏难度逐步提升（障碍物缝隙缩小、间距变化、新障碍类型出现），同时玩家可解锁新的装备零件作为奖励。关卡系统为游戏增加渐进式挑战和长期目标感。

## 术语表

- **Level_System**：关卡系统，根据飞行距离划分游戏阶段并调整难度与奖励的核心模块
- **Stage**：关卡阶段，每个阶段对应一段飞行距离区间，具有独立的难度参数
- **Stage_Threshold**：关卡阈值，触发进入下一关卡的飞行距离值（以米为单位）
- **Difficulty_Profile**：难度配置，定义某个关卡阶段的障碍物参数集合（缝隙大小、间距、速度等）
- **Obstacle_Manager**：障碍物管理器，负责生成和管理飞行路径上的障碍物
- **Flight_System**：飞行系统，控制载具物理运动和碰撞检测的模块
- **Game_Store**：游戏状态管理，集中管理游戏模式、分数、关卡等全局状态
- **Equipment_Reward**：装备奖励，玩家达到特定关卡后解锁的新零件或零件等级
- **Stage_Indicator**：关卡指示器，向玩家展示当前关卡信息的 UI 组件
- **Transition_Effect**：过渡效果，关卡切换时的视觉或听觉反馈
- **Background_Theme**：背景主题，定义某个关卡阶段的天空、光照、星星等环境视觉参数集合
- **Environment**：环境组件，负责渲染天空盒、星星、环境光和主光源等背景视觉元素
- **BGM_Engine**：背景音乐引擎，基于 Web Audio API 的程序化音乐生成与播放模块，负责管理不同模式和关卡的背景音乐
- **Stage_BGM_Profile**：关卡音乐配置，定义某个关卡阶段的音乐参数集合（和弦进行、旋律音阶、节奏速度、音色类型等）

## 需求

### 需求 1：关卡阶段划分

**用户故事：** 作为玩家，我希望飞行过程中能感受到阶段性的变化，这样游戏不会一成不变，我有持续挑战的动力。

#### 验收标准

1. WHEN 飞行距离达到 Stage_Threshold 的整数倍时，THE Level_System SHALL 将当前关卡阶段递增 1
2. THE Level_System SHALL 以 1000 米为默认 Stage_Threshold 划分关卡阶段
3. THE Level_System SHALL 从第 1 阶段开始计数，第 1 阶段对应飞行距离 0 至 999 米
4. WHEN 游戏重新开始时，THE Level_System SHALL 将当前关卡阶段重置为 1
5. WHEN 玩家使用续命功能时，THE Level_System SHALL 保留当前关卡阶段不变

### 需求 2：难度渐进

**用户故事：** 作为玩家，我希望随着关卡推进，游戏难度逐步提升，这样我能感受到挑战的递增和自身技术的成长。

#### 验收标准

1. WHEN 进入新的关卡阶段时，THE Obstacle_Manager SHALL 根据当前阶段的 Difficulty_Profile 调整障碍物参数
2. THE Difficulty_Profile SHALL 包含以下可调参数：障碍物缝隙大小（gap_size）、障碍物间距（spacing）、缝隙垂直位置范围（gap_y_range）
3. WHEN 关卡阶段递增时，THE Obstacle_Manager SHALL 将障碍物缝隙大小减少一个固定比例，直至达到最小缝隙下限
4. THE Obstacle_Manager SHALL 为普通玩家设定最小缝隙大小为 5 米，为 VIP 玩家设定最小缝隙大小为 10 米
5. WHEN 关卡阶段递增时，THE Obstacle_Manager SHALL 将障碍物间距减少一个固定值，直至达到最小间距下限 8 米
6. THE Level_System SHALL 为每个关卡阶段预定义 Difficulty_Profile，关卡 1 至 5 使用预设值，关卡 6 及以上使用公式计算

### 需求 3：关卡状态管理

**用户故事：** 作为开发者，我希望关卡状态被集中管理，这样各组件能方便地读取和响应关卡变化。

#### 验收标准

1. THE Game_Store SHALL 维护当前关卡阶段（currentStage）作为全局状态
2. THE Game_Store SHALL 维护玩家历史最高关卡（highestStage）并持久化存储
3. WHEN 当前关卡阶段超过 highestStage 时，THE Game_Store SHALL 更新 highestStage 为当前值
4. WHEN toggleGameMode 切换到建造模式时，THE Game_Store SHALL 将 currentStage 重置为 1
5. THE Game_Store SHALL 提供 getCurrentDifficultyProfile 方法，根据 currentStage 返回对应的 Difficulty_Profile

### 需求 4：关卡切换视觉反馈

**用户故事：** 作为玩家，我希望进入新关卡时有明显的视觉提示，这样我能清楚地知道自己的进度。

#### 验收标准

1. WHEN 关卡阶段发生变化时，THE Stage_Indicator SHALL 在屏幕中央显示新关卡编号，持续 2 秒后自动消失
2. THE Stage_Indicator SHALL 以动画形式（淡入淡出）展示关卡变化信息
3. THE Stage_Indicator SHALL 显示格式为"第 N 关"（中文）或"Stage N"（英文），遵循当前语言设置
4. WHILE 处于飞行模式时，THE Stage_Indicator SHALL 在 HUD 区域持续显示当前关卡编号

### 需求 5：环境视觉变化

**用户故事：** 作为玩家，我希望不同关卡有不同的视觉风格，这样每个阶段都有新鲜感。

#### 验收标准

1. WHEN 进入新的关卡阶段时，THE Environment SHALL 根据当前阶段切换障碍物颜色主题
2. THE Level_System SHALL 为关卡 1 至 5 各定义一套障碍物颜色方案
3. WHEN 关卡阶段超过 5 时，THE Environment SHALL 循环使用关卡 1 至 5 的颜色方案
4. WHEN 关卡切换时，THE Environment SHALL 在 0.5 秒内平滑过渡到新的颜色方案

### 需求 6：装备解锁奖励

**用户故事：** 作为玩家，我希望达到更高关卡后能解锁新装备，这样我有动力不断挑战更远的距离。

#### 验收标准

1. THE Level_System SHALL 定义装备解锁表，将特定关卡阶段与可解锁的 Equipment_Reward 关联
2. WHEN 玩家首次到达某个解锁关卡时，THE Level_System SHALL 将对应的 Equipment_Reward 标记为已解锁
3. THE Game_Store SHALL 持久化存储玩家已解锁的装备列表
4. WHILE 处于建造模式时，THE BuildingSystem SHALL 仅允许玩家使用已解锁的零件
5. THE Level_System SHALL 在关卡 1 默认解锁所有普通（NORMAL）等级零件
6. THE Level_System SHALL 在关卡 3 解锁黄金机翼（VIP Wing），在关卡 5 解锁黄金引擎（VIP Engine），在关卡 7 解锁黄金机身（VIP Fuselage），在关卡 10 解锁黄金驾驶座（VIP Cockpit）

### 需求 7：关卡信息持久化与统计

**用户故事：** 作为玩家，我希望我的关卡成就被记录下来，这样我能看到自己的历史进度。

#### 验收标准

1. THE Game_Store SHALL 持久化存储 highestStage 到 localStorage
2. WHEN 游戏结束时，THE Game_Store SHALL 在游戏结束界面显示本次到达的最高关卡
3. THE Game_Store SHALL 在游戏结束界面显示历史最高关卡记录
4. IF localStorage 不可用，THEN THE Game_Store SHALL 静默降级，仅在当前会话内维护关卡数据

### 需求 8：关卡难度配置可扩展性

**用户故事：** 作为开发者，我希望关卡难度参数集中配置且易于调整，这样后续可以方便地平衡游戏难度。

#### 验收标准

1. THE Level_System SHALL 将所有关卡难度参数定义在 gameConstants.js 的 LEVEL_CONFIG 常量中
2. THE LEVEL_CONFIG SHALL 包含 Stage_Threshold、各阶段的 Difficulty_Profile 预设值、最小缝隙大小、最小间距、装备解锁表
3. THE Level_System SHALL 支持通过修改 LEVEL_CONFIG 来调整关卡数量和难度曲线，无需修改组件逻辑代码

### 需求 9：关卡背景主题变化

**用户故事：** 作为玩家，我希望不同关卡拥有不同的背景环境，这样每个阶段的飞行体验都有独特的氛围和沉浸感。

#### 验收标准

1. WHEN 进入新的关卡阶段时，THE Environment SHALL 根据当前阶段的 Background_Theme 切换天空盒参数（sunPosition、inclination、azimuth）
2. WHEN 进入新的关卡阶段时，THE Environment SHALL 根据当前阶段的 Background_Theme 调整环境光强度（ambientLight intensity）和主光源强度（directionalLight intensity）
3. WHEN 进入新的关卡阶段时，THE Environment SHALL 根据当前阶段的 Background_Theme 调整星星的可见度和密度（Stars count、fade、speed）
4. THE Level_System SHALL 为关卡 1 至 5 各定义一套 Background_Theme，分别对应晴天白昼、黄昏暮色、星空夜晚、极光黎明、烈日荒漠五种视觉风格
5. WHEN 关卡阶段超过 5 时，THE Environment SHALL 循环使用关卡 1 至 5 的 Background_Theme
6. WHEN 关卡切换时，THE Environment SHALL 在 1 秒内平滑过渡天空颜色、光照强度和星星参数到新的 Background_Theme
7. THE LEVEL_CONFIG SHALL 包含每个关卡阶段的 Background_Theme 参数定义，支持通过配置文件调整背景主题

### 需求 10：关卡背景音乐变化

**用户故事：** 作为玩家，我希望不同关卡拥有与视觉主题匹配的背景音乐，这样每个阶段的飞行体验在听觉上也有独特的氛围和沉浸感。

#### 验收标准

1. WHEN 进入新的关卡阶段时，THE BGM_Engine SHALL 根据当前阶段的 Stage_BGM_Profile 切换飞行模式的背景音乐参数（和弦进行、旋律音阶、节奏速度、音色类型）
2. THE Level_System SHALL 为关卡 1 至 5 各定义一套 Stage_BGM_Profile，分别对应晴天白昼（明亮轻快）、黄昏暮色（温暖舒缓）、星空夜晚（空灵悠远）、极光黎明（神秘渐亮）、烈日荒漠（紧张急促）五种音乐风格
3. WHEN 关卡阶段超过 5 时，THE BGM_Engine SHALL 循环使用关卡 1 至 5 的 Stage_BGM_Profile
4. WHEN 关卡切换时，THE BGM_Engine SHALL 在 1.5 秒内将当前音乐淡出，并在 2 秒内将新关卡音乐淡入，实现平滑过渡
5. THE LEVEL_CONFIG SHALL 包含每个关卡阶段的 Stage_BGM_Profile 参数定义，支持通过配置文件调整音乐风格
6. WHILE 处于建造模式或欢迎页时，THE BGM_Engine SHALL 保持原有的建造模式和欢迎页背景音乐不变，不受关卡音乐配置影响
7. IF Web Audio API 不可用，THEN THE BGM_Engine SHALL 静默降级，跳过关卡音乐切换且不影响游戏正常运行
