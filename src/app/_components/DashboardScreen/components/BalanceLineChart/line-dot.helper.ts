import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import type { TooltipContent } from "../ChartTooltip/hook.ts";

// One point of the curve, with the caption the bubble prints for it. Its own
// file so `hook.ts` stays under the 100-line cap — the chart's scales and its
// dash split are already all that file has room for.

// The only channel that still says "projection" once the chart is read in
// greyscale, alongside the path's own stroke-dasharray. The half-opacity dot is
// reinforcement, never the signal.
const tagFor = (projected: boolean): string => {
  if (projected) {
    return "estimado";
  }
  return "real";
};

function rowsFor(cumulative: number, ceilingLeft: number | undefined) {
  const cumulativeRow = {
    key: "cumulative",
    label: "acumulado",
    value: formatMoney(cumulative),
    tone: "brand" as const,
  };
  if (ceilingLeft === undefined) {
    return [cumulativeRow];
  }
  return [
    cumulativeRow,
    {
      key: "teto",
      label: "se gastar o teto",
      value: formatMoney(ceilingLeft),
      tone: "neutral" as const,
    },
  ];
}

function tipFor(
  month: number,
  projected: boolean,
  plotX: number,
  cumulative: number,
  ceilingLeft: number | undefined,
): TooltipContent {
  return {
    title: formatYyyymm(month),
    tag: tagFor(projected),
    plotX,
    rows: rowsFor(cumulative, ceilingLeft),
  };
}

function dotFor(
  point: MonthPoint,
  projected: boolean,
  cx: number,
  cy: number,
  ceilingLeft?: number,
) {
  const label = formatYyyymm(point.month);
  const value = formatMoney(point.cumulative);

  return {
    key: `${point.month}-cumulative`,
    cx,
    cy,
    projected,
    // `plotX` is the dot's own x in PLOT coordinates, so the chart drops its
    // crosshair from the hover the bubble is already tracking rather than
    // holding a second piece of state that could disagree with it.
    tip: tipFor(point.month, projected, cx, point.cumulative, ceilingLeft),
    title: `${label} · acumulado ${value}`,
  };
}

function tetoDotFor(
  month: number,
  ceilingLeft: number,
  projected: boolean,
  cx: number,
  cy: number,
  cumulative: number,
) {
  const label = formatYyyymm(month);
  const value = formatMoney(ceilingLeft);

  return {
    key: `${month}-teto`,
    cx,
    cy,
    projected,
    tip: tipFor(month, projected, cx, cumulative, ceilingLeft),
    title: `${label} · se gastar o teto ${value}`,
  };
}

export { dotFor, tagFor, tetoDotFor };
