import { useEffect, useState, useCallback } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { submitScore } from '../../services/leaderboard';
import { generateShareUrl, getShareText, getAvailablePlatforms, SHARE_PLATFORMS } from '../../services/share';
import { useReferralLife } from '../../services/referral';
import './GameOverModal.css';

export function GameOverModal() {
  const {
    isGameOver, score, highScore, playerId, playerName,
    resetGame, showAccountModal,
    hasUsedShareRevive, hasUsedReferralRevive, referralLives,
    shareRevive, referralRevive, setReferralLives,
  } = useGameStore();
  const { t } = useI18n();
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copyHint, setCopyHint] = useState(false);
  const [reviveCountdown, setReviveCountdown] = useState(0);

  const isNewRecord = score >= highScore && score > 0;
  const canShareRevive = !hasUsedShareRevive;
  const canReferralRevive = !hasUsedReferralRevive && referralLives > 0;
  const canRevive = canShareRevive || canReferralRevive;

  // 游戏结束时提交分数
  useEffect(() => {
    if (isGameOver && playerId && playerName && score > 0) {
      submitScore(playerId, playerName, score);
    }
  }, [isGameOver, playerId, playerName, score]);

  // 重置面板状态
  useEffect(() => {
    if (isGameOver) {
      setShowSharePanel(false);
      setShareSuccess(false);
      setCopyHint(false);
      setReviveCountdown(0);
    }
  }, [isGameOver]);

  // 续命倒计时
  useEffect(() => {
    if (reviveCountdown > 0) {
      const timer = setTimeout(() => {
        if (reviveCountdown === 1) {
          // 倒计时结束，执行续命
          shareRevive();
        }
        setReviveCountdown(reviveCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [reviveCountdown, shareRevive]);

  const handleShare = useCallback(async (platformId) => {
    const url = generateShareUrl(playerId);
    const text = getShareText(score, t);
    const platform = SHARE_PLATFORMS[platformId];
    
    if (!platform) return;

    const result = await platform.share(url, text);
    
    if (result?.method === 'clipboard' || platformId === 'wechat') {
      setCopyHint(true);
      setTimeout(() => setCopyHint(false), 3000);
    }

    // 方案A：点击分享即视为已分享
    setShareSuccess(true);
    setReviveCountdown(3);
  }, [playerId, score, t]);

  const handleReferralRevive = useCallback(async () => {
    if (!canReferralRevive) return;
    
    // 消耗远程续命次数
    if (playerId) {
      const success = await useReferralLife(playerId);
      if (success) {
        setReferralLives(referralLives - 1);
      }
    }
    referralRevive();
  }, [canReferralRevive, playerId, referralLives, referralRevive, setReferralLives]);

  const handleRestart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetGame();
  };

  if (!isGameOver || showAccountModal) return null;

  const platforms = getAvailablePlatforms();

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

        {/* 续命区域 */}
        {canRevive && !shareSuccess && (
          <div className="revive-section">
            <div className="revive-title">💖 {t('share.reviveTitle')}</div>
            
            {/* 分享续命 */}
            {canShareRevive && !showSharePanel && (
              <button
                className="revive-button share-revive-btn"
                onClick={() => setShowSharePanel(true)}
              >
                📢 {t('share.shareToRevive')}
              </button>
            )}

            {/* 分享平台选择 */}
            {showSharePanel && !shareSuccess && (
              <div className="share-panel">
                <div className="share-panel-hint">{t('share.choosePlatform')}</div>
                <div className="share-platforms">
                  {platforms.map((pid) => {
                    const p = SHARE_PLATFORMS[pid];
                    return (
                      <button
                        key={pid}
                        className="share-platform-btn"
                        onClick={() => handleShare(pid)}
                        title={t(`share.platform.${pid}`)}
                      >
                        <span className="platform-icon">{p.icon}</span>
                        <span className="platform-name">{t(`share.platform.${pid}`)}</span>
                      </button>
                    );
                  })}
                </div>
                {copyHint && (
                  <div className="copy-hint">✅ {t('share.copied')}</div>
                )}
              </div>
            )}

            {/* 邀请续命 */}
            {canReferralRevive && (
              <button
                className="revive-button referral-revive-btn"
                onClick={handleReferralRevive}
              >
                🎁 {t('share.referralRevive')} ({referralLives})
              </button>
            )}
          </div>
        )}

        {/* 分享成功，续命倒计时 */}
        {shareSuccess && reviveCountdown > 0 && (
          <div className="revive-countdown">
            <div className="revive-countdown-text">
              ✅ {t('share.shareSuccess')}
            </div>
            <div className="revive-countdown-number">
              {t('share.reviveIn').replace('{seconds}', reviveCountdown)}
            </div>
          </div>
        )}

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
