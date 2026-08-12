import { scaleBand } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { buildFrame } from "../../chart-frame.helper.ts";

export type MonthlyBarChartProps = {
  points: MonthPoint[];
  // First month the payload calls a projection. The bars read per-point
  // `incomeEstimated`/`expenseEstimated`; this is the one figure saying where
  // the projected REGION starts, and it is deliberately NOT clamped to the
  // current month — an under-recorded past month opens the band early, which is
  // the intent.
  dashedFrom: number | null;
  width: number;
  height: number;
};

// One bar per type per month. `estimated` is read off the payload, never
// re-derived by comparing numbers here — the API already resolved which side won.
const SERIES = [
  { key: "income", label: "Entradas", fill: "var(--color-positive)" },
  { key: "expense", label: "Saídas", fill: "var(--color-negative)" },
] as const;

export function useMonthlyBarChart({
  points,
  dashedFrom,
  width,
  height,
}: MonthlyBarChartProps) {
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

  const bars = points.flatMap((point) =>
    SERIES.map((series) => {
      const value = point[series.key];
      const estimated =
        series.key === "income"
          ? point.incomeEstimated
          : point.expenseEstimated;

      return {
        key: `${point.month}-${series.key}`,
        x: (frame.monthScale(point.month) ?? 0) + (typeScale(series.key) ?? 0),
        y: frame.valueScale(value),
        width: typeScale.bandwidth(),
        height: Math.max(0, frame.valueScale(0) - frame.valueScale(value)),
        fill: series.fill,
        estimated,
        // The 50% opacity is a data encoding, so it needs a non-visual channel
        // carrying the same fact.
        title: `${formatYyyymm(point.month)} · ${series.label} · ${formatMoney(
          value,
        )} · ${estimated ? "previsto" : "lançado"}`,
      };
    }),
  );

  // The band starts at the leading edge of the first projected month's own band
  // — not its centre — so the dashed rule lands where the month begins. Null
  // whenever nothing is projected, or the month fell outside the range.
  const bandStart =
    dashedFrom === null ? null : (frame.monthScale(dashedFrom) ?? null);

  return {
    frame,
    bars,
    width,
    height,
    band:
      bandStart === null
        ? null
        : { x: bandStart, width: Math.max(0, frame.innerWidth - bandStart) },
  };
}
