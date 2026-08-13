import { ENTRY_TYPES, type EntryType, TYPE_LABELS } from "@/lib/entry-types.ts";

interface TypeToggleProps {
  value: EntryType;
  onChange: (value: EntryType) => void;
}

// One option per entry type, each carrying whether it is the current choice and
// its own bound handler — so index.tsx maps over ready values instead of
// building a closure per input in the JSX.
//
// The variant each option used to carry is gone with SELECTED_VARIANT: the
// selection was painted `success`/`danger`, which said "expense" in the same
// red as "delete forever" and left the state readable by colour alone. It is a
// radio group now, so `checked` is the state and the browser announces it.
function useTypeToggle({ value, onChange }: TypeToggleProps) {
  return {
    // A constant name is enough: the form lives in a modal and only one is ever
    // mounted. Two on a page would share a group and fight.
    name: "entry-type",
    options: ENTRY_TYPES.map((kind) => ({
      kind,
      label: TYPE_LABELS[kind],
      checked: kind === value,
      select: () => onChange(kind),
    })),
  };
}

export type { TypeToggleProps };
export { useTypeToggle };
