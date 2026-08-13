import type { TooltipContent } from "./chart-tooltip.types.ts";

// The whole bubble, as one string, for the mark's accessible name.
//
// The bubble itself is `aria-hidden` and always was announced to nobody: it
// carried `role="tooltip"` with no element pointing at it, so its three rows
// reached no screen reader at all. Wiring `aria-describedby` across siblings
// would fix the plumbing; putting the same words in the mark's OWN name fixes the
// information, which is what was actually missing — entradas and saídas per month
// appear nowhere else on this screen, so a keyboard-only reader could not reach
// them by any route.
export function markLabel(tip: TooltipContent): string {
  const rows = tip.rows.map((row) => `${row.label} ${row.value}`);

  return [tip.title, tip.tag, ...rows].join(" · ");
}
