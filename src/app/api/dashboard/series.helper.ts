import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";
import { accumulate, emptySums } from "./series-sums.helper.ts";
import type { MonthPoint } from "./types.ts";

// Reconciles "real" (Movement) against "estimated" (Forecast) per month AND
// per type: the more complete picture wins. Actuals above the commitments mean
// the month happened; actuals below mean it has not happened yet, or has not
// been fully recorded, so the commitments are the better truth.
export function buildSeries(
  months: number[],
  movements: Movement[],
  forecasts: Forecast[],
): MonthPoint[] {
  const sums = accumulate(months, movements, forecasts);
  let cumulative = 0;

  return months.map((month) => {
    const { realIncome, realExpense, estIncome, estExpense } =
      sums.get(month) ?? emptySums();
    const income = Math.max(realIncome, estIncome);
    const expense = Math.max(realExpense, estExpense);
    const balance = income - expense;
    cumulative += balance;

    return {
      month,
      income,
      expense,
      balance,
      cumulative,
      // Strictly greater: a tie means the actuals fully cover the commitment,
      // so the month is history, not projection.
      incomeEstimated: estIncome > realIncome,
      expenseEstimated: estExpense > realExpense,
    };
  });
}

// The month the balance line stops being history and starts being projection.
// null when every month is real-dominant, i.e. the whole line stays solid.
export function firstEstimatedMonth(points: MonthPoint[]): number | null {
  const found = points.find(
    (point) => point.incomeEstimated || point.expenseEstimated,
  );
  return found?.month ?? null;
}
