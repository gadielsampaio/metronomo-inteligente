import { CELL, createGrid } from '../grid/gridManager.js';

const KEY = 'groove_analyzer_presets_v1';

export const defaultPresets = [
  preset('4/4 semínimas', 90, 4, 1),
  preset('4/4 colcheias', 90, 4, 2),
  preset('4/4 semicolcheias', 80, 4, 4),
  preset('3/4', 90, 3, 1),
  preset('6/8', 80, 6, 1),
  preset('5/4', 90, 5, 1),
  preset('Tocar 1 / silenciar 1', 80, 4, 4, { audibleBars: 1, silentBars: 1 }),
  preset('Tocar 2 / silenciar 2', 80, 4, 4, { audibleBars: 2, silentBars: 2 }),
  preset('Tercinas', 75, 4, 3),
  {
    ...preset('Clique apenas no tempo 1', 70, 4, 4),
    grid: createGrid(4, 4).map((_, i) => i === 0 ? CELL.ACCENT : CELL.REF)
  }
];

function preset(name, bpm, beats, subdivision, silence = {}) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    name,
    bpm,
    beats,
    subdivision,
    customSubdivision: subdivision,
    grid: createGrid(beats, subdivision),
    silence: { audibleBars: 0, silentBars: 0, maxCycles: 0, infinite: true, ...silence },
    toleranceMs: 30,
    volumes: { master: 0.75, normal: 0.55, accent: 0.9, subdivision: 0.35, count: 0.5 },
    clickSound: 'sine'
  };
}

export function loadPresets() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    return [...defaultPresets, ...saved];
  } catch {
    return defaultPresets;
  }
}

export function savePreset(config, name) {
  const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
  const entry = { ...config, id: crypto.randomUUID?.() ?? String(Date.now()), name };
  localStorage.setItem(KEY, JSON.stringify([...saved, entry]));
  return entry;
}

export function clearUserPresets() {
  localStorage.removeItem(KEY);
}
