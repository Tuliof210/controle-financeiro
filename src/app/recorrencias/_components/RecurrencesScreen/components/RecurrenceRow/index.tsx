import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { formatCents } from "@/components/MoneyInput/money.helper";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { formatMonths } from "../../recurrence-range.helper";
import styles from "./style.module.scss";

type RecurrenceRowProps = {
  recurrence: Recurrence;
  person?: Person;
  onEdit: () => void;
  onDelete: () => void;
};

export function RecurrenceRow({
  recurrence,
  person,
  onEdit,
  onDelete,
}: RecurrenceRowProps) {
  return (
    <li className={styles.row}>
      <span
        className={`${styles.swatch} ${person ? styles[person.color] : ""}`}
        aria-hidden
      />
      <span className={styles.owner}>{person?.name ?? "—"}</span>
      <span className={styles.name}>{recurrence.name}</span>
      <span className={`${styles.value} ${styles[recurrence.type]}`}>
        R$ {formatCents(recurrence.valueCents)}
      </span>
      <span className={styles.period}>{formatMonths(recurrence.months)}</span>
      <IconButton aria-label={`Editar ${recurrence.name}`} onClick={onEdit}>
        <Pencil size={16} aria-hidden />
      </IconButton>
      <IconButton
        variant="danger"
        aria-label={`Excluir ${recurrence.name}`}
        onClick={onDelete}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    </li>
  );
}
