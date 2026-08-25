import type { Ceiling, CeilingMonth, CeilingTarget } from "./ceiling.types.ts";
import {
  firstRedOf,
  headroomOf,
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
// is the fix. Each month gets its share of what is left of its worst balance
// AFTER the earlier months have already been authorised, so the whole column can
// be spent in order and no month closes under.
//
// The accumulator is also why raising the percentage does NOT raise every row:
// only month 0's gap is untouched by an earlier month. A later month is offered
// a share of what the earlier ones left, and a bigger share of a smaller
// remainder can be less — on a flat suffix minimum of 1000, month 1 gets 250 at
// 50% and 187 at 75%. Redistribution, not rounding; `expectCapOrder` in
// e2e/ceiling-cap.helper.ts pins month 0 alone for this reason.
//
// `(gap * percent) / 100` floored, in THAT order, never leaves the integers —
// `gap` is a sum and difference of integer cents throughout. Writing it as
// `gap * (percent / 100)` and flooring per step would compound float error down
// a recursion as deep as the range is long. Math.floor everywhere: a spending
// allowance always rounds DOWN. Never Math.trunc — it differs on negatives.
const PERCENT = 100;

// What one month is offered, and the only place the two targets differ.
//
// A percentage is bounded twice: by the gap the earlier months left, and by the
// period having no hole at all — a month already underwater zeroes the WHOLE
// column, not merely the months up to it, because offering money to spend
// across a period that has one is not an answer; tape the hole first. Owner's
// decision (2026-07-29).
//
// A fixed amount is bounded by neither. The family typed a number and the board
// answers with it, so `ceilingLeft` can go negative and a red month still gets
// its allowance. That overflow is not a bug to clamp: it is the one signal the
// dashboard's alert reads, and clamping it would hide the months it sinks.
function offerFor(target: CeilingTarget, gap: number, red: boolean): number {
  if (target.mode === "fixed") {
    return target.cents;
  }
  if (red) {
    return 0;
  }
  return Math.floor((gap * target.percent) / PERCENT);
}

export function buildCeiling(
  points: MonthPoint[],
  currentMonth: number,
  target: CeilingTarget,
): Ceiling {
  // Never empty: service.ts answers "out_of_range" when the current month is
  // outside the range, and `points` is 1:1 with the months of that range.
  const ahead = points.filter((point) => point.month >= currentMonth);
  const red = ahead.find((point) => point.cumulative < 0);

  const worst = suffixMinimum(ahead);
  const months: CeilingMonth[] = [];
  let authorised = 0;

  for (let index = 0; index < ahead.length; index += 1) {
    // Defensive only: `worst` is non-decreasing and the gap stays >= 0 by
    // induction, so a negative gap means one of those two broke.
    const gap = Math.max(0, worst[index] - authorised);
    const budget = offerFor(target, gap, red !== undefined);
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
    headroomCents: headroomOf(red, worst),
    fixed: target.mode === "fixed",
  };
}
