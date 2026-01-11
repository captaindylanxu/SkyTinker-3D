import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import './GameOverModal.css';

export function GameOverModal() {
  const { isGameOver, score, resetGame } = useGameStore();
  const { t } = useI18n();

  if (!isGameOver) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h1 className="game-over-title">💥 {t('gameOver')}</h1>
        
        <div className="final-score">
          <span className="score-label">{t('finalScore')}</span>
          <span className="score-value">{Math.floor(score)} {t('meter')}</span>
        </div>

        <button className="restart-button" onClick={resetGame}>
          🔄 {t('backToBuild')}
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
