import { useEffect, useState, useRef, useCallback } from 'react';
import useGameStore from '../../store/useGameStore';
import { GAME_MODES } from '../../constants/gameConstants';
import { LEVEL_CONFIG } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import './StageIndicator.css';

export function StageIndicator() {
  const currentStage = useGameStore((s) => s.currentStage);
  const stageJustChanged = useGameStore((s) => s.stageJustChanged);
  const gameMode = useGameStore((s) => s.gameMode);
  const clearStageChanged = useGameStore((s) => s.clearStageChanged);
  const { t } = useI18n();

  const [showOverlay, setShowOverlay] = useState(false);
  const timerRef = useRef(null);

  const stageText = t('stageLabel').replace('{n}', currentStage);

  // 关卡变化时显示中央提示，2 秒后淡出
  useEffect(() => {
    if (stageJustChanged) {
      setShowOverlay(true);

      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setShowOverlay(false);
        clearStageChanged();
        timerRef.current = null;
      }, LEVEL_CONFIG.STAGE_INDICATOR_DURATION);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [stageJustChanged, clearStageChanged]);

  const isFlightMode = gameMode === GAME_MODES.FLIGHT_MODE;

  return (
    <>
      {/* 关卡变化中央提示 */}
      {showOverlay && (
        <div className="stage-indicator-overlay">
          <div className="stage-indicator-text">{stageText}</div>
        </div>
      )}

      {/* 飞行模式 HUD 常驻显示 */}
      {isFlightMode && (
        <div className="stage-hud-badge">{stageText}</div>
      )}
    </>
  );
}

export default StageIndicator;
