import type { Goal } from "@/core/entities/goal.entity.ts";
import { formatMoney } from "@/lib/money.ts";

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
