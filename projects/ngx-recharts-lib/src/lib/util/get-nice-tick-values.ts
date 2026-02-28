/**
 * Calculate "nice" tick values for a given domain and tick count.
 * Port of recharts-scale getNiceTickValues.
 */
export function getNiceTickValues(domain: [number, number], tickCount: number): number[] {
  const [min, max] = domain;
  if (min === max) return [min];
  if (tickCount <= 0) return [];
  if (tickCount === 1) return [(min + max) / 2];

  const range = max - min;
  const roughStep = range / (tickCount - 1);
  const stepMagnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const stepNormalized = roughStep / stepMagnitude;

  let niceStep: number;
  if (stepNormalized <= 1.5) niceStep = 1;
  else if (stepNormalized <= 3) niceStep = 2;
  else if (stepNormalized <= 7) niceStep = 5;
  else niceStep = 10;

  niceStep *= stepMagnitude;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + niceStep * 0.5; v += niceStep) {
    ticks.push(Math.round(v * 1e12) / 1e12); // avoid floating point artifacts
  }
  return ticks;
}

export function getTickValuesOfScale(scale: any): any[] {
  if (scale && typeof scale.ticks === 'function') {
    return scale.ticks();
  }
  if (scale && typeof scale.domain === 'function') {
    return scale.domain();
  }
  return [];
}
