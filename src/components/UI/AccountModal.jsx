import { useState, useCallback } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { createPlayer, recoverAccount, checkPlayerNameExists } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './AccountModal.css';

// 阻止触摸事件穿透到 Canvas（Safari 移动端兼容）
const stopTouchPropagation = (e) => {
  e.stopPropagation();
};

export function AccountModal() {
  const { 
    showAccountModal, 
    setPlayerInfo, 
    skipOnboarding, 
    setTutorialStep,
    hasCompletedOnboarding,
    playerId: currentPlayerId,
  } = useGameStore();
  const { t } = useI18n();
  
  const [mode, setMode] = useState('welcome'); // welcome, create, recover
  const [playerName, setPlayerName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasLeaderboard = isSupabaseConfigured();

  // 手动聚焦输入框（Safari 移动端需要）
  const handleInputClick = useCallback((e) => {
    e.target.focus();
  }, []);

  // 只在 showAccountModal 为 true 时显示
  if (!showAccountModal) return null;

  // 完成账号创建/找回后
  const handleAccountComplete = (playerId, playerName) => {
    setPlayerInfo(playerId, playerName);
    const state = useGameStore.getState();
    // 只有新用户（还没完成过 onboarding）才启动教程
    if (!state.hasCompletedOnboarding) {
      useGameStore.getState().resetGame();
      setTutorialStep(0);
    }
  };

  // 跳过账号流程
  const handleSkip = () => {
    const wasOnboarded = useGameStore.getState().hasCompletedOnboarding;
    skipOnboarding();
    // 只有新用户才启动教程
    if (!wasOnboarded) {
      useGameStore.getState().resetGame();
      setTutorialStep(0);
    }
  };

  // overlay 的通用事件属性（阻止穿透到 Canvas）
  const overlayProps = {
    onTouchStart: stopTouchPropagation,
    onTouchMove: stopTouchPropagation,
    onTouchEnd: stopTouchPropagation,
    onMouseDown: stopTouchPropagation,
  };

  // 欢迎界面
  if (mode === 'welcome') {
    // 从 UserBadge 打开（已完成 onboarding）vs 新用户首次
    const isFromBadge = hasCompletedOnboarding;
    
    return (
      <div className="account-overlay" {...overlayProps}>
        <div className="account-modal">
          {isFromBadge && (
            <button className="account-back" onClick={() => useGameStore.setState({ showAccountModal: false })}>
              ✕
            </button>
          )}
          <h2 className="account-title">
            {isFromBadge ? `👤 ${t('account.createAccount')}` : `🎉 ${t('account.firstGameComplete')}`}
          </h2>
          <p className="account-description">
            {isFromBadge ? t('account.welcomeDesc') : t('account.createAccountPrompt')}
          </p>

          {hasLeaderboard ? (
            <div className="account-buttons">
              <button 
                className="account-button primary"
                onClick={() => setMode('create')}
              >
                🆕 {t('account.createNew')}
              </button>
              <button 
                className="account-button secondary"
                onClick={() => setMode('recover')}
              >
                🔑 {t('account.recoverAccount')}
              </button>
              {!isFromBadge && (
                <button
                  className="account-button skip"
                  onClick={handleSkip}
                >
                  {t('account.skip')}
                </button>
              )}
            </div>
          ) : (
            <button
              className="account-button primary"
              onClick={isFromBadge ? () => useGameStore.setState({ showAccountModal: false }) : handleSkip}
            >
              {t('account.continue')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 创建新账号
  if (mode === 'create') {
    const handleCreate = async (e) => {
      e.preventDefault();
      setError('');

      if (!playerName.trim()) {
        setError(t('account.nameRequired'));
        return;
      }

      if (playerName.length > 20) {
        setError(t('account.nameTooLong'));
        return;
      }

      if (pin && !/^\d{4}$/.test(pin)) {
        setError(t('account.pinInvalid'));
        return;
      }

      setIsProcessing(true);

      // 检查昵称是否已存在
      const exists = await checkPlayerNameExists(playerName);
      if (exists) {
        setError(t('account.nameExists'));
        setIsProcessing(false);
        return;
      }

      // 创建账号
      const result = await createPlayer(playerName, pin || null);
      setIsProcessing(false);

      if (result.success) {
        handleAccountComplete(result.data.playerId, result.data.playerName);
      } else {
        setError(result.error === 'Name already exists' 
          ? t('account.nameExists') 
          : t('account.createFailed'));
      }
    };

    return (
      <div className="account-overlay" {...overlayProps}>
        <div className="account-modal">
          <button className="account-back" onClick={() => setMode('welcome')}>
            ← {t('account.back')}
          </button>

          <h2 className="account-title">🆕 {t('account.createAccount')}</h2>
          <p className="account-description">{t('account.createDesc')}</p>

          <form onSubmit={handleCreate} className="account-form">
            <label className="account-label">
              {t('account.nickname')}
              <input
                type="text"
                className="account-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onClick={handleInputClick}
                onTouchEnd={handleInputClick}
                placeholder={t('account.nicknamePlaceholder')}
                maxLength={20}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </label>

            <label className="account-label">
              {t('account.pin')} <span className="optional">({t('account.optional')})</span>
              <input
                type="tel"
                className="account-input pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onClick={handleInputClick}
                onTouchEnd={handleInputClick}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                autoComplete="off"
              />
              <span className="account-hint">{t('account.pinHint')}</span>
            </label>

            {error && <div className="account-error">{error}</div>}

            <button 
              type="submit" 
              className="account-button primary"
              disabled={isProcessing}
            >
              {isProcessing ? t('account.creating') : t('account.create')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 找回账号
  if (mode === 'recover') {
    const handleRecover = async (e) => {
      e.preventDefault();
      setError('');

      if (!playerName.trim()) {
        setError(t('account.nameRequired'));
        return;
      }

      if (!pin || !/^\d{4}$/.test(pin)) {
        setError(t('account.pinRequired'));
        return;
      }

      setIsProcessing(true);

      const result = await recoverAccount(playerName, pin);
      setIsProcessing(false);

      if (result.success) {
        handleAccountComplete(result.data.playerId, result.data.playerName);
      } else {
        if (result.error === 'Account not found') {
          setError(t('account.accountNotFound'));
        } else if (result.error === 'Incorrect PIN') {
          setError(t('account.incorrectPin'));
        } else {
          setError(t('account.recoverFailed'));
        }
      }
    };

    return (
      <div className="account-overlay" {...overlayProps}>
        <div className="account-modal">
          <button className="account-back" onClick={() => setMode('welcome')}>
            ← {t('account.back')}
          </button>

          <h2 className="account-title">🔑 {t('account.recoverAccount')}</h2>
          <p className="account-description">{t('account.recoverDesc')}</p>

          <form onSubmit={handleRecover} className="account-form">
            <label className="account-label">
              {t('account.nickname')}
              <input
                type="text"
                className="account-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onClick={handleInputClick}
                onTouchEnd={handleInputClick}
                placeholder={t('account.nicknamePlaceholder')}
                maxLength={20}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </label>

            <label className="account-label">
              {t('account.pin')}
              <input
                type="tel"
                className="account-input pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onClick={handleInputClick}
                onTouchEnd={handleInputClick}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                autoComplete="off"
              />
            </label>

            {error && <div className="account-error">{error}</div>}

            <button 
              type="submit" 
              className="account-button primary"
              disabled={isProcessing}
            >
              {isProcessing ? t('account.recovering') : t('account.recover')}
            </button>

            <div className="account-divider">{t('account.or')}</div>

            <button
              type="button"
              className="account-button secondary"
              onClick={() => setMode('create')}
            >
              {t('account.createNew')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

export default AccountModal;
