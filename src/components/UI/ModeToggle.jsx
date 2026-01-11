import useGameStore from '../../store/useGameStore';
import { GAME_MODES, PART_TYPES } from '../../constants/gameConstants';
import './ModeToggle.css';

export function ModeToggle() {
  const { gameMode, toggleGameMode, vehicleParts, score } = useGameStore();

  const isBuildMode = gameMode === GAME_MODES.BUILD_MODE;
  const hasNoParts = vehicleParts.length === 0;
  const hasEngine = vehicleParts.some(p => p.type === PART_TYPES.ENGINE);

  const handleClick = () => {
    toggleGameMode();
    document.activeElement?.blur();
  };

  return (
    <div className="mode-toggle">
      <button
        className={`toggle-button ${!isBuildMode ? 'flight-mode' : ''}`}
        onClick={handleClick}
        disabled={isBuildMode && hasNoParts}
        title={hasNoParts && isBuildMode ? '请先放置至少一个零件' : ''}
      >
        {isBuildMode ? '🚀 开始飞行' : '🔧 停止模拟'}
      </button>
      
      <div className="mode-indicator">
        {isBuildMode ? '建造模式' : '飞行模式'}
      </div>

      {!isBuildMode && (
        <>
          <div className="score-display">
            距离: {Math.floor(score)} m
          </div>
          <div className="controls-hint">
            {hasEngine ? (
              <>按住 空格键 或 鼠标 上升</>
            ) : (
              <>⚠️ 未安装引擎</>
            )}
          </div>
        </>
      )}
      
      {isBuildMode && (
        <div className="parts-count">
          零件: {vehicleParts.length} | 引擎: {vehicleParts.filter(p => p.type === PART_TYPES.ENGINE).length}
        </div>
      )}
    </div>
  );
}

export default ModeToggle;
