import type { CeilingRates } from "./ceiling.types";
import type { MonthPoint } from "./types";

// The pure arithmetic behind buildCeiling, split off it for the 100-line cap.
// Nothing here knows about caps, limits or the Meta target — that is exactly
// what makes it the half that could leave.

// One figure at the three cadences the card shows. The headline floors the same
// way, for the same reason the budget itself does: an allowance rounds DOWN.
export const rates = (monthly: number): CeilingRates => ({
  monthly,
  weekly: Math.floor(monthly / 4),
  daily: Math.floor(monthly / 30),
});

// The worst projected balance from each month to the range end, right to left in
// one pass. Seeded from the LAST balance rather than a sentinel: the formula this
// replaces seeded POSITIVE_INFINITY, and Infinity - Infinity is NaN.
export function suffixMinimum(ahead: MonthPoint[]): number[] {
  const worst = new Array<number>(ahead.length);
  worst[worst.length - 1] = ahead[ahead.length - 1].cumulative;
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
