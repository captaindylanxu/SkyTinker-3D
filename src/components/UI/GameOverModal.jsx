import { useEffect, useState, useCallback, useMemo } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { submitScore, getPlayerHighScore } from '../../services/leaderboard';
import { generateShareUrl, getShareText, doShare } from '../../services/share';
import { useReferralLife } from '../../services/referral';
import { generateGameTips } from '../../services/gameTips';
import './GameOverModal.css';

export function GameOverModal() {
  const {
    isGameOver, score, highScore, playerId, playerName,
    resetGame, showAccountModal, vehicleParts,
    hasUsedShareRevive, hasUsedReferralRevive, referralLives,
    shareRevive, referralRevive, setReferralLives,
    currentStage, highestStage,
  } = useGameStore();
  const { t } = useI18n();
  // shared: 用户已完成分享动作，等待手动续命
  const [shared, setShared] = useState(false);
  const [showWeChatGuide, setShowWeChatGuide] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState(false);
  const [dbHighScore, setDbHighScore] = useState(null);

  const displayHighScore = playerId && dbHighScore !== null
    ? Math.max(dbHighScore, highScore)
    : highScore;

  const isNewRecord = score >= displayHighScore && score > 0;
  const canShareRevive = !hasUsedShareRevive && !shared;
  const canReferralRevive = !hasUsedReferralRevive && referralLives > 0;
  const canRevive = canShareRevive || canReferralRevive || shared;

  const gameTips = useMemo(() => {
    if (!isGameOver) return [];
    return generateGameTips(vehicleParts, score, displayHighScore, t);
  }, [isGameOver, vehicleParts, score, displayHighScore, t]);

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

  // 重置状态
  useEffect(() => {
    if (isGameOver) {
      setShared(false);
      setShowWeChatGuide(false);
      setShowCopyTip(false);
    }
  }, [isGameOver]);

  // 第一步：点击分享按钮 → 复制内容 + 显示引导
  const handleShareClick = useCallback(async () => {
    const url = generateShareUrl(playerId);
    const text = getShareText(score, t);
    const result = await doShare(url, text);

    if (result.wechat) {
      setShowWeChatGuide(true);
    } else {
      // 非微信：直接标记为已分享，显示复制提示
      setShowCopyTip(true);
      setShared(true);
    }
  }, [playerId, score, t]);

  // 微信引导蒙层关闭 → 标记为已分享
  const dismissWeChatGuide = useCallback(() => {
    setShowWeChatGuide(false);
    setShared(true);
  }, []);

  // 第二步：用户主动点击续命
  const handleReviveNow = useCallback(() => {
    shareRevive();
  }, [shareRevive]);

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

        <div className="stage-info">
          <div className="stage-info-row">
            <span className="stage-info-label">🚀 {t('stageReached')}</span>
            <span className="stage-info-value">{currentStage}</span>
          </div>
          <div className="stage-info-row">
            <span className="stage-info-label">👑 {t('highestStage')}</span>
            <span className="stage-info-value">{highestStage}</span>
          </div>
        </div>

        {/* 智能建议/鼓励 */}
        {gameTips.length > 0 && (
          <div className="game-tips">
            {gameTips.map((tip, i) => (
              <div key={i} className={`game-tip tip-${tip.type}`}>
                <span className="tip-icon">{tip.icon}</span>
                <span className="tip-text">{tip.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* 续命区域 */}
        {canRevive && (
          <div className="revive-section">
            <div className="revive-title">💖 {t('share.reviveTitle')}</div>

            {/* 还没分享：显示分享按钮 */}
            {canShareRevive && (
              <button
                className="revive-button share-revive-btn"
                onClick={handleButtonAction(handleShareClick)}
                onTouchEnd={handleButtonAction(handleShareClick)}
              >
                📢 {t('share.shareToRevive')}
              </button>
            )}

            {/* 已分享：显示复制提示 + 续命按钮 */}
            {shared && (
              <>
                {showCopyTip && (
                  <div className="copy-guide-tip">
                    {t('share.copyGuide')}
                  </div>
                )}
                <button
                  className="revive-button revive-now-btn"
                  onClick={handleButtonAction(handleReviveNow)}
                  onTouchEnd={handleButtonAction(handleReviveNow)}
                >
                  ✅ {t('share.reviveNow')}
                </button>
              </>
            )}

            {/* 邀请续命 */}
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

        <button
          className="restart-button"
          onClick={handleRestart}
          onTouchEnd={handleRestart}
        >
          🔄 {t('backToBuild')}
        </button>
      </div>

      {/* 微信引导蒙层 */}
      {showWeChatGuide && (
        <div
          className="wechat-guide-overlay"
          onClick={handleButtonAction(dismissWeChatGuide)}
          onTouchEnd={handleButtonAction(dismissWeChatGuide)}
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
