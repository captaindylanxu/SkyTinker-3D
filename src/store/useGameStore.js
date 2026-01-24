import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GAME_MODES, PART_TYPES, PART_TIERS, PART_LIMITS, GRID_SIZE } from '../constants/gameConstants';

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

const useGameStore = create(
  persist(
    (set, get) => ({
  // VIP 状态
  isVIP: false,
  setVIP: (value) => set({ isVIP: value }),
  
  // 玩家信息
  playerId: null,
  playerName: null,
  hasCompletedOnboarding: false,
  
  setPlayerInfo: (playerId, playerName) => set({ 
    playerId, 
    playerName,
    hasCompletedOnboarding: true,
  }),
  
  skipOnboarding: () => set({ hasCompletedOnboarding: true }),
  
  // 教程系统
  tutorialStep: 0, // -1 表示已完成或跳过，0+ 表示当前步骤
  
  setTutorialStep: (step) => set({ tutorialStep: step }),
  
  completeTutorial: () => {
    set({ 
      tutorialStep: -1,
      gameMode: GAME_MODES.BUILD_MODE,
      isGameOver: false,
      isExploded: false,
    });
  },
  
  skipTutorial: () => {
    set({ 
      tutorialStep: -1,
      gameMode: GAME_MODES.BUILD_MODE,
      isGameOver: false,
      isExploded: false,
    });
  },
  
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
  
  // 飞行器稳定性评分
  stabilityScore: 0,
  setStabilityScore: (score) => set({ stabilityScore: score }),
  
  // 检查零件连接性 - 使用BFS确保所有零件相互连接
  checkPartsConnectivity: () => {
    const parts = get().vehicleParts;
    if (parts.length === 0) return { connected: true, disconnectedParts: [] };
    if (parts.length === 1) return { connected: true, disconnectedParts: [] };
    
    // 构建邻接表
    const adjacency = new Map();
    parts.forEach(part => {
      const key = `${part.position[0]},${part.position[1]},${part.position[2]}`;
      adjacency.set(key, part);
    });
    
    // 检查两个零件是否相邻（共享一个面）
    const areAdjacent = (pos1, pos2) => {
      const dx = Math.abs(pos1[0] - pos2[0]);
      const dy = Math.abs(pos1[1] - pos2[1]);
      const dz = Math.abs(pos1[2] - pos2[2]);
      
      // 相邻意味着在一个轴上相差GRID_SIZE，其他轴相同
      return (
        (dx === GRID_SIZE && dy === 0 && dz === 0) ||
        (dx === 0 && dy === GRID_SIZE && dz === 0) ||
        (dx === 0 && dy === 0 && dz === GRID_SIZE)
      );
    };
    
    // BFS从第一个零件开始
    const visited = new Set();
    const queue = [parts[0]];
    visited.add(`${parts[0].position[0]},${parts[0].position[1]},${parts[0].position[2]}`);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      // 检查所有其他零件
      parts.forEach(part => {
        const key = `${part.position[0]},${part.position[1]},${part.position[2]}`;
        if (!visited.has(key) && areAdjacent(current.position, part.position)) {
          visited.add(key);
          queue.push(part);
        }
      });
    }
    
    // 找出未连接的零件
    const disconnectedParts = parts.filter(part => {
      const key = `${part.position[0]},${part.position[1]},${part.position[2]}`;
      return !visited.has(key);
    });
    
    return {
      connected: disconnectedParts.length === 0,
      disconnectedParts: disconnectedParts.map(p => p.position),
    };
  },
  
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
}),
    {
      name: 'flappy-vehicle-storage',
      partialize: (state) => ({
        playerId: state.playerId,
        playerName: state.playerName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        tutorialStep: state.tutorialStep,
        isVIP: state.isVIP,
      }),
    }
  )
);

export default useGameStore;
