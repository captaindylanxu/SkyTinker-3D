import useGameStore from '../../store/useGameStore';
import './GameOverModal.css';

export function GameOverModal() {
  const { isGameOver, score, resetGame } = useGameStore();

  if (!isGameOver) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h1 className="game-over-title">💥 Game Over</h1>
        
        <div className="final-score">
          <span className="score-label">飞行距离</span>
          <span className="score-value">{Math.floor(score)} m</span>
        </div>

        <button className="restart-button" onClick={resetGame}>
          🔄 重新建造
        </button>

        <p className="tip">提示：多加机翼增加稳定性，多加引擎增加推力</p>
      </div>
    </div>
  );
}

export default GameOverModal;
