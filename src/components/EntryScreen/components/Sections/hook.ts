import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import type { EntryScreenLabels } from "../../types.ts";

export interface SectionsProps<T extends Entry> {
  labels: EntryScreenLabels;
  income: T[];
  expense: T[];
  people: Person[];
  period: Period | null;
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  renderBadges?: (item: T, period: Period | null) => ReactNode;
  renderBand?: (item: T, period: Period | null) => ReactNode;
  onAdd: (kind: EntryType) => void;
  onEdit: (entry: T) => void;
  onDelete: (entry: T) => void;
}

// One array instead of two near-identical JSX blocks — Entradas/Saídas differ
// only in the fields below; people/period/renderPeriod/renderBadges/renderBand/
// onEdit/onDelete thread to both unchanged.
export function useSections<T extends Entry>({
  labels,
  income,
  expense,
  people,
  period,
  renderPeriod,
  renderBadges,
  renderBand,
  onAdd,
  onEdit,
  onDelete,
}: SectionsProps<T>) {
  const shared = {
    people,
    period,
    renderPeriod,
    renderBadges,
    renderBand,
    onEdit,
    onDelete,
  };
  return {
    sections: [
      {
        key: "income",
        title: "Entradas",
        icon: "arrowDownCircle",
        tone: "positive" as const,
        items: income,
        labels: labels.income,
        onAdd: () => onAdd("income"),
        ...shared,
      },
      {
        key: "expense",
        title: "Saídas",
        icon: "arrowUpCircle",
        tone: "negative" as const,
        items: expense,
        labels: labels.expense,
        onAdd: () => onAdd("expense"),
        ...shared,
      },
    ],
  };
}
