export class OnsetDetector {
  constructor(onOnset) {
    this.onOnset = onOnset;
    this.sensitivity = 1.6;
    this.threshold = 0.045;
    this.debounceMs = 85;
    this.lastOnsetMs = -Infinity;
    this.noiseFloor = 0;
    this.prevEnvelope = 0;
    this.env = 0;
    this.level = 0;
    this.clipping = false;
    this.lowSignal = true;
  }

  configure({ sensitivity, threshold, debounceMs }) {
    if (sensitivity != null) this.sensitivity = Number(sensitivity);
    if (threshold != null) this.threshold = Number(threshold);
    if (debounceMs != null) this.debounceMs = Number(debounceMs);
  }

  process(buffer, audioTime, sampleRate, inputLatencyMs = 0) {
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const v = buffer[i];
      sum += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
    }

    const rms = Math.sqrt(sum / buffer.length);
    this.level = rms;
    this.clipping = peak > 0.94;
    this.noiseFloor = this.noiseFloor * 0.995 + rms * 0.005;
    this.lowSignal = this.noiseFloor < 0.006 && rms < 0.025;

    const attackCoeff = 0.55;
    const releaseCoeff = 0.08;
    const coeff = rms > this.env ? attackCoeff : releaseCoeff;
    this.prevEnvelope = this.env;
    this.env = this.env + coeff * (rms - this.env);
    const flux = Math.max(0, this.env - this.prevEnvelope);

    const nowMs = (audioTime * 1000) - inputLatencyMs;
    const dynamicThreshold = Math.max(this.threshold, this.noiseFloor * this.sensitivity);
    const transientDetected = this.env > dynamicThreshold && flux > dynamicThreshold * 0.18;

    if (transientDetected && nowMs - this.lastOnsetMs > this.debounceMs) {
      this.lastOnsetMs = nowMs;
      this.onOnset?.({
        timeSec: nowMs / 1000,
        absoluteMs: nowMs,
        intensity: Math.min(1, rms * 8),
        rms,
        peak,
        noiseFloor: this.noiseFloor
      });
    }

    return {
      level: rms,
      peak,
      envelope: this.env,
      noiseFloor: this.noiseFloor,
      clipping: this.clipping,
      lowSignal: this.lowSignal
    };
  }
}
