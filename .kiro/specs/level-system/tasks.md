# 实现计划：关卡系统（Level System）

## 概述

以配置驱动为核心，先建立关卡常量和状态基础设施，再逐步改造各组件（障碍物、环境、BGM、UI），最后集成联调。每个任务增量构建，确保前后衔接无孤立代码。

## Tasks

- [x] 1. 定义关卡配置常量与纯函数
  - [x] 1.1 在 `src/constants/gameConstants.js` 中新增 `LEVEL_CONFIG` 常量
    - 包含 STAGE_THRESHOLD、DIFFICULTY_PROFILES（1-5）、MIN_GAP_SIZE_NORMAL/VIP、MIN_SPACING、GAP_REDUCTION_RATE、SPACING_REDUCTION
    - 包含 OBSTACLE_COLOR_THEMES（1-5）、BACKGROUND_THEMES（1-5）、STAGE_BGM_PROFILES（1-5）
    - 包含 EQUIPMENT_UNLOCKS 装备解锁表（关卡 1/3/5/7/10）
    - 包含过渡动画时长常量（COLOR_TRANSITION_DURATION、BG_TRANSITION_DURATION、BGM_FADEOUT_DURATION、BGM_FADEIN_DURATION、STAGE_INDICATOR_DURATION）
    - _需求: 8.1, 8.2, 8.3, 2.6, 5.2, 9.4, 9.7, 10.2, 10.5, 6.5, 6.6_
  - [x] 1.2 在 `src/constants/gameConstants.js` 中新增纯函数 `computeStage(score)`、`computeDifficultyProfile(stage, isVIP)`、`getThemeByStage(stage, themeMap)` 
    - `computeStage`: `Math.floor(score / STAGE_THRESHOLD) + 1`，负数 score 返回 1
    - `computeDifficultyProfile`: 关卡 1-5 返回预设值，关卡 6+ 使用公式计算，确保不低于下限
    - `getThemeByStage`: 通过 `((stage - 1) % 5) + 1` 映射到 1-5 范围
    - _需求: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.3, 9.5, 10.3_
  - [x] 1.3 编写属性测试：关卡阶段计算正确性
    - **Property 1: 关卡阶段计算正确性**
    - **验证: 需求 1.1, 1.2, 1.3**
  - [x] 1.4 编写属性测试：难度单调递增且有下限
    - **Property 5: 难度单调递增且有下限**
    - **验证: 需求 2.3, 2.4, 2.5**
  - [x] 1.5 编写属性测试：难度配置完整性
    - **Property 4: 难度配置完整性**
    - **验证: 需求 2.1, 2.2, 2.6, 3.5**
  - [x] 1.6 编写属性测试：主题/配置循环复用
    - **Property 9: 主题/配置循环复用**
    - **验证: 需求 5.1, 5.3, 9.1, 9.5, 10.1, 10.3**

- [x] 2. 扩展 Game Store 关卡状态管理
  - [x] 2.1 在 `src/store/useGameStore.js` 中新增关卡状态字段和方法
    - 新增状态: `currentStage: 1`、`highestStage: 1`、`unlockedEquipment`（默认解锁所有 NORMAL 零件）、`stageJustChanged: false`
    - 新增 `updateStage()`: 根据 score 调用 `computeStage` 计算新关卡，若变化则更新 `currentStage`、设置 `stageJustChanged: true`、检查装备解锁、更新 `highestStage`
    - 新增 `getCurrentDifficultyProfile()`、`getCurrentBackgroundTheme()`、`getCurrentBGMProfile()`、`isEquipmentUnlocked(type, tier)`、`clearStageChanged()`
    - _需求: 3.1, 3.2, 3.3, 3.5, 6.1, 6.2, 6.3, 6.5_
  - [x] 2.2 修改 `addScore` 方法，在加分后调用 `updateStage()`
    - _需求: 1.1_
  - [x] 2.3 修改 `resetGame` 和 `toggleGameMode`，重置 `currentStage` 为 1
    - _需求: 1.4, 3.4_
  - [x] 2.4 修改 `shareRevive` 和 `referralRevive`，确保不修改 `currentStage`
    - _需求: 1.5_
  - [x] 2.5 扩展 `persist` 的 `partialize`，持久化 `highestStage` 和 `unlockedEquipment`
    - 从 localStorage 恢复时验证 `unlockedEquipment` 数据格式，无效则回退默认值
    - _需求: 7.1, 7.4, 6.3_
  - [x] 2.6 编写属性测试：游戏重置时关卡归一
    - **Property 2: 游戏重置时关卡归一**
    - **验证: 需求 1.4, 3.4**
  - [x] 2.7 编写属性测试：续命保留关卡
    - **Property 3: 续命保留关卡**
    - **验证: 需求 1.5**
  - [x] 2.8 编写属性测试：历史最高关卡追踪
    - **Property 6: 历史最高关卡追踪**
    - **验证: 需求 3.3**
  - [x] 2.9 编写属性测试：装备解锁正确性
    - **Property 7: 装备解锁正确性**
    - **验证: 需求 6.2**

- [x] 3. 检查点 - 确保配置层和状态层正确
  - 确保所有测试通过，如有疑问请询问用户。

- [x] 4. 改造 ObstacleManager 支持关卡难度
  - [x] 4.1 修改 `src/components/ObstacleManager.jsx`，从 Game Store 读取 `currentStage` 并使用 `getCurrentDifficultyProfile()` 获取动态难度参数
    - 替换固定的 `GAP_SIZE_NORMAL`/`GAP_SIZE_VIP`/`OBSTACLE_SPACING`/`GAP_MIN_Y`/`GAP_MAX_Y` 为当前关卡的难度配置值
    - 新生成的障碍物使用当前关卡参数，已生成的障碍物保持原参数不变
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 4.2 修改 `ObstaclePair` 和 `ObstaclePipe` 组件，支持 `colorTheme` prop
    - 从 `LEVEL_CONFIG.OBSTACLE_COLOR_THEMES` 读取当前关卡颜色方案
    - 每个障碍物在生成时记录其颜色主题，渲染时使用记录的颜色
    - _需求: 5.1, 5.2, 5.3_

- [x] 5. 改造 Environment 支持关卡背景主题
  - [x] 5.1 修改 `src/components/Environment.jsx`，订阅 `currentStage` 并读取 `getCurrentBackgroundTheme()`
    - 使用 `useRef` 存储目标主题和当前插值状态
    - 在 `useFrame` 中使用 `THREE.MathUtils.lerp` 平滑插值天空参数（sunPosition、inclination、azimuth）、光照强度（ambientIntensity、directionalIntensity）、星星参数（count、fade、speed）
    - 过渡时长由 `LEVEL_CONFIG.BG_TRANSITION_DURATION`（1 秒）控制
    - _需求: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7_

- [x] 6. 改造 BGMEngine 支持关卡音乐切换
  - [x] 6.1 在 `src/hooks/useBGM.js` 的 `BGMEngine` 类中新增 `switchStage(stage)` 方法
    - 从 `LEVEL_CONFIG.STAGE_BGM_PROFILES` 读取目标关卡的音乐参数
    - 先淡出当前音乐（1.5 秒），再用新参数重新启动飞行音乐并淡入（2 秒）
    - Web Audio API 不可用时静默返回，不抛异常
    - _需求: 10.1, 10.4, 10.7_
  - [x] 6.2 修改 `useBGM` hook，新增 `currentStage` 订阅
    - 当处于飞行模式且未游戏结束时，`currentStage` 变化触发 `bgmEngine.switchStage(currentStage)`
    - 建造模式和欢迎页不受关卡音乐影响
    - _需求: 10.1, 10.3, 10.6_
  - [x] 6.3 编写属性测试：BGM 模式隔离
    - **Property 11: BGM 模式隔离**
    - **验证: 需求 10.6**

- [x] 7. 检查点 - 确保核心游戏系统改造正确
  - 确保所有测试通过，如有疑问请询问用户。

- [x] 8. 新增 StageIndicator UI 组件
  - [x] 8.1 创建 `src/components/UI/StageIndicator.jsx` 和 `src/components/UI/StageIndicator.css`
    - 订阅 `currentStage`、`stageJustChanged`、`gameMode`
    - 关卡变化时在屏幕中央显示"第 N 关"/"Stage N"，2 秒后淡出，调用 `clearStageChanged()`
    - 飞行模式下在 HUD 区域持续显示当前关卡编号
    - 使用 CSS 动画实现淡入淡出效果
    - 通过 `useI18n` 支持中英文
    - _需求: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.2 在 `src/i18n/locales.js` 中新增关卡相关的 i18n 键
    - 中文: `stageLabel: "第 {n} 关"`、`stageReached: "到达关卡"`、`highestStage: "最高关卡"` 等
    - 英文: `stageLabel: "Stage {n}"`、`stageReached: "Stage Reached"`、`highestStage: "Highest Stage"` 等
    - _需求: 4.3, 7.2, 7.3_
  - [x] 8.3 编写属性测试：关卡指示器国际化格式
    - **Property 10: 关卡指示器国际化格式**
    - **验证: 需求 4.3**

- [x] 9. 改造 GameOverModal 显示关卡信息
  - [x] 9.1 修改 `src/components/UI/GameOverModal.jsx`，新增显示本次到达的最高关卡（`currentStage`）和历史最高关卡（`highestStage`）
    - 使用 8.2 中新增的 i18n 键
    - _需求: 7.2, 7.3_

- [x] 10. 改造 Toolbar 和 BuildingSystem 支持装备解锁
  - [x] 10.1 修改 `src/components/UI/Toolbar.jsx`，根据 `unlockedEquipment` 过滤可选零件
    - 未解锁的零件显示锁定状态和解锁条件（如"第 3 关解锁"）
    - VIP 零件需同时满足 VIP 身份和关卡解锁两个条件
    - _需求: 6.4, 6.5, 6.6_
  - [x] 10.2 修改 `src/store/useGameStore.js` 的 `addPart` 方法，增加解锁检查
    - 调用 `isEquipmentUnlocked(type, tier)` 验证，未解锁则返回 false 且不修改 `vehicleParts`
    - _需求: 6.4_
  - [x] 10.3 编写属性测试：建造系统尊重解锁状态
    - **Property 8: 建造系统尊重解锁状态**
    - **验证: 需求 6.4**

- [x] 11. 集成与场景接入
  - [x] 11.1 在 `src/components/Scene.jsx` 中引入 `StageIndicator` 组件
    - 确保 StageIndicator 在飞行模式下渲染
    - _需求: 4.1, 4.4_

- [x] 12. 最终检查点 - 确保所有功能集成正确
  - 确保所有测试通过，如有疑问请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证通用正确性规则，单元测试验证具体示例和边界情况
