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
  // The month in view. Badged in words beside the label, because "solid rather
  // than hatched" is a fill pattern and not a label.
  current?: boolean;
  // Where a reference value falls on THIS row's axis, same 0..100 scale as
  // `percent`. Omitted leaves the marker out entirely; `markLabel` is what it
  // means, since a line drawn on a bar says nothing on its own.
  mark?: number;
  markLabel?: string;
};

export function useMeterRow({
  label,
  percent,
  tone,
  srLabel,
  children,
  projected,
  current,
  mark,
  markLabel,
}: MeterRowProps) {
  const clamp = (value: number) => Math.min(100, Math.max(0, value));

  return {
    label,
    tone,
    srLabel,
    children,
    projected,
    current,
    markLabel,
    // A 140% month must still read as 140% in text; only the fill clamps.
    fill: `${clamp(percent)}%`,
    // The marker is a 2px border on a zero-width box and the track clips its
    // overflow, so a flat `left: 100%` paints the whole border OUTSIDE the clip
    // box and draws nothing — precisely on the rows where the reference value is
    // above this row's own total, which is the reading it exists to give. The
    // `min()` holds the last 2px inside; at 0 it is a no-op.
    mark:
      mark === undefined
        ? null
        : `min(${clamp(mark)}%, calc(100% - var(--border-2)))`,
  };
}
