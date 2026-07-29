import { useState } from "react";

export function useAppShell() {
  // The rail collapses to an 80px icon strip from `md` up; it is never
  // removed from the DOM there. Below `md` it is hidden in favour of an
  // overlay drawer instead.
  const [collapsed, setCollapsed] = useState(false);
  // ponytail: no persistence; add localStorage when someone asks.
  return { collapsed, toggle: () => setCollapsed((c) => !c) };
}
