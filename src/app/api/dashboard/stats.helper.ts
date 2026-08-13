import type { Stats } from "./types.ts";

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

// `stdDev` and `median` were computed here for exactly one consumer, the KPI
// tile's 2x2 quadrant. That quadrant is two figures now, so both are gone rather
// than computed for nobody — see the note on `Stats` in `types.ts`.
const EMPTY: Stats = {
  total: 0,
  current: 0,
  mean: 0,
};

// `values` is one effective figure per month of the global range, in range
// order; `currentIndex` is where the current month sits in it. Everything is
// integer cents, so derived statistics are Math.round-ed — formatCents'
// Math.trunc is a formatting concern, not a rounding policy.
export function computeStats(values: number[], currentIndex: number): Stats {
  if (values.length === 0) {
    return EMPTY;
  }

  const total = sum(values);

  return {
    total,
    current: sum(values.slice(0, currentIndex + 1)),
    mean: Math.round(total / values.length),
  };
}
