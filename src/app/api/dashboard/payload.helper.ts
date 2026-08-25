import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";
import { buildCeiling } from "./ceiling.helper.ts";
import type { CeilingTarget } from "./ceiling.types.ts";
import { projectGoals } from "./goals.helper.ts";
import { type GoalsTarget, savingPace } from "./pace.helper.ts";
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
  // How much of each month's headroom is released as spendable, as the Perfil
  // screen saved it. Everything the ceiling feeds hangs off it — `pace` is a
  // quotient of the budgets and the goal projections a quotient of `pace` — so
  // this one value reaching buildCeiling moves the whole payload.
  ceilingTarget: CeilingTarget;
  // The monthly commitment to goals, saved separately from the ceiling: the
  // family may want a flat amount put aside out of a percentage ceiling, or the
  // reverse.
  goalsTarget: GoalsTarget;
}

// The "ok" payload minus the one field the service adds on top: `overHeadroom`
// compares the saved row against the ceiling this function produces, so it can
// only be answered once this has returned.
type OkPayload = Extract<DashboardData, { status: "ok" }>;

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
  ceilingTarget,
  goalsTarget,
}: PayloadInput): Omit<OkPayload, "overHeadroom"> {
  const points = buildSeries(months, movements, forecasts);
  const stats = (pick: (point: (typeof points)[number]) => number) =>
    computeStats(points.map(pick), currentIndex);
  const ceiling = buildCeiling(points, range.current, ceilingTarget);
  const pace = savingPace(ceiling, goalsTarget);

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
