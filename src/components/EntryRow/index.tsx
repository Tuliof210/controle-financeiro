import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { type EntryRowProps, useEntryRow } from "./hook";
import styles from "./style.module.scss";

// Flat cells, no tier wrappers: the enclosing RowGrid places each one by its
// `data-cell` tag, which is what lets sibling rows share columns.
export function EntryRow(props: EntryRowProps) {
  const {
    name,
    swatchClass,
    valueClass,
    value,
    owner,
    period,
    onEdit,
    onDelete,
  } = useEntryRow(props);

  return (
    <li className={styles.row}>
      <span data-cell="swatch" className={swatchClass} aria-hidden />
      <span data-cell="name" className={styles.name}>
        {name}
      </span>
      <span data-cell="value" className={valueClass}>
        {value}
      </span>
      <span data-cell="owner" className={styles.owner}>
        {owner}
      </span>
      <span data-cell="period" className={styles.period}>
        {period}
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
