import { useState } from "react";

// The design caps both projection lists at eight rows before the toggle.
const CAP = 8;

// The state-dependent half, kept pure so BOTH branches are testable:
// `renderHook` can only observe a hook's initial (collapsed) state.
export function showAllView<T>(rows: T[], all: boolean, cap = CAP) {
  return {
    rows: all ? rows : rows.slice(0, cap),
    label: all ? "Mostrar menos" : `Ver todos (${rows.length})`,
    // "There are rows hidden behind the toggle", i.e. render the button at all.
    // With a six-month range it is false: "Ver todos (6)" sitting above six
    // already-visible rows would be nonsense.
    hidden: rows.length > cap,
  };
}

// Shared by SlackCard and LimitCard — the same behaviour, twice, so it is
// written once. Role-suffixed rather than `hook.ts`: a folder's hook.ts is
// called by its OWN index.tsx, and this one is called by two other components'
// hooks.
export function useShowAll<T>(rows: T[], cap = CAP) {
  const [all, setAll] = useState(false);
  return { ...showAllView(rows, all, cap), toggle: () => setAll((v) => !v) };
}
