// 游戏模式
export const GAME_MODES = {
  BUILD_MODE: 'BUILD_MODE',
  FLIGHT_MODE: 'FLIGHT_MODE',
};

// 零件等级
export const PART_TIERS = {
  NORMAL: 'normal',
  VIP: 'vip',
};

// 零件类型
export const PART_TYPES = {
  FUSELAGE: 'Fuselage',
  WING: 'Wing',
  ENGINE: 'Engine',
  COCKPIT: 'Cockpit',
};

// 零件属性配置
// lift: 升力加成（机翼专属，让升空更容易）
// stability: 稳定性加成（机身专属，减少飞行晃动）
// control: 操控加成（驾驶座专属，下落更平缓、响应更灵敏）
export const PART_STATS = {
  [PART_TYPES.FUSELAGE]: {
    [PART_TIERS.NORMAL]: { weight: 2.0, power: 0, stability: 1.0, color: '#6b7280', name: '机身' },
    [PART_TIERS.VIP]: { weight: 1.0, power: 0, stability: 1.8, color: '#ffd700', name: '黄金机身' },
  },
  [PART_TYPES.WING]: {
    [PART_TIERS.NORMAL]: { weight: 0.5, power: 0, lift: 1.0, color: '#3b82f6', name: '机翼' },
    [PART_TIERS.VIP]: { weight: 0.2, power: 0, lift: 2.0, color: '#ffd700', name: '黄金机翼' },
  },
  [PART_TYPES.ENGINE]: {
    [PART_TIERS.NORMAL]: { weight: 3.0, power: 1.0, color: '#ef4444', name: '引擎' },
    [PART_TIERS.VIP]: { weight: 1.0, power: 2.5, color: '#ffd700', name: '黄金引擎' },
  },
  [PART_TYPES.COCKPIT]: {
    [PART_TIERS.NORMAL]: { weight: 1.5, power: 0, control: 1.0, color: '#22c55e', name: '驾驶座' },
    [PART_TIERS.VIP]: { weight: 0.5, power: 0, control: 1.8, color: '#ffd700', name: '黄金驾驶座' },
  },
};

// 获取零件颜色（兼容旧代码）
export const PART_COLORS = {
  [PART_TYPES.FUSELAGE]: '#6b7280',
  [PART_TYPES.WING]: '#3b82f6',
  [PART_TYPES.ENGINE]: '#ef4444',
  [PART_TYPES.COCKPIT]: '#22c55e',
};

// 网格大小
export const GRID_SIZE = 1;

// 地面配置
export const GROUND_SIZE = 20;  // 建造区域大小（20x20网格）
export const BUILD_AREA_LIMIT = 10;  // 建造范围限制（从中心点±10格）

// 零件数量限制
export const PART_LIMITS = {
  MAX_TOTAL: 12,           // 总零件数上限
  MAX_PER_TYPE: 4,         // 每种零件上限
};

// Flappy 模式配置
export const FLAPPY_CONFIG = {
  // 自动前进速度
  FORWARD_SPEED: 8,
  
  // 点击/空格时的推力
  FLAP_FORCE: 55,              // 增加推力
  FLAP_TORQUE: 2,
  
  // 重力和阻尼
  GRAVITY: -12,                // 降低重力
  ANGULAR_DAMPING: 0.9,
  
  // 障碍物配置
  OBSTACLE_SPAWN_DISTANCE: 50,
  OBSTACLE_SPACING: 15,
  OBSTACLE_WIDTH: 3,
  OBSTACLE_HEIGHT: 100,            // 增加高度，防止从上方绕过
  
  // 缝隙配置
  GAP_SIZE_NORMAL: 10,         // 稍微增大缝隙
  GAP_SIZE_VIP: 18,            // VIP玩家缝隙
  GAP_MIN_Y: 8,                // 缝隙最低位置
  GAP_MAX_Y: 25,               // 缝隙最高位置
  
  // 飞行高度限制
  MAX_HEIGHT: 100,              // 最大飞行高度
  MIN_HEIGHT: 1,               // 最低高度（地面）
  
  // 碰撞阈值
  COLLISION_THRESHOLD_NORMAL: 2,
  COLLISION_THRESHOLD_VIP: 8,
  
  // 清理距离
  CLEANUP_DISTANCE: 30,
  
  // 相机配置
  CAMERA_OFFSET_Z: 25,
  CAMERA_OFFSET_X: -5,
  CAMERA_HEIGHT: 10,
};

// 关卡系统配置
export const LEVEL_CONFIG = {
  STAGE_THRESHOLD: 500, // 每 500 米一个关卡

  // 关卡 1-5 难度预设
  DIFFICULTY_PROFILES: {
    1: { gapSize: { normal: 14, vip: 20 }, spacing: 17, gapYRange: [14, 26] },
    2: { gapSize: { normal: 13, vip: 19 }, spacing: 16, gapYRange: [13, 27] },
    3: { gapSize: { normal: 12, vip: 18 }, spacing: 15, gapYRange: [12, 28] },
    4: { gapSize: { normal: 11, vip: 17 }, spacing: 14, gapYRange: [11, 29] },
    5: { gapSize: { normal: 10, vip: 16 }, spacing: 13, gapYRange: [10, 30] },
  },

  // 难度下限
  MIN_GAP_SIZE_NORMAL: 5,
  MIN_GAP_SIZE_VIP: 10,
  MIN_SPACING: 8,

  // 关卡 6+ 难度公式参数
  GAP_REDUCTION_RATE: 0.05, // 每关缝隙缩小比例
  SPACING_REDUCTION: 0.5, // 每关间距减少值

  // 关卡 1-7 障碍物颜色方案（红橙黄绿青蓝紫）
  OBSTACLE_COLOR_THEMES: {
    1: { top: '#ef4444', bottom: '#dc2626' }, // 红
    2: { top: '#f97316', bottom: '#ea580c' }, // 橙
    3: { top: '#eab308', bottom: '#ca8a04' }, // 黄
    4: { top: '#22c55e', bottom: '#16a34a' }, // 绿
    5: { top: '#06b6d4', bottom: '#0891b2' }, // 青
    6: { top: '#3b82f6', bottom: '#2563eb' }, // 蓝
    7: { top: '#8b5cf6', bottom: '#7c3aed' }, // 紫
  },

  // 关卡 1-7 背景主题
  BACKGROUND_THEMES: {
    1: {
      // 晴天白昼
      sky: { sunPosition: [100, 20, 100], inclination: 0.5, azimuth: 0.25 },
      ambientIntensity: 0.4,
      directionalIntensity: 1.0,
      stars: { count: 0, fade: false, speed: 0 },
    },
    2: {
      // 黄昏暮色
      sky: { sunPosition: [100, 5, 100], inclination: 0.49, azimuth: 0.15 },
      ambientIntensity: 0.3,
      directionalIntensity: 0.7,
      stars: { count: 500, fade: true, speed: 0.5 },
    },
    3: {
      // 星空夜晚
      sky: { sunPosition: [100, -10, 100], inclination: 0.48, azimuth: 0.05 },
      ambientIntensity: 0.15,
      directionalIntensity: 0.3,
      stars: { count: 3000, fade: true, speed: 1.5 },
    },
    4: {
      // 极光黎明
      sky: { sunPosition: [100, 2, 100], inclination: 0.52, azimuth: 0.35 },
      ambientIntensity: 0.35,
      directionalIntensity: 0.6,
      stars: { count: 1500, fade: true, speed: 2.0 },
    },
    5: {
      // 烈日荒漠
      sky: { sunPosition: [100, 40, 100], inclination: 0.55, azimuth: 0.25 },
      ambientIntensity: 0.6,
      directionalIntensity: 1.5,
      stars: { count: 0, fade: false, speed: 0 },
    },
    6: {
      // 深海幽蓝
      sky: { sunPosition: [100, -5, 100], inclination: 0.47, azimuth: 0.1 },
      ambientIntensity: 0.2,
      directionalIntensity: 0.4,
      stars: { count: 800, fade: true, speed: 0.8 },
    },
    7: {
      // 梦幻紫霞
      sky: { sunPosition: [100, 10, 100], inclination: 0.51, azimuth: 0.3 },
      ambientIntensity: 0.35,
      directionalIntensity: 0.8,
      stars: { count: 2000, fade: true, speed: 1.2 },
    },
  },

  // 关卡 1-7 BGM 配置
  STAGE_BGM_PROFILES: {
    1: {
      // 晴天白昼 — 明亮轻快
      chords: [
        [329.6, 392.0, 493.9],
        [261.6, 329.6, 392.0],
        [196.0, 246.9, 293.7],
        [293.7, 370.0, 440.0],
      ],
      bassNotes: [164.8, 130.8, 98.0, 146.8],
      melody: [659.3, 0, 784.0, 659.3, 587.3, 0, 523.3, 587.3, 659.3, 0, 784.0, 880.0, 784.0, 0, 659.3, 0],
      chordDur: 2.8,
      oscType: 'triangle',
      melodyOscType: 'sine',
    },
    2: {
      // 黄昏暮色 — 温暖舒缓
      chords: [
        [261.6, 329.6, 392.0],
        [220.0, 277.2, 329.6],
        [196.0, 246.9, 293.7],
        [246.9, 311.1, 370.0],
      ],
      bassNotes: [130.8, 110.0, 98.0, 123.5],
      melody: [523.3, 0, 493.9, 440.0, 392.0, 0, 440.0, 493.9, 523.3, 0, 587.3, 523.3, 493.9, 0, 440.0, 0],
      chordDur: 3.5,
      oscType: 'sine',
      melodyOscType: 'sine',
    },
    3: {
      // 星空夜晚 — 空灵悠远
      chords: [
        [293.7, 370.0, 440.0],
        [261.6, 329.6, 415.3],
        [220.0, 293.7, 370.0],
        [246.9, 329.6, 392.0],
      ],
      bassNotes: [146.8, 130.8, 110.0, 123.5],
      melody: [880.0, 0, 784.0, 0, 659.3, 0, 587.3, 0, 659.3, 0, 784.0, 0, 880.0, 0, 0, 0],
      chordDur: 4.0,
      oscType: 'sine',
      melodyOscType: 'triangle',
    },
    4: {
      // 极光黎明 — 神秘渐亮
      chords: [
        [246.9, 311.1, 392.0],
        [277.2, 349.2, 440.0],
        [293.7, 370.0, 466.2],
        [329.6, 415.3, 523.3],
      ],
      bassNotes: [123.5, 138.6, 146.8, 164.8],
      melody: [493.9, 523.3, 587.3, 659.3, 0, 784.0, 880.0, 0, 987.8, 880.0, 784.0, 0, 659.3, 587.3, 523.3, 0],
      chordDur: 3.2,
      oscType: 'triangle',
      melodyOscType: 'sine',
    },
    5: {
      // 烈日荒漠 — 紧张急促
      chords: [
        [329.6, 415.3, 493.9],
        [349.2, 440.0, 523.3],
        [293.7, 370.0, 440.0],
        [311.1, 392.0, 466.2],
      ],
      bassNotes: [164.8, 174.6, 146.8, 155.6],
      melody: [
        659.3, 784.0, 659.3, 784.0, 880.0, 784.0, 659.3, 784.0, 880.0, 987.8, 880.0, 784.0, 659.3, 784.0, 659.3,
        0,
      ],
      chordDur: 2.0,
      oscType: 'sawtooth',
      melodyOscType: 'square',
    },
    6: {
      // 深海幽蓝 — 低沉深邃
      chords: [
        [196.0, 246.9, 311.1],
        [174.6, 220.0, 277.2],
        [164.8, 207.7, 261.6],
        [185.0, 233.1, 293.7],
      ],
      bassNotes: [98.0, 87.3, 82.4, 92.5],
      melody: [392.0, 0, 370.0, 329.6, 0, 293.7, 329.6, 0, 370.0, 392.0, 440.0, 0, 392.0, 370.0, 0, 329.6],
      chordDur: 3.8,
      oscType: 'sine',
      melodyOscType: 'sine',
    },
    7: {
      // 梦幻紫霞 — 飘渺奇幻
      chords: [
        [277.2, 349.2, 440.0],
        [311.1, 392.0, 493.9],
        [261.6, 329.6, 415.3],
        [293.7, 370.0, 466.2],
      ],
      bassNotes: [138.6, 155.6, 130.8, 146.8],
      melody: [554.4, 659.3, 0, 784.0, 880.0, 0, 784.0, 659.3, 554.4, 0, 659.3, 784.0, 880.0, 0, 987.8, 0],
      chordDur: 3.0,
      oscType: 'triangle',
      melodyOscType: 'triangle',
    },
  },

  // 装备解锁表
  EQUIPMENT_UNLOCKS: {
    1: [
      { type: 'Wing', tier: 'normal' },
      { type: 'Engine', tier: 'normal' },
      { type: 'Fuselage', tier: 'normal' },
      { type: 'Cockpit', tier: 'normal' },
    ],
    3: [{ type: 'Wing', tier: 'vip' }],
    5: [{ type: 'Engine', tier: 'vip' }],
    7: [{ type: 'Fuselage', tier: 'vip' }],
    10: [{ type: 'Cockpit', tier: 'vip' }],
  },

  // 过渡动画时长
  COLOR_TRANSITION_DURATION: 0.5, // 障碍物颜色过渡（秒）
  BG_TRANSITION_DURATION: 1.0, // 背景主题过渡（秒）
  BGM_FADEOUT_DURATION: 1.5, // BGM 淡出（秒）
  BGM_FADEIN_DURATION: 2.0, // BGM 淡入（秒）
  STAGE_INDICATOR_DURATION: 2000, // 关卡提示显示时长（毫秒）
};


// ---- 关卡系统纯函数 ----

/**
 * 根据飞行距离（score）计算当前关卡阶段
 * @param {number} score - 飞行距离/分数
 * @returns {number} 关卡阶段（最小为 1）
 */
export const computeStage = (score) => {
  if (score < 0) return 1;
  return Math.floor(score / LEVEL_CONFIG.STAGE_THRESHOLD) + 1;
};

/**
 * 根据关卡阶段和 VIP 状态计算难度配置
 * 关卡 1-5 返回预设值，关卡 6+ 使用公式计算，确保不低于下限
 * @param {number} stage - 关卡阶段
 * @param {boolean} isVIP - 是否为 VIP 玩家
 * @returns {object} 难度配置 { gapSize: { normal, vip }, spacing, gapYRange }
 */
export const computeDifficultyProfile = (stage, isVIP) => {
  if (stage <= 5) return LEVEL_CONFIG.DIFFICULTY_PROFILES[stage];
  const base = LEVEL_CONFIG.DIFFICULTY_PROFILES[5];
  const extraStages = stage - 5;
  const gapNormal = Math.max(
    LEVEL_CONFIG.MIN_GAP_SIZE_NORMAL,
    base.gapSize.normal * (1 - LEVEL_CONFIG.GAP_REDUCTION_RATE * extraStages)
  );
  const gapVip = Math.max(
    LEVEL_CONFIG.MIN_GAP_SIZE_VIP,
    base.gapSize.vip * (1 - LEVEL_CONFIG.GAP_REDUCTION_RATE * extraStages)
  );
  const spacing = Math.max(
    LEVEL_CONFIG.MIN_SPACING,
    base.spacing - LEVEL_CONFIG.SPACING_REDUCTION * extraStages
  );
  return { gapSize: { normal: gapNormal, vip: gapVip }, spacing, gapYRange: base.gapYRange };
};

/**
 * 根据关卡阶段从主题映射中获取对应主题（循环复用 1-7）
 * @param {number} stage - 关卡阶段
 * @param {object} themeMap - 主题映射对象（键为 1-7）
 * @returns {*} 对应的主题值
 */
export const getThemeByStage = (stage, themeMap) => {
  const mappedStage = ((stage - 1) % 7) + 1;
  return themeMap[mappedStage];
};
