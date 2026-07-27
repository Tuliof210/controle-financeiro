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
  // A month past the current one: the figure is a projection, not history, so
  // the fill is hatched rather than solid. Derived by the card from
  // `month > range.current` — the payload marks no month itself.
  projected?: boolean;
};

export function useMeterRow({
  label,
  percent,
  tone,
  srLabel,
  children,
  projected,
}: MeterRowProps) {
  return {
    label,
    tone,
    srLabel,
    children,
    projected,
    // A 140% month must still read as 140% in text; only the fill clamps.
    fill: `${Math.min(100, Math.max(0, percent))}%`,
  };
}
