import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import './GameOverModal.css';

export function GameOverModal() {
  const { isGameOver, score, highScore, resetGame } = useGameStore();
  const { t } = useI18n();

  if (!isGameOver) return null;

  const isNewRecord = score >= highScore && score > 0;

  const handleRestart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetGame();
  };

  return (
    <div className="game-over-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="game-over-modal">
        <h1 className="game-over-title">💥 {t('gameOver')}</h1>
        
        {isNewRecord && (
          <div className="new-record-badge">{t('newRecord')}</div>
        )}
        
        <div className="final-score">
          <span className="score-label">{t('finalScore')}</span>
          <span className="score-value">{Math.floor(score)} {t('meter')}</span>
        </div>
        
        <div className="high-score">
          <span className="high-score-label">🏆 {t('highScore')}</span>
          <span className="high-score-value">{Math.floor(highScore)} {t('meter')}</span>
        </div>

        <button 
          className="restart-button" 
          onClick={handleRestart}
          onTouchEnd={handleRestart}
        >
          🔄 {t('backToBuild')}
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
