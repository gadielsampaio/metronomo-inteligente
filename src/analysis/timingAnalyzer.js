export function nearestGridPosition(onsetTimeSec, config, transportStartSec) {
  const secondsPerStep = 60 / config.bpm / config.subdivision;
  const relative = onsetTimeSec - transportStartSec - (config.calibration.outputLatencyMs / 1000) - (config.calibration.globalOffsetMs / 1000);
  if (relative < -secondsPerStep) return null;

  const nearestStep = Math.round(relative / secondsPerStep);
  const expected = transportStartSec + nearestStep * secondsPerStep;
  const deviationMs = (onsetTimeSec - expected) * 1000 - config.calibration.globalOffsetMs;
  const localStep = ((nearestStep % (config.beats * config.subdivision)) + (config.beats * config.subdivision)) % (config.beats * config.subdivision);
  const bar = Math.floor(nearestStep / (config.beats * config.subdivision));

  return { nearestStep, localStep, bar, expectedSec: expected, deviationMs };
}

export function analyzeOnset(onset, config, transportStartSec) {
  if (!transportStartSec) return null;
  const pos = nearestGridPosition(onset.timeSec, config, transportStartSec);
  if (!pos) return null;
  const abs = Math.abs(pos.deviationMs);
  const tolerance = Number(config.toleranceMs);
  const status = abs <= tolerance ? 'no tempo' : pos.deviationMs < 0 ? 'adiantado' : 'atrasado';
  const veryOff = abs > Math.max(120, tolerance * 3);
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    ...onset,
    ...pos,
    deviationMs: Math.round(pos.deviationMs),
    status: veryOff ? 'fora da grade' : status
  };
}

export function computeStats(attacks, toleranceMs = 30, windowSize = 24) {
  const valid = attacks.filter((a) => a.status !== 'fora da grade');
  if (!valid.length) {
    return {
      count: 0,
      average: 0,
      stdDev: 0,
      maxVariation: 0,
      stability: 0,
      tendency: 'aguardando',
      generalTrend: 'aguardando'
    };
  }

  const values = valid.map((a) => a.deviationMs);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - average) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const maxVariation = Math.max(...values) - Math.min(...values);
  const inside = values.filter((v) => Math.abs(v) <= toleranceMs).length;
  const stability = Math.round((inside / values.length) * 100);

  const recent = valid.slice(-windowSize).map((a) => a.deviationMs);
  const tendency = classifyTendency(recent, average, stdDev, toleranceMs);
  const generalTrend = classifyTendency(values, average, stdDev, toleranceMs);

  return {
    count: valid.length,
    average: Math.round(average),
    stdDev: Math.round(stdDev),
    maxVariation: Math.round(maxVariation),
    stability,
    tendency,
    generalTrend
  };
}

function classifyTendency(values, average, stdDev, toleranceMs) {
  if (values.length < 6) {
    if (average < -toleranceMs) return 'adiantado';
    if (average > toleranceMs) return 'atrasado';
    return 'estável';
  }

  const n = values.length;
  const xs = values.map((_, i) => i);
  const xAvg = (n - 1) / 2;
  const yAvg = values.reduce((a, b) => a + b, 0) / n;
  const numerator = values.reduce((acc, y, i) => acc + (xs[i] - xAvg) * (y - yAvg), 0);
  const denominator = xs.reduce((acc, x) => acc + (x - xAvg) ** 2, 0) || 1;
  const slope = numerator / denominator;

  if (stdDev > toleranceMs * 1.8) return 'oscilando';
  if (slope < -1.15) return 'correndo';
  if (slope > 1.15) return 'segurando';
  if (average < -toleranceMs) return 'adiantado';
  if (average > toleranceMs) return 'atrasado';
  return 'estável';
}
