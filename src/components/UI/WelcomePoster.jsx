import { useMemo, useState, useEffect, useRef } from 'react';
import useGameStore, { DEFAULT_VEHICLE_PARTS } from '../../store/useGameStore';
import { GAME_MODES } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import { getLeaderboard } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './WelcomePoster.css';

// 故事图片 + 多语言文案 key
const STORY_SLIDES = [
  { src: '/story/story1.jpg', titleKey: 'story.s1Title', descKey: 'story.s1Desc' },
  { src: '/story/story2.jpg', titleKey: 'story.s2Title', descKey: 'story.s2Desc' },
  { src: '/story/story3.jpg', titleKey: 'story.s3Title', descKey: 'story.s3Desc' },
  { src: '/story/story4.jpg', titleKey: 'story.s4Title', descKey: 'story.s4Desc' },
  { src: '/story/story5.jpg', titleKey: 'story.s5Title', descKey: 'story.s5Desc' },
  { src: '/story/story6.jpg', titleKey: 'story.s6Title', descKey: 'story.s6Desc' },
  { src: '/story/story7.jpg', titleKey: 'story.s7Title', descKey: 'story.s7Desc' },
];

const AUTO_PLAY_INTERVAL = 5000;

// ===== 星星背景 =====
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
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            '--duration': s.duration, animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// ===== 内嵌迷你轮播组件（在海报页内自动播放） =====
function InlineStoryCarousel() {
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const { t } = useI18n();
  const total = STORY_SLIDES.length;

  // 自动播放（循环）
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [total]);

  // 切换时重置文字动画
  useEffect(() => {
    setTextVisible(false);
    const timer = setTimeout(() => setTextVisible(true), 100);
    return () => clearTimeout(timer);
  }, [current]);

  // 触摸滑动
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      clearInterval(timerRef.current);
      setCurrent((c) => dx < 0 ? (c + 1) % total : (c - 1 + total) % total);
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % total);
      }, AUTO_PLAY_INTERVAL);
    }
  };

  const slide = STORY_SLIDES[current];

  return (
    <div
      className="inline-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {STORY_SLIDES.map((s, i) => (
        <div
          key={i}
          className={`inline-carousel-slide ${i === current ? 'active' : ''}`}
        >
          <img src={s.src} alt={`Story ${i + 1}`} draggable={false} />
        </div>
      ))}

      <div className={`inline-carousel-caption ${textVisible ? 'visible' : ''}`}>
        <div className="inline-carousel-title">{t(slide.titleKey)}</div>
        <div className="inline-carousel-desc">{t(slide.descKey)}</div>
      </div>

      <div className="inline-carousel-dots">
        {STORY_SLIDES.map((_, i) => (
          <span key={i} className={`inline-carousel-dot ${i === current ? 'active' : ''}`} />
        ))}
      </div>

      <div className="inline-carousel-progress">
        <div
          className="inline-carousel-progress-bar"
          key={current}
          style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
        />
      </div>
    </div>
  );
}

// ===== 海报内嵌排行榜 =====
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

// ===== 主组件 =====
export function WelcomePoster() {
  const { hasSeenPoster } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { t } = useI18n();

  if (hasSeenPoster) return null;

  const handleEnterGame = () => {
    const state = useGameStore.getState();
    if (state.hasCompletedOnboarding) {
      useGameStore.setState({ hasSeenPoster: true, gameMode: GAME_MODES.BUILD_MODE });
    } else {
      useGameStore.setState({
        hasSeenPoster: true,
        gameMode: GAME_MODES.FLIGHT_MODE,
        vehicleParts: DEFAULT_VEHICLE_PARTS,
        score: 0,
        isGameOver: false,
        isExploded: false,
      });
    }
  };

  return (
    <div className="welcome-poster">
      <div className="welcome-bg"><Stars /></div>

      <div className="welcome-content">
        <div className="welcome-avatar-wrapper">
          <div className="welcome-avatar-glow" />
          <img className="welcome-avatar" src="/captaindylan.png" alt="Captain Dylan" />
        </div>

        <h1 className="welcome-title">SKYTINKER</h1>
        <p className="welcome-subtitle">{t('poster.subtitle')}</p>
        <div className="welcome-divider" />

        <InlineStoryCarousel />

        <div className="welcome-buttons">
          <button className="welcome-play-btn" onClick={handleEnterGame}>
            ▶ {t('poster.play')}
          </button>
          <button className="welcome-leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
            🏆 {t('leaderboard.title')}
          </button>
        </div>

        <p className="welcome-hint">{t('poster.hint')}</p>
      </div>

      {showLeaderboard && <PosterLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

export default WelcomePoster;
