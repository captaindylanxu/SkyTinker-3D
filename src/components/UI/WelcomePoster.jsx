import { useMemo, useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { GAME_MODES } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import { getLeaderboard } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
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

// 海报内嵌排行榜
function PosterLeaderboard({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    if (isSupabaseConfigured()) {
      getLeaderboard(20).then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="poster-leaderboard-overlay" onClick={onClose}>
      <div className="poster-leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="poster-lb-header">
          <h2>🏆 {t('leaderboard.title')}</h2>
          <button className="poster-lb-close" onClick={onClose}>✕</button>
        </div>
        <div className="poster-lb-content">
          {loading ? (
            <p className="poster-lb-loading">{t('leaderboard.loading')}</p>
          ) : data.length === 0 ? (
            <p className="poster-lb-empty">{t('leaderboard.empty')}</p>
          ) : (
            <div className="poster-lb-list">
              {data.map((entry, i) => (
                <div key={entry.player_id} className={`poster-lb-item ${i < 3 ? `rank-${i + 1}` : ''}`}>
                  <span className="poster-lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="poster-lb-name">{entry.player_name}</span>
                  <span className="poster-lb-score">{Math.floor(entry.high_score)} {t('meter')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WelcomePoster() {
  const { hasSeenPoster, hasCompletedOnboarding } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { t } = useI18n();

  // 每次刷新都显示海报，点击 TAKE OFF 后隐藏（hasSeenPoster 不持久化）
  if (hasSeenPoster) return null;

  const handlePlay = () => {
    const state = useGameStore.getState();
    if (state.hasCompletedOnboarding) {
      // 老用户 → 直接进入建造模式
      useGameStore.setState({ 
        hasSeenPoster: true,
        gameMode: GAME_MODES.BUILD_MODE,
      });
    } else {
      // 新用户 → 显示账号弹窗 → 教程
      useGameStore.setState({ 
        hasSeenPoster: true,
        showAccountModal: true,
        gameMode: GAME_MODES.BUILD_MODE,
      });
    }
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

        {/* 按钮区域 */}
        <div className="welcome-buttons">
          <button className="welcome-play-btn" onClick={handlePlay}>
            ▶ {t('poster.play')}
          </button>
          <button className="welcome-leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
            🏆 {t('leaderboard.title')}
          </button>
        </div>

        <p className="welcome-hint">{t('poster.hint')}</p>
      </div>

      {/* 排行榜弹窗 */}
      {showLeaderboard && (
        <PosterLeaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

export default WelcomePoster;
