import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { MARGIN, MAX_X_TICKS, Y_TICKS } from "../../chart.config";
import { axisTickMonths, dashSplit, yDomain } from "../../chart.helper";

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
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const months = points.map((point) => point.month);

  // A band scale, not a point scale, so the dots sit on the same month centres
  // as the bar chart's groups directly above.
  const monthScale = scaleBand({
    domain: months,
    range: [0, innerWidth],
    padding: 0.25,
  });
  const valueScale = scaleLinear({
    domain: yDomain(points.map((point) => point.cumulative)),
    range: [innerHeight, 0],
    nice: true,
  });

  const x = (point: MonthPoint) =>
    (monthScale(point.month) ?? 0) + monthScale.bandwidth() / 2;
  const y = (point: MonthPoint) => valueScale(point.cumulative);

  const { solid, dashed } = dashSplit(points, dashedFrom);

  return {
    solid,
    dashed,
    x,
    y,
    innerHeight,
    dots: points.map((point) => ({
      key: point.month,
      cx: x(point),
      cy: y(point),
      projected: point.month >= (dashedFrom ?? Number.POSITIVE_INFINITY),
      title: `${formatYyyymm(point.month)} · acumulado ${formatMoney(point.cumulative)}`,
    })),
    monthScale,
    valueScale,
    // Only worth drawing when the series actually crosses zero; otherwise the
    // baseline coincides with the axis.
    zeroY: valueScale.domain()[0] < 0 ? valueScale(0) : null,
    gridValues: valueScale.ticks(Y_TICKS),
    tickValues: axisTickMonths(months, MAX_X_TICKS),
  };
}
