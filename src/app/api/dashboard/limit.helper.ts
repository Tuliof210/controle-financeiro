import type { LimitMonth, MonthPoint } from "./types";

// Settings.monthlyGoalCents read as a monthly spending CEILING: for every month
// of the range, what percentage of it that month's effective expense consumed.
// <= 100% is good, > 100% is not — this only produces the number; the card
// renders the polarity. Covers the whole range, not just the months ahead.
//
// goalCents is null until the owner saves one, and a null percent is what makes
// the card show its empty state rather than a misleading 0%.
export function buildLimit(
  points: MonthPoint[],
  goalCents: number | null,
): { goalCents: number | null; months: LimitMonth[] } {
  return {
    goalCents,
    months: points.map((point) => ({
      month: point.month,
      spent: point.expense,
      percent: goalCents ? Math.round((point.expense / goalCents) * 100) : null,
    })),
  };
}
