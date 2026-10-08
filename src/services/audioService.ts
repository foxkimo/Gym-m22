// Web Audio API Sound generator for athletic tactile feedback without external assets
class AudioAlertService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  playBeep(frequency = 880, duration = 0.1, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback silent failure safe
    }
  }

  playSetComplete() {
    this.playBeep(659.25, 0.1, 'triangle');
    setTimeout(() => {
      this.playBeep(880, 0.2, 'triangle');
    }, 100);
  }

  playTimerCountdown() {
    this.playBeep(523.25, 0.08, 'sine');
  }

  playTimerFinished() {
    this.playBeep(880, 0.15, 'square');
    setTimeout(() => this.playBeep(1100, 0.15, 'square'), 160);
    setTimeout(() => this.playBeep(1320, 0.35, 'square'), 320);
  }

  playSuccess() {
    this.playBeep(523.25, 0.1, 'triangle');
    setTimeout(() => this.playBeep(659.25, 0.1, 'triangle'), 100);
    setTimeout(() => this.playBeep(783.99, 0.2, 'triangle'), 200);
  }

  playDelete() {
    this.playBeep(440, 0.1, 'sawtooth');
    setTimeout(() => this.playBeep(330, 0.2, 'sawtooth'), 100);
  }

  playWarning() {
    this.playBeep(440, 0.12, 'sawtooth');
    setTimeout(() => this.playBeep(350, 0.2, 'sawtooth'), 120);
  }

  playError() {
    this.playBeep(220, 0.15, 'sawtooth');
    setTimeout(() => this.playBeep(180, 0.35, 'sawtooth'), 120);
  }
}

export const audioAlertService = new AudioAlertService();
