import useGameStore from '../../store/useGameStore';
import { PART_TYPES, PART_TIERS, PART_STATS, GAME_MODES, PART_LIMITS } from '../../constants/gameConstants';
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
  } = useGameStore();

  if (gameMode !== GAME_MODES.BUILD_MODE) return null;

  const partTypes = Object.values(PART_TYPES);
  const totalParts = vehicleParts.length;

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        零件选择 ({totalParts}/{PART_LIMITS.MAX_TOTAL})
      </div>
      
      {/* 普通零件 */}
      <div className="toolbar-section">
        <div className="section-label">普通零件</div>
        <div className="toolbar-items">
          {partTypes.map((type) => {
            const stats = PART_STATS[type][PART_TIERS.NORMAL];
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.NORMAL;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            
            return (
              <button
                key={`normal-${type}`}
                className={`toolbar-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.NORMAL);
                }}
              >
                <div 
                  className="part-preview"
                  style={{ backgroundColor: stats.color }}
                />
                <span className="part-name">{stats.name}</span>
                <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP 零件 */}
      <div className={`toolbar-section vip-section ${!isVIP ? 'locked' : ''}`}>
        <div className="section-label vip-label">
          👑 VIP 零件
          {!isVIP && <span className="lock-hint">（需要开通VIP）</span>}
        </div>
        <div className="toolbar-items">
          {partTypes.map((type) => {
            const stats = PART_STATS[type][PART_TIERS.VIP];
            const isSelected = selectedPartType === type && selectedPartTier === PART_TIERS.VIP;
            const count = getPartCountByType(type);
            const isMaxed = count >= PART_LIMITS.MAX_PER_TYPE || totalParts >= PART_LIMITS.MAX_TOTAL;
            
            return (
              <button
                key={`vip-${type}`}
                className={`toolbar-item vip-item ${isSelected ? 'active' : ''} ${isMaxed ? 'maxed' : ''}`}
                style={{ '--part-color': stats.color }}
                onClick={() => {
                  if (!isVIP) return;
                  setSelectedPartType(type);
                  setSelectedPartTier(PART_TIERS.VIP);
                }}
                disabled={!isVIP}
              >
                <div 
                  className="part-preview vip-preview"
                  style={{ backgroundColor: isVIP ? stats.color : '#444' }}
                />
                <span className="part-name">{stats.name}</span>
                <span className="part-count">{count}/{PART_LIMITS.MAX_PER_TYPE}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="toolbar-hint">
        左键放置 | 右键删除
      </div>
    </div>
  );
}

export default Toolbar;
