import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import type { Person } from "@/core/entities/person.entity";
import styles from "./style.module.scss";

type PersonRowProps = {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
};

export function PersonRow({ person, onEdit, onDelete }: PersonRowProps) {
  return (
    <li className={styles.row}>
      <span
        className={`${styles.swatch} ${styles[person.color]}`}
        aria-hidden
      />
      <span className={styles.name}>{person.name}</span>
      <IconButton aria-label={`Editar ${person.name}`} onClick={onEdit}>
        <Pencil size={16} aria-hidden />
      </IconButton>
      <IconButton
        variant="danger"
        aria-label={`Excluir ${person.name}`}
        onClick={onDelete}
      >
        <Trash2 size={16} aria-hidden />
      </IconButton>
    </li>
  );
}
