import type { Goal } from "@/core/entities/goal.entity";
import type { GoalProjection } from "./types";

// Goal carries no deadline, so the only question is how long each target takes
// at the current saving pace. Math.ceil: a wait always rounds UP, and a target
// smaller than one month's pace is still one month, never zero.
//
// pace of 0 means no month in the range leaves anything to put aside — the
// null is what the card renders as "inalcançável no ritmo atual".
export function projectGoals(goals: Goal[], pace: number): GoalProjection[] {
  return goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetCents: goal.targetCents,
    months: pace > 0 ? Math.ceil(goal.targetCents / pace) : null,
  }));
}
