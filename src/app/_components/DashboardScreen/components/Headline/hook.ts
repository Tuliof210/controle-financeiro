import type { ReactNode } from "react";

// The figure itself is a ReactNode rather than a string: StatCard leads its with
// a ▲/▼ glyph, CeilingCard hangs its weekly and daily splits off it, and that is
// the only place the two diverge. `.squad/learnings.md`: one divergent rendering
// seam should be a ReactNode prop, not a generic.
export interface HeadlineProps {
  caption: string;
  tone?: "positive" | "negative";
  children: ReactNode;
}

export function useHeadline({ caption, tone, children }: HeadlineProps) {
  return { caption, tone, children };
}
