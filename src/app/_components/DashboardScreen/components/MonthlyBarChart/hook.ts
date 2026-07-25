import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { MARGIN, MAX_X_TICKS, Y_TICKS } from "../../chart.config";
import { axisTickMonths, yDomain } from "../../chart.helper";

export type MonthlyBarChartProps = {
  points: MonthPoint[];
  width: number;
  height: number;
};

// One bar per type per month. `estimated` is read off the payload, never
// re-derived by comparing numbers here — task 01 already resolved which side won.
const SERIES = [
  { key: "income", label: "Entradas", fill: "var(--color-positive)" },
  { key: "expense", label: "Saídas", fill: "var(--color-negative)" },
] as const;

export function useMonthlyBarChart({
  points,
  width,
  height,
}: MonthlyBarChartProps) {
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const months = points.map((point) => point.month);

  const monthScale = scaleBand({
    domain: months,
    range: [0, innerWidth],
    padding: 0.25,
  });
  const typeScale = scaleBand({
    domain: SERIES.map((series) => series.key),
    range: [0, monthScale.bandwidth()],
    padding: 0.15,
  });
  const valueScale = scaleLinear({
    domain: yDomain(points.flatMap((point) => [point.income, point.expense])),
    range: [innerHeight, 0],
    nice: true,
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
        x: (monthScale(point.month) ?? 0) + (typeScale(series.key) ?? 0),
        y: valueScale(value),
        width: typeScale.bandwidth(),
        height: Math.max(0, valueScale(0) - valueScale(value)),
        fill: series.fill,
        estimated,
        // Native SVG tooltip: the 50% opacity is a data encoding, so it needs a
        // non-visual channel carrying the same fact.
        title: `${formatYyyymm(point.month)} · ${series.label} · ${formatMoney(value)}${
          estimated ? " · previsto" : " · lançado"
        }`,
      };
    }),
  );

  return {
    bars,
    monthScale,
    valueScale,
    innerHeight,
    gridValues: valueScale.ticks(Y_TICKS),
    tickValues: axisTickMonths(months, MAX_X_TICKS),
  };
}
