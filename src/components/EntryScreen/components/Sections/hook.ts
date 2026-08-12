import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import type { EntryScreenLabels } from "../../types.ts";

export type SectionsProps<T extends Entry> = {
  labels: EntryScreenLabels;
  income: T[];
  expense: T[];
  people: Person[];
  period: Period | null;
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  renderBand?: (item: T, period: Period | null) => ReactNode;
  onAdd: (kind: EntryType) => void;
  onEdit: (entry: T) => void;
  onDelete: (entry: T) => void;
};

// One array instead of two near-identical JSX blocks — Entradas/Saídas differ
// only in the fields below; people/period/renderPeriod/renderBand/onEdit/
// onDelete thread to both unchanged.
export function useSections<T extends Entry>({
  labels,
  income,
  expense,
  people,
  period,
  renderPeriod,
  renderBand,
  onAdd,
  onEdit,
  onDelete,
}: SectionsProps<T>) {
  const shared = { people, period, renderPeriod, renderBand, onEdit, onDelete };
  return {
    sections: [
      {
        key: "income",
        title: "Entradas",
        icon: ArrowDownCircle,
        tone: "positive" as const,
        items: income,
        labels: labels.income,
        onAdd: () => onAdd("income"),
        ...shared,
      },
      {
        key: "expense",
        title: "Saídas",
        icon: ArrowUpCircle,
        tone: "negative" as const,
        items: expense,
        labels: labels.expense,
        onAdd: () => onAdd("expense"),
        ...shared,
      },
    ],
  };
}
