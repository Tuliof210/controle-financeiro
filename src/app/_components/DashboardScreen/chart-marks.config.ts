// The marks layered behind and over the plot: the projected wash and its rule,
// and the filled tags. Split off chart.config.ts for the 100-line cap.
import { AXIS_COLOR } from "./chart.config.ts";

// A wash, not a signal: --color-surface-raised over the card's --color-surface
// is ~1.13:1 in the light theme. What actually says "projected" is the dashed
// rule on its leading edge and the tag beside it, both measured below.
const PROJECTED_BAND_FILL = "var(--color-surface-raised)";

const projectedRuleProps = {
  stroke: AXIS_COLOR,
  strokeWidth: 2,
  strokeDasharray: "6 5",
} as const;

const TIGHTEST_RULE_DASHARRAY = "4 4";

// An SVG geometry attribute cannot resolve a custom property, so the bar's
// corner is a number rather than --radius-sm. It is the target's 3, half the 6px
// the token layer puts on a chip: on a ~20px-wide bar the 6 reads as a lozenge.
const BAR_RADIUS = 3;

// A projected bar is an OUTLINE, not just a paler fill. The dashed contour is
// the channel that survives greyscale (README rule 7c, and the target's own
// brand rule); the wash inside it is reinforcement only. A real bar carries the
// same stroke at zero opacity, so the two share one geometry and only the
// opacities move between them.
const BAR_STROKE = { strokeWidth: 1.5, strokeDasharray: "3 3" } as const;
const ESTIMATED_BAR = {
  fillOpacity: "var(--opacity-data-wash)",
  strokeOpacity: 1,
} as const;
const REAL_BAR = { fillOpacity: 1, strokeOpacity: 0 } as const;

// A SIMULATED month gets its own contour, not the projected one. PRODUCT.md says
// projected, real and simulated must never read as the same kind of fact, and a
// what-if used to draw exactly like a committed forecast.
//
// DOTTED against the projection's DASHED: told apart by pattern rather than hue,
// the same reasoning the dashed contour exists for at all. Only the dash array
// changes — the width and the wash stay, so a simulated bar still reads as an
// outline of the same family rather than as a different chart.
const SIMULATED_DASHARRAY = "1 3";
const SIMULATED_BAR = {
  fillOpacity: "var(--opacity-data-wash)",
  strokeOpacity: 1,
  strokeDasharray: SIMULATED_DASHARRAY,
} as const;

// Filled tags. Each pairs a fill with the token that is already its counterpart,
// so the two flip together and one measurement covers both themes:
//   --color-text-muted on --color-bg  ->  7.26:1 light,  7.30:1 dark
//   --color-caution    on --color-bg  ->  5.87:1 light,  8.10:1 dark
// Both texts are --color-bg: the fills are themed, so the ink has to flip with
// them. The caution tag used a fixed dark ink and measured 3.31:1 in the light
// theme, where --color-caution resolves to the DARK end of its ramp.
const TAG_TONES = {
  muted: { fill: "var(--color-text-muted)", text: "var(--color-bg)" },
  caution: { fill: "var(--color-caution)", text: "var(--color-bg)" },
} as const;

const TAG_LABEL_PROPS = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-wide)",
} as const;

// IBM Plex Mono at --text-2xs, MEASURED in the browser: 6.60px per character
// plain, 8.14px once TAG_LABEL_PROPS' --tracking-wide (0.14em) is added — and
// it is the tracked figure that sizes this box. Rounded up: a tag box a pixel
// wide is invisible, a tag box a pixel short clips its own label, and nothing
// in the suite catches either. Higher than chart-gutter's CHAR_PX for exactly
// that reason — the axis labels are not tracked.
// A tag measures its own box from its own label, so no per-label pixel width is
// hand-written.
const TAG_CHAR_PX = 9;
const TAG_PAD_X = 8;
const TAG_HEIGHT = 20;

export {
  BAR_RADIUS,
  BAR_STROKE,
  ESTIMATED_BAR,
  PROJECTED_BAND_FILL,
  projectedRuleProps,
  REAL_BAR,
  SIMULATED_BAR,
  SIMULATED_DASHARRAY,
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_LABEL_PROPS,
  TAG_PAD_X,
  TAG_TONES,
  TIGHTEST_RULE_DASHARRAY,
};
