import type { Person } from "@/core/entities/person.entity.ts";
import styles from "./style.module.scss";

export interface PersonRowProps {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}

export function usePersonRow({ person, ...rest }: PersonRowProps) {
  return {
    ...rest,
    name: person.name,
    // The swatch colour is a CSS-Modules string lookup; resolving it here
    // keeps index.tsx free of the concatenation, as EntryRow's hook does.
    swatchClass: `${styles.swatch} ${styles[person.color]}`,
  };
}
