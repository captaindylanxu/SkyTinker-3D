import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { createPlayer, recoverAccount, checkPlayerNameExists } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './AccountModal.css';

export function AccountModal() {
  const { 
    hasCompletedOnboarding, 
    setPlayerInfo, 
    skipOnboarding,
    isFirstGame,
    hasPlayedFirstFlight,
    startTutorial,
  } = useGameStore();
  const { t } = useI18n();
  
  const [mode, setMode] = useState('welcome'); // welcome, create, recover
  const [playerName, setPlayerName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasLeaderboard = isSupabaseConfigured();

  // 只在第一次游戏后且未完成账号创建时显示
  const shouldShow = !isFirstGame && hasPlayedFirstFlight && !hasCompletedOnboarding;
  
  if (!shouldShow) return null;

  // 欢迎界面
  if (mode === 'welcome') {
    return (
      <div className="account-overlay">
        <div className="account-modal">
          <h2 className="account-title">✈️ {t('account.welcome')}</h2>
          <p className="account-description">{t('account.welcomeDesc')}</p>
          
          {/* 第一次游戏后的特殊提示 */}
          {hasPlayedFirstFlight && (
            <div className="first-game-message">
              <p>🎮 {t('firstGameMessage')}</p>
            </div>
          )}

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
              <button
                className="account-button skip"
                onClick={() => {
                  skipOnboarding();
                  // 跳过后启动教程
                  if (hasPlayedFirstFlight) {
                    setTimeout(() => startTutorial(), 100);
                  }
                }}
              >
                {t('account.skip')}
              </button>
            </div>
          ) : (
            <button
              className="account-button primary"
              onClick={() => {
                skipOnboarding();
                // 跳过后启动教程
                if (hasPlayedFirstFlight) {
                  setTimeout(() => startTutorial(), 100);
                }
              }}
            >
              {t('account.startGame')}
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
        setPlayerInfo(result.data.playerId, result.data.playerName);
        // 创建账号后启动教程
        if (hasPlayedFirstFlight) {
          setTimeout(() => startTutorial(), 100);
        }
      } else {
        setError(result.error === 'Name already exists' 
          ? t('account.nameExists') 
          : t('account.createFailed'));
      }
    };

    return (
      <div className="account-overlay">
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
                placeholder={t('account.nicknamePlaceholder')}
                maxLength={20}
                autoFocus
              />
            </label>

            <label className="account-label">
              {t('account.pin')} <span className="optional">({t('account.optional')})</span>
              <input
                type="tel"
                className="account-input pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
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
        setPlayerInfo(result.data.playerId, result.data.playerName);
        // 找回账号后启动教程
        if (hasPlayedFirstFlight) {
          setTimeout(() => startTutorial(), 100);
        }
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
      <div className="account-overlay">
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
                placeholder={t('account.nicknamePlaceholder')}
                maxLength={20}
                autoFocus
              />
            </label>

            <label className="account-label">
              {t('account.pin')}
              <input
                type="tel"
                className="account-input pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
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
