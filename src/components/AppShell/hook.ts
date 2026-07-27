import { useState } from "react";

export function useAppShell() {
  // The rail collapses to an 80px icon strip; it is never removed from the DOM
  // at desktop width. Below `md` CSS hides it entirely and BottomNav takes over.
  const [collapsed, setCollapsed] = useState(false);
  // ponytail: no persistence; add localStorage when someone asks.
  return { collapsed, toggle: () => setCollapsed((c) => !c) };
}
