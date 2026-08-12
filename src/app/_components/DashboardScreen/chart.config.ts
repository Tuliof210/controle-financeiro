import { formatMoneyShort, formatMoneyShortK } from "@/lib/money.ts";

// Geometry and styling shared by both charts, so the two line up on the same
// month positions and read as one component rather than two.

// `left` is derived per chart from its widest y label — see leftMargin in
// chart.helper.ts. A fixed value clipped "−R$ 20.000" once the balance went
// negative.
const MARGIN = { top: 8, right: 8, bottom: 28 };

const Y_TICKS = 4;
const BAND_PADDING = 0.25;

// Below this measured plot width (ChartCard's own box, not the viewport —
// see chart-frame.helper.ts) the chart windows to 6 months and switches the Y
// axis to compact "K" labels; at or above it, 12 months and the full
// formatter. Measured (not assumed): ChartCard's box is 291px at a 375px
// viewport and 884px at 1280px, so 768px — $breakpoints.md in
// src/styles/_theme.scss — sits comfortably between the two with room either
// side. Re-measure both before moving this number; it is not the viewport
// width.
const DESKTOP_PLOT_WIDTH = 768;
const MONTHS_DESKTOP = 12;
const MONTHS_MOBILE = 6;

const isDesktopWidth = (width: number): boolean => width >= DESKTOP_PLOT_WIDTH;

const monthWindowSize = (width: number): number => {
  if (isDesktopWidth(width)) {
    return MONTHS_DESKTOP;
  }
  return MONTHS_MOBILE;
};

// Same width-based choice as monthWindowSize, for what the Y axis actually
// draws: below the desktop plot width, formatMoneyShort's full grouped
// digits ("R$ 12.345") are too wide for the gutter, so both charts drop to
// the compact "K" form instead. Shared here so buildFrame's gutter sizing
// and ChartFrame's rendered labels can never disagree on which format is on
// screen at a given width.
const tickFormatterFor = (width: number) => {
  if (isDesktopWidth(width)) {
    return formatMoneyShort;
  }
  return formatMoneyShortK;
};

// visx renders plain SVG, so DS tokens go straight into presentation
// attributes — they resolve inside SVG and follow the runtime theme switch for
// free, with no library theme to override.
const GRID_COLOR = "var(--color-border-subtle)";
const AXIS_COLOR = "var(--color-border)";

const TICK_LABEL_PROPS = {
  fill: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
} as const;

const axisProps = {
  stroke: AXIS_COLOR,
  tickStroke: AXIS_COLOR,
} as const;

export {
  AXIS_COLOR,
  axisProps,
  BAND_PADDING,
  GRID_COLOR,
  isDesktopWidth,
  MARGIN,
  MONTHS_DESKTOP,
  MONTHS_MOBILE,
  monthWindowSize,
  TICK_LABEL_PROPS,
  tickFormatterFor,
  Y_TICKS,
};
