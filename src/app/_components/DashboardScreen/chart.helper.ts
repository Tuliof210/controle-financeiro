import type { MonthPoint } from "@/app/api/dashboard/types";

// The y domain always includes 0 so the baseline is a real line rather than the
// bottom edge, and it handles an all-negative cumulative balance. A degenerate
// domain (every value 0) would give the scale zero height, so widen it.
export function yDomain(values: number[]): [number, number] {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  return low === high ? [0, 1] : [low, high];
}

// Splits the balance series where history stops and projection starts. The two
// LinePaths SHARE the boundary point, or the line visibly breaks at the seam.
// `dashedFrom` on the very first month means there is no history to draw, so
// `solid` is empty rather than a one-point path that renders nothing.
export function dashSplit(
  points: MonthPoint[],
  dashedFrom: number | null,
): { solid: MonthPoint[]; dashed: MonthPoint[] } {
  if (dashedFrom === null) return { solid: points, dashed: [] };

  const index = points.findIndex((point) => point.month >= dashedFrom);
  if (index === -1) return { solid: points, dashed: [] };

  return {
    solid: index === 0 ? [] : points.slice(0, index + 1),
    dashed: points.slice(index),
  };
}
