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
const SERIES = [
  { key: "income", label: "Entradas", fill: "var(--color-positive)" },
  { key: "expense", label: "Saídas", fill: "var(--color-negative)" },
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
        tip,
      };
    });
  });

  return { frame, bars };
}

export { SERIES };
