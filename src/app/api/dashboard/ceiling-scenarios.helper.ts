import type { CeilingMonth } from "./ceiling.types";

// One month of the ceiling scenario, before the average one can be computed:
// the average is floor(total / n), and n is only known once the pass that fills
// this array has finished. `cumulative` rides along for that second pass and
// does not survive into the payload.
export type CeilingSpend = {
  month: number;
  budget: number;
  cumulative: number;
  ceilingBalance: number;
  ceilingLeft: number;
};

// The second scenario, in one pass over the first. `cumulative` is an absolute
// period-to-date balance — series.helper.ts seeds it at the RANGE start, not at
// the current month — so subtracting `index` average spends is the whole
// arithmetic. Nothing accumulates by hand here, which is why the two scenarios
// cannot drift apart by a rounding step.
//
// Asymmetry worth knowing before "fixing" it: `ceilingLeft` can never go
// negative, because each budget is floored against a suffix minimum that is
// itself <= that month's `cumulative`. `averageLeft` can, and does whenever the
// income is back-loaded — a flat spend meets a balance that has not arrived yet.
// That negative is the one the card renders in the red state.
export function withAverage(
  spends: CeilingSpend[],
  monthly: number,
): CeilingMonth[] {
  return spends.map(({ cumulative, ...spend }, index) => ({
    ...spend,
    averageBalance: cumulative - monthly * index,
    averageLeft: cumulative - monthly * (index + 1),
  }));
}
