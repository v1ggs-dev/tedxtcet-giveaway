// Web Audio API Synthesizer for Retro Arcade Lucky Draw Cabinet
// Zero external sound file dependency - guarantees 100% offline localhost reliability

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8; // 0.0 to 1.0
  private spinInterval: ReturnType<typeof setInterval> | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private getDestination(): AudioNode | null {
    this.init();
    return this.masterGain;
  }

  /**
   * Retro Button Click
   */
  public playButtonClick() {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * Pleasant Soft Mechanical Ratchet Click (Joystick Drag / Drum Steps)
   */
  public playRatchetClick(pitchFactor: number = 1.0) {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Mechanical Lever / Plunger Throw Sound
   */
  public playLeverPull() {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Heavy Mechanical Solenoid Lock Clack (When a Reel Locks)
   */
  public playLockSnap(pitchFactor: number = 1.0, isHeavy: boolean = false) {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Soft warm click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    gain.gain.setValueAtTime(isHeavy ? 0.6 : 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.07);

    // Chassis resonance / deep thud
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isHeavy ? 110 : 150 * pitchFactor, now);
    gain2.gain.setValueAtTime(isHeavy ? 0.5 : 0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.22 : 0.12));

    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now);
    osc2.stop(now + (isHeavy ? 0.23 : 0.13));
  }

  /**
   * Visceral Subwoofer Heartbeat Thump (Pleasant, deep low-end pulse)
   */
  public playHeartbeat(intensity: number = 1.0) {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Sub-bass thud 1 (Lub)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter1 = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(70, now);
    osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(120, now);

    gain1.gain.setValueAtTime(0.7 * intensity, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(dest);

    osc1.start(now);
    osc1.stop(now + 0.15);

    // Sub-bass thud 2 (Dub) at +130ms
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const filter2 = this.ctx.createBiquadFilter();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(60, now + 0.13);
    osc2.frequency.exponentialRampToValueAtTime(28, now + 0.26);

    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(100, now + 0.13);

    gain2.gain.setValueAtTime(0.55 * intensity, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(dest);

    osc2.start(now + 0.13);
    osc2.stop(now + 0.29);
  }

  /**
   * Warm Mechanical Tumbler Rolling Sound (Ear-friendly soft gear clicks)
   */
  public startSpinSound() {
    if (this.isMuted) return;
    this.stopSpinSound();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const speed = 45; // ms interval
    const playTick = () => {
      if (this.isMuted || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft muted low-frequency wooden/metal tumbler click (180Hz - 80Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.02);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.03);
    };

    this.spinInterval = setInterval(playTick, speed);
  }

  public stopSpinSound() {
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
  }

  /**
   * Dramatic Sub-Bass Flash Impact Boom (When final letter locks)
   */
  public playClimaxFlashImpact() {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 1.15);
  }

  /**
   * Theatrical 777 Jackpot Arcade Victory Fanfare
   */
  public playWinnerFanfare() {
    if (this.isMuted) return;
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const chords = [
      220, // A3
      277.18, // C#4
      329.63, // E4
      440, // A4
      554.37, // C#5
      659.25, // E5
      880, // A5
    ];

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.5);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.2 / chords.length, now + idx * 0.04 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + 3.1);
    });
  }
}

export const sound = new SoundEngine();
