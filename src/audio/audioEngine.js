export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
  }

  async ensure() {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running') await this.ctx.resume();
    return this.ctx;
  }

  setMasterVolume(value) {
    if (this.master) this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
  }

  click(time, { accent = false, subdivision = false, volume = 0.7, sound = 'sine' } = {}) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const baseFreq = accent ? 1550 : subdivision ? 980 : 1180;

    osc.type = sound === 'wood' ? 'triangle' : sound === 'square' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, time);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, time);
    filter.Q.value = 8;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (accent ? 0.065 : 0.04));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.08);
  }
}
