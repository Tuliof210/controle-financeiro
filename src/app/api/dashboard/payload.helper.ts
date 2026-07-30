import type { Forecast } from "@/core/entities/forecast.entity";
import type { Goal } from "@/core/entities/goal.entity";
import type { Movement } from "@/core/entities/movement.entity";
import { buildCeiling } from "./ceiling.helper";
import { projectGoals } from "./goals.helper";
import { savingPace } from "./pace.helper";
import { buildSeries, firstEstimatedMonth } from "./series.helper";
import { computeStats } from "./stats.helper";
import type { DashboardData, DashboardRange } from "./types";

type PayloadInput = {
  range: DashboardRange;
  months: number[];
  currentIndex: number;
  goals: Goal[];
  movements: Movement[];
  forecasts: Forecast[];
};

// Assembles the "ok" payload from an already-validated range and
// already-owner-filtered entries. Kept out of service.ts so neither file
// approaches the 100-line cap.
export function buildPayload({
  range,
  months,
  currentIndex,
  goals,
  movements,
  forecasts,
}: PayloadInput): DashboardData {
  const points = buildSeries(months, movements, forecasts);
  const stats = (pick: (point: (typeof points)[number]) => number) =>
    computeStats(points.map(pick), currentIndex);
  const ceiling = buildCeiling(points, range.current);
  const pace = savingPace(ceiling);

  return {
    status: "ok",
    range,
    points,
    dashedFrom: firstEstimatedMonth(points),
    income: stats((point) => point.income),
    expense: stats((point) => point.expense),
    balance: stats((point) => point.balance),
    ceiling,
    pace,
    goals: projectGoals(goals, { pace, current: range.current }),
  };
}
