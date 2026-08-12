import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry } from "@/lib/entry-types.ts";
import { formatMoney } from "@/lib/money.ts";
import styles from "./style.module.scss";

interface EntryRowProps {
  entry: Entry;
  person?: Person;
  // Already-formatted period, the one part that differs per entity (a
  // forecast's month intervals vs a movement's single month). It reads in the
  // metadata line now, beside the owner, rather than in a column of its own.
  period: ReactNode;
  // The full-width band under the row, when the entity has one. Absent for a
  // movement, and absent for a forecast until a global period is saved — the
  // row must render no cell at all then, not an empty one.
  band?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

// With no person the chip keeps its box but drops the fill and the letter, so
// the rows around it stay aligned instead of one starting a chip-width left.
const chipFill = (color: string | undefined): string => {
  if (color === undefined) {
    return "";
  }
  return styles[color];
};

// Spread, not charAt: a name may legally start with an astral character (an
// emoji), which charAt would cut in half into a lone surrogate.
const initialOf = (name: string | undefined): string | null => {
  if (name === undefined) {
    return null;
  }
  const [head] = [...name.trim()];
  if (head === undefined) {
    return null;
  }
  return head.toUpperCase();
};

function useEntryRow({ entry, person, ...rest }: EntryRowProps) {
  const { color, name: owner = "—" } = person ?? {};

  return {
    ...rest,
    name: entry.name,
    // Chip colour and income/expense tint are both CSS-Modules string lookups;
    // resolving them here keeps index.tsx free of the concatenation.
    chipClass: `${styles.chip} ${chipFill(color)}`,
    initial: initialOf(person?.name),
    valueClass: `${styles.value} ${styles[entry.type]}`,
    value: formatMoney(entry.valueCents),
    owner,
  };
}

export type { EntryRowProps };
export { useEntryRow };
