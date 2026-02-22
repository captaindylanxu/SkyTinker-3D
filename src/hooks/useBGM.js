import { useEffect, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import { GAME_MODES } from '../constants/gameConstants';

// ===== 背景音乐生成器 =====
class BGMEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentMode = null;
    this.pendingMode = null; // 等待用户交互后播放的模式
    this.nodes = [];
    this.loopTimer = null;
    this.userInteracted = false;
    this._setupInteractionListener();
  }

  // 监听用户首次交互，解锁 AudioContext
  _setupInteractionListener() {
    const unlock = () => {
      this.userInteracted = true;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          // 如果有待播放的模式，现在启动
          if (this.pendingMode && !this.currentMode) {
            this.currentMode = this.pendingMode;
            this.pendingMode = null;
            this._startMode(this.currentMode);
            this._fadeIn(2);
          }
        }).catch(() => {});
      }
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('touchend', unlock, true);
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
    window.addEventListener('touchstart', unlock, true);
    window.addEventListener('touchend', unlock, true);
    window.addEventListener('click', unlock, true);
    window.addEventListener('keydown', unlock, true);
  }

  _ensureContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('Web Audio API not supported');
        return false;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  _stopCurrent() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    this.nodes = [];
  }

  // 淡入
  _fadeIn(duration = 2) {
    if (!this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.15, now + duration);
  }

  // 淡出并停止
  _fadeOut(duration = 1.5) {
    if (!this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + duration);
    setTimeout(() => this._stopCurrent(), duration * 1000 + 100);
  }

  // ===== 欢迎页 BGM：梦幻温暖 =====
  _playWelcome() {
    const chords = [
      [261.6, 329.6, 392.0], // C
      [293.7, 370.0, 440.0], // D
      [349.2, 440.0, 523.3], // F
      [392.0, 493.9, 587.3], // G
    ];
    const chordDur = 4;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'welcome') return;
      const now = this.ctx.currentTime;

      // 和弦垫音
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.04, t + 0.5);
          g.gain.linearRampToValueAtTime(0.03, t + chordDur - 0.3);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });

      // 旋律
      const melody = [523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 0,
                       587.3, 659.3, 784.0, 880.0, 784.0, 659.3, 587.3, 0];
      const noteDur = 0.9;
      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + 0.5 + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur - 0.05);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };

    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 建造模式 BGM：轻松创意 Lo-fi 风 =====
  _playBuild() {
    // 温暖的 lo-fi 和弦进行 Am - F - C - G
    const chords = [
      [220.0, 261.6, 329.6],  // Am
      [174.6, 220.0, 261.6],  // F
      [130.8, 164.8, 196.0],  // C (低八度)
      [196.0, 246.9, 293.7],  // G
    ];
    const chordDur = 3.5;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'build') return;
      const now = this.ctx.currentTime;

      // 柔和的和弦垫音
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sine';
          osc.frequency.value = freq;
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.05, t + 0.8);
          g.gain.linearRampToValueAtTime(0.04, t + chordDur - 0.5);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(filter);
          filter.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });

      // 轻柔的琶音旋律
      const arp = [
        329.6, 392.0, 440.0, 523.3, 440.0, 392.0,
        349.2, 440.0, 523.3, 587.3, 523.3, 440.0,
        261.6, 329.6, 392.0, 523.3, 392.0, 329.6,
        293.7, 392.0, 493.9, 587.3, 493.9, 392.0,
      ];
      const noteDur = totalDur / arp.length;
      arp.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = now + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.025, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.9);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };

    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 飞行模式 BGM：紧张刺激但不烦躁 =====
  _playFlight() {
    // 节奏感的低音 + 紧张但悦耳的和弦
    // Em - C - G - D 进行，有推进感
    const bassNotes = [164.8, 130.8, 98.0, 146.8]; // Em, C, G, D 低音
    const chords = [
      [329.6, 392.0, 493.9],  // Em
      [261.6, 329.6, 392.0],  // C
      [196.0, 246.9, 293.7],  // G
      [293.7, 370.0, 440.0],  // D
    ];
    const chordDur = 2.8;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'flight') return;
      const now = this.ctx.currentTime;

      // 脉冲低音（有节奏感但不是"噔噔噔"）
      bassNotes.forEach((freq, ci) => {
        const beatCount = 4;
        for (let b = 0; b < beatCount; b++) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = now + ci * chordDur + b * (chordDur / beatCount);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.06, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + chordDur / beatCount - 0.05);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + chordDur / beatCount);
          this.nodes.push(osc);
        }
      });

      // 持续的和弦垫音（营造紧张氛围）
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.025, t + 0.3);
          g.gain.linearRampToValueAtTime(0.02, t + chordDur - 0.2);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });

      // 高音旋律线（冒险感）
      const melody = [
        659.3, 0, 784.0, 659.3, 587.3, 0, 523.3, 587.3,
        659.3, 0, 784.0, 880.0, 784.0, 0, 659.3, 0,
      ];
      const noteDur = totalDur / melody.length;
      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = now + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.85);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };

    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 切换模式 =====
  switchTo(mode) {
    if (mode === this.currentMode) return;
    if (!this._ensureContext()) return;

    // 如果 AudioContext 还是 suspended（移动端未交互），记住待播放模式
    if (this.ctx.state === 'suspended') {
      this.pendingMode = mode;
      // 如果已有当前模式在播放，先停掉
      if (this.currentMode) {
        this._stopCurrent();
        this.currentMode = null;
      }
      return;
    }

    // 淡出当前
    if (this.currentMode) {
      this._fadeOut(1);
      setTimeout(() => {
        this._stopCurrent();
        this.currentMode = mode;
        this._startMode(mode);
        this._fadeIn(2);
      }, 1200);
    } else {
      this.currentMode = mode;
      this._startMode(mode);
      this._fadeIn(2);
    }
  }

  _startMode(mode) {
    switch (mode) {
      case 'welcome': this._playWelcome(); break;
      case 'build': this._playBuild(); break;
      case 'flight': this._playFlight(); break;
    }
  }

  stop() {
    this._fadeOut(1);
    setTimeout(() => {
      this._stopCurrent();
      this.currentMode = null;
      if (this.ctx) {
        try { this.ctx.close(); } catch (e) {}
        this.ctx = null;
      }
    }, 1200);
  }
}

// 单例
const bgmEngine = new BGMEngine();

// ===== React Hook =====
export function useBGM() {
  const gameMode = useGameStore((s) => s.gameMode);
  const hasSeenPoster = useGameStore((s) => s.hasSeenPoster);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const startedRef = useRef(false);

  useEffect(() => {
    // 欢迎页
    if (!hasSeenPoster) {
      bgmEngine.switchTo('welcome');
      startedRef.current = true;
      return;
    }

    // 游戏结束时不切换（保持当前音乐淡出）
    if (isGameOver) return;

    // 根据游戏模式切换
    if (gameMode === GAME_MODES.BUILD_MODE) {
      bgmEngine.switchTo('build');
    } else if (gameMode === GAME_MODES.FLIGHT_MODE) {
      bgmEngine.switchTo('flight');
    }
    startedRef.current = true;
  }, [hasSeenPoster, gameMode, isGameOver]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (startedRef.current) {
        bgmEngine.stop();
      }
    };
  }, []);
}

export default useBGM;
