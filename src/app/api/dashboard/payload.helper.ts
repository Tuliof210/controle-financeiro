import type { Goal } from "@/core/entities/goal.entity";
import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { projectGoals } from "./goals.helper";
import { buildLimit } from "./limit.helper";
import { buildSeries, firstEstimatedMonth } from "./series.helper";
import { buildSlack, savingPace } from "./slack.helper";
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
  const slack = buildSlack(points, range.current);
  const pace = savingPace(slack);

  return {
    status: "ok",
    range,
    points,
    dashedFrom: firstEstimatedMonth(points),
    income: stats((point) => point.income),
    expense: stats((point) => point.expense),
    balance: stats((point) => point.balance),
    slack,
    pace,
    limit: buildLimit(points, goalCents),
    goals: projectGoals(goals, pace),
  };
}
