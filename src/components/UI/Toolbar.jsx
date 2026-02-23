import useGameStore from '../../store/useGameStore';
import { PART_TYPES, PART_TIERS, PART_STATS, GAME_MODES, PART_LIMITS, LEVEL_CONFIG } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import './Toolbar.css';

// 查找某个零件类型+等级在哪个关卡解锁
function getUnlockStage(type, tier) {
  const unlocks = LEVEL_CONFIG.EQUIPMENT_UNLOCKS;
  for (const [stage, items] of Object.entries(unlocks)) {
    if (items.some((item) => item.type === type && item.tier === tier)) {
      return Number(stage);
    }
  }
  return null;
}

export function Toolbar() {
  const { 
    gameMode, 
    selectedPartType, 
    selectedPartTier,
    setSelectedPartType, 
    setSelectedPartTier,
    isVIP,
    vehicleParts,
    getPartCountByType,
    isDeleteMode,
    setDeleteMode,
    hasSeenPoster,
  } = useGameStore();
  const isEquipmentUnlocked = useGameStore((s) => s.isEquipmentUnlocked);
  const { t } = useI18n();

  if (gameMode !== GAME_MODES.BUILD_MODE || !hasSeenPoster) return null;

  const partTypes = Object.values(PART_TYPES);
  const totalParts = vehicleParts.length;

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        {t('parts')} ({totalParts}/{PART_LIMITS.MAX_TOTAL})
      </div>
      
      {/* 删除模式按钮 */}
      <button
        className={`delete-mode-btn ${isDeleteMode ? 'active' : ''}`}
        onClick={() => setDeleteMode(!isDeleteMode)}
      >
        🗑️ {t('deleteMode')} {isDeleteMode ? '✓' : ''}
      </button>
      
      {/* 普通零件 */}
      <div className="toolbar-section">
        <div className="section-label">{t('partTiers.normal')}</div>
        <div className="toolbar-items">
          {partTypes.map((type) => {
            const stats = PART_STATS[type][PART_TIERS.NORMAL];
            const unlocked = isEquipmentUnlocked(type, PART_TIERS.NORMAL);
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.NORMAL && !isDeleteMode;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            const unlockStage = !unlocked ? getUnlockStage(type, PART_TIERS.NORMAL) : null;
            
            return (
              <button
                key={`normal-${type}`}
                className={`toolbar-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''} ${!unlocked ? 'locked-item' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  if (!unlocked) return;
                  setDeleteMode(false);
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.NORMAL);
                }}
                disabled={!unlocked}
              >
                <div 
                  className="part-preview"
                  style={{ backgroundColor: unlocked ? stats.color : '#444' }}
                />
                <span className="part-name">{t(`partTypes.${type}`)}</span>
                {unlocked ? (
                  <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
                ) : (
                  <span className="lock-label">🔒 {unlockStage ? t('unlockAtStage').replace('{n}', unlockStage) : ''}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP 零件 */}
      <div className={`toolbar-section vip-section ${!isVIP ? 'locked' : ''}`}>
        <div className="section-label vip-label">
          👑 {t('partTiers.vip')}
          {!isVIP && <span className="lock-hint">（{t('buyVip')}）</span>}
        </div>
        <div className="toolbar-items">
          {partTypes.map((type) => {
            const stats = PART_STATS[type][PART_TIERS.VIP];
            const stageUnlocked = isEquipmentUnlocked(type, PART_TIERS.VIP);
            // VIP 零件需同时满足 VIP 身份和关卡解锁两个条件
            const fullyUnlocked = isVIP && stageUnlocked;
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.VIP && !isDeleteMode;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            const unlockStage = !stageUnlocked ? getUnlockStage(type, PART_TIERS.VIP) : null;
            
            return (
              <button
                key={`vip-${type}`}
                className={`toolbar-item vip-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''} ${!fullyUnlocked ? 'locked-item' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  if (!fullyUnlocked) return;
                  setDeleteMode(false);
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.VIP);
                }}
                disabled={!fullyUnlocked}
              >
                <div 
                  className="part-preview vip-preview"
                  style={{ backgroundColor: fullyUnlocked ? stats.color : '#444' }}
                />
                <span className="part-name">{t(`partTypes.${type}`)}</span>
                {fullyUnlocked ? (
                  <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
                ) : (
                  <span className="lock-label">
                    🔒 {!isVIP && !stageUnlocked
                      ? `${t('buyVip')} + ${unlockStage ? t('unlockAtStage').replace('{n}', unlockStage) : ''}`
                      : !isVIP
                        ? t('buyVip')
                        : unlockStage
                          ? t('unlockAtStage').replace('{n}', unlockStage)
                          : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
