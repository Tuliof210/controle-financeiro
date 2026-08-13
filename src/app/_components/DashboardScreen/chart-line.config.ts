// How the cumulative curve is painted: the stroke, the wash under it and the
// crosshair through the hovered month. Split off `chart-marks.config.ts`, which
// now holds only what the BAR chart draws, for the 100-line cap.
//
// Every colour is a token string handed to SVG as a presentation attribute — it
// resolves inside the SVG and follows the runtime theme switch with no JS, which
// is why nothing here reads getComputedStyle.
//
// --cat-cyan, not --color-brand. This curve is DATA, and the Rationed Cobalt Rule
// gives cobalt to action, focus and the mark — a second cobalt element on a screen
// means one of them is wrong, and this one was ~40 of them. The category ramp is
// specified for exactly this: hues distinguishable from each other AND from
// cobalt. Fixed across themes, like every --cat-* (they have no dark counterpart),
// which is what a category hue wants — the series must not change identity when
// the theme does.

const LINE_PROPS = { stroke: "var(--cat-cyan)", strokeWidth: 2 } as const;

// Shape, not opacity: the dash IS what says "projection" once the chart is read
// in greyscale. Much heavier than the crosshair's below, so the two never blur
// into each other.
const PROJECTED_LINE_DASHARRAY = "8 6";

// Rides ChartFrame's `background` slot, so it lands under the gridlines: a fill
// behind the line, not a mark of its own.
const areaWashProps = {
  fill: "var(--cat-cyan)",
  fillOpacity: "var(--opacity-data-wash)",
  stroke: "none",
} as const;

// A dashed hairline at half alpha — it points at the hovered month without
// competing with the projected path's own dashes.
const crosshairProps = {
  stroke: "var(--cat-cyan)",
  strokeWidth: 1,
  strokeDasharray: "3 4",
  strokeOpacity: 0.5,
} as const;

export { areaWashProps, crosshairProps, LINE_PROPS, PROJECTED_LINE_DASHARRAY };
