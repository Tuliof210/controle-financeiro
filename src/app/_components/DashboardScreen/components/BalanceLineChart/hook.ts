import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { dashSplit } from "../../chart.helper.ts";
import { buildFrame } from "../../chart-frame.helper.ts";
import { dotsFor, seriesValues } from "./line-series.helper.ts";

// The tag would run off the trailing edge in the last third of the plot; past
// the midpoint it hangs to the left of its rule instead.
const markFor = (
  point: MonthPoint | undefined,
  x: (point: MonthPoint) => number,
  y: (point: MonthPoint) => number,
  innerWidth: number,
) => {
  if (point === undefined) {
    return null;
  }
  return { x: x(point), y: y(point), flip: x(point) > innerWidth / 2 };
};

interface BalanceLineChartProps {
  points: MonthPoint[];
  dashedFrom: number | null;
  // The month the Teto card calls its bottleneck (`Ceiling.tightest`), NOT this
  // curve's own minimum: that is the suffix minimum of `ceilingBalance`, a
  // different series, and two marks naming two different months on one screen
  // is the thing to avoid. Null when there is no ceiling at all.
  tightest: number | null;
  ceilingMonths: CeilingMonth[];
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
  ceilingMonths,
  width,
  height,
}: BalanceLineChartProps) {
  const frame = buildFrame(
    points,
    seriesValues(points, ceilingMonths),
    width,
    height,
  );

  // Centred in each month's band, so the dots sit above the bar chart's groups.
  const xAt = (month: number) =>
    (frame.monthScale(month) ?? 0) + frame.monthScale.bandwidth() / 2;
  const x = (point: MonthPoint) => xAt(point.month);
  const y = (point: MonthPoint) => frame.valueScale(point.cumulative);
  const xTeto = (month: CeilingMonth) => xAt(month.month);
  const yTeto = (month: CeilingMonth) => frame.valueScale(month.ceilingLeft);

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
    xTeto,
    yTeto,
    teto: ceilingMonths,
    curve: points,
    ...dashSplit(points, dashedFrom),
    dots: dotsFor(points, ceilingMonths, projectedFrom, xAt, frame.valueScale),
    zeroY: zeroLine(frame.valueScale),
    tightestMark: markFor(tightestPoint, x, y, frame.innerWidth),
  };
}

export type { BalanceLineChartProps };
export { useBalanceLineChart };
