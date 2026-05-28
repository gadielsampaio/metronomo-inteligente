import { CELL, cellLabel, cycleCellState } from '../grid/gridManager.js';

const symbols = {
  [CELL.NORMAL]: 'x',
  [CELL.ACCENT]: 'A',
  [CELL.SILENT]: '.',
  [CELL.REF]: 'ref'
};

export function GridEditor({ grid, beats, subdivision, currentStep, onChange }) {
  function toggle(index) {
    const next = [...grid];
    next[index] = cycleCellState(next[index]);
    onChange(next);
  }

  return (
    <div className="card grid-card">
      <div className="card-title">
        <div>
          <h2>Grade rítmica</h2>
          <p>Clique nas células: normal → acento → silêncio → referência.</p>
        </div>
      </div>
      <div className="rhythm-grid" style={{ gridTemplateColumns: `repeat(${subdivision}, minmax(44px, 1fr))` }}>
        {grid.map((state, index) => (
          <button
            key={index}
            onClick={() => toggle(index)}
            className={`cell ${state} ${currentStep === index ? 'active' : ''}`}
            title="Alternar estado da célula"
          >
            <span className="label">{cellLabel(index, subdivision)}</span>
            <strong>{symbols[state]}</strong>
          </button>
        ))}
      </div>
      <div className="legend">
        <span><b>A</b> acento</span>
        <span><b>x</b> clique</span>
        <span><b>.</b> silêncio</span>
        <span><b>ref</b> mudo/analisado</span>
      </div>
    </div>
  );
}
