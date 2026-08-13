import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

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

function dotFor(point: MonthPoint, projected: boolean, cx: number, cy: number) {
  const label = formatYyyymm(point.month);
  const value = formatMoney(point.cumulative);

  return {
    key: point.month,
    cx,
    cy,
    projected,
    // `plotX` is the dot's own x in PLOT coordinates, so the chart drops its
    // crosshair from the hover the bubble is already tracking rather than
    // holding a second piece of state that could disagree with it.
    tip: {
      title: label,
      tag: tagFor(projected),
      plotX: cx,
      rows: [
        {
          key: "cumulative",
          label: "acumulado",
          value,
          tone: "brand" as const,
        },
      ],
    },
    title: `${label} · acumulado ${value}`,
  };
}

export { dotFor, tagFor };
