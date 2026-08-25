import { Icon } from "@/components/Icon/index.tsx";
import { IconButton } from "@/components/IconButton/index.tsx";
import { type GoalRowProps, useGoalRow } from "./hook.ts";
import styles from "./style.module.scss";

// The same cells an entry row uses, tagged with the same grid areas. A goal has
// no chip and no metadata line, so the `who` area takes no width at all and the
// name starts flush at the row's edge.
//
// The design draws only an edit button here, and a percentage badge beside the
// amount. The badge would need progress-per-goal, which this app does not model;
// dropping the delete button would take away an action that works today.
export function GoalRow(props: GoalRowProps) {
  const { name, value, onEdit, onDelete } = useGoalRow(props);

  return (
    <li>
      <span data-cell="main" className={styles.name}>
        {name}
      </span>
      <span data-cell="amt" className={styles.value}>
        {value}
      </span>
      <span data-cell="act">
        <IconButton aria-label={`Editar ${name}`} onClick={onEdit}>
          <Icon name="pencil" size={14} />
        </IconButton>
        <IconButton
          variant="destructive"
          aria-label={`Excluir ${name}`}
          onClick={onDelete}
        >
          <Icon name="trash" size={14} />
        </IconButton>
      </span>
    </li>
  );
}
