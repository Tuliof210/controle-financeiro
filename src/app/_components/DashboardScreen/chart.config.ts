// Geometry and styling shared by both charts, so the two line up on the same
// month positions and read as one component rather than two.

// `left` is derived per chart from its widest y label — see leftMargin in
// chart.helper.ts. A fixed value clipped "−R$ 20.000" once the balance went
// negative.
export const MARGIN = { top: 8, right: 8, bottom: 28 };

export const Y_TICKS = 4;
export const MAX_X_TICKS = 8;
export const BAND_PADDING = 0.25;

// visx renders plain SVG, so DS tokens go straight into presentation
// attributes — they resolve inside SVG and follow the runtime theme switch for
// free, with no library theme to override.
export const GRID_COLOR = "var(--color-border-subtle)";
const AXIS_COLOR = "var(--color-border)";

export const TICK_LABEL_PROPS = {
  fill: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
} as const;

export const axisProps = {
  stroke: AXIS_COLOR,
  tickStroke: AXIS_COLOR,
} as const;
