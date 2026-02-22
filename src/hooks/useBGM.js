import { useEffect, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import { GAME_MODES } from '../constants/gameConstants';

// ===== 背景音乐生成器 =====
class BGMEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentMode = null;
    this.desiredMode = null; // 期望播放的模式（不管 ctx 状态）
    this.nodes = [];
    this.loopTimer = null;
    this._unlocked = false;
    this._boundUnlock = this._unlock.bind(this);
    this._addUnlockListeners();
    this._addVisibilityListener();
  }

  // 用户交互解锁
  _addUnlockListeners() {
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    events.forEach((e) => document.addEventListener(e, this._boundUnlock, { capture: true, passive: true }));
  }

  _removeUnlockListeners() {
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    events.forEach((e) => document.removeEventListener(e, this._boundUnlock, { capture: true }));
  }

  _unlock() {
    this._unlocked = true;
    this._removeUnlockListeners();

    // 如果已有 ctx 但被挂起，恢复它
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // 如果有期望模式但还没真正播放，现在启动
    if (this.desiredMode && !this.currentMode) {
      this._doSwitch(this.desiredMode);
    }
  }

  // 页面可见性
  _addVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      if (document.hidden) {
        this.ctx.suspend().catch(() => {});
      } else if (this._unlocked) {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  _ensureContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  _stopCurrent() {
    if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
    this.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    this.nodes = [];
  }

  _fadeIn(dur = 2) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.15, now + dur);
  }

  _fadeOut(dur = 1.5) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + dur);
    setTimeout(() => this._stopCurrent(), dur * 1000 + 100);
  }

  // ===== 欢迎页 BGM =====
  _playWelcome() {
    const chords = [
      [261.6, 329.6, 392.0],
      [293.7, 370.0, 440.0],
      [349.2, 440.0, 523.3],
      [392.0, 493.9, 587.3],
    ];
    const chordDur = 4;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'welcome') return;
      const now = this.ctx.currentTime;
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.04, t + 0.5);
          g.gain.linearRampToValueAtTime(0.03, t + chordDur - 0.3);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });
      const melody = [523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 0,
                       587.3, 659.3, 784.0, 880.0, 784.0, 659.3, 587.3, 0];
      const noteDur = 0.9;
      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        const t = now + 0.5 + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur - 0.05);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(t); osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };
    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 建造模式 BGM =====
  _playBuild() {
    const chords = [
      [220.0, 261.6, 329.6],
      [174.6, 220.0, 261.6],
      [130.8, 164.8, 196.0],
      [196.0, 246.9, 293.7],
    ];
    const chordDur = 3.5;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'build') return;
      const now = this.ctx.currentTime;
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sine'; osc.frequency.value = freq;
          filter.type = 'lowpass'; filter.frequency.value = 800;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.05, t + 0.8);
          g.gain.linearRampToValueAtTime(0.04, t + chordDur - 0.5);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(filter); filter.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });
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
        osc.type = 'sine'; osc.frequency.value = freq;
        const t = now + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.025, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.9);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(t); osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };
    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 飞行模式 BGM =====
  _playFlight() {
    const bassNotes = [164.8, 130.8, 98.0, 146.8];
    const chords = [
      [329.6, 392.0, 493.9],
      [261.6, 329.6, 392.0],
      [196.0, 246.9, 293.7],
      [293.7, 370.0, 440.0],
    ];
    const chordDur = 2.8;
    const totalDur = chords.length * chordDur;

    const scheduleLoop = () => {
      if (!this.ctx || this.currentMode !== 'flight') return;
      const now = this.ctx.currentTime;
      bassNotes.forEach((freq, ci) => {
        const beatCount = 4;
        for (let b = 0; b < beatCount; b++) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          const t = now + ci * chordDur + b * (chordDur / beatCount);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.06, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + chordDur / beatCount - 0.05);
          osc.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + chordDur / beatCount);
          this.nodes.push(osc);
        }
      });
      chords.forEach((chord, ci) => {
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle'; osc.frequency.value = freq;
          const t = now + ci * chordDur;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.025, t + 0.3);
          g.gain.linearRampToValueAtTime(0.02, t + chordDur - 0.2);
          g.gain.linearRampToValueAtTime(0, t + chordDur);
          osc.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + chordDur);
          this.nodes.push(osc);
        });
      });
      const melody = [
        659.3, 0, 784.0, 659.3, 587.3, 0, 523.3, 587.3,
        659.3, 0, 784.0, 880.0, 784.0, 0, 659.3, 0,
      ];
      const noteDur = totalDur / melody.length;
      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        const t = now + i * noteDur;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.85);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(t); osc.stop(t + noteDur);
        this.nodes.push(osc);
      });
    };
    scheduleLoop();
    this.loopTimer = setInterval(scheduleLoop, totalDur * 1000);
  }

  // ===== 切换 =====
  switchTo(mode) {
    this.desiredMode = mode;

    // 还没解锁（移动端未交互），先记住，等 _unlock 触发
    if (!this._unlocked) {
      // 预创建 ctx 以便 unlock 时能 resume
      this._ensureContext();
      return;
    }

    this._doSwitch(mode);
  }

  _doSwitch(mode) {
    if (mode === this.currentMode) return;
    if (!this._ensureContext()) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

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
    this.desiredMode = null;
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
    if (!hasSeenPoster) {
      bgmEngine.switchTo('welcome');
      startedRef.current = true;
      return;
    }
    if (isGameOver) return;
    if (gameMode === GAME_MODES.BUILD_MODE) {
      bgmEngine.switchTo('build');
    } else if (gameMode === GAME_MODES.FLIGHT_MODE) {
      bgmEngine.switchTo('flight');
    }
    startedRef.current = true;
  }, [hasSeenPoster, gameMode, isGameOver]);

  useEffect(() => {
    return () => {
      if (startedRef.current) bgmEngine.stop();
    };
  }, []);
}

export default useBGM;
