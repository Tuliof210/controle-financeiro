import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/IconButton";
import { formatCents } from "@/lib/money";
import type { Person } from "@/core/entities/person.entity";
import type { Entry } from "@/lib/entry-types";
import styles from "./style.module.scss";

type EntryRowProps = {
  entry: Entry;
  person?: Person;
  // Already-formatted period cell — the one part that differs per entity
  // (a recurrence's month intervals vs a movement's single month).
  period: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export function EntryRow({
  entry,
  person,
  period,
  onEdit,
  onDelete,
}: EntryRowProps) {
  return (
    <li className={styles.row}>
      <span
        className={`${styles.swatch} ${person ? styles[person.color] : ""}`}
        aria-hidden
      />
      <span className={styles.owner}>{person?.name ?? "—"}</span>
      <span className={styles.name}>{entry.name}</span>
      <span className={`${styles.value} ${styles[entry.type]}`}>
        R$ {formatCents(entry.valueCents)}
      </span>
      <span className={styles.period}>{period}</span>
      <IconButton aria-label={`Editar ${entry.name}`} onClick={onEdit}>
        <Pencil size={16} aria-hidden />
      </IconButton>
      <IconButton
        variant="danger"
        aria-label={`Excluir ${entry.name}`}
        onClick={onDelete}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    </li>
  );
}
