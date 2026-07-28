import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { type GoalRowProps, useGoalRow } from "./hook";
import styles from "./style.module.scss";

// Flat cells, no tier wrappers: the enclosing RowGrid places each one by its
// `data-cell` tag. A goal has no swatch, owner or period — those cells are
// simply absent, and the list gives their columns no width.
export function GoalRow(props: GoalRowProps) {
  const { name, value, onEdit, onDelete } = useGoalRow(props);

  return (
    <li className={styles.row}>
      <span data-cell="name" className={styles.name}>
        {name}
      </span>
      <span data-cell="value" className={styles.value}>
        {value}
      </span>
      <span data-cell="actions" className={styles.actions}>
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
