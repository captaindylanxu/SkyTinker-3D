import { useEffect, useState, useCallback } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { submitScore, getPlayerHighScore } from '../../services/leaderboard';
import { generateShareUrl, getShareText, doShare, isWeChatBrowser } from '../../services/share';
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
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showWeChatGuide, setShowWeChatGuide] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState(false);
  const [reviveCountdown, setReviveCountdown] = useState(0);
  const [dbHighScore, setDbHighScore] = useState(null);

  const displayHighScore = playerId && dbHighScore !== null
    ? Math.max(dbHighScore, highScore)
    : highScore;

  const isNewRecord = score >= displayHighScore && score > 0;
  const canShareRevive = !hasUsedShareRevive;
  const canReferralRevive = !hasUsedReferralRevive && referralLives > 0;
  const canRevive = canShareRevive || canReferralRevive;

  useEffect(() => {
    if (isGameOver && playerId && playerName && score > 0) {
      submitScore(playerId, playerName, score);
    }
  }, [isGameOver, playerId, playerName, score]);

  useEffect(() => {
    if (isGameOver && playerId) {
      getPlayerHighScore(playerId).then(({ success, highScore: dbScore }) => {
        if (success && dbScore !== null) {
          setDbHighScore(dbScore);
        }
      });
    } else {
      setDbHighScore(null);
    }
  }, [isGameOver, playerId]);

  useEffect(() => {
    if (isGameOver) {
      setShareSuccess(false);
      setShowWeChatGuide(false);
      setShowCopyTip(false);
      setReviveCountdown(0);
    }
  }, [isGameOver]);

  useEffect(() => {
    if (reviveCountdown > 0) {
      const timer = setTimeout(() => {
        if (reviveCountdown === 1) {
          shareRevive();
        }
        setReviveCountdown(reviveCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [reviveCountdown, shareRevive]);

  const handleShareToRevive = useCallback(async () => {
    const url = generateShareUrl(playerId);
    const text = getShareText(score, t);
    const result = await doShare(url, text);

    if (result.wechat) {
      // 微信内：显示引导蒙层，提示用户点右上角分享
      setShowWeChatGuide(true);
    } else {
      // 非微信：显示复制成功提示
      setShowCopyTip(true);
    }

    // 方案A：点击即视为已分享，开始续命倒计时
    setShareSuccess(true);
    setReviveCountdown(3);
  }, [playerId, score, t]);

  const handleReferralRevive = useCallback(async () => {
    if (!canReferralRevive) return;
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

  const handleButtonAction = (callback) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  if (!isGameOver || showAccountModal) return null;

  return (
    <div
      className="game-over-overlay"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
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
          <span className="high-score-value">{Math.floor(displayHighScore)} {t('meter')}</span>
        </div>

        {/* 续命区域 */}
        {canRevive && !shareSuccess && (
          <div className="revive-section">
            <div className="revive-title">💖 {t('share.reviveTitle')}</div>

            {canShareRevive && (
              <button
                className="revive-button share-revive-btn"
                onClick={handleButtonAction(handleShareToRevive)}
                onTouchEnd={handleButtonAction(handleShareToRevive)}
              >
                📢 {t('share.shareToRevive')}
              </button>
            )}

            {canReferralRevive && (
              <button
                className="revive-button referral-revive-btn"
                onClick={handleButtonAction(handleReferralRevive)}
                onTouchEnd={handleButtonAction(handleReferralRevive)}
              >
                🎁 {t('share.referralRevive')} ({referralLives})
              </button>
            )}
          </div>
        )}

        {/* 分享成功 + 续命倒计时 */}
        {shareSuccess && reviveCountdown > 0 && (
          <div className="revive-countdown">
            {showWeChatGuide && (
              <div className="wechat-guide-tip">
                {t('share.wechatGuide')}
              </div>
            )}
            {showCopyTip && (
              <div className="copy-guide-tip">
                {t('share.copyGuide')}
              </div>
            )}
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

      {/* 微信引导蒙层：提示用户点右上角分享 */}
      {showWeChatGuide && (
        <div
          className="wechat-guide-overlay"
          onClick={handleButtonAction(() => setShowWeChatGuide(false))}
          onTouchEnd={handleButtonAction(() => setShowWeChatGuide(false))}
        >
          <div className="wechat-guide-arrow">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M30 50 L30 15" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M18 27 L30 15 L42 27" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="wechat-guide-text">
            {t('share.wechatTapGuide')}
          </div>
          <div className="wechat-guide-dismiss">
            {t('share.tapToDismiss')}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameOverModal;
