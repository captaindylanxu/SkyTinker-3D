import useGameStore from '../../store/useGameStore';
import { PART_TYPES, PART_TIERS, PART_STATS, GAME_MODES, PART_LIMITS } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import './Toolbar.css';

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
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.NORMAL && !isDeleteMode;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            
            return (
              <button
                key={`normal-${type}`}
                className={`toolbar-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  setDeleteMode(false);
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.NORMAL);
                }}
              >
                <div 
                  className="part-preview"
                  style={{ backgroundColor: stats.color }}
                />
                <span className="part-name">{t(`partTypes.${type}`)}</span>
                <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
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
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.VIP && !isDeleteMode;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            
            return (
              <button
                key={`vip-${type}`}
                className={`toolbar-item vip-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  if (!isVIP) return;
                  setDeleteMode(false);
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.VIP);
                }}
                disabled={!isVIP}
              >
                <div 
                  className="part-preview vip-preview"
                  style={{ backgroundColor: isVIP ? stats.color : '#444' }}
                />
                <span className="part-name">{t(`partTypes.${type}`)}</span>
                <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
