export function StatsPanel({ stats, latestStatus, silentBar }) {
  return (
    <div className="card stats-card">
      <div className="big-status">
        <span className={statusClass(latestStatus)}>{latestStatus || 'aguardando'}</span>
        {silentBar && <em>ciclo silencioso</em>}
      </div>
      <div className="stats-grid">
        <Stat label="Timing médio" value={`${stats.average} ms`} />
        <Stat label="Consistência" value={`±${stats.stdDev} ms`} />
        <Stat label="Variação máx." value={`${stats.maxVariation} ms`} />
        <Stat label="Estabilidade" value={`${stats.stability}%`} />
        <Stat label="Ataques" value={stats.count} />
        <Stat label="Tendência" value={stats.tendency} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><small>{label}</small><strong>{value}</strong></div>;
}

function statusClass(status = '') {
  if (status.includes('no tempo') || status.includes('estável')) return 'good';
  if (status.includes('fora') || status.includes('oscilando')) return 'bad';
  return 'warn';
}
