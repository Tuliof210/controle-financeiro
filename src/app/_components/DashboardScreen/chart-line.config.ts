// How the cumulative curve is painted: the stroke, the wash under it and the
// crosshair through the hovered month. Split off `chart-marks.config.ts`, which
// now holds only what the BAR chart draws, for the 100-line cap.
//
// Every colour is a token string handed to SVG as a presentation attribute — it
// resolves inside the SVG and follows the runtime theme switch with no JS, which
// is why nothing here reads getComputedStyle.

const LINE_PROPS = { stroke: "var(--color-brand)", strokeWidth: 2 } as const;

// Shape, not opacity: the dash IS what says "projection" once the chart is read
// in greyscale. Much heavier than the crosshair's below, so the two never blur
// into each other.
const PROJECTED_LINE_DASHARRAY = "8 6";

// Rides ChartFrame's `background` slot, so it lands under the gridlines: a fill
// behind the line, not a mark of its own.
const areaWashProps = {
  fill: "var(--color-brand)",
  fillOpacity: "var(--opacity-data-wash)",
  stroke: "none",
} as const;

// A dashed hairline at half alpha — it points at the hovered month without
// competing with the projected path's own dashes.
const crosshairProps = {
  stroke: "var(--color-brand)",
  strokeWidth: 1,
  strokeDasharray: "3 4",
  strokeOpacity: 0.5,
} as const;

export { areaWashProps, crosshairProps, LINE_PROPS, PROJECTED_LINE_DASHARRAY };
