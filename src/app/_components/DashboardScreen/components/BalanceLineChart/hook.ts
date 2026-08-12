import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { dashSplit } from "../../chart.helper.ts";
import { buildFrame } from "../../chart-frame.helper.ts";

interface BalanceLineChartProps {
  points: MonthPoint[];
  dashedFrom: number | null;
  // The month the Teto card calls its bottleneck (`Ceiling.tightest`), NOT this
  // curve's own minimum: that is the suffix minimum of `ceilingBalance`, a
  // different series, and two marks naming two different months on one screen
  // is the thing to avoid. Null when there is no ceiling at all.
  tightest: number | null;
  width: number;
  height: number;
}

// Only worth drawing when the series actually crosses zero; otherwise the
// baseline coincides with the axis.
function zeroLine(valueScale: {
  domain: () => number[];
  (value: number): number;
}): number | null {
  if (valueScale.domain()[0] >= 0) {
    return null;
  }
  return valueScale(0);
}

function useBalanceLineChart({
  points,
  dashedFrom,
  tightest,
  width,
  height,
}: BalanceLineChartProps) {
  const frame = buildFrame(
    points,
    points.map((point) => point.cumulative),
    width,
    height,
  );

  // Centred in each month's band, so the dots sit above the bar chart's groups.
  const x = (point: MonthPoint) =>
    (frame.monthScale(point.month) ?? 0) + frame.monthScale.bandwidth() / 2;
  const y = (point: MonthPoint) => frame.valueScale(point.cumulative);

  const projectedFrom = dashedFrom ?? Number.POSITIVE_INFINITY;

  // Anchored to the named month's OWN cumulative, not to the curve's minimum —
  // the two need not coincide, and the label names the month, not the low point.
  let tightestPoint: MonthPoint | undefined;
  if (tightest !== null) {
    tightestPoint = points.find((point) => point.month === tightest);
  }

  return {
    frame,
    width,
    height,
    x,
    y,
    ...dashSplit(points, dashedFrom),
    dots: points.map((point) => ({
      key: point.month,
      cx: x(point),
      cy: y(point),
      projected: point.month >= projectedFrom,
      title: `${formatYyyymm(point.month)} · acumulado ${formatMoney(
        point.cumulative,
      )}`,
    })),
    // Only worth drawing when the series actually crosses zero; otherwise the
    // baseline coincides with the axis.
    zeroY: zeroLine(frame.valueScale),
    tightestMark:
      tightestPoint === undefined
        ? null
        : {
            x: x(tightestPoint),
            y: y(tightestPoint),
            // The tag would run off the trailing edge in the last third of the
            // plot; past the midpoint it hangs to the left of its rule instead.
            flip: x(tightestPoint) > frame.innerWidth / 2,
          },
  };
}

export type { BalanceLineChartProps };
export { useBalanceLineChart };
