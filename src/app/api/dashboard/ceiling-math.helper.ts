import type { CeilingRates } from "./ceiling.types.ts";
import type { MonthPoint } from "./types.ts";

// The pure arithmetic behind buildCeiling, split off it for the 100-line cap.
// Nothing here knows about caps, limits or the Meta target — that is exactly
// what makes it the half that could leave.

// Nominal weeks and days in a month: the cadences the card shows, not a
// calendar — the figure is an allowance, and it floors.
const WEEKS_IN_MONTH = 4;
const DAYS_IN_MONTH = 30;

// One figure at the three cadences the card shows. The headline floors the same
// way, for the same reason the budget itself does: an allowance rounds DOWN.
export const rates = (monthly: number): CeilingRates => ({
  monthly,
  weekly: Math.floor(monthly / WEEKS_IN_MONTH),
  daily: Math.floor(monthly / DAYS_IN_MONTH),
});

// The worst projected balance from each month to the range end, right to left in
// one pass. Seeded from the LAST balance rather than a sentinel: the formula this
// replaces seeded POSITIVE_INFINITY, and Infinity - Infinity is NaN.
export function suffixMinimum(ahead: MonthPoint[]): number[] {
  const last = ahead.at(-1);
  if (!last) {
    return [];
  }

  const worst = new Array<number>(ahead.length);
  worst[worst.length - 1] = last.cumulative;
  for (let index = worst.length - 2; index >= 0; index -= 1) {
    worst[index] = Math.min(ahead[index].cumulative, worst[index + 1]);
  }
  return worst;
}

// `worst[0]` is a minimum OVER these balances, so a match always exists; the
// fallback is there to satisfy the type and is unreachable.
export function tightestMonth(ahead: MonthPoint[], floor: number): number {
  return (ahead.find((point) => point.cumulative === floor) ?? ahead[0]).month;
}

// The month whose balance IS the worst ahead — what limits this month's figure,
// and the only month the card can honestly name. Null while nothing is offered.
export function tightestOf(
  monthly: number,
  ahead: MonthPoint[],
  worst: number[],
): number | null {
  if (monthly <= 0) {
    return null;
  }
  return tightestMonth(ahead, worst[0]);
}

export function firstRedOf(red: MonthPoint | undefined) {
  if (red === undefined) {
    return null;
  }
  return { month: red.month, shortfall: -red.cumulative };
}
