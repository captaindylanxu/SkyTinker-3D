import useGameStore from '../../store/useGameStore';
import { GAME_MODES, PART_TYPES } from '../../constants/gameConstants';
import { useSound } from '../../hooks/useSound';
import { useI18n } from '../../i18n/useI18n';
import './ModeToggle.css';

export function ModeToggle() {
  const { gameMode, toggleGameMode, vehicleParts, score, hasSeenPoster } = useGameStore();
  const { playModeSwitch } = useSound();
  const { t } = useI18n();

  if (!hasSeenPoster) return null;

  const isBuildMode = gameMode === GAME_MODES.BUILD_MODE;
  const hasNoParts = vehicleParts.length === 0;
  const hasEngine = vehicleParts.some(p => p.type === PART_TYPES.ENGINE);

  const handleClick = () => {
    playModeSwitch();
    toggleGameMode();
    document.activeElement?.blur();
  };

  return (
    <div className="mode-toggle">
      <button
        className={`toggle-button ${!isBuildMode ? 'flight-mode' : ''}`}
        onClick={handleClick}
        disabled={isBuildMode && hasNoParts}
        title={hasNoParts && isBuildMode ? t('placePartFirst') : ''}
      >
        {isBuildMode ? t('startFlight') : t('stopSimulation')}
      </button>
      
      <div className="mode-indicator">
        {isBuildMode ? t('buildMode') : t('flightMode')}
      </div>

      {!isBuildMode && (
        <>
          <div className="score-display">
            {t('distance')}: {Math.floor(score)} {t('meter')}
          </div>
          <div className="controls-hint">
            {hasEngine ? t('holdToRise') : t('noEngine')}
          </div>
        </>
      )}
      
      {isBuildMode && (
        <div className="parts-count">
          {t('parts')}: {vehicleParts.length} | {t('engine')}: {vehicleParts.filter(p => p.type === PART_TYPES.ENGINE).length}
        </div>
      )}
    </div>
  );
}

export default ModeToggle;
