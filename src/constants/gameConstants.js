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
export const PART_STATS = {
  [PART_TYPES.FUSELAGE]: {
    [PART_TIERS.NORMAL]: { weight: 2.0, power: 0, color: '#6b7280', name: '机身' },
    [PART_TIERS.VIP]: { weight: 1.0, power: 0, color: '#ffd700', name: '黄金机身' },
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
    [PART_TIERS.NORMAL]: { weight: 1.5, power: 0, color: '#22c55e', name: '驾驶座' },
    [PART_TIERS.VIP]: { weight: 0.5, power: 0, color: '#ffd700', name: '黄金驾驶座' },
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
export const GROUND_SIZE = 200;

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
