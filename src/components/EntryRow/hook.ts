import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity";
import type { Entry } from "@/lib/entry-types";
import { formatMoney } from "@/lib/money";
import styles from "./style.module.scss";

export type EntryRowProps = {
  entry: Entry;
  person?: Person;
  // Already-formatted period cell — the one part that differs per entity
  // (a recurrence's month intervals vs a movement's single month).
  period: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export function useEntryRow({ entry, person, ...rest }: EntryRowProps) {
  return {
    ...rest,
    name: entry.name,
    // Swatch colour and income/expense tint are both CSS-Modules string
    // lookups; resolving them here keeps index.tsx free of the concatenation.
    swatchClass: `${styles.swatch} ${person ? styles[person.color] : ""}`,
    valueClass: `${styles.value} ${styles[entry.type]}`,
    value: formatMoney(entry.valueCents),
    owner: person?.name ?? "—",
  };
}
