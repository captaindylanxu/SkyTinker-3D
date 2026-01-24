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
    checkPartsConnectivity,
    stabilityScore,
  } = useGameStore();
  const { t } = useI18n();

  if (gameMode !== GAME_MODES.BUILD_MODE) return null;

  const partTypes = Object.values(PART_TYPES);
  const totalParts = vehicleParts.length;
  
  // 检查连接性和必要零件
  const connectivity = checkPartsConnectivity();
  const hasEngine = vehicleParts.some(p => p.type === PART_TYPES.ENGINE);
  const hasCockpit = vehicleParts.some(p => p.type === PART_TYPES.COCKPIT);
  const hasWarnings = !connectivity.connected || !hasEngine || !hasCockpit;
  
  // 稳定性等级
  const getStabilityLevel = (score) => {
    if (score >= 0.8) return { level: t('stability.excellent') || '优秀', color: '#22c55e' };
    if (score >= 0.6) return { level: t('stability.good') || '良好', color: '#3b82f6' };
    if (score >= 0.4) return { level: t('stability.fair') || '一般', color: '#fbbf24' };
    return { level: t('stability.poor') || '较差', color: '#ef4444' };
  };
  
  const stabilityInfo = getStabilityLevel(stabilityScore);

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        {t('parts')} ({totalParts}/{PART_LIMITS.MAX_TOTAL})
      </div>
      
      {/* 稳定性指示器 */}
      {totalParts > 0 && (
        <div className="stability-indicator">
          <div className="stability-label">
            ✈️ {t('stability.title') || '飞行稳定性'}
          </div>
          <div className="stability-bar-container">
            <div 
              className="stability-bar" 
              style={{ 
                width: `${stabilityScore * 100}%`,
                backgroundColor: stabilityInfo.color 
              }}
            />
          </div>
          <div className="stability-level" style={{ color: stabilityInfo.color }}>
            {stabilityInfo.level}
          </div>
          <div className="stability-hint">
            {stabilityScore < 0.6 && (t('stability.hint') || '💡 提示：左右对称放置机翼可提高稳定性')}
          </div>
        </div>
      )}
      
      {/* 警告提示 */}
      {hasWarnings && totalParts > 0 && (
        <div className="toolbar-warnings">
          {!connectivity.connected && (
            <div className="warning-item disconnected">
              ⚠️ {t('warnings.disconnected') || '有零件未连接！'}
            </div>
          )}
          {!hasEngine && (
            <div className="warning-item missing-part">
              ⚠️ {t('warnings.noEngine') || '需要引擎才能飞行！'}
            </div>
          )}
          {!hasCockpit && (
            <div className="warning-item missing-part">
              ⚠️ {t('warnings.noCockpit') || '需要驾驶座才能飞行！'}
            </div>
          )}
        </div>
      )}
      
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
