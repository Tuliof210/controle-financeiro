import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoneyShort } from "@/lib/money";
import { paceLabel } from "./timeline.helper";

export type GoalCardProps = { goal: GoalProjection };

// The three funding assumptions, in the order they answer the question: what if
// this goal had the whole capacity, what if it shared it with the others, what
// if it had all of it but only once every cheaper goal was funded.
const METRICS = [
  ["dedicated", "DEDICADO"],
  ["parallel", "EM PARALELO"],
  ["serialized", "UM DE CADA VEZ"],
] as const;

// Calls no React hook, despite the `use` prefix the convention gives it.
export function useGoalCard({ goal }: GoalCardProps) {
  return {
    name: goal.name,
    target: formatMoneyShort(goal.targetCents),
    // Mapped rather than three near-identical blocks in the JSX: repeating one
    // <div><dt/><dd/></div> three times is what the recursion rule answers with
    // a whole child component folder, and a list is the smaller answer.
    metrics: METRICS.map(([key, label]) => ({
      key,
      label,
      value: paceLabel(goal[key]),
    })),
  };
}
