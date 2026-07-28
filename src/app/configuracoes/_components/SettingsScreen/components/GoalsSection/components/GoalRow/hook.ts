import type { Goal } from "@/core/entities/goal.entity";
import { formatMoney } from "@/lib/money";

export type GoalRowProps = {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
};

export function useGoalRow({ goal, ...rest }: GoalRowProps) {
  return {
    ...rest,
    name: goal.name,
    value: formatMoney(goal.targetCents),
  };
}
