import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { MonthPoint } from "./types";

// The four raw sums a month accumulates before the two sides are reconciled.
type Sums = {
  realIncome: number;
  realExpense: number;
  estIncome: number;
  estExpense: number;
};

const emptySums = (): Sums => ({
  realIncome: 0,
  realExpense: 0,
  estIncome: 0,
  estExpense: 0,
});

// Seeded from `months` so a month with no data at all still yields a zeroed
// point rather than disappearing from the series. Entries whose month is not
// in the global range fall through: nothing server-side clamps Movement.month
// or RecurrenceMonth.month, and the dashboard is deliberately range-only.
function accumulate(
  months: number[],
  movements: Movement[],
  recurrences: Recurrence[],
): Map<number, Sums> {
  const sums = new Map(months.map((month) => [month, emptySums()]));

  for (const movement of movements) {
    const month = sums.get(movement.month);
    if (!month) continue;
    if (movement.type === "income") month.realIncome += movement.valueCents;
    else month.realExpense += movement.valueCents;
  }

  for (const recurrence of recurrences) {
    // valueCents is PER active month — a recurrence active Jan-Dec contributes
    // its full value to each of those twelve months, never value / 12.
    for (const active of recurrence.months) {
      const month = sums.get(active);
      if (!month) continue;
      if (recurrence.type === "income")
        month.estIncome += recurrence.valueCents;
      else month.estExpense += recurrence.valueCents;
    }
  }

  return sums;
}

// Reconciles "real" (Movement) against "estimated" (Recurrence) per month AND
// per type: the more complete picture wins. Actuals above the commitments mean
// the month happened; actuals below mean it has not happened yet, or has not
// been fully recorded, so the commitments are the better truth.
export function buildSeries(
  months: number[],
  movements: Movement[],
  recurrences: Recurrence[],
): MonthPoint[] {
  const sums = accumulate(months, movements, recurrences);
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
      realIncome,
      realExpense,
      estimatedIncome: estIncome,
      estimatedExpense: estExpense,
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
