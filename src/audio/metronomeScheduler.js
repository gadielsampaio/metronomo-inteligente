import { CELL } from '../grid/gridManager.js';

export class MetronomeScheduler {
  constructor(audioEngine, onTick) {
    this.engine = audioEngine;
    this.onTick = onTick;
    this.timer = null;
    this.running = false;
    this.nextNoteTime = 0;
    this.step = 0;
    this.transportStart = 0;
    this.lookAheadMs = 25;
    this.scheduleAheadSec = 0.12;
    this.config = null;
    this.cycleCount = 0;
  }

  async start(config) {
    this.config = config;
    const ctx = await this.engine.ensure();
    this.running = true;
    this.step = 0;
    this.cycleCount = 0;
    this.transportStart = ctx.currentTime + 0.08;
    this.nextNoteTime = this.transportStart;
    this.timer = setInterval(() => this.scheduler(), this.lookAheadMs);
    this.scheduler();
  }

  stop() {
    this.running = false;
    clearInterval(this.timer);
    this.timer = null;
  }

  updateConfig(config) {
    this.config = config;
  }

  secondsPerStep() {
    return 60 / this.config.bpm / this.config.subdivision;
  }

  totalSteps() {
    return this.config.beats * this.config.subdivision;
  }

  barIndexForStep(globalStep) {
    return Math.floor(globalStep / this.totalSteps());
  }

  isSilentBar(bar) {
    const { audibleBars, silentBars } = this.config.silence;
    if (!audibleBars || !silentBars) return false;
    const cycle = audibleBars + silentBars;
    return (bar % cycle) >= audibleBars;
  }

  shouldStopAtBar(bar) {
    const { audibleBars, silentBars, maxCycles, infinite } = this.config.silence;
    if (infinite || !maxCycles || (!audibleBars && !silentBars)) return false;
    const cycle = Math.max(1, audibleBars + silentBars);
    return bar >= cycle * maxCycles;
  }

  scheduler() {
    if (!this.running || !this.engine.ctx || !this.config) return;
    const ctx = this.engine.ctx;
    while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadSec) {
      const totalSteps = this.totalSteps();
      const localStep = this.step % totalSteps;
      const bar = this.barIndexForStep(this.step);
      if (this.shouldStopAtBar(bar)) {
        this.stop();
        this.onTick?.({ stopped: true });
        return;
      }

      const cellState = this.config.grid[localStep];
      const silentBar = this.isSilentBar(bar);
      const isBeat = localStep % this.config.subdivision === 0;
      if (!silentBar && (cellState === CELL.NORMAL || cellState === CELL.ACCENT)) {
        const accent = cellState === CELL.ACCENT;
        const vol = this.config.volumes.master * (accent ? this.config.volumes.accent : isBeat ? this.config.volumes.normal : this.config.volumes.subdivision);
        this.engine.click(this.nextNoteTime, { accent, subdivision: !isBeat, volume: vol, sound: this.config.clickSound });
      }

      this.onTick?.({
        audioTime: this.nextNoteTime,
        localStep,
        globalStep: this.step,
        bar,
        silentBar,
        transportStart: this.transportStart
      });
      this.nextNoteTime += this.secondsPerStep();
      this.step += 1;
    }
  }
}
