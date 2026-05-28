import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine } from './audio/audioEngine.js';
import { MetronomeScheduler } from './audio/metronomeScheduler.js';
import { MicrophoneInput } from './audio/microphoneInput.js';
import { analyzeOnset, computeStats } from './analysis/timingAnalyzer.js';
import { createGrid, normalizeGrid } from './grid/gridManager.js';
import { loadPresets, savePreset } from './presets/presetStorage.js';
import { useTapTempo } from './hooks/useTapTempo.js';
import { Controls } from './components/Controls.jsx';
import { GridEditor } from './components/GridEditor.jsx';
import { MicPanel } from './components/MicPanel.jsx';
import { StatsPanel } from './components/StatsPanel.jsx';
import { TimingChart } from './components/TimingChart.jsx';
import { PresetPanel } from './components/PresetPanel.jsx';

const baseConfig = {
  bpm: 90,
  beats: 4,
  subdivision: 4,
  grid: createGrid(4, 4),
  silence: { audibleBars: 0, silentBars: 0, maxCycles: 0, infinite: true },
  volumes: { master: 0.75, normal: 0.55, accent: 0.9, subdivision: 0.35, count: 0.5 },
  clickSound: 'sine',
  toleranceMs: 30,
  calibration: {
    sensitivity: 1.6,
    threshold: 0.045,
    debounceMs: 85,
    inputLatencyMs: 0,
    outputLatencyMs: 0,
    globalOffsetMs: 0
  }
};

export default function App() {
  const [config, setConfig] = useState(baseConfig);
  const [playing, setPlaying] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micStatus, setMicStatus] = useState('desligado');
  const [meter, setMeter] = useState({ level: 0, noiseFloor: 0, lowSignal: false, clipping: false });
  const [attacks, setAttacks] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [silentBar, setSilentBar] = useState(false);
  const [transportStart, setTransportStart] = useState(0);
  const [presets, setPresets] = useState(loadPresets());

  const configRef = useRef(config);
  const transportStartRef = useRef(0);
  const engineRef = useRef(new AudioEngine());
  const metroRef = useRef(null);
  const micRef = useRef(null);

  useEffect(() => { configRef.current = config; metroRef.current?.updateConfig(config); }, [config]);

  useEffect(() => {
    setConfig((c) => ({ ...c, grid: normalizeGrid(c.grid, c.beats, c.subdivision) }));
  }, [config.beats, config.subdivision]);

  const stats = useMemo(() => computeStats(attacks, config.toleranceMs), [attacks, config.toleranceMs]);
  const latestStatus = attacks.at(-1)?.status || stats.tendency;

  const tapTempo = useTapTempo((bpm) => setConfig((c) => ({ ...c, bpm })));

  async function play() {
    const engine = engineRef.current;
    await engine.ensure();
    engine.setMasterVolume(config.volumes.master);
    setAttacks([]);
    metroRef.current = new MetronomeScheduler(engine, (tick) => {
      if (tick.stopped) {
        setPlaying(false);
        return;
      }
      setCurrentStep(tick.localStep);
      setSilentBar(tick.silentBar);
      setTransportStart(tick.transportStart);
      transportStartRef.current = tick.transportStart;
    });
    metroRef.current.start(configRef.current);
    setPlaying(true);
  }

  function stop() {
    metroRef.current?.stop();
    setPlaying(false);
    setCurrentStep(-1);
    setSilentBar(false);
  }

  async function toggleMic() {
    if (micOn) {
      micRef.current?.stop();
      setMicOn(false);
      setMicStatus('desligado');
      return;
    }
    try {
      const mic = new MicrophoneInput(engineRef.current, (onset) => {
        const analyzed = analyzeOnset(onset, configRef.current, transportStartRef.current);
        if (analyzed) setAttacks((list) => [...list.slice(-250), analyzed]);
      }, setMeter);
      mic.configure(config.calibration);
      await mic.start();
      micRef.current = mic;
      setMicOn(true);
      setMicStatus('ligado');
    } catch (err) {
      console.error(err);
      setMicStatus('sem permissão');
    }
  }

  useEffect(() => {
    micRef.current?.configure(config.calibration);
  }, [config.calibration]);

  function loadPreset(preset) {
    stop();
    setConfig({ ...baseConfig, ...preset, calibration: { ...baseConfig.calibration, ...(preset.calibration || {}) } });
  }

  function saveCurrentPreset(name) {
    savePreset(config, name);
    setPresets(loadPresets());
  }

  function estimateOffsetFromSession() {
    const valid = attacks.filter((a) => a.status !== 'fora da grade');
    if (!valid.length) return alert('Sem ataques suficientes para calibrar.');
    const avg = Math.round(valid.reduce((s, a) => s + a.deviationMs, 0) / valid.length);
    setConfig((c) => ({ ...c, calibration: { ...c.calibration, globalOffsetMs: c.calibration.globalOffsetMs + avg } }));
    alert(`Offset aplicado: ${avg} ms. Faça novo teste para validar.`);
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Groove Analyzer</p>
          <h1>Metrônomo inteligente para treino percussivo</h1>
          <p>Compara ataques detectados pelo microfone com a grade rítmica, inclusive durante compassos silenciosos.</p>
        </div>
        <button className="ghost" onClick={estimateOffsetFromSession}>Calibrar pelo offset médio</button>
      </header>

      <section className="layout">
        <div className="left-column">
          <Controls config={config} setConfig={setConfig} playing={playing} micOn={micOn} onPlay={play} onStop={stop} onTap={tapTempo} onMicToggle={toggleMic} />
          <GridEditor grid={config.grid} beats={config.beats} subdivision={config.subdivision} currentStep={currentStep} onChange={(grid) => setConfig((c) => ({ ...c, grid }))} />
          <TimingChart attacks={attacks} tolerance={config.toleranceMs} />
        </div>
        <div className="right-column">
          <StatsPanel stats={stats} latestStatus={latestStatus} silentBar={silentBar} />
          <MicPanel meter={meter} config={config} setConfig={setConfig} micStatus={micStatus} />
          <PresetPanel presets={presets} onLoad={loadPreset} onSave={saveCurrentPreset} onReload={() => setPresets(loadPresets())} />
        </div>
      </section>

      <footer>
        <strong>Observação:</strong> a detecção é baseada em energia/envelope/transientes, sem reconhecimento de pitch ou nome do exercício.
      </footer>
    </main>
  );
}
