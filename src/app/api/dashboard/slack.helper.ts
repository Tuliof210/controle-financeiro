import type { MonthPoint, SlackMonth } from "./types";

// 20% safety margin on the worst month still ahead.
const MARGIN = 0.8;
// A quarter of the tightest month in the list is what the owner is willing to
// commit to a goal every month.
const PACE_SHARE = 0.25;

// Spending X in month M lowers the cumulative balance of M *and every month
// after it*, so the ceiling for M is the worst cumulative balance from M to the
// range end — a suffix minimum, taken right to left in one pass.
//
// The list runs from `currentMonth` to the range end. Note the shape this
// produces: a suffix minimum is non-decreasing as M advances, so slack never
// drops month over month. That is a property of the formula, not a bug.
//
// Math.floor everywhere: a spending allowance always rounds DOWN. Never
// Math.trunc — it differs on negatives, and the pre-clamp value can be one.
export function buildSlack(
  points: MonthPoint[],
  currentMonth: number,
): SlackMonth[] {
  const months: SlackMonth[] = [];
  let worstAhead = Number.POSITIVE_INFINITY;

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    worstAhead = Math.min(worstAhead, point.cumulative);
    if (point.month < currentMonth) continue;

    const total = Math.max(0, Math.floor(MARGIN * worstAhead));
    months.push({
      month: point.month,
      total,
      weekly: Math.floor(total / 4),
      daily: Math.floor(total / 30),
    });
  }

  return months.reverse();
}

// The tightest month in the list sets the pace. Because slack is
// non-decreasing that is the first entry, but take the real minimum — it is
// what was asked for, and it holds whatever the series does.
export function savingPace(slack: SlackMonth[]): number {
  if (slack.length === 0) return 0;
  const tightest = Math.min(...slack.map((month) => month.total));
  return Math.floor(PACE_SHARE * tightest);
}
