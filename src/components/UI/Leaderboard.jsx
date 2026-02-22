import { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { getLeaderboard, getPlayerRank } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './Leaderboard.css';

export function Leaderboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { playerId, gameMode, hasSeenPoster } = useGameStore();
  const { t } = useI18n();

  const hasLeaderboard = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen && hasLeaderboard) {
      loadLeaderboard();
    }
  }, [isOpen, hasLeaderboard]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    
    const [leaderboardResult, rankResult] = await Promise.all([
      getLeaderboard(100),
      playerId ? getPlayerRank(playerId) : Promise.resolve({ rank: null }),
    ]);

    if (leaderboardResult.success) {
      setLeaderboardData(leaderboardResult.data);
    }

    if (rankResult.success && rankResult.rank) {
      setPlayerRank(rankResult.rank);
    }

    setIsLoading(false);
  };

  if (!hasLeaderboard || !hasSeenPoster) return null;

  return (
    <>
      <button className="leaderboard-toggle" onClick={() => setIsOpen(!isOpen)}>
        🏆 {t('leaderboard.title')}
      </button>

      {isOpen && (
        <div className="leaderboard-overlay" onClick={() => setIsOpen(false)}>
          <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-header">
              <h2 className="leaderboard-title">🏆 {t('leaderboard.title')}</h2>
              <button className="leaderboard-close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            {playerId && playerRank && (
              <div className="leaderboard-player-rank">
                {t('leaderboard.yourRank')}: #{playerRank}
              </div>
            )}

            <div className="leaderboard-content">
              {isLoading ? (
                <div className="leaderboard-loading">{t('leaderboard.loading')}</div>
              ) : leaderboardData.length === 0 ? (
                <div className="leaderboard-empty">{t('leaderboard.empty')}</div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboardData.map((entry, index) => (
                    <div
                      key={entry.player_id}
                      className={`leaderboard-item ${
                        entry.player_id === playerId ? 'is-current-player' : ''
                      } ${index < 3 ? `rank-${index + 1}` : ''}`}
                    >
                      <div className="leaderboard-rank">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div className="leaderboard-player">
                        <div className="leaderboard-player-name">{entry.player_name}</div>
                      </div>
                      <div className="leaderboard-score">
                        {Math.floor(entry.high_score)} {t('meter')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="leaderboard-refresh" onClick={loadLeaderboard}>
              🔄 {t('leaderboard.refresh')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Leaderboard;
