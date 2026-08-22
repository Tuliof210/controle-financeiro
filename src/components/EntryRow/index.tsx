import { Icon } from "@/components/Icon/index.tsx";
import { IconButton } from "@/components/IconButton/index.tsx";
import { type EntryRowProps, useEntryRow } from "./hook.ts";
import styles from "./style.module.scss";

// Four cells, each tagged with the grid area RowGrid places it in: the owner
// chip, the name-plus-metadata block, the amount, and the action pair. Owner
// and period live inside `main` — a muted line under the name (and under the
// optional badges row a forecast inserts between the two).
export function EntryRow(props: EntryRowProps) {
  const {
    name,
    chipClass,
    initial,
    valueClass,
    value,
    owner,
    period,
    badges,
    band,
    onEdit,
    onDelete,
  } = useEntryRow(props);

  return (
    <li>
      {/* aria-hidden: the initial only re-states the owner name that the
          metadata line below spells out in full, so announcing it would prefix
          every row's accessible name with a stray letter. */}
      <span data-cell="who" className={chipClass} aria-hidden={true}>
        {initial}
      </span>
      <span data-cell="main" className={styles.main}>
        <span className={styles.name}>{name}</span>
        {badges}
        <span className={styles.meta}>
          <span className={styles.owner}>{owner}</span>
          <span className={styles.separator} aria-hidden={true} />
          <span className={styles.period}>{period}</span>
        </span>
      </span>
      <span data-cell="amt" className={valueClass}>
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
      {Boolean(band) && <span data-cell="bar">{band}</span>}
    </li>
  );
}
