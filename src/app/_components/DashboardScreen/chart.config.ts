// Geometry and styling shared by both charts, so the two line up on the same
// month positions and read as one component rather than two.

// Left is the widest: it has to clear a formatMoneyShort label like "R$ 1.234".
export const MARGIN = { top: 8, right: 8, bottom: 28, left: 68 };

export const Y_TICKS = 4;
export const MAX_X_TICKS = 8;

// visx renders plain SVG, so DS tokens go straight into presentation
// attributes — they resolve inside SVG and follow the runtime theme switch for
// free, with no library theme to override.
export const AXIS_COLOR = "var(--color-border)";
export const GRID_COLOR = "var(--color-border-subtle)";

export const TICK_LABEL_PROPS = {
  fill: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
} as const;

export const axisProps = {
  stroke: AXIS_COLOR,
  tickStroke: AXIS_COLOR,
} as const;
