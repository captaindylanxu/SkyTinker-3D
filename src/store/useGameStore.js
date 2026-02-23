import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GAME_MODES, PART_TYPES, PART_TIERS, PART_LIMITS, LEVEL_CONFIG, computeStage, computeDifficultyProfile, getThemeByStage } from '../constants/gameConstants';

// 默认解锁所有 NORMAL 零件
const DEFAULT_UNLOCKED_EQUIPMENT = [
  { type: 'Wing', tier: 'normal' },
  { type: 'Engine', tier: 'normal' },
  { type: 'Fuselage', tier: 'normal' },
  { type: 'Cockpit', tier: 'normal' },
];

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

// 默认飞机配置（新用户试玩用）
export const DEFAULT_VEHICLE_PARTS = [
  { id: 1, type: PART_TYPES.ENGINE, tier: PART_TIERS.NORMAL, position: [-1, 0.5, -1], rotation: [0, 0, 0] },
  { id: 2, type: PART_TYPES.ENGINE, tier: PART_TIERS.NORMAL, position: [0, 0.5, -1], rotation: [0, 0, 0] },
  { id: 3, type: PART_TYPES.ENGINE, tier: PART_TIERS.NORMAL, position: [1, 0.5, -1], rotation: [0, 0, 0] },
  { id: 4, type: PART_TYPES.FUSELAGE, tier: PART_TIERS.NORMAL, position: [0, 0.5, 0], rotation: [0, 0, 0] },
  { id: 5, type: PART_TYPES.WING, tier: PART_TIERS.NORMAL, position: [-1, 0.5, 0], rotation: [0, 0, 0] },
  { id: 6, type: PART_TYPES.WING, tier: PART_TIERS.NORMAL, position: [1, 0.5, 0], rotation: [0, 0, 0] },
  { id: 7, type: PART_TYPES.COCKPIT, tier: PART_TIERS.NORMAL, position: [0, 1.5, 0], rotation: [0, 0, 0] },
];

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
  hasPlayedFirstGame: false, // 已废弃，保留兼容
  hasSeenPoster: false, // 每次刷新重置，不持久化
  showAccountModal: false,
  
  // 关卡系统状态
  currentStage: 1,
  highestStage: 1,
  unlockedEquipment: [...DEFAULT_UNLOCKED_EQUIPMENT],
  stageJustChanged: false,
  
  setPlayerInfo: (playerId, playerName) => set({ 
    playerId, 
    playerName,
    hasCompletedOnboarding: true,
    showAccountModal: false,
  }),
  
  skipOnboarding: () => set({ 
    hasCompletedOnboarding: true,
    showAccountModal: false,
  }),
  
  // 第一局游戏结束后触发账号流程
  triggerAccountFlow: () => set({
    hasPlayedFirstGame: true,
    showAccountModal: true,
  }),
  
  closeAccountModal: () => set({ showAccountModal: false }),
  
  // 教程系统
  tutorialStep: -1, // -1 表示已完成或跳过，0+ 表示当前步骤（默认跳过，账号创建后开始）
  
  setTutorialStep: (step) => set({ tutorialStep: step }),
  
  completeTutorial: () => {
    console.log('🎓 completeTutorial called');
    const newState = { 
      tutorialStep: -1,
      gameMode: GAME_MODES.BUILD_MODE,
      isGameOver: false,
      isExploded: false,
    };
    console.log('🎓 Setting state:', newState);
    set(newState);
    console.log('🎓 State after set:', get().tutorialStep, get().gameMode);
  },
  
  skipTutorial: () => {
    console.log('⏭️ skipTutorial called');
    const newState = { 
      tutorialStep: -1,
      gameMode: GAME_MODES.BUILD_MODE,
      isGameOver: false,
      isExploded: false,
    };
    console.log('⏭️ Setting state:', newState);
    set(newState);
    console.log('⏭️ State after set:', get().tutorialStep, get().gameMode);
  },
  
  // 游戏模式 - 每次刷新先显示海报，点击后进入建造模式
  gameMode: GAME_MODES.BUILD_MODE,
  setGameMode: (mode) => set({ gameMode: mode }),
  toggleGameMode: () => set((state) => ({
    gameMode: state.gameMode === GAME_MODES.BUILD_MODE 
      ? GAME_MODES.FLIGHT_MODE 
      : GAME_MODES.BUILD_MODE,
    score: state.gameMode === GAME_MODES.BUILD_MODE ? 0 : state.score,
    isGameOver: false,
    isExploded: false,
    hasUsedShareRevive: false,
    hasUsedReferralRevive: false,
    reviveScore: 0,
    isReviving: false,
    currentStage: 1,
    stageJustChanged: false,
  })),

  // 游戏结束状态
  isGameOver: false,
  isExploded: false,
  
  // 续命系统
  hasUsedShareRevive: false,   // 本次冒险是否已用过分享续命
  hasUsedReferralRevive: false, // 本次冒险是否已用过邀请续命
  referralLives: 0,            // 当前可用的邀请续命次数
  reviveScore: 0,              // 续命时保留的分数
  isReviving: false,           // 是否正在续命中
  
  setReferralLives: (count) => set({ referralLives: count }),
  
  setGameOver: () => {
    const state = get();
    state.updateHighScore();
    // 新用户第一次炸毁后，弹出账号弹窗
    if (!state.hasCompletedOnboarding) {
      set({ isGameOver: true, showAccountModal: true });
    } else {
      set({ isGameOver: true });
    }
  },
  setExploded: () => set({ isExploded: true }),
  
  // 分享续命
  shareRevive: () => {
    const state = get();
    if (state.hasUsedShareRevive) return false;
    set({
      hasUsedShareRevive: true,
      reviveScore: state.score,
      isGameOver: false,
      isExploded: false,
      isReviving: true,
      gameMode: GAME_MODES.FLIGHT_MODE,
    });
    return true;
  },
  
  // 邀请续命
  referralRevive: () => {
    const state = get();
    if (state.hasUsedReferralRevive || state.referralLives <= 0) return false;
    set({
      hasUsedReferralRevive: true,
      referralLives: state.referralLives - 1,
      reviveScore: state.score,
      isGameOver: false,
      isExploded: false,
      isReviving: true,
      gameMode: GAME_MODES.FLIGHT_MODE,
    });
    return true;
  },
  
  // 续命完成，清除续命标记
  clearReviving: () => set({ isReviving: false }),
  
  // ---- 关卡系统方法 ----
  
  // 根据 score 计算并更新 currentStage
  updateStage: () => {
    const state = get();
    const newStage = computeStage(state.score);
    if (newStage !== state.currentStage) {
      const updates = {
        currentStage: newStage,
        stageJustChanged: true,
      };
      // 检查装备解锁
      const unlocks = LEVEL_CONFIG.EQUIPMENT_UNLOCKS[newStage];
      if (unlocks) {
        const currentUnlocked = [...state.unlockedEquipment];
        let changed = false;
        for (const item of unlocks) {
          const alreadyUnlocked = currentUnlocked.some(
            (u) => u.type === item.type && u.tier === item.tier
          );
          if (!alreadyUnlocked) {
            currentUnlocked.push({ type: item.type, tier: item.tier });
            changed = true;
          }
        }
        if (changed) {
          updates.unlockedEquipment = currentUnlocked;
        }
      }
      // 更新 highestStage
      if (newStage > state.highestStage) {
        updates.highestStage = newStage;
      }
      set(updates);
    }
  },
  
  // 获取当前难度配置
  getCurrentDifficultyProfile: () => {
    const state = get();
    return computeDifficultyProfile(state.currentStage, state.isVIP);
  },
  
  // 获取当前背景主题
  getCurrentBackgroundTheme: () => {
    const state = get();
    return getThemeByStage(state.currentStage, LEVEL_CONFIG.BACKGROUND_THEMES);
  },
  
  // 获取当前 BGM 配置
  getCurrentBGMProfile: () => {
    const state = get();
    return getThemeByStage(state.currentStage, LEVEL_CONFIG.STAGE_BGM_PROFILES);
  },
  
  // 检查装备是否已解锁
  isEquipmentUnlocked: (type, tier) => {
    const state = get();
    return state.unlockedEquipment.some(
      (u) => u.type === type && u.tier === tier
    );
  },
  
  // 清除关卡变化标记
  clearStageChanged: () => set({ stageJustChanged: false }),
  
  resetGame: () => set({
    gameMode: GAME_MODES.BUILD_MODE,
    score: 0,
    isGameOver: false,
    isExploded: false,
    hasUsedShareRevive: false,
    hasUsedReferralRevive: false,
    reviveScore: 0,
    isReviving: false,
    currentStage: 1,
    stageJustChanged: false,
  }),

  // 分数
  score: 0,
  highScore: getStoredHighScore(),
  addScore: (points = 1) => {
    set((state) => ({ score: state.score + points }));
    get().updateStage();
  },
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
    // 解锁检查：未解锁的零件不允许添加
    const tier = part.tier || state.selectedPartTier;
    if (!state.isEquipmentUnlocked(part.type, tier)) return false;
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
        highestStage: state.highestStage,
        unlockedEquipment: state.unlockedEquipment,
      }),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...persistedState };
        // 验证 unlockedEquipment 数据格式，无效则回退默认值
        if (
          !Array.isArray(merged.unlockedEquipment) ||
          !merged.unlockedEquipment.every(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.type === 'string' &&
              typeof item.tier === 'string'
          )
        ) {
          merged.unlockedEquipment = [...DEFAULT_UNLOCKED_EQUIPMENT];
        }
        return merged;
      },
    }
  )
);

export default useGameStore;
