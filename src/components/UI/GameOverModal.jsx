import { useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { submitScore } from '../../services/leaderboard';
import './GameOverModal.css';

export function GameOverModal() {
  const { 
    isGameOver, 
    score, 
    highScore, 
    playerId, 
    playerName, 
    resetGame,
    isFirstGame,
    setFirstFlightCompleted,
    startTutorial,
  } = useGameStore();
  const { t } = useI18n();

  const isNewRecord = score >= highScore && score > 0;

  // 游戏结束时提交分数
  useEffect(() => {
    if (isGameOver && playerId && playerName && score > 0) {
      submitScore(playerId, playerName, score);
    }
  }, [isGameOver, playerId, playerName, score]);

  if (!isGameOver) return null;

  const handleRestart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 如果是第一次游戏，进入建造模式并开始教程
    if (isFirstGame) {
      setFirstFlightCompleted();
      startTutorial();
    } else {
      resetGame();
    }
  };

  return (
    <div className="game-over-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="game-over-modal">
        <h1 className="game-over-title">💥 {t('gameOver')}</h1>
        
        {isFirstGame && (
          <div className="first-game-message">
            <p>🎮 {t('firstGameMessage')}</p>
          </div>
        )}
        
        {isNewRecord && !isFirstGame && (
          <div className="new-record-badge">{t('newRecord')}</div>
        )}
        
        <div className="final-score">
          <span className="score-label">{t('finalScore')}</span>
          <span className="score-value">{Math.floor(score)} {t('meter')}</span>
        </div>
        
        {!isFirstGame && (
          <div className="high-score">
            <span className="high-score-label">🏆 {t('highScore')}</span>
            <span className="high-score-value">{Math.floor(highScore)} {t('meter')}</span>
          </div>
        )}

        <button 
          className="restart-button" 
          onClick={handleRestart}
          onTouchEnd={handleRestart}
        >
          {isFirstGame ? '🛠️ ' + t('startBuilding') : '🔄 ' + t('backToBuild')}
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
