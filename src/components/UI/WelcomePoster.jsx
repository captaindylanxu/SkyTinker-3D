import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import useGameStore, { DEFAULT_VEHICLE_PARTS } from '../../store/useGameStore';
import { GAME_MODES } from '../../constants/gameConstants';
import { useI18n } from '../../i18n/useI18n';
import { getLeaderboard } from '../../services/leaderboard';
import { isSupabaseConfigured } from '../../lib/supabase';
import './WelcomePoster.css';

// 故事图片配置
const STORY_SLIDES = [
  { src: '/story/story1.jpg' },
  { src: '/story/story2.jpg' },
  { src: '/story/story3.jpg' },
  { src: '/story/story4.jpg' },
  { src: '/story/story5.jpg' },
  { src: '/story/story6.jpg' },
  { src: '/story/story7.jpg' },
];

const AUTO_PLAY_INTERVAL = 4000;

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
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            '--duration': s.duration, animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// 故事书轮播组件
function StoryBook({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const { t } = useI18n();
  const total = STORY_SLIDES.length;
  const isLast = current === total - 1;

  // 自动播放
  useEffect(() => {
    if (paused || isLast) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => Math.min(c + 1, total - 1));
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, current, isLast, total]);

  const goTo = useCallback((idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    setPaused(true);
  }, [current]);

  const goNext = useCallback(() => {
    if (current < total - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
      setPaused(true);
    }
  }, [current, total]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
      setPaused(true);
    }
  }, [current]);

  // 触摸滑动
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
    }
  };

  // 点击左右区域翻页
  const handleAreaClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrev();
    else if (x > rect.width * 0.7) goNext();
    else setPaused((p) => !p);
  };

  return (
    <div className="storybook">
      {/* 图片区域 */}
      <div
        className="storybook-viewport"
        onClick={handleAreaClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {STORY_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`storybook-slide ${i === current ? 'active' : ''} ${
              i < current ? 'past' : i > current ? 'future' : ''
            }`}
            style={{ '--ken-burns-dir': i % 2 === 0 ? '1' : '-1' }}
          >
            <img src={slide.src} alt={`Story ${i + 1}`} draggable={false} />
          </div>
        ))}

        {/* 左右翻页提示 */}
        {current > 0 && <div className="storybook-nav-hint left">‹</div>}
        {current < total - 1 && <div className="storybook-nav-hint right">›</div>}
      </div>

      {/* 底部控制区 */}
      <div className="storybook-controls">
        {/* 进度点 */}
        <div className="storybook-dots">
          {STORY_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`storybook-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* 跳过 / 开始冒险 */}
        <div className="storybook-actions">
          {!isLast ? (
            <button className="storybook-skip" onClick={onFinish}>
              {t('tutorial.skip')} →
            </button>
          ) : (
            <button className="storybook-start" onClick={onFinish}>
              ▶ {t('poster.play')}
            </button>
          )}
        </div>
      </div>

      {/* 自动播放进度条 */}
      {!paused && !isLast && (
        <div className="storybook-progress">
          <div
            className="storybook-progress-bar"
            key={current}
            style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
          />
        </div>
      )}
    </div>
  );
}

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
  const { hasSeenPoster } = useGameStore();
  const [showStory, setShowStory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { t } = useI18n();

  if (hasSeenPoster) return null;

  // 进入游戏（故事结束或主页 TAKE OFF）
  const handleEnterGame = () => {
    const state = useGameStore.getState();
    if (state.hasCompletedOnboarding) {
      // 老用户 → 直接进入建造模式
      useGameStore.setState({ hasSeenPoster: true, gameMode: GAME_MODES.BUILD_MODE });
    } else {
      // 新用户 → 用默认飞机直接试玩飞行模式，炸毁后再弹账号弹窗
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

  // 故事书模式
  if (showStory) {
    return (
      <div className="welcome-poster">
        <StoryBook onFinish={handleEnterGame} />
      </div>
    );
  }

  // 主海报页
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

        {/* 故事入口 - 大图预览 */}
        <button className="story-preview-btn" onClick={() => setShowStory(true)}>
          <img src="/story/story1.jpg" alt="Story" className="story-preview-img" />
          <div className="story-preview-overlay">
            <span className="story-preview-play">▶</span>
            <span className="story-preview-text">{t('poster.storyBtn')}</span>
          </div>
        </button>

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
