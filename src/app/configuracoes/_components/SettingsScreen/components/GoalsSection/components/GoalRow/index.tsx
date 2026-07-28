import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { RowLayout } from "@/components/RowLayout";
import { formatMoney } from "@/lib/money";
import { type GoalRowProps, useGoalRow } from "./hook";
import styles from "./style.module.scss";

export function GoalRow(props: GoalRowProps) {
  const { goal, onEdit, onDelete } = useGoalRow(props);

  return (
    <li className={styles.row}>
      <RowLayout
        primary={
          <>
            <span className={styles.name}>{goal.name}</span>
            <span className={styles.target}>
              {formatMoney(goal.targetCents)}
            </span>
          </>
        }
        actions={
          <>
            <IconButton aria-label={`Editar ${goal.name}`} onClick={onEdit}>
              <Pencil size={16} aria-hidden />
            </IconButton>
            <IconButton
              variant="danger"
              aria-label={`Excluir ${goal.name}`}
              onClick={onDelete}
            >
              <Trash2 size={16} aria-hidden />
            </IconButton>
          </>
        }
      />
    </li>
  );
}
