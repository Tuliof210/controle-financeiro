import type { ReactNode } from "react";

// The figure is a ReactNode rather than a string: CeilingCard leads with
// MoneyDisplay, and a pre-formatted string has no cents span.
export interface HeadlineProps {
  caption: string;
  tone?: "positive" | "negative";
  children: ReactNode;
}

export function useHeadline({ caption, tone, children }: HeadlineProps) {
  return { caption, tone, children };
}
