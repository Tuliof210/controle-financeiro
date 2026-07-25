import type { Goal } from "@/core/entities/goal.entity";
import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { buildSeries, firstEstimatedMonth } from "./series.helper";
import { computeStats } from "./stats.helper";
import type { DashboardData, DashboardRange } from "./types";

type PayloadInput = {
  range: DashboardRange;
  months: number[];
  currentIndex: number;
  goals: Goal[];
  movements: Movement[];
  recurrences: Recurrence[];
};

// Assembles the "ok" payload from an already-validated range and
// already-owner-filtered entries. Kept out of service.ts so neither file
// approaches the 100-line cap once task 02 adds its four blocks.
export function buildPayload({
  range,
  months,
  currentIndex,
  goals,
  movements,
  recurrences,
}: PayloadInput): DashboardData {
  const points = buildSeries(months, movements, recurrences);
  const stats = (pick: (point: (typeof points)[number]) => number) =>
    computeStats(points.map(pick), currentIndex);

  return {
    status: "ok",
    range,
    points,
    dashedFrom: firstEstimatedMonth(points),
    income: stats((point) => point.income),
    expense: stats((point) => point.expense),
    balance: stats((point) => point.balance),
    // ponytail: task 02 fills these — declared empty so the contract the
    // screen consumes is already final and task 02 is a pure fill-in.
    slack: [],
    pace: 0,
    limit: { goalCents: null, months: [] },
    coverage: { committed: 0, recorded: 0, percent: null, months: [] },
    goals: goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetCents: goal.targetCents,
      months: null,
    })),
  };
}
