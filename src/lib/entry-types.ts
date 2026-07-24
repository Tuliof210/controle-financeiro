export const ENTRY_TYPES = ["income", "expense"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

// Shared UI mappings for the Entrada/Saída type of an entry.
export const TYPE_LABELS: Record<EntryType, string> = {
  income: "Entrada",
  expense: "Saída",
};
export const SELECTED_VARIANT = {
  income: "success",
  expense: "danger",
} as const;
