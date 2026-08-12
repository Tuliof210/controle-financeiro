import {
  ENTRY_TYPES,
  type EntryType,
  SELECTED_VARIANT,
  TYPE_LABELS,
} from "@/lib/entry-types.ts";

interface TypeToggleProps {
  value: EntryType;
  onChange: (value: EntryType) => void;
}

// One option per entry type, each carrying the variant it renders with and its
// own bound handler — so index.tsx maps over ready values instead of building a
// closure per button in the JSX.
function useTypeToggle({ value, onChange }: TypeToggleProps) {
  return {
    options: ENTRY_TYPES.map((kind) => ({
      kind,
      label: TYPE_LABELS[kind],
      variant: kind === value ? SELECTED_VARIANT[kind] : ("ghost" as const),
      select: () => onChange(kind),
    })),
  };
}

export type { TypeToggleProps };
export { useTypeToggle };
