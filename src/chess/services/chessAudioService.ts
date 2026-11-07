import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Procedural Game Audio Synthesizer
 * Derived directly from Antigravity Game Studio's Retro SFX Engine (tools/sfx_generator.html).
 * Synthesizes zero-latency, zero-allocation game sound effects without external audio files.
 */
class ChessAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (_) {
        // Fallback gracefully if WebAudio is restricted
      }
    }
  }

  private ensureContextActive() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp Wooden Chess Piece Move
   * High-transient double-tap simulating physical wood-on-wood tile placement.
   */
  public playMove() {
    if (this.isMuted) return;
    this.triggerHaptic('light');

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Heavy Tactical Capture Impact
   * Low-frequency sine punch + filtered noise burst.
   */
  public playCapture() {
    if (this.isMuted) return;
    this.triggerHaptic('heavy');

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const now = this.audioCtx.currentTime;

    // 1. Low Sine Sub-Drop
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);

    // 2. High-Frequency Impact Crack (White Noise)
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.audioCtx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.06);
  }

  /**
   * Check / Threat Warning Tone
   * Rising minor triad alert.
   */
  public playCheck() {
    if (this.isMuted) return;
    this.triggerHaptic('medium');

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const notes = [440, 554.37]; // A4 -> C#5
    notes.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const startTime = this.audioCtx.currentTime + idx * 0.06;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  /**
   * 10-Move Time-Rewind (Chronos Scroll)
   * Reverse tape-whir / ascending frequency sweep.
   */
  public playRewind() {
    if (this.isMuted) return;
    this.triggerHaptic('heavy');

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * Star Objective / Victory Triumphant Chime
   * Harmonic 4-tone ascending major arpeggio.
   */
  public playVictory() {
    if (this.isMuted) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    arpeggio.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const time = this.audioCtx.currentTime + idx * 0.08;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(time);
      osc.stop(time + 0.28);
    });
  }

  /**
   * Defeat Chime
   * Descending dissonant lament.
   */
  public playDefeat() {
    if (this.isMuted) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (_) {}

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const sadTones = [392.00, 349.23, 293.66, 261.63]; // G4, F4, D4, C4
    sadTones.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const time = this.audioCtx.currentTime + idx * 0.12;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(time);
      osc.stop(time + 0.22);
    });
  }

  /**
   * Item Purchase / Coin Ping
   */
  public playCoin() {
    if (this.isMuted) return;
    this.triggerHaptic('light');

    if (!this.audioCtx) return;
    this.ensureContextActive();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.05); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  private triggerHaptic(style: 'light' | 'medium' | 'heavy') {
    if (Platform.OS !== 'web') {
      try {
        if (style === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (style === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (_) {}
    }
  }
}

export const ChessAudio = new ChessAudioSynthesizer();
