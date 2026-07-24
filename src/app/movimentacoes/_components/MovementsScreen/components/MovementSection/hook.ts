import type { LucideIcon } from "lucide-react";
import type { Movement } from "@/core/entities/movement.entity";
import type { Person } from "@/core/entities/person.entity";

export type MovementSectionProps = {
  title: string;
  icon: LucideIcon;
  tone: "positive" | "negative";
  items: Movement[];
  people: Person[];
  onAdd: () => void;
  onEdit: (movement: Movement) => void;
  onDelete: (movement: Movement) => void;
};

// Resolves each row's owner once here, so MovementRow never refetches or
// re-searches the people list itself.
export function useMovementSection({
  title,
  icon,
  tone,
  items,
  people,
  onAdd,
  onEdit,
  onDelete,
}: MovementSectionProps) {
  const rows = items.map((movement) => ({
    movement,
    person: people.find((person) => person.id === movement.ownerId),
    onEdit: () => onEdit(movement),
    onDelete: () => onDelete(movement),
  }));

  return { title, icon, tone, rows, onAdd };
}
