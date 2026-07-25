import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoneyShort } from "@/lib/money";
import { BAND_PADDING, MARGIN, MAX_X_TICKS, Y_TICKS } from "./chart.config";

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

// Thins the x axis so a 36-month range does not collapse into unreadable
// overlap. Every month is still plotted; only the labels are sampled.
export function axisTickMonths(months: number[], maxTicks: number): number[] {
  if (months.length <= maxTicks) return months;
  const step = Math.ceil(months.length / maxTicks);
  return months.filter((_, index) => index % step === 0);
}

// JetBrains Mono at --text-2xs is ~6px per character; the gutter covers the
// tick mark plus its gap to the axis. Derived rather than fixed because a
// signed six-figure balance ("−R$ 20.000") is three characters wider than the
// positive labels a constant was sized for, and the SVG root clips the excess.
const CHAR_PX = 6;
const TICK_GUTTER = 12;

export function leftMargin(labels: string[]): number {
  return (
    Math.max(0, ...labels.map((label) => label.length)) * CHAR_PX + TICK_GUTTER
  );
}

// The scaffolding both charts share: same month band, same tick sampling, same
// y-tick count. Only the y values differ — the bars scale on income/expense,
// the line on the cumulative balance.
export function buildFrame(
  months: number[],
  values: number[],
  width: number,
  height: number,
) {
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const valueScale = scaleLinear({
    domain: yDomain(values),
    range: [innerHeight, 0],
    nice: true,
  });
  const gridValues = valueScale.ticks(Y_TICKS);
  // The y scale does not depend on the left margin, so deriving the margin from
  // its ticks is not circular.
  const left = leftMargin(gridValues.map(formatMoneyShort));
  const innerWidth = Math.max(0, width - left - MARGIN.right);

  return {
    left,
    innerWidth,
    innerHeight,
    valueScale,
    gridValues,
    monthScale: scaleBand({
      domain: months,
      range: [0, innerWidth],
      padding: BAND_PADDING,
    }),
    tickValues: axisTickMonths(months, MAX_X_TICKS),
  };
}
