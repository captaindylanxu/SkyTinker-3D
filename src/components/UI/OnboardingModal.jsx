import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { checkPlayerIdExists } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './OnboardingModal.css';

export function OnboardingModal() {
  const { hasCompletedOnboarding, setPlayerInfo, skipOnboarding } = useGameStore();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const hasLeaderboard = isSupabaseConfigured();

  if (hasCompletedOnboarding) return null;

  const handleSkip = () => {
    skipOnboarding();
  };

  const handlePlayerIdSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!playerId.trim()) {
      setError(t('onboarding.playerIdRequired'));
      return;
    }

    // 验证 ID 格式（3-20 字符，字母数字下划线）
    const idRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!idRegex.test(playerId)) {
      setError(t('onboarding.playerIdInvalid'));
      return;
    }

    setIsChecking(true);

    // 检查 ID 是否已存在
    const exists = await checkPlayerIdExists(playerId);
    setIsChecking(false);

    if (exists) {
      setError(t('onboarding.playerIdExists'));
      return;
    }

    setStep(2);
  };

  const handlePlayerNameSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim()) {
      setError(t('onboarding.playerNameRequired'));
      return;
    }

    if (playerName.length > 20) {
      setError(t('onboarding.playerNameTooLong'));
      return;
    }

    setPlayerInfo(playerId, playerName);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {step === 1 ? (
          <>
            <h2 className="onboarding-title">✈️ {t('onboarding.welcome')}</h2>
            <p className="onboarding-description">{t('onboarding.description')}</p>

            {hasLeaderboard ? (
              <form onSubmit={handlePlayerIdSubmit} className="onboarding-form">
                <label className="onboarding-label">
                  {t('onboarding.playerIdLabel')}
                  <input
                    type="text"
                    className="onboarding-input"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value.toLowerCase())}
                    placeholder={t('onboarding.playerIdPlaceholder')}
                    maxLength={20}
                    autoFocus
                  />
                  <span className="onboarding-hint">{t('onboarding.playerIdHint')}</span>
                </label>

                {error && <div className="onboarding-error">{error}</div>}

                <button 
                  type="submit" 
                  className="onboarding-button"
                  disabled={isChecking}
                >
                  {isChecking ? t('onboarding.checking') : t('onboarding.next')}
                </button>

                <button
                  type="button"
                  className="onboarding-skip"
                  onClick={handleSkip}
                >
                  {t('onboarding.skip')}
                </button>
              </form>
            ) : (
              <div className="onboarding-no-leaderboard">
                <p>{t('onboarding.noLeaderboard')}</p>
                <button
                  type="button"
                  className="onboarding-button"
                  onClick={handleSkip}
                >
                  {t('onboarding.start')}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="onboarding-title">👤 {t('onboarding.nameTitle')}</h2>
            <p className="onboarding-description">{t('onboarding.nameDescription')}</p>

            <form onSubmit={handlePlayerNameSubmit} className="onboarding-form">
              <label className="onboarding-label">
                {t('onboarding.playerNameLabel')}
                <input
                  type="text"
                  className="onboarding-input"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('onboarding.playerNamePlaceholder')}
                  maxLength={20}
                  autoFocus
                />
              </label>

              {error && <div className="onboarding-error">{error}</div>}

              <div className="onboarding-buttons">
                <button
                  type="button"
                  className="onboarding-back"
                  onClick={() => setStep(1)}
                >
                  {t('onboarding.back')}
                </button>
                <button type="submit" className="onboarding-button">
                  {t('onboarding.start')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default OnboardingModal;
