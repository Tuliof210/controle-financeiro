import type { Ceiling, CeilingTarget } from "./ceiling.types.ts";

// The same union the Teto uses, under its own name: the two adjustments are
// saved separately on the `Settings` row and read the same two ways, and a
// shared alias is what keeps a caller from handing one to the other.
type GoalsTarget = CeilingTarget;

const PERCENT = 100;

// A share of the MEAN of the figures the Teto de Gastos card displays — every
// month from the current one to the range end, zeros included. Averaging is what
// makes a front-loaded column usable as a rate: the early months sit far above
// what repeats and the late ones far below, and only their mean is a number that
// can be committed to every month.
//
// `total * percent / (100 * n)` floored, in that order — the same rule
// buildCeiling's accumulator follows. Flooring a share of an already-floored
// mean would round twice, and a saving rate always rounds DOWN. Never
// Math.trunc: it differs on negatives.
//
// A fixed amount is returned as it stands, with no clamp against the ceiling it
// is meant to come out of. An unreachable rate is the family's own figure read
// back to them, and the dashboard's alert is what says so — silently lowering it
// would leave the goal dates looking affordable.
//
// `ceiling.months` is never empty (see its declaration in ceiling.types.ts), so
// there is no divisor guard here. A period with no room at all makes every
// budget 0 and so the pace 0, which goals.helper already treats as "no rate".
//
// Its own file rather than ceiling.helper's: this is what the ceiling BUYS, not
// how it is computed, and folding it back in puts that file over the 100-line
// cap.
function savingPace(ceiling: Ceiling, target: GoalsTarget): number {
  if (target.mode === "fixed") {
    return target.cents;
  }
  const total = ceiling.months.reduce((sum, month) => sum + month.budget, 0);
  return Math.floor(
    (total * target.percent) / (PERCENT * ceiling.months.length),
  );
}

export type { GoalsTarget };
export { savingPace };
