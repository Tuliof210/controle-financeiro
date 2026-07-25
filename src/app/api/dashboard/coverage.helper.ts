import type { CoverageMonth, MonthPoint } from "./types";

type Coverage = {
  committed: number;
  recorded: number;
  percent: number | null;
  months: CoverageMonth[];
};

// Per month, summing both types. `recorded` is capped per type at that type's
// commitment, so overspending on expenses cannot mask an unrecorded income
// commitment (or vice versa) — without the cap a month could read as fully
// covered while half its commitments have no movement behind them.
function monthCoverage(point: MonthPoint): CoverageMonth {
  const committed = point.estimatedIncome + point.estimatedExpense;
  const recorded =
    Math.min(point.realIncome, point.estimatedIncome) +
    Math.min(point.realExpense, point.estimatedExpense);
  return { month: point.month, committed, recorded, gap: committed - recorded };
}

// A STALE-DATA signal, not an accuracy score: across elapsed months only, how
// much of the known commitments has actually been recorded as movements. A low
// percentage means entries are missing, never that a forecast was wrong.
//
// Elapsed months are rangeStart .. min(currentMonth, rangeEnd); `points` is
// already clamped to the range, so cutting at currentMonth is enough.
export function buildCoverage(
  points: MonthPoint[],
  currentMonth: number,
): Coverage {
  const elapsed = points
    .filter((point) => point.month <= currentMonth)
    .map(monthCoverage);

  const committed = elapsed.reduce((sum, month) => sum + month.committed, 0);
  const recorded = elapsed.reduce((sum, month) => sum + month.recorded, 0);

  return {
    committed,
    recorded,
    // null, not 0: nothing committed means the question does not apply, and a
    // 0% would read as "you have recorded nothing".
    percent: committed > 0 ? Math.round((recorded / committed) * 100) : null,
    months: elapsed
      .filter((month) => month.gap > 0)
      .sort((a, b) => b.gap - a.gap),
  };
}
