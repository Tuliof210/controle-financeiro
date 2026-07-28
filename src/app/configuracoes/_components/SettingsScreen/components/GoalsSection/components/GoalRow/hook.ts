import type { Goal } from "@/core/entities/goal.entity";

export type GoalRowProps = {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
};

// Nothing to derive — a pass-through keeps the folder shape uniform, the
// same reasoning RowLayout's own hook uses.
export function useGoalRow(props: GoalRowProps) {
  return props;
}
