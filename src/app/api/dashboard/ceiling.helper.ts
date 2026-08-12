import type { Ceiling, CeilingMonth } from "./ceiling.types.ts";
import {
  firstRedOf,
  rates,
  suffixMinimum,
  tightestOf,
} from "./ceiling-math.helper.ts";
import type { MonthPoint } from "./types.ts";

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
//
// `limit` is the Meta target and nothing else: a hard ceiling in cents on what
// any single month may hand out, applied AFTER the percentage. Null for the
// percentage targets, which have no such ceiling. It changes no rule above —
// the suffix minimum, the accumulator and the `red ? 0` all still decide what
// is available; the limit only declines part of what was offered, and what it
// declines stays in `worst` for the months that follow. That is the whole
// "sobra para o mês seguinte" behaviour, and it is the accumulator's, not new
// arithmetic here.
const PERCENT = 100;

export function buildCeiling(
  points: MonthPoint[],
  currentMonth: number,
  cap: number,
  limit: number | null,
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
    let offered = 0;
    if (red === undefined) {
      offered = Math.floor((gap * cap) / PERCENT);
    }
    // Math.min against a null-checked number rather than `limit ?? Infinity`:
    // Infinity is what the seed of `suffixMinimum` above had to be rewritten to
    // avoid, and there is no reason to reintroduce it one loop away.
    let budget = offered;
    if (limit !== null) {
      budget = Math.min(offered, limit);
    }
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
    tightest: tightestOf(monthly, ahead, worst),
    firstRed: firstRedOf(red),
    months,
  };
}
