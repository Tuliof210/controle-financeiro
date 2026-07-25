import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity";
import type { Entry } from "@/lib/entry-types";

export type EntrySectionProps<T extends Entry> = {
  title: string;
  icon: LucideIcon;
  tone: "positive" | "negative";
  items: T[];
  people: Person[];
  empty: string;
  renderPeriod: (item: T) => ReactNode;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
};

// Resolves each row's owner and period once here, so EntryRow never refetches or
// re-searches the people list itself.
export function useEntrySection<T extends Entry>({
  title,
  icon,
  tone,
  items,
  people,
  empty,
  renderPeriod,
  onAdd,
  onEdit,
  onDelete,
}: EntrySectionProps<T>) {
  const rows = items.map((item) => ({
    entry: item,
    person: people.find((person) => person.id === item.ownerId),
    period: renderPeriod(item),
    onEdit: () => onEdit(item),
    onDelete: () => onDelete(item),
  }));

  return { title, icon, tone, rows, empty, onAdd };
}
