// ============================================
// 物理参数调节面板 - 在这里微调飞行手感
// ============================================

// 引擎推力
export const THRUST_FORCE = 25;        // W键前进推力
export const REVERSE_FORCE = 10;       // S键后退推力
export const LIFT_THRUST = 20;         // Space键垂直升力

// 转向控制
export const YAW_TORQUE = 12;          // A/D 偏航扭矩
export const PITCH_TORQUE = 8;         // Q/E 俯仰扭矩（可选）

// 空气动力学参数
export const LIFT_COEFFICIENT = 0.8;   // 升力系数 - 增大让飞机更容易起飞
export const DRAG_COEFFICIENT = 0.3;   // 阻力系数 - 增大让飞机减速更快
export const WING_AREA = 2.0;          // 机翼面积（影响升力大小）

// 空气密度（地球海平面约 1.225）
export const AIR_DENSITY = 1.2;

// 升力攻角效率曲线参数
export const MAX_LIFT_ANGLE = 15;      // 最大升力攻角（度）
export const STALL_ANGLE = 25;         // 失速攻角（度）

// 阻尼参数
export const LINEAR_DAMPING = 0.1;     // 线性阻尼
export const ANGULAR_DAMPING = 0.3;    // 角阻尼

// 质量配置
export const PART_MASS = {
  Fuselage: 2.0,
  Wing: 0.5,
  Engine: 3.0,
  Cockpit: 1.5,
};

// 最小速度阈值（低于此速度不计算空气动力）
export const MIN_SPEED_THRESHOLD = 0.5;
