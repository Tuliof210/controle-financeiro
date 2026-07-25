import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoneyShort } from "@/lib/money";
import { BAND_PADDING, MARGIN, MAX_X_TICKS, Y_TICKS } from "./chart.config";
import { axisTickMonths, yDomain } from "./chart.helper";

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
  points: MonthPoint[],
  values: number[],
  width: number,
  height: number,
) {
  const months = points.map((point) => point.month);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const scaleFor = (domainValues: number[]) =>
    scaleLinear({
      domain: yDomain(domainValues),
      range: [innerHeight, 0],
      nice: true,
    });

  const valueScale = scaleFor(values);
  const gridValues = valueScale.ticks(Y_TICKS);

  // The margin is sized on BOTH series, not just this chart's, so the two
  // charts share one left edge and their month bands stay vertically aligned.
  // Deriving it per chart skewed them by up to 11px, because innerWidth is
  // width - left - right. Both callers pass the same `points`, so both land on
  // the same number. Not circular: the y scale does not depend on the margin.
  const marginTicks = scaleFor(
    points.flatMap((point) => [point.income, point.expense, point.cumulative]),
  ).ticks(Y_TICKS);
  const left = leftMargin(marginTicks.map(formatMoneyShort));
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
