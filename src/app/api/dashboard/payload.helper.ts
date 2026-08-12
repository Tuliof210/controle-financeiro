import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";
import { buildCeiling } from "./ceiling.helper.ts";
import { projectGoals } from "./goals.helper.ts";
import { savingPace } from "./pace.helper.ts";
import { buildSeries, firstEstimatedMonth } from "./series.helper.ts";
import { computeStats } from "./stats.helper.ts";
import type { DashboardData, DashboardRange } from "./types.ts";

interface PayloadInput {
  range: DashboardRange;
  months: number[];
  currentIndex: number;
  goals: Goal[];
  movements: Movement[];
  forecasts: Forecast[];
  // Percent of each month's headroom released as spendable. Everything the
  // ceiling feeds hangs off it — `pace` is a quotient of the budgets and the
  // goal projections are a quotient of `pace` — so this one number reaching
  // buildCeiling moves the whole payload, and nothing below has to know it.
  cap: number;
  // Cents no month's ceiling may exceed — the Meta target's saved goal. Null on
  // every percentage target. Separate from `meta` below because they answer
  // different questions: this one is applied, that one is only reported.
  limit: number | null;
  // The saved goal itself, echoed to the screen so the selector knows whether
  // the Meta segment exists at all. Present even while a percentage target is
  // selected — the segment has to be offered before it can be picked.
  meta: number | null;
}

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
  cap,
  limit,
  meta,
}: PayloadInput): DashboardData {
  const points = buildSeries(months, movements, forecasts);
  const stats = (pick: (point: (typeof points)[number]) => number) =>
    computeStats(points.map(pick), currentIndex);
  const ceiling = buildCeiling(points, range.current, cap, limit);
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
    meta,
    pace,
    goals: projectGoals(goals, { pace, current: range.current }),
  };
}
