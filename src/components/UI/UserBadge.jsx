import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import './UserBadge.css';

export function UserBadge() {
  const { playerName, playerId, hasSeenPoster, hasCompletedOnboarding } = useGameStore();
  const { t } = useI18n();

  // 海报期间不显示
  if (!hasSeenPoster) return null;

  const handleClick = () => {
    useGameStore.setState({ showAccountModal: true });
  };

  // 已有账号 → 显示用户名
  if (playerId && playerName) {
    return (
      <button className="user-badge logged-in" onClick={handleClick} title={t('account.recoverAccount')}>
        <span className="user-badge-icon">👤</span>
        <span className="user-badge-name">{playerName}</span>
      </button>
    );
  }

  // 没有账号 → 显示创建账号按钮
  return (
    <button className="user-badge guest" onClick={handleClick}>
      <span className="user-badge-icon">👤</span>
      <span className="user-badge-name">{t('account.createNew')}</span>
    </button>
  );
}

export default UserBadge;
