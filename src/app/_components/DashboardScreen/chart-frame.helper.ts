import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { formatMoneyShort, formatMoneyShortK } from "@/lib/money";
import {
  BAND_PADDING,
  isDesktopWidth,
  MARGIN,
  monthWindowSize,
  Y_TICKS,
} from "./chart.config";
import { yDomain } from "./chart.helper";

// JetBrains Mono at --text-2xs is ~6px per character; the gutter covers the
// tick mark plus its gap to the axis. Derived rather than fixed because a
// signed six-figure balance ("−R$ 20.000") is three characters wider than the
// positive labels a constant was sized for, and the SVG root clips the excess.
const CHAR_PX = 6;
const TICK_GUTTER = 12;

// "Jan/24" is always 6 characters (formatYyyymm's MONTH_LABELS are all 3
// letters); MIN_TICK_GAP is breathing room so two labels never render flush
// against each other even where they technically fit. Measured, not assumed:
// at the 6-month mobile window the label (36px) was WIDER than the per-month
// step (~35px) — every-month labels ran together with zero gap — so this
// isn't optional polish, it is what keeps the mobile axis readable at all.
const X_LABEL_WIDTH = 6 * CHAR_PX;
const MIN_TICK_GAP = 4;

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
  // Same width-based choice ChartFrame/hook.ts's formatYTick makes for what's
  // actually drawn — the gutter has to match the format displayed in it, or
  // mobile reserves space for "R$ 40.000" while rendering the shorter "R$ 40K".
  const formatYTick = isDesktopWidth(width)
    ? formatMoneyShort
    : formatMoneyShortK;
  const left = leftMargin(marginTicks.map(formatYTick));
  const visibleWidth = Math.max(0, width - left - MARGIN.right);

  // Every month gets a fixed bandwidth, sized so exactly one window (12
  // desktop / 6 mobile) fills the visible card — not the whole history
  // squeezed into it. `innerWidth` only grows past `visibleWidth` once there
  // are more months than the window holds; ChartFrame scrolls that excess
  // horizontally instead of shrinking the bars. Below the window size this
  // collapses back to `visibleWidth` exactly, same as before this changed.
  const windowSize = monthWindowSize(width);
  const bandwidth = windowSize > 0 ? visibleWidth / windowSize : 0;
  const innerWidth = Math.max(visibleWidth, bandwidth * months.length);

  const monthScale = scaleBand({
    domain: months,
    range: [0, innerWidth],
    padding: BAND_PADDING,
  });

  // Thin by real step vs. real label width, not a fixed count: a wide window
  // (few months, or desktop) has room for every label, a narrow one does not.
  const stride = Math.max(
    1,
    Math.ceil((X_LABEL_WIDTH + MIN_TICK_GAP) / (monthScale.step() || 1)),
  );

  return {
    left,
    innerWidth,
    innerHeight,
    valueScale,
    gridValues,
    monthScale,
    tickValues: months.filter((_, index) => index % stride === 0),
  };
}
