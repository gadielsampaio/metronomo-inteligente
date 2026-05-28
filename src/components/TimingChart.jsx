export function TimingChart({ attacks, tolerance }) {
  const items = attacks.slice(-50);
  return (
    <div className="card chart-card">
      <h2>Timing em tempo real</h2>
      <div className="timing-lane">
        <div className="center-line" />
        <div className="tol left" style={{ width: `${Math.min(45, tolerance / 2)}%` }} />
        <div className="tol right" style={{ width: `${Math.min(45, tolerance / 2)}%` }} />
        {items.map((a, i) => {
          const x = Math.max(0, Math.min(100, 50 + a.deviationMs / 2));
          return <span key={a.id} className={`dot ${a.status.replaceAll(' ', '-')}`} style={{ left: `${x}%`, opacity: 0.25 + (i / items.length) * 0.75 }} title={`${a.deviationMs} ms`} />;
        })}
      </div>
      <div className="lane-labels"><span>- cedo</span><span>grade</span><span>+ tarde</span></div>
      <div className="attack-list">
        {attacks.slice(-10).reverse().map((a) => (
          <div key={a.id}><span>{a.deviationMs > 0 ? '+' : ''}{a.deviationMs} ms</span><b>{a.status}</b></div>
        ))}
      </div>
    </div>
  );
}
