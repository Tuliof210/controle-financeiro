import { sustainableRate } from "./sustainable.helper";
import type { Ceiling, CeilingMonth, MonthPoint } from "./types";

// A quarter of the sustainable rate is what the owner is willing to commit to a
// goal every month.
const PACE_SHARE = 0.25;

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
// is the fix. Each month gets 80% of what is left of its worst balance AFTER the
// earlier months have already been authorised, so the whole column can be spent
// in order and no month closes under.
//
// `(4 * gap) / 5` floored, in that order, never leaves the integers. Writing it
// as `0.8 * gap` and flooring per step would compound float error down a
// recursion as deep as the range is long. Math.floor everywhere: a spending
// allowance always rounds DOWN. Never Math.trunc — it differs on negatives.
export function buildCeiling(
  points: MonthPoint[],
  currentMonth: number,
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
    const worstAhead = worst[index];
    // Defensive only: `worst` is non-decreasing and `remaining` stays >= 0 by
    // induction, so a negative gap means one of those two broke.
    const gap = Math.max(0, worstAhead - authorised);
    const budget = red ? 0 : Math.floor((4 * gap) / 5);
    authorised += budget;
    months.push({
      month: ahead[index].month,
      budget,
      worstAhead,
      remaining: worstAhead - authorised,
    });
  }

  const monthly = months[0].budget;

  return {
    monthly,
    weekly: Math.floor(monthly / 4),
    daily: Math.floor(monthly / 30),
    // Clamps itself to 0 on a red period, so `red` needs no branch here.
    sustainable: sustainableRate(ahead),
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

// A share of the sustainable rate, never of the front-loaded figure: goals.helper
// multiplies this by the months left, which only stays inside the balance for a
// rate that survives being spent every month.
export function savingPace(ceiling: Ceiling): number {
  return Math.floor(PACE_SHARE * ceiling.sustainable);
}
