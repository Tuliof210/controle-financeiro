import type { ReactNode } from "react";

export type MeterRowProps = {
  label: string;
  // May exceed 100 — the bar clamps, the caller's text does not.
  percent: number;
  tone: "positive" | "negative";
  // What the bar means, in words. src/styles/README.md rule 7: meaning is
  // never colour-only, and a bar is a colour.
  srLabel: string;
  children: ReactNode;
};

export function useMeterRow({
  label,
  percent,
  tone,
  srLabel,
  children,
}: MeterRowProps) {
  return {
    label,
    tone,
    srLabel,
    children,
    // A 140% month must still read as 140% in text; only the fill clamps.
    fill: `${Math.min(100, Math.max(0, percent))}%`,
  };
}
