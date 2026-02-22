import { useMemo } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import './WelcomePoster.css';

// 生成随机星星
function Stars() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 3}s`,
      size: `${1 + Math.random() * 2.5}px`,
    }));
  }, []);

  return (
    <div className="welcome-stars">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            '--duration': s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: '🔧',
    titleKey: 'poster.feature1Title',
    descKey: 'poster.feature1Desc',
  },
  {
    icon: '🚀',
    titleKey: 'poster.feature2Title',
    descKey: 'poster.feature2Desc',
  },
  {
    icon: '🏆',
    titleKey: 'poster.feature3Title',
    descKey: 'poster.feature3Desc',
  },
  {
    icon: '🌍',
    titleKey: 'poster.feature4Title',
    descKey: 'poster.feature4Desc',
  },
];

export function WelcomePoster() {
  const { hasPlayedFirstGame, hasSeenPoster } = useGameStore();
  const { t } = useI18n();

  // 只有新用户且还没看过海报才显示
  if (hasPlayedFirstGame || hasSeenPoster) return null;

  const handlePlay = () => {
    // 标记已看过海报，进入试玩（飞行模式已经是默认状态）
    useGameStore.setState({ hasSeenPoster: true });
  };

  return (
    <div className="welcome-poster">
      <div className="welcome-bg">
        <Stars />
      </div>

      <div className="welcome-content">
        {/* Captain Dylan 头像 */}
        <div className="welcome-avatar-wrapper">
          <div className="welcome-avatar-glow" />
          <img
            className="welcome-avatar"
            src="/captaindylan.png"
            alt="Captain Dylan"
          />
        </div>

        {/* 标题 */}
        <h1 className="welcome-title">SKYTINKER</h1>
        <p className="welcome-subtitle">{t('poster.subtitle')}</p>

        <div className="welcome-divider" />

        {/* 特色卡片 */}
        <div className="welcome-features">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <p className="feature-title">{t(f.titleKey)}</p>
              <p className="feature-desc">{t(f.descKey)}</p>
            </div>
          ))}
        </div>

        {/* 开始按钮 */}
        <button className="welcome-play-btn" onClick={handlePlay}>
          ▶ {t('poster.play')}
        </button>

        <p className="welcome-hint">{t('poster.hint')}</p>
      </div>
    </div>
  );
}

export default WelcomePoster;
