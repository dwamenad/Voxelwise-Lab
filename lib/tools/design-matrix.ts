export function clampAcquisition(value: number, min: number, max: number, fallback: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

// A contrast is estimable exactly when it lies in the row space of X.
// Scale columns first so that rank detection is independent of EV amplitude.
export function analyzeDesign(columns: number[][]) {
  const scales = columns.map((column) => Math.hypot(...column));
  const zeroColumns = scales.flatMap((scale, index) => scale === 0 ? [index] : []);
  const basis: number[][] = [];
  for (let row = 0; row < (columns[0]?.length ?? 0); row++) {
    const residual = columns.map((column, index) => column[row] / (scales[index] || 1));
    // Reorthogonalize to reduce numerical error for nearly dependent EVs.
    for (let pass = 0; pass < 2; pass++) {
      for (const vector of basis) {
        const projection = vector.reduce((sum, value, index) => sum + value * residual[index], 0);
        for (let index = 0; index < residual.length; index++) residual[index] -= projection * vector[index];
      }
    }
    const norm = Math.hypot(...residual);
    if (norm > 1e-10) basis.push(residual.map((value) => value / norm));
    if (basis.length === columns.length) break;
  }
  return { rank: basis.length, basis, scales, zeroColumns };
}

export function isContrastEstimable(weights: number[], design: ReturnType<typeof analyzeDesign>) {
  if (weights.length !== design.scales.length || !weights.every(Number.isFinite)) return false;
  const residual = weights.map((value, index) => value / (design.scales[index] || 1));
  const norm = Math.hypot(...residual);
  if (norm === 0) return false;
  for (const vector of design.basis) {
    const projection = vector.reduce((sum, value, index) => sum + value * residual[index], 0);
    for (let index = 0; index < residual.length; index++) residual[index] -= projection * vector[index];
  }
  return Math.hypot(...residual) <= norm * 1e-8;
}
