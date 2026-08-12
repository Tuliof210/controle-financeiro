import { formatMoneyShort, formatMoneyShortK } from "@/lib/money.ts";

// Geometry and styling shared by both charts, so the two line up on the same
// month positions and read as one component rather than two.

// `left` is derived per chart from its widest y label — see leftMargin in
// chart.helper.ts. A fixed value clipped "−R$ 20.000" once the balance went
// negative.
export const MARGIN = { top: 8, right: 8, bottom: 28 };

export const Y_TICKS = 4;
export const BAND_PADDING = 0.25;

// Below this measured plot width (ChartCard's own box, not the viewport —
// see chart-frame.helper.ts) the chart windows to 6 months and switches the Y
// axis to compact "K" labels; at or above it, 12 months and the full
// formatter. Measured (not assumed): ChartCard's box is 291px at a 375px
// viewport and 884px at 1280px, so 768px — $breakpoints.md in
// src/styles/_theme.scss — sits comfortably between the two with room either
// side. Re-measure both before moving this number; it is not the viewport
// width.
const DESKTOP_PLOT_WIDTH = 768;
export const MONTHS_DESKTOP = 12;
export const MONTHS_MOBILE = 6;

export const isDesktopWidth = (width: number): boolean =>
  width >= DESKTOP_PLOT_WIDTH;

export const monthWindowSize = (width: number): number =>
  isDesktopWidth(width) ? MONTHS_DESKTOP : MONTHS_MOBILE;

// Same width-based choice as monthWindowSize, for what the Y axis actually
// draws: below the desktop plot width, formatMoneyShort's full grouped
// digits ("R$ 12.345") are too wide for the gutter, so both charts drop to
// the compact "K" form instead. Shared here so buildFrame's gutter sizing
// and ChartFrame's rendered labels can never disagree on which format is on
// screen at a given width.
export const tickFormatterFor = (width: number) =>
  isDesktopWidth(width) ? formatMoneyShort : formatMoneyShortK;

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

// ---- Marks layered behind and over the plot --------------------------------

// A wash, not a signal: --color-surface-raised over the card's --color-surface
// is ~1.13:1 in the light theme. What actually says "projected" is the dashed
// rule on its leading edge and the tag beside it, both measured below.
export const PROJECTED_BAND_FILL = "var(--color-surface-raised)";

export const projectedRuleProps = {
  stroke: AXIS_COLOR,
  strokeWidth: 2,
  strokeDasharray: "6 5",
} as const;

export const TIGHTEST_RULE_DASHARRAY = "4 4";

// Filled tags. Each pairs a fill with the token that is already its counterpart,
// so the two flip together and one measurement covers both themes:
//   --color-text-muted on --color-bg  ->  5.26:1 light,  7.30:1 dark
//   --color-caution    on --ink-900   ->  9.38:1 light, 11.13:1 dark
export const TAG_TONES = {
  muted: { fill: "var(--color-text-muted)", text: "var(--color-bg)" },
  caution: { fill: "var(--color-caution)", text: "var(--ink-900)" },
} as const;

export const TAG_LABEL_PROPS = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-wide)",
} as const;

// JetBrains Mono at --text-2xs runs ~6px/char — the same figure
// chart-frame.helper keeps privately to size the axis gutter. A tag measures its
// own box from its own label, so no per-label pixel width is hand-written.
export const TAG_CHAR_PX = 6;
export const TAG_PAD_X = 8;
export const TAG_HEIGHT = 20;
