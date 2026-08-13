import { scaleBand } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { buildFrame } from "../../chart-frame.helper.ts";
import { estimatedFor } from "./bar-series.helper.ts";
import { tipFor } from "./bar-tip.helper.ts";

// The frame and every bar, built in one pass. Split off `hook.ts` so that file
// can be the memo boundary and nothing else — the whole point is that this runs
// only when points/width/height change, not on every pointer move.

// One bar per type per month. `estimated` is read off the payload, never
// re-derived by comparing numbers here — the API already resolved which side won.
//
// CATEGORY hues, not the semantic pair. Income-vs-expense in a bar chart is a
// category distinction, not a financial state: painting 36 ordinary expense bars
// --color-negative broke the constitution's first pillar (a normal expense is not
// red) and, worse, spent the alarm — a healthy month and an unhealthy one drew
// from the same two colours, so the chart had nothing left to escalate WITH.
//
// green ~168deg against amber ~33deg: separated by HUE. Measured, they are only
// 1.1:1 apart in luminance, because the category ramp is flat by construction
// (every hue 3.42–4.52:1 against --color-surface). Colour is therefore not the
// carrying channel — the fixed left/right order inside each month's band is, and
// the legend and the bubble name both series in words.
const SERIES = [
  { key: "income", label: "Entradas", fill: "var(--cat-green)" },
  { key: "expense", label: "Saídas", fill: "var(--cat-amber)" },
] as const;

export function buildBars(points: MonthPoint[], width: number, height: number) {
  const frame = buildFrame(
    points,
    points.flatMap((point) => [point.income, point.expense]),
    width,
    height,
  );

  // Nested inside each month's band, so the pair sits side by side.
  const typeScale = scaleBand({
    domain: SERIES.map((series) => series.key),
    range: [0, frame.monthScale.bandwidth()],
    // Tighter than the month band: this only separates the pair from each other.
    padding: 0.15,
  });

  const bars = points.flatMap((point) => {
    // Built once per month and shared by both of its bars: the bubble answers
    // for the month, so hovering either side of the pair says the same thing.
    const tip = tipFor(point);

    return SERIES.map((series) => {
      const value = point[series.key];

      return {
        key: `${point.month}-${series.key}`,
        x: (frame.monthScale(point.month) ?? 0) + (typeScale(series.key) ?? 0),
        y: frame.valueScale(value),
        width: typeScale.bandwidth(),
        height: Math.max(0, frame.valueScale(0) - frame.valueScale(value)),
        fill: series.fill,
        estimated: estimatedFor(point, series.key),
        simulated: point.simulated,
        tip,
      };
    });
  });

  return { frame, bars };
}

export { SERIES };
