# 第一次游戏流程说明

## 新的游戏流程

### 1. 首次启动游戏
- ✅ 游戏直接进入**飞行模式**
- ✅ 使用预设的默认飞机（驾驶座、机身、引擎、两个机翼）
- ✅ 显示飞行提示（5秒后自动消失）
- ✅ 隐藏模式切换按钮和工具栏
- ✅ 建造范围限制在 20x20 区域（中心点±10格）

### 2. 第一次死亡
- ✅ GameOverModal 不显示（因为还没完成账号创建）
- ✅ 自动显示 **AccountModal**（账号创建界面）
- ✅ 显示特殊提示："不错的尝试！现在让我们学习如何建造自己的飞机吧"

### 3. 账号创建界面
玩家有三个选择：
1. **创建新账号**：输入昵称和可选的 PIN 码
2. **找回账号**：输入昵称和 PIN 码
3. **跳过**：不创建账号，直接开始游戏

### 4. 完成账号创建/跳过后
- ✅ 自动进入**建造模式**
- ✅ 清空默认飞机
- ✅ 启动**教程系统**（TutorialOverlay）
- ✅ 显示模式切换按钮和工具栏

### 5. 后续游戏
- ✅ 正常的建造-飞行循环
- ✅ 死亡后显示正常的 GameOverModal
- ✅ 可以查看排行榜、购买 VIP 等

## 技术实现

### 状态管理（useGameStore.js）
```javascript
isFirstGame: true              // 是否是第一次游戏
hasPlayedFirstFlight: false    // 是否已经玩过第一次飞行
tutorialStep: -1               // 教程步骤（-1 = 未开始）
gameMode: FLIGHT_MODE          // 默认飞行模式
vehicleParts: [...]            // 默认飞机配置
```

### 关键方法
- `setFirstFlightCompleted()`: 标记第一次飞行完成
- `startTutorial()`: 启动教程系统
- `skipOnboarding()`: 跳过账号创建

### 组件显示逻辑

#### AccountModal
```javascript
shouldShow = !isFirstGame && hasPlayedFirstFlight && !hasCompletedOnboarding
```

#### GameOverModal
```javascript
// 第一次游戏且未完成账号创建时不显示
if (isFirstGame && !hasCompletedOnboarding) return null;
```

#### ModeToggle & Toolbar
```javascript
// 第一次游戏时隐藏
if (isFirstGame) return null;
```

#### FirstFlightHint
```javascript
// 第一次游戏且在飞行模式时显示
if (isFirstGame && gameMode === FLIGHT_MODE) show();
```

## 建造范围限制

### 常量配置
```javascript
GROUND_SIZE = 20              // 地面大小 20x20
BUILD_AREA_LIMIT = 10         // 建造范围 ±10 格
```

### 边界检查
```javascript
isWithinBuildArea(x, z) {
  return Math.abs(x) <= 10 && Math.abs(z) <= 10;
}
```

### 视觉提示
- 黄色边界线标识建造区域
- 超出范围的预览显示为红色（无效）
- 无法在范围外放置零件

## 测试要点

1. ✅ 首次启动直接进入飞行模式
2. ✅ 第一次死亡后显示账号创建界面
3. ✅ 创建账号后启动教程
4. ✅ 跳过账号创建也能启动教程
5. ✅ 找回账号后启动教程
6. ✅ 建造范围限制在 20x20 区域
7. ✅ 超出范围无法放置零件
8. ✅ 第二次游戏流程正常
