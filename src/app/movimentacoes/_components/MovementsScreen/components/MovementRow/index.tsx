import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { formatCents } from "@/components/MoneyInput/money.helper";
import type { Movement } from "@/core/entities/movement.entity";
import type { Person } from "@/core/entities/person.entity";
import { formatYyyymm } from "@/lib/months";
import styles from "./style.module.scss";

type MovementRowProps = {
  movement: Movement;
  person?: Person;
  onEdit: () => void;
  onDelete: () => void;
};

export function MovementRow({
  movement,
  person,
  onEdit,
  onDelete,
}: MovementRowProps) {
  return (
    <li className={styles.row}>
      <span
        className={`${styles.swatch} ${person ? styles[person.color] : ""}`}
        aria-hidden
      />
      <span className={styles.owner}>{person?.name ?? "—"}</span>
      <span className={styles.name}>{movement.name}</span>
      <span className={`${styles.value} ${styles[movement.type]}`}>
        R$ {formatCents(movement.valueCents)}
      </span>
      <span className={styles.period}>{formatYyyymm(movement.month)}</span>
      <IconButton aria-label={`Editar ${movement.name}`} onClick={onEdit}>
        <Pencil size={16} aria-hidden />
      </IconButton>
      <IconButton
        variant="danger"
        aria-label={`Excluir ${movement.name}`}
        onClick={onDelete}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    </li>
  );
}
