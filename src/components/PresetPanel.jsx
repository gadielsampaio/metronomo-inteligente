import { clearUserPresets } from '../presets/presetStorage.js';

export function PresetPanel({ presets, onLoad, onSave, onReload }) {
  return (
    <div className="card">
      <div className="card-title"><h2>Presets</h2></div>
      <div className="preset-list">
        {presets.map((p) => <button key={p.id} onClick={() => onLoad(p)}>{p.name}</button>)}
      </div>
      <div className="preset-actions">
        <button onClick={() => {
          const name = prompt('Nome do preset');
          if (name) onSave(name);
        }}>Salvar preset atual</button>
        <button onClick={() => { clearUserPresets(); onReload(); }}>Limpar salvos</button>
      </div>
    </div>
  );
}
