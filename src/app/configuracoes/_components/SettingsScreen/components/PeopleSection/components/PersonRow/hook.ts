import type { Person } from "@/core/entities/person.entity.ts";
import styles from "./style.module.scss";

export interface PersonRowProps {
  person: Person;
  // Take the person back rather than a pre-bound thunk: binding it in the
  // caller's JSX is a closure rebuilt on every render of the whole list.
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export function usePersonRow({ person, onEdit, onDelete }: PersonRowProps) {
  return {
    onEdit: () => onEdit(person),
    onDelete: () => onDelete(person),
    name: person.name,
    // The swatch colour is a CSS-Modules string lookup; resolving it here
    // keeps index.tsx free of the concatenation, as EntryRow's hook does.
    swatchClass: `${styles.swatch} ${styles[person.color]}`,
  };
}
