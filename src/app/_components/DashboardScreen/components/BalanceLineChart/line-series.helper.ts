import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { dotFor, tetoDotFor } from "./line-dot.helper.ts";

// Domain for the line chart's y-scale: both series, or a teto that sinks below
// every cumulative (fixed ceiling over headroom) clips and never draws zero.
export function seriesValues(
  points: MonthPoint[],
  ceilingMonths: CeilingMonth[],
): number[] {
  return [
    ...points.map((point) => point.cumulative),
    ...ceilingMonths.map((month) => month.ceilingLeft),
  ];
}

export function dotsFor(
  points: MonthPoint[],
  ceilingMonths: CeilingMonth[],
  projectedFrom: number,
  xOf: (month: number) => number,
  yOf: (value: number) => number,
) {
  const leftOf = new Map(
    ceilingMonths.map((month) => [month.month, month.ceilingLeft]),
  );
  const pointOf = new Map(points.map((point) => [point.month, point]));
  const current = points.map((point) =>
    dotFor(
      point,
      point.month >= projectedFrom,
      xOf(point.month),
      yOf(point.cumulative),
      leftOf.get(point.month),
    ),
  );
  const teto = ceilingMonths.flatMap((row) => {
    const point = pointOf.get(row.month);
    if (point === undefined) {
      return [];
    }
    return [
      tetoDotFor(
        row.month,
        row.ceilingLeft,
        row.month >= projectedFrom,
        xOf(row.month),
        yOf(row.ceilingLeft),
        point.cumulative,
      ),
    ];
  });
  return [...current, ...teto];
}
