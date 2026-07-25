import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { dashSplit } from "../../chart.helper";
import { buildFrame } from "../../chart-frame.helper";

export type BalanceLineChartProps = {
  points: MonthPoint[];
  dashedFrom: number | null;
  width: number;
  height: number;
};

export function useBalanceLineChart({
  points,
  dashedFrom,
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
    zeroY: frame.valueScale.domain()[0] < 0 ? frame.valueScale(0) : null,
  };
}
