import type { Ceiling, CeilingMonth, CeilingRates } from "./ceiling.types";
import type { MonthPoint } from "./types";

// One figure at the three cadences the card shows. The headline floors the same
// way, for the same reason the budget itself does: an allowance rounds DOWN.
const rates = (monthly: number): CeilingRates => ({
  monthly,
  weekly: Math.floor(monthly / 4),
  daily: Math.floor(monthly / 30),
});

// The worst projected balance from each month to the range end, right to left in
// one pass. Seeded from the LAST balance rather than a sentinel: the formula this
// replaces seeded POSITIVE_INFINITY, and Infinity - Infinity is NaN.
function suffixMinimum(ahead: MonthPoint[]): number[] {
  const worst = new Array<number>(ahead.length);
  worst[worst.length - 1] = ahead[ahead.length - 1].cumulative;
  for (let index = worst.length - 2; index >= 0; index -= 1) {
    worst[index] = Math.min(ahead[index].cumulative, worst[index + 1]);
  }
  return worst;
}

// Spending extra in month k lowers the cumulative balance of k AND every month
// after it, so k's headroom is never k's own balance: it is the WORST balance
// from k to the range end — a suffix minimum.
//
// That minimum alone is not an answer, and shipping it once proved it: it priced
// each month's spend in isolation, so its per-month figures were mutually
// exclusive and spending the first invalidated every later one. The accumulator
// is the fix. Each month gets `cap` percent of what is left of its worst balance
// AFTER the earlier months have already been authorised, so the whole column can
// be spent in order and no month closes under.
//
// The accumulator is also why raising `cap` does NOT raise every row: only month
// 0's gap is untouched by an earlier month. A later month is offered a share of
// what the earlier ones left, and a bigger share of a smaller remainder can be
// less — on a flat suffix minimum of 1000, month 1 gets 250 at cap 50 and 187 at
// cap 75. Redistribution, not rounding; `expectCapOrder` in
// e2e/ceiling-cap.helper.ts pins month 0 alone for this reason.
//
// `(gap * cap) / 100` floored, in THAT order, never leaves the integers — `gap`
// is a sum and difference of integer cents throughout. Writing it as
// `gap * (cap / 100)` and flooring per step would compound float error down a
// recursion as deep as the range is long. Math.floor everywhere: a spending
// allowance always rounds DOWN. Never Math.trunc — it differs on negatives.
export function buildCeiling(
  points: MonthPoint[],
  currentMonth: number,
  cap: number,
): Ceiling {
  // Never empty: service.ts answers "out_of_range" when the current month is
  // outside the range, and `points` is 1:1 with the months of that range.
  const ahead = points.filter((point) => point.month >= currentMonth);

  // A month already underwater zeroes the WHOLE ceiling, not merely the months
  // up to it. The suffix minimum on its own would still hand out figures after
  // the hole, and offering money to spend across a period that has one is not an
  // answer — tape the hole first. Owner's decision (2026-07-29).
  const red = ahead.find((point) => point.cumulative < 0);

  const worst = suffixMinimum(ahead);
  const months: CeilingMonth[] = [];
  let authorised = 0;

  for (let index = 0; index < ahead.length; index += 1) {
    // Defensive only: `worst` is non-decreasing and the gap stays >= 0 by
    // induction, so a negative gap means one of those two broke.
    const gap = Math.max(0, worst[index] - authorised);
    const budget = red ? 0 : Math.floor((gap * cap) / 100);
    const { month, cumulative } = ahead[index];
    // Read BEFORE this month is authorised: the balance ARRIVING at the month.
    const ceilingBalance = cumulative - authorised;
    authorised += budget;
    months.push({
      month,
      budget,
      ceilingBalance,
      ceilingLeft: cumulative - authorised,
    });
  }

  const monthly = months[0].budget;

  return {
    ...rates(monthly),
    // The month whose balance IS the worst ahead — what limits this month's
    // figure, and the only month the card can honestly name.
    tightest: monthly > 0 ? tightestMonth(ahead, worst[0]) : null,
    firstRed: red ? { month: red.month, shortfall: -red.cumulative } : null,
    months,
  };
}

// `worst[0]` is a minimum OVER these balances, so a match always exists; the
// fallback is there to satisfy the type and is unreachable.
function tightestMonth(ahead: MonthPoint[], floor: number): number {
  return (ahead.find((point) => point.cumulative === floor) ?? ahead[0]).month;
}
