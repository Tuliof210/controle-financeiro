import type { Goal } from "@/core/entities/goal.entity.ts";
import { formatMoney } from "@/lib/money.ts";

export interface GoalRowProps {
  goal: Goal;
  // Take the goal back rather than a pre-bound thunk: binding it in the
  // caller's JSX is a closure rebuilt on every render of the whole list.
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export function useGoalRow({ goal, onEdit, onDelete }: GoalRowProps) {
  return {
    onEdit: () => onEdit(goal),
    onDelete: () => onDelete(goal),
    name: goal.name,
    value: formatMoney(goal.targetCents),
  };
}
