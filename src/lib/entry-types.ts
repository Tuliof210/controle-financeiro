export const ENTRY_TYPES = ["income", "expense"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

// What every entry (forecast, movement, ...) has in common. The generic
// EntryRow/EntrySection/EntryScreen work off this shape; the period is the
// only part that differs per entity, so it is injected by the caller.
export type Entry = {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
};

// Shared UI mappings for the Entrada/Saída type of an entry.
export const TYPE_LABELS: Record<EntryType, string> = {
  income: "Entrada",
  expense: "Saída",
};
export const SELECTED_VARIANT = {
  income: "success",
  expense: "danger",
} as const;
