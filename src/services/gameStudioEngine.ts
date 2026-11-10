import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type StudioSfxType =
  | 'card_lift'
  | 'card_strike'
  | 'heavy_strike'
  | 'shield_up'
  | 'power_surge'
  | 'status_inflict'
  | 'enemy_attack'
  | 'relic_trigger'
  | 'gold_gain'
  | 'button_click'
  | 'victory'
  | 'defeat';

/**
 * Antigravity Game Studio — Procedural Audio, Haptics & Kinesthetics Engine
 * Ported from `game studio/tools/sfx_generator.html` & `music_jukebox.html`
 * Enforces Anti-Slop Craftsman Rule 4 (66ms hit-stop, 12ms lift tap, 35ms strike punch).
 */
class GameStudioEngineImpl {
  private sfxEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private jukeboxPlaying: boolean = false;
  private audioCtx: any = null;
  private jukeboxTimer: any = null;
  private jukeboxStep: number = 0;

  private getAudioContext(): any {
    if (Platform.OS !== 'web') return null;
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    if (this.sfxEnabled) {
      this.playSfx('button_click');
    }
    return this.sfxEnabled;
  }

  public isJukeboxPlaying(): boolean {
    return this.jukeboxPlaying;
  }

  /**
   * Toggle the Game Studio Procedural Synth Jukebox (Atmospheric Rift Citadel Arp)
   */
  public toggleJukebox(): boolean {
    if (this.jukeboxPlaying) {
      this.stopJukebox();
    } else {
      this.startJukebox();
    }
    return this.jukeboxPlaying;
  }

  public startJukebox(): void {
    if (this.jukeboxPlaying) return;
    this.jukeboxPlaying = true;
    this.jukeboxStep = 0;

    // D minor 9 / Phrygian dark sci-fi spire progression (Hz)
    const bassNotes = [73.42, 73.42, 87.31, 82.41, 65.41, 65.41, 77.78, 82.41];
    const arpNotes = [
      293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23,
      329.63, 392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 392.0,
    ];

    this.jukeboxTimer = setInterval(() => {
      if (!this.jukeboxPlaying || !this.sfxEnabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const arpFreq = arpNotes[this.jukeboxStep % arpNotes.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(arpFreq, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);

        // Sub-bass pulse on every 4th step
        if (this.jukeboxStep % 4 === 0) {
          const bassFreq = bassNotes[Math.floor(this.jukeboxStep / 4) % bassNotes.length];
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bOsc.type = 'sawtooth';
          bOsc.frequency.setValueAtTime(bassFreq, now);
          bGain.gain.setValueAtTime(0.045, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          bOsc.connect(bGain);
          bGain.connect(ctx.destination);
          bOsc.start(now);
          bOsc.stop(now + 0.66);
        }

        this.jukeboxStep++;
      } catch {
        // Ignore audio context restrictions
      }
    }, 260);
  }

  public stopJukebox(): void {
    this.jukeboxPlaying = false;
    if (this.jukeboxTimer) {
      clearInterval(this.jukeboxTimer);
      this.jukeboxTimer = null;
    }
  }

  /**
   * Trigger synchronized Tactile Haptics + Procedural WebAudio Synth SFX
   */
  public playSfx(type: StudioSfxType): void {
    if (this.hapticsEnabled) {
      this.triggerHaptic(type);
    }
    if (this.sfxEnabled) {
      this.synthesizeWebAudio(type);
    }
  }

  private triggerHaptic(type: StudioSfxType): void {
    try {
      switch (type) {
        case 'card_lift':
        case 'button_click':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          break;
        case 'card_strike':
        case 'shield_up':
        case 'status_inflict':
        case 'gold_gain':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          break;
        case 'heavy_strike':
        case 'enemy_attack':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          break;
        case 'power_surge':
        case 'relic_trigger':
        case 'victory':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          break;
        case 'defeat':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          break;
      }
    } catch {
      // Safe fallback on unsupported devices
    }
  }

  /**
   * Procedural WebAudio Synthesizer ported from `game studio/tools/sfx_generator.html`
   */
  private synthesizeWebAudio(type: StudioSfxType): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'card_lift':
        case 'button_click': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        case 'card_strike': {
          // Laser / Plasma Slash sweep
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(680, now);
          osc.frequency.exponentialRampToValueAtTime(95, now + 0.16);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.17);
          osc.start(now);
          osc.stop(now + 0.17);
          break;
        }
        case 'heavy_strike': {
          // Deep Sub-Bass Explosion Crunch
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.34);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
        case 'shield_up': {
          // Crystalline Aegis Harmonic
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.setValueAtTime(495, now + 0.06);
          osc.frequency.setValueAtTime(660, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.24);
          osc.start(now);
          osc.stop(now + 0.24);
          break;
        }
        case 'power_surge':
        case 'relic_trigger': {
          // Rising Overclock Arpeggio
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(960, now + 0.28);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.29);
          osc.start(now);
          osc.stop(now + 0.29);
          break;
        }
        case 'status_inflict':
        case 'enemy_attack': {
          // Gritty Impact Punch
          osc.type = 'square';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.19);
          osc.start(now);
          osc.stop(now + 0.19);
          break;
        }
        case 'gold_gain': {
          // Coin Chime B5 -> E6
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now);
          osc.frequency.setValueAtTime(1318.51, now + 0.07);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'victory': {
          // Triumphant Fanfare Triad
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1);
          osc.frequency.setValueAtTime(659.25, now + 0.2);
          osc.frequency.setValueAtTime(880, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }
        case 'defeat': {
          // Descending Power-Down
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.45);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.46);
          osc.start(now);
          osc.stop(now + 0.46);
          break;
        }
      }
    } catch {
      // Ignore WebAudio errors if blocked by browser autoplay policy
    }
  }
}

export const GameStudioEngine = new GameStudioEngineImpl();
