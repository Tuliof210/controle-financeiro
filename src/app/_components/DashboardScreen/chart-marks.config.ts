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

// Filled tags. Each pairs a fill with the token that is already its counterpart,
// so the two flip together and one measurement covers both themes:
//   --color-text-muted on --color-bg  ->  5.26:1 light,  7.30:1 dark
//   --color-caution    on --ink-900   ->  9.38:1 light, 11.13:1 dark
const TAG_TONES = {
  muted: { fill: "var(--color-text-muted)", text: "var(--color-bg)" },
  caution: { fill: "var(--color-caution)", text: "var(--ink-900)" },
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
  PROJECTED_BAND_FILL,
  projectedRuleProps,
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_LABEL_PROPS,
  TAG_PAD_X,
  TAG_TONES,
  TIGHTEST_RULE_DASHARRAY,
};
