import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

export type Period = { start: number; end: number };

// The projection period the app can offer: oldest -> newest month across
// every forecast-active month and every movement's own month. null when
// both are empty. The period is the OUTPUT of the entries, never an input
// that constrains them — callers must never use this to clamp or reject an
// entry's month.
//
// Two callers (the dashboard service, the /api/period route) already fetch
// these lists via the existing repositories, so this stays a pure function
// over their results rather than a third place that re-queries the DB.
export function derivePeriod(
  movements: Movement[],
  forecasts: Forecast[],
): Period | null {
  const months = [
    ...movements.map((movement) => movement.month),
    ...forecasts.flatMap((forecast) => forecast.months),
  ];
  return months.length === 0
    ? null
    : { start: Math.min(...months), end: Math.max(...months) };
}
