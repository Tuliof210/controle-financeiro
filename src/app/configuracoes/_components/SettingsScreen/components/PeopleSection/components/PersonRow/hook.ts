import type { Person } from "@/core/entities/person.entity";

export type PersonRowProps = {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
};

// Nothing to derive — a pass-through keeps the folder shape uniform, the
// same reasoning RowLayout's own hook uses.
export function usePersonRow(props: PersonRowProps) {
  return props;
}
