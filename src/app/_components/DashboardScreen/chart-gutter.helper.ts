// The axis gutter and the tick thinning: the two measurements buildFrame makes
// about text rather than about data. Split off chart-frame.helper.ts for the
// 100-line cap.

// JetBrains Mono at --text-2xs is ~6px per character; the gutter covers the
// tick mark plus its gap to the axis. Derived rather than fixed because a
// signed six-figure balance ("−R$ 20.000") is three characters wider than the
// positive labels a constant was sized for, and the SVG root clips the excess.
const CHAR_PX = 6;
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
