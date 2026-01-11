import { create } from 'zustand';
import { GAME_MODES, PART_TYPES, PART_TIERS, PART_LIMITS } from '../constants/gameConstants';

// 从 localStorage 读取最高分
const getStoredHighScore = () => {
  try {
    const stored = localStorage.getItem('flappy-vehicle-highscore');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

// 保存最高分到 localStorage
const saveHighScore = (score) => {
  try {
    localStorage.setItem('flappy-vehicle-highscore', String(score));
  } catch {
    // localStorage 不可用时静默失败
  }
};

const useGameStore = create((set, get) => ({
  // VIP 状态
  isVIP: false,
  setVIP: (value) => set({ isVIP: value }),
  
  // 游戏模式
  gameMode: GAME_MODES.BUILD_MODE,
  setGameMode: (mode) => set({ gameMode: mode }),
  toggleGameMode: () => set((state) => ({
    gameMode: state.gameMode === GAME_MODES.BUILD_MODE 
      ? GAME_MODES.FLIGHT_MODE 
      : GAME_MODES.BUILD_MODE,
    score: state.gameMode === GAME_MODES.BUILD_MODE ? 0 : state.score,
    isGameOver: false,
    isExploded: false,
  })),

  // 游戏结束状态
  isGameOver: false,
  isExploded: false,
  
  setGameOver: () => {
    get().updateHighScore();
    set({ isGameOver: true });
  },
  setExploded: () => set({ isExploded: true }),
  
  resetGame: () => set({
    gameMode: GAME_MODES.BUILD_MODE,
    score: 0,
    isGameOver: false,
    isExploded: false,
  }),

  // 分数
  score: 0,
  highScore: getStoredHighScore(),
  addScore: (points = 1) => set((state) => ({ score: state.score + points })),
  resetScore: () => set({ score: 0 }),
  
  // 更新最高分
  updateHighScore: () => {
    const { score, highScore } = get();
    if (score > highScore) {
      saveHighScore(score);
      set({ highScore: score });
    }
  },

  // 当前选择的零件类型和等级
  selectedPartType: PART_TYPES.FUSELAGE,
  selectedPartTier: PART_TIERS.NORMAL,
  setSelectedPartType: (type) => set({ selectedPartType: type }),
  setSelectedPartTier: (tier) => set({ selectedPartTier: tier }),

  // 删除模式（手机端用）
  isDeleteMode: false,
  setDeleteMode: (value) => set({ isDeleteMode: value }),

  // 载具零件数组
  vehicleParts: [],
  
  // 获取某类型零件数量
  getPartCountByType: (type) => {
    const parts = get().vehicleParts;
    return parts.filter(p => p.type === type).length;
  },

  // 检查是否可以添加零件
  canAddPart: (type) => {
    const parts = get().vehicleParts;
    const totalCount = parts.length;
    const typeCount = parts.filter(p => p.type === type).length;
    
    return totalCount < PART_LIMITS.MAX_TOTAL && typeCount < PART_LIMITS.MAX_PER_TYPE;
  },
  
  // 添加零件（包含等级）
  addPart: (part) => {
    const state = get();
    if (!state.canAddPart(part.type)) return false;
    
    set((state) => ({
      vehicleParts: [...state.vehicleParts, { 
        ...part, 
        id: Date.now(),
        tier: part.tier || state.selectedPartTier,
      }]
    }));
    return true;
  },
  
  // 删除零件
  removePart: (id) => set((state) => ({
    vehicleParts: state.vehicleParts.filter((p) => p.id !== id)
  })),

  // 根据位置删除零件
  removePartAtPosition: (position) => set((state) => ({
    vehicleParts: state.vehicleParts.filter(
      (p) => !(p.position[0] === position[0] && 
               p.position[1] === position[1] && 
               p.position[2] === position[2])
    )
  })),

  // 清空所有零件
  clearParts: () => set({ vehicleParts: [] }),

  // 检查位置是否已有零件
  hasPartAtPosition: (position) => {
    const parts = get().vehicleParts;
    return parts.some(
      (p) => p.position[0] === position[0] && 
             p.position[1] === position[1] && 
             p.position[2] === position[2]
    );
  },
}));

export default useGameStore;
