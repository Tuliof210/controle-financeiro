import type { Ceiling } from "./ceiling.types.ts";

// A quarter of the average monthly ceiling is what the owner is willing to
// commit to a goal every month. Owner's decision (2026-07-30).
const PACE_DIVISOR = 4;

// A quarter of the MEAN of the figures the Teto de Gastos card displays — every
// month from the current one to the range end, zeros included. Averaging is what
// makes a front-loaded column usable as a rate: the early months sit far above
// what repeats and the late ones far below, and only their mean is a number that
// can be committed to every month.
//
// `sum / (4 * n)` floored, in that order — the same rule buildCeiling's
// accumulator follows. Flooring a quarter of an already-floored mean would round
// twice, and a saving rate always rounds DOWN. Never Math.trunc: it differs on
// negatives.
//
// `ceiling.months` is never empty (see its declaration in types.ts), so there is
// no divisor guard here. A period with no room at all makes every budget 0 and
// so the pace 0, which goals.helper already treats as "no rate".
//
// Its own file rather than ceiling.helper's: this is what the ceiling BUYS, not
// how it is computed, and folding it back in puts that file over the 100-line
// cap.
export function savingPace(ceiling: Ceiling): number {
  const total = ceiling.months.reduce((sum, month) => sum + month.budget, 0);
  return Math.floor(total / (PACE_DIVISOR * ceiling.months.length));
}
