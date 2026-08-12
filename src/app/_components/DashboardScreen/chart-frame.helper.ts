import { scaleBand, scaleLinear } from "@visx/scale";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import {
  BAND_PADDING,
  MARGIN,
  monthWindowSize,
  tickFormatterFor,
  Y_TICKS,
} from "./chart.config.ts";
import { yDomain } from "./chart.helper.ts";
import {
  bandwidthFor,
  leftMargin,
  MIN_TICK_GAP,
  X_LABEL_WIDTH,
} from "./chart-gutter.helper.ts";

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
  // tickFormatterFor is shared with ChartFrame/hook.ts, so this gutter always
  // matches the format actually drawn (see chart.config.ts for why).
  const left = leftMargin(marginTicks.map(tickFormatterFor(width)));
  const visibleWidth = Math.max(0, width - left - MARGIN.right);

  // Every month gets a fixed bandwidth, sized so exactly one window (12
  // desktop / 6 mobile) fills the visible card — not the whole history
  // squeezed into it. `innerWidth` only grows past `visibleWidth` once there
  // are more months than the window holds; ChartFrame scrolls that excess
  // horizontally instead of shrinking the bars. Below the window size this
  // collapses back to `visibleWidth` exactly, same as before this changed.
  const bandwidth = bandwidthFor(visibleWidth, monthWindowSize(width));
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
