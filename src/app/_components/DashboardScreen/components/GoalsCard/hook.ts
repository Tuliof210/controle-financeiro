import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { goalLabel } from "../../list-cards.helper";

export type GoalsCardProps = { goals: GoalProjection[] };

export function useGoalsCard({ goals }: GoalsCardProps) {
  return {
    empty: goals.length === 0,
    // No meter here: months-to-target is a wait, not a share of anything.
    rows: goals.map((goal) => ({
      key: goal.id,
      name: goal.name,
      target: formatMoney(goal.targetCents),
      wait: goalLabel(goal.months),
      unreachable: goal.months === null,
    })),
  };
}
