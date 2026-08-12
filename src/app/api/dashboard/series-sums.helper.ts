import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

// The four raw sums a month accumulates before the two sides are reconciled.
// Local to this file: the payload only ever carries the reconciled result.
export interface Sums {
  realIncome: number;
  realExpense: number;
  estIncome: number;
  estExpense: number;
}

export const emptySums = (): Sums => ({
  realIncome: 0,
  realExpense: 0,
  estIncome: 0,
  estExpense: 0,
});

// Seeded from `months` so a month with no data at all still yields a zeroed
// point rather than disappearing from the series. Entries whose month is not
// in the global range fall through: nothing server-side clamps Movement.month
// or ForecastMonth.month, and the dashboard is deliberately range-only.
export function accumulate(
  months: number[],
  movements: Movement[],
  forecasts: Forecast[],
): Map<number, Sums> {
  const sums = new Map(months.map((month) => [month, emptySums()]));
  addMovements(sums, movements);
  addForecasts(sums, forecasts);
  return sums;
}

function addMovements(sums: Map<number, Sums>, movements: Movement[]): void {
  for (const movement of movements) {
    const month = sums.get(movement.month);
    if (month) {
      if (movement.type === "income") {
        month.realIncome += movement.valueCents;
      } else {
        month.realExpense += movement.valueCents;
      }
    }
  }
}

// valueCents is PER active month — a forecast active Jan-Dec contributes its
// full value to each of those twelve months, never value / 12.
function addForecasts(sums: Map<number, Sums>, forecasts: Forecast[]): void {
  for (const forecast of forecasts) {
    for (const active of forecast.months) {
      const month = sums.get(active);
      if (month) {
        if (forecast.type === "income") {
          month.estIncome += forecast.valueCents;
        } else {
          month.estExpense += forecast.valueCents;
        }
      }
    }
  }
}
