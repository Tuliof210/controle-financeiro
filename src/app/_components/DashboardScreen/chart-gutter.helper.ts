// The axis gutter and the tick thinning: the two measurements buildFrame makes
// about text rather than about data. Split off chart-frame.helper.ts for the
// 100-line cap.

// IBM Plex Mono at --text-2xs, MEASURED in the browser: 6.60px per character.
// The tick labels carry no letter-spacing, so that advance is the whole story;
// rounded up, because the failure is one-sided — too small and the SVG root
// clips the label, too large and the gutter is a pixel wide of nothing. It was
// 6 for JetBrains Mono at a 10px --text-2xs, and nothing fails when it is
// wrong: the axis labels just clip.
// The gutter covers the tick mark plus its gap to the axis, derived rather than
// fixed because a signed six-figure balance ("−R$ 20.000") is three characters
// wider than the positive labels a constant was sized for.
const CHAR_PX = 7;
const TICK_GUTTER = 12;

// "Jan/24" is always 6 characters (formatYyyymm's MONTH_LABELS are all 3
// letters); MIN_TICK_GAP is breathing room so two labels never render flush
// against each other even where they technically fit. Measured, not assumed: at
// the 6-month mobile window the label (36px) was WIDER than the per-month step
// (~35px) — labels ran together with zero gap — so this keeps the axis legible.
const X_LABEL_CHARS = 6; // "Ago/26"
const X_LABEL_WIDTH = X_LABEL_CHARS * CHAR_PX;
const MIN_TICK_GAP = 4;

const bandwidthFor = (visibleWidth: number, windowSize: number): number => {
  if (windowSize <= 0) {
    return 0;
  }
  return visibleWidth / windowSize;
};

function leftMargin(labels: string[]): number {
  return (
    Math.max(0, ...labels.map((label) => label.length)) * CHAR_PX + TICK_GUTTER
  );
}

export { bandwidthFor, CHAR_PX, leftMargin, MIN_TICK_GAP, X_LABEL_WIDTH };
