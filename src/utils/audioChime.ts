/**
 * Bagan Temple Kye-Zee (ကြေးစည်) Acoustic Resonance Synthesizer
 * Uses Web Audio API without external audio assets for 0ms latency and 0 bytes bandwidth
 */

class AudioChimeSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play traditional Burmese Kye-Zee brass bell chime (dual harmonic with shimmer)
   */
  public playKyeZeeChime(highPitch: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Fundamental and overtone frequencies
      const f1 = highPitch ? 880 : 784; // A5 or G5
      const f2 = highPitch ? 1760 : 1568; // 2nd harmonic
      const f3 = highPitch ? 2640 : 2352; // 3rd shimmering harmonic

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.25, now + 0.015);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      masterGain.connect(ctx.destination);

      // Oscillator 1 (Fundamental Brass)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc1.frequency.exponentialRampToValueAtTime(f1 - 4, now + 1.0);

      // Oscillator 2 (High Harmonic)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(f2, now);

      // Oscillator 3 (Shimmer partial)
      const osc3 = ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(f3, now);

      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.12, now);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(masterGain);

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
      osc3.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }

  /**
   * Play subtle command success click
   */
  public playSuccessTone() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // ignore
    }
  }
}

export const audioChime = new AudioChimeSynthesizer();
