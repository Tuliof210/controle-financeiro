import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton/index.tsx";
import { type PersonRowProps, usePersonRow } from "./hook.ts";
import styles from "./style.module.scss";

// The same cells an entry row uses, tagged with the same grid areas, so RowGrid
// lays this out and paints its box identically. A person has no amount and no
// metadata line — those cells are simply absent, and an area no row fills costs
// the row nothing.
export function PersonRow(props: PersonRowProps) {
  const { name, swatchClass, onEdit, onDelete } = usePersonRow(props);

  return (
    <li>
      <span data-cell="who" className={swatchClass} aria-hidden />
      <span data-cell="main" className={styles.name}>
        {name}
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
    </li>
  );
}
