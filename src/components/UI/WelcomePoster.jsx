import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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

// ===== 背景音乐生成器（梦幻冒险风） =====
class StoryBGM {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.playing = false;
    this.nodes = [];
  }

  start() {
    if (this.playing) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2);
      this.gainNode.connect(this.ctx.destination);
      this.playing = true;
      this._playPad();
      this._playMelody();
    } catch (e) {
      console.warn('BGM not supported');
    }
  }

  // 柔和的和弦垫音
  _playPad() {
    if (!this.ctx) return;
    const chords = [
      [261.6, 329.6, 392.0], // C major
      [293.7, 370.0, 440.0], // D major
      [349.2, 440.0, 523.3], // F major
      [392.0, 493.9, 587.3], // G major
    ];
    const now = this.ctx.currentTime;
    const chordDur = 4;
    const totalDur = chords.length * chordDur;

    const loop = (startTime) => {
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0, startTime + ci * chordDur);
          g.gain.linearRampToValueAtTime(0.06, startTime + ci * chordDur + 0.5);
          g.gain.linearRampToValueAtTime(0.04, startTime + ci * chordDur + chordDur - 0.3);
          g.gain.linearRampToValueAtTime(0, startTime + ci * chordDur + chordDur);
          osc.connect(g);
          g.connect(this.gainNode);
          osc.start(startTime + ci * chordDur);
          osc.stop(startTime + ci * chordDur + chordDur);
          this.nodes.push(osc);
        });
      });
    };

    // 循环播放 3 轮（足够覆盖故事时长）
    for (let i = 0; i < 3; i++) {
      loop(now + i * totalDur);
    }
  }

  // 简单的旋律线
  _playMelody() {
    if (!this.ctx) return;
    const notes = [
      523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 0,
      587.3, 659.3, 784.0, 880.0, 784.0, 659.3, 587.3, 0,
      523.3, 659.3, 784.0, 1046.5, 880.0, 784.0, 659.3, 0,
    ];
    const now = this.ctx.currentTime;
    const noteDur = 0.8;

    const playOnce = (offset) => {
      notes.forEach((freq, i) => {
        if (freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = offset + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur - 0.05);
        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };

    // 延迟 1 秒开始旋律，循环 2 轮
    const melodyLen = notes.length * noteDur;
    for (let i = 0; i < 2; i++) {
      playOnce(now + 1 + i * (melodyLen + 2));
    }
  }

  fadeOut() {
    if (!this.ctx || !this.gainNode) return;
    try {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
      setTimeout(() => this.stop(), 1600);
    } catch (e) {
      this.stop();
    }
  }

  stop() {
    this.playing = false;
    this.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    this.nodes = [];
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  }
}

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

// ===== 故事书轮播组件 =====
function StoryBook({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const bgmRef = useRef(null);
  const { t } = useI18n();
  const total = STORY_SLIDES.length;
  const isLast = current === total - 1;

  // 初始化背景音乐
  useEffect(() => {
    bgmRef.current = new StoryBGM();
    return () => {
      if (bgmRef.current) bgmRef.current.stop();
    };
  }, []);

  // 用户首次交互后启动音乐
  const ensureMusic = useCallback(() => {
    if (!musicStarted && bgmRef.current) {
      bgmRef.current.start();
      setMusicStarted(true);
    }
  }, [musicStarted]);

  // 切换幻灯片时重置文字动画
  useEffect(() => {
    setTextVisible(false);
    const timer = setTimeout(() => setTextVisible(true), 100);
    return () => clearTimeout(timer);
  }, [current]);

  // 自动播放
  useEffect(() => {
    if (paused || isLast) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((c) => Math.min(c + 1, total - 1));
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, current, isLast, total]);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setPaused(true);
  }, []);

  const goNext = useCallback(() => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setPaused(true);
    }
  }, [current, total]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setPaused(true);
    }
  }, [current]);

  const handleFinish = useCallback(() => {
    if (bgmRef.current) bgmRef.current.fadeOut();
    onFinish();
  }, [onFinish]);

  // 触摸滑动
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    ensureMusic();
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
    }
  };

  // 点击左右区域翻页
  const handleAreaClick = (e) => {
    ensureMusic();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrev();
    else if (x > rect.width * 0.7) goNext();
    else setPaused((p) => !p);
  };

  const slide = STORY_SLIDES[current];

  return (
    <div className="storybook">
      {/* 图片区域 */}
      <div
        className="storybook-viewport"
        onClick={handleAreaClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {STORY_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`storybook-slide ${i === current ? 'active' : ''} ${
              i < current ? 'past' : i > current ? 'future' : ''
            }`}
            style={{ '--ken-burns-dir': i % 2 === 0 ? '1' : '-1' }}
          >
            <img src={s.src} alt={`Story ${i + 1}`} draggable={false} />
          </div>
        ))}

        {/* 文字叠加层 */}
        <div className={`storybook-caption ${textVisible ? 'visible' : ''}`}>
          <h2 className="storybook-caption-title">{t(slide.titleKey)}</h2>
          <p className="storybook-caption-desc">{t(slide.descKey)}</p>
        </div>

        {/* 左右翻页提示 */}
        {current > 0 && <div className="storybook-nav-hint left">‹</div>}
        {current < total - 1 && <div className="storybook-nav-hint right">›</div>}
      </div>

      {/* 底部控制区 */}
      <div className="storybook-controls">
        <div className="storybook-dots">
          {STORY_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`storybook-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="storybook-actions">
          {!isLast ? (
            <button className="storybook-skip" onClick={handleFinish}>
              {t('tutorial.skip')} →
            </button>
          ) : (
            <button className="storybook-start" onClick={handleFinish}>
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

// ===== 主组件：刷新后直接自动播放故事 =====
export function WelcomePoster() {
  const { hasSeenPoster } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { t } = useI18n();

  if (hasSeenPoster) return null;

  // 进入游戏
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

  // 直接显示故事书（自动播放）
  return (
    <div className="welcome-poster">
      <StoryBook onFinish={handleEnterGame} />
      {showLeaderboard && <PosterLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

export default WelcomePoster;
