import { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { GAME_MODES } from '../../constants/gameConstants';
import './FirstFlightHint.css';

export function FirstFlightHint() {
  const { isFirstGame, gameMode } = useGameStore();
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isFirstGame && gameMode === GAME_MODES.FLIGHT_MODE) {
      setShow(true);
      // 5秒后自动隐藏
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isFirstGame, gameMode]);

  if (!show) return null;

  return (
    <div className="first-flight-hint">
      <div className="hint-content">
        <h2>✈️ {t('firstFlight.title')}</h2>
        <p>{t('firstFlight.desc')}</p>
        <button className="hint-close" onClick={() => setShow(false)}>
          {t('firstFlight.gotIt')}
        </button>
      </div>
    </div>
  );
}

export default FirstFlightHint;
