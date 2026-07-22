import { useState } from "react";

export function useAppShell() {
  const [open, setOpen] = useState(true);
  // ponytail: no persistence; add localStorage when someone asks.
  return { open, toggle: () => setOpen((o) => !o) };
}
