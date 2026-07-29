import type { Goal } from "@/core/entities/goal.entity";
import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { buildCeiling, savingPace } from "./ceiling.helper";
import { projectGoals } from "./goals.helper";
import { buildLimit } from "./limit.helper";
import { buildSeries, firstEstimatedMonth } from "./series.helper";
import { computeStats } from "./stats.helper";
import type { DashboardData, DashboardRange } from "./types";

type PayloadInput = {
  range: DashboardRange;
  months: number[];
  currentIndex: number;
  goalCents: number | null;
  goals: Goal[];
  movements: Movement[];
  recurrences: Recurrence[];
};

// Assembles the "ok" payload from an already-validated range and
// already-owner-filtered entries. Kept out of service.ts so neither file
// approaches the 100-line cap.
export function buildPayload({
  range,
  months,
  currentIndex,
  goalCents,
  goals,
  movements,
  recurrences,
}: PayloadInput): DashboardData {
  const points = buildSeries(months, movements, recurrences);
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
    limit: buildLimit(points, goalCents),
    // The ceiling runs from the current month to the range end, so its length
    // is exactly how many months are left to save in — never 0.
    goals: projectGoals(goals, {
      pace,
      monthsAhead: ceiling.months.length,
      current: range.current,
    }),
  };
}
