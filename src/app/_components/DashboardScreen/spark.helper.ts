// The inline sparkline every KPI card draws beside its headline. Pure geometry,
// shared by every card that draws one.

const SPARK_W = 112;
const SPARK_H = 30;

// The baseline sits 3px above the bottom edge and the plot is 8px shorter than
// the box, so a 2px stroke never clips against either edge.
const BASELINE = 3;
const PLOT_INSET = 8;
const PLOT_H = SPARK_H - PLOT_INSET;

/**
 * An SVG path pair for a 112x30 inline sparkline: the line itself and the same
 * line closed to the baseline for the translucent fill underneath.
 *
 * Returns `null` for an empty series so the caller renders no `<svg>` at all —
 * an empty `d` attribute is a console warning in some browsers and an invisible
 * bug in others.
 */
function spark(values: number[]): { line: string; area: string } | null {
  if (values.length === 0) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A single value and an all-equal series both have zero range; `|| 1` turns
  // the division into 0 and draws a flat line instead of NaN.
  const span = max - min || 1;
  const dx = SPARK_W / Math.max(1, values.length - 1);

  const line = values
    .map((value, index) => {
      const x = index * dx;
      const y = SPARK_H - BASELINE - ((value - min) / span) * PLOT_H;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return { line, area: `${line} L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z` };
}

export { SPARK_H, SPARK_W, spark };
