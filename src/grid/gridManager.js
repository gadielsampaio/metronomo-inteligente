export const CELL = {
  NORMAL: 'normal',
  ACCENT: 'accent',
  SILENT: 'silent',
  REF: 'reference'
};

export const SUBDIVISIONS = [
  { label: 'Sem subdivisão', value: 1, names: ['1'] },
  { label: 'Colcheias', value: 2, names: ['1', '&'] },
  { label: 'Tercinas', value: 3, names: ['1', 'trip', 'let'] },
  { label: 'Semicolcheias', value: 4, names: ['1', 'e', '&', 'a'] },
  { label: 'Quintinas', value: 5, names: ['1', 'ta', 'ka', 'di', 'mi'] },
  { label: 'Sextinas', value: 6, names: ['1', 'ta', 'la', '&', 'ta', 'la'] },
  { label: 'Personalizada', value: 'custom', names: [] }
];

export function createGrid(beats = 4, subdivision = 4) {
  const total = beats * subdivision;
  return Array.from({ length: total }, (_, index) => {
    const sub = index % subdivision;
    if (index === 0) return CELL.ACCENT;
    if (sub === 0) return CELL.NORMAL;
    return CELL.REF;
  });
}

export function normalizeGrid(grid, beats, subdivision) {
  const total = beats * subdivision;
  const next = [...grid];
  while (next.length < total) next.push(next.length === 0 ? CELL.ACCENT : (next.length % subdivision === 0 ? CELL.NORMAL : CELL.REF));
  return next.slice(0, total);
}

export function cycleCellState(state) {
  if (state === CELL.NORMAL) return CELL.ACCENT;
  if (state === CELL.ACCENT) return CELL.SILENT;
  if (state === CELL.SILENT) return CELL.REF;
  return CELL.NORMAL;
}

export function cellLabel(index, subdivision) {
  const beat = Math.floor(index / subdivision) + 1;
  const sub = index % subdivision;
  const common = {
    1: [''],
    2: ['', '&'],
    3: ['', 't', 'l'],
    4: ['', 'e', '&', 'a'],
    5: ['', '2', '3', '4', '5'],
    6: ['', '2', '3', '&', '5', '6']
  };
  const suffix = common[subdivision]?.[sub] ?? String(sub + 1);
  return sub === 0 ? String(beat) : suffix;
}

export function isSoundingCell(state) {
  return state === CELL.NORMAL || state === CELL.ACCENT;
}

export function isAnalysisCell(state) {
  return state === CELL.NORMAL || state === CELL.ACCENT || state === CELL.REF || state === CELL.SILENT;
}
