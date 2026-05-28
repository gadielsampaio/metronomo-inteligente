export function MicPanel({ meter, config, setConfig, micStatus }) {
  const setCal = (patch) => setConfig((c) => ({ ...c, calibration: { ...c.calibration, ...patch } }));
  const level = Math.min(100, Math.round((meter.level || 0) * 500));
  const noise = Math.min(100, Math.round((meter.noiseFloor || 0) * 1200));

  return (
    <div className="card">
      <div className="card-title"><h2>Microfone</h2><span className={`pill ${micStatus === 'ligado' ? 'ok' : ''}`}>{micStatus}</span></div>
      <div className="meter"><div style={{ width: `${level}%` }} /></div>
      <div className="meter-label">Entrada: {level}% · Ruído: {noise}%</div>
      {meter.lowSignal && <p className="warning">Sinal baixo: aproxime o microfone ou aumente a sensibilidade.</p>}
      {meter.clipping && <p className="danger">Sinal saturando: afaste o microfone ou reduza o ganho.</p>}
      <div className="control-grid compact">
        <label>Sensibilidade<input type="range" min="0.8" max="4" step="0.1" value={config.calibration.sensitivity} onChange={(e) => setCal({ sensitivity: Number(e.target.value) })} /></label>
        <label>Limiar<input type="range" min="0.005" max="0.18" step="0.005" value={config.calibration.threshold} onChange={(e) => setCal({ threshold: Number(e.target.value) })} /></label>
        <label>Debounce ms<input type="number" min="30" max="240" value={config.calibration.debounceMs} onChange={(e) => setCal({ debounceMs: Number(e.target.value) })} /></label>
        <label>Tolerância ms<input type="number" min="5" max="120" value={config.toleranceMs} onChange={(e) => setConfig((c) => ({ ...c, toleranceMs: Number(e.target.value) }))} /></label>
        <label>Latência entrada ms<input type="number" value={config.calibration.inputLatencyMs} onChange={(e) => setCal({ inputLatencyMs: Number(e.target.value) })} /></label>
        <label>Latência saída ms<input type="number" value={config.calibration.outputLatencyMs} onChange={(e) => setCal({ outputLatencyMs: Number(e.target.value) })} /></label>
        <label>Offset global ms<input type="number" value={config.calibration.globalOffsetMs} onChange={(e) => setCal({ globalOffsetMs: Number(e.target.value) })} /></label>
      </div>
    </div>
  );
}
