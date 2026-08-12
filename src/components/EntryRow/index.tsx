import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton/index.tsx";
import { type EntryRowProps, useEntryRow } from "./hook.ts";
import styles from "./style.module.scss";

// Four cells, each tagged with the grid area RowGrid places it in: the owner
// chip, the name-plus-metadata block, the amount, and the action pair. Owner
// and period live inside `main` now — they read as one muted line under the
// name instead of claiming two columns of their own.
export function EntryRow(props: EntryRowProps) {
  const {
    name,
    chipClass,
    initial,
    valueClass,
    value,
    owner,
    period,
    band,
    onEdit,
    onDelete,
  } = useEntryRow(props);

  return (
    <li>
      {/* aria-hidden: the initial only re-states the owner name that the
          metadata line below spells out in full, so announcing it would prefix
          every row's accessible name with a stray letter. */}
      <span data-cell="who" className={chipClass} aria-hidden>
        {initial}
      </span>
      <span data-cell="main" className={styles.main}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>
          <span className={styles.owner}>{owner}</span>
          <span className={styles.separator} aria-hidden />
          <span className={styles.period}>{period}</span>
        </span>
      </span>
      <span data-cell="amt" className={valueClass}>
        {value}
      </span>
      <span data-cell="act">
        <IconButton aria-label={`Editar ${name}`} onClick={onEdit}>
          <Pencil size={14} aria-hidden />
        </IconButton>
        <IconButton
          variant="danger"
          aria-label={`Excluir ${name}`}
          onClick={onDelete}
        >
          <Trash2 size={14} aria-hidden />
        </IconButton>
      </span>
      {band ? <span data-cell="bar">{band}</span> : null}
    </li>
  );
}
