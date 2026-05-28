import { Play, Square, Mic, MicOff } from 'lucide-react';
import { SUBDIVISIONS } from '../grid/gridManager.js';

export function Controls({ config, setConfig, playing, micOn, onPlay, onStop, onTap, onMicToggle }) {
  const set = (patch) => setConfig((c) => ({ ...c, ...patch }));
  const setSilence = (patch) => setConfig((c) => ({ ...c, silence: { ...c.silence, ...patch } }));
  const setVolumes = (patch) => setConfig((c) => ({ ...c, volumes: { ...c.volumes, ...patch } }));

  return (
    <div className="card controls">
      <div className="transport">
        <button className="primary" onClick={playing ? onStop : onPlay}>{playing ? <Square /> : <Play />} {playing ? 'Stop' : 'Play'}</button>
        <button onClick={onTap}>Tap tempo</button>
        <button onClick={onMicToggle}>{micOn ? <MicOff /> : <Mic />} {micOn ? 'Desligar mic' : 'Ativar mic'}</button>
      </div>

      <div className="control-grid">
        <label>BPM
          <input type="number" min="30" max="260" value={config.bpm} onChange={(e) => set({ bpm: Number(e.target.value) })} />
        </label>
        <label>Tempos/compasso
          <input type="number" min="1" max="12" value={config.beats} onChange={(e) => set({ beats: Number(e.target.value) })} />
        </label>
        <label>Subdivisão
          <select value={config.subdivision} onChange={(e) => set({ subdivision: Number(e.target.value) })}>
            {SUBDIVISIONS.filter((s) => s.value !== 'custom').map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>Som do clique
          <select value={config.clickSound} onChange={(e) => set({ clickSound: e.target.value })}>
            <option value="sine">Claro</option>
            <option value="wood">Madeira</option>
            <option value="square">Digital</option>
          </select>
        </label>
      </div>

      <details>
        <summary>Modo silêncio e volumes</summary>
        <div className="control-grid compact">
          <label>Tocar X compassos<input type="number" min="0" value={config.silence.audibleBars} onChange={(e) => setSilence({ audibleBars: Number(e.target.value) })} /></label>
          <label>Silenciar Y compassos<input type="number" min="0" value={config.silence.silentBars} onChange={(e) => setSilence({ silentBars: Number(e.target.value) })} /></label>
          <label>Ciclos 0 = infinito<input type="number" min="0" value={config.silence.maxCycles} onChange={(e) => setSilence({ maxCycles: Number(e.target.value), infinite: Number(e.target.value) === 0 })} /></label>
          <label>Volume geral<input type="range" min="0" max="1" step="0.01" value={config.volumes.master} onChange={(e) => setVolumes({ master: Number(e.target.value) })} /></label>
          <label>Normal<input type="range" min="0" max="1" step="0.01" value={config.volumes.normal} onChange={(e) => setVolumes({ normal: Number(e.target.value) })} /></label>
          <label>Acento<input type="range" min="0" max="1" step="0.01" value={config.volumes.accent} onChange={(e) => setVolumes({ accent: Number(e.target.value) })} /></label>
          <label>Subdivisão<input type="range" min="0" max="1" step="0.01" value={config.volumes.subdivision} onChange={(e) => setVolumes({ subdivision: Number(e.target.value) })} /></label>
        </div>
      </details>
    </div>
  );
}
