import { useState } from "react";

// The design caps both projection lists at eight rows before the toggle.
const CAP = 8;

// Shared by CeilingCard and LimitCard — the same behaviour, twice, so it is
// written once. Role-suffixed rather than `hook.ts`: a folder's hook.ts is
// called by its OWN index.tsx, and this one is called by two other components'
// hooks.
//
// `all` is returned, not just consumed: the chip is a disclosure button and
// owes the reader an `aria-expanded`, the way Aside's and Header's do.
export function useShowAll<T>(rows: T[]) {
  const [all, setAll] = useState(false);
  return {
    rows: all ? rows : rows.slice(0, CAP),
    label: all ? "Mostrar menos" : `Ver todos (${rows.length})`,
    // "There are rows hidden behind the toggle", i.e. render the button at all.
    // With a six-month range it is false: "Ver todos (6)" sitting above six
    // already-visible rows would be nonsense.
    hidden: rows.length > CAP,
    all,
    toggle: () => setAll((v) => !v),
  };
}
