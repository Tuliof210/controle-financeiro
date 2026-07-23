import type { LucideIcon } from "lucide-react";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";

export type RecurrenceSectionProps = {
  title: string;
  icon: LucideIcon;
  items: Recurrence[];
  people: Person[];
  onAdd: () => void;
  onEdit: (recurrence: Recurrence) => void;
  onDelete: (recurrence: Recurrence) => void;
};

// Resolves each row's owner once here, so RecurrenceRow never refetches or
// re-searches the people list itself.
export function useRecurrenceSection({
  title,
  icon,
  items,
  people,
  onAdd,
  onEdit,
  onDelete,
}: RecurrenceSectionProps) {
  const rows = items.map((recurrence) => ({
    recurrence,
    person: people.find((person) => person.id === recurrence.ownerId),
    onEdit: () => onEdit(recurrence),
    onDelete: () => onDelete(recurrence),
  }));

  return { title, icon, rows, onAdd };
}
