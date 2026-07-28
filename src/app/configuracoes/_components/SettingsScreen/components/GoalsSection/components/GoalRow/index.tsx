import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { type GoalRowProps, useGoalRow } from "./hook";
import styles from "./style.module.scss";

// Two halves: the data block and the controls. RowGrid places each cell inside
// the data half by its `data-cell` tag. A goal has no swatch, owner or period —
// those cells are simply absent, and the list gives their columns no width.
export function GoalRow(props: GoalRowProps) {
  const { name, value, onEdit, onDelete } = useGoalRow(props);

  return (
    <li className={styles.row}>
      <span data-row="data">
        <span data-cell="name" className={styles.name}>
          {name}
        </span>
        <span data-cell="value" className={styles.value}>
          {value}
        </span>
      </span>
      <span data-row="controls">
        <IconButton aria-label={`Editar ${name}`} onClick={onEdit}>
          <Pencil size={16} aria-hidden />
        </IconButton>
        <IconButton
          variant="danger"
          aria-label={`Excluir ${name}`}
          onClick={onDelete}
        >
          <Trash2 size={16} aria-hidden />
        </IconButton>
      </span>
    </li>
  );
}
