import { OnsetDetector } from './onsetDetector.js';

export class MicrophoneInput {
  constructor(audioEngine, onOnset, onMeter) {
    this.engine = audioEngine;
    this.onMeter = onMeter;
    this.detector = new OnsetDetector(onOnset);
    this.stream = null;
    this.source = null;
    this.processor = null;
    this.filter = null;
    this.enabled = false;
    this.inputLatencyMs = 0;
  }

  async start() {
    const ctx = await this.engine.ensure();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });

    this.source = ctx.createMediaStreamSource(this.stream);
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'highpass';
    this.filter.frequency.value = 85;
    this.filter.Q.value = 0.7;

    // ScriptProcessor é legado, mas ainda é a forma mais simples e compatível para uma primeira versão.
    // Para produção avançada, migrar para AudioWorklet para menor jitter e melhor performance.
    this.processor = ctx.createScriptProcessor(1024, 1, 1);
    this.processor.onaudioprocess = (event) => {
      if (!this.enabled) return;
      const buffer = event.inputBuffer.getChannelData(0);
      const audioTime = ctx.currentTime;
      const meter = this.detector.process(buffer, audioTime, ctx.sampleRate, this.inputLatencyMs);
      this.onMeter?.(meter);
    };

    this.source.connect(this.filter);
    this.filter.connect(this.processor);
    this.processor.connect(ctx.destination);
    this.enabled = true;
  }

  stop() {
    this.enabled = false;
    this.processor?.disconnect();
    this.filter?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  configure(options) {
    if (options.inputLatencyMs != null) this.inputLatencyMs = Number(options.inputLatencyMs);
    this.detector.configure(options);
  }
}
