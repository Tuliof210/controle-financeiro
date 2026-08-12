import type { Stats } from "./types.ts";

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

// Population standard deviation (divided by N, not N-1): the months of the
// global range are the whole population, not a sample drawn from one.
function stdDev(values: number[], mean: number): number {
  const variance = sum(values.map((v) => (v - mean) ** 2)) / values.length;
  return Math.round(Math.sqrt(variance));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

const EMPTY: Stats = {
  total: 0,
  current: 0,
  mean: 0,
  stdDev: 0,
  median: 0,
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
  const mean = Math.round(total / values.length);

  return {
    total,
    current: sum(values.slice(0, currentIndex + 1)),
    mean,
    stdDev: stdDev(values, total / values.length),
    median: median(values),
  };
}
