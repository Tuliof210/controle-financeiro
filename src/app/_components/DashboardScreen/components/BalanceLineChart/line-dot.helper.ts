import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

// One point of the curve, with the caption the bubble prints for it. Its own
// file so `hook.ts` stays under the 100-line cap — the chart's scales and its
// dash split are already all that file has room for.

// The only channel that still says which KIND of fact this is once the chart is
// read in greyscale, alongside the path's own stroke-dasharray. The half-opacity
// dot is reinforcement, never the signal.
//
// "simulado" wins over "estimado": a what-if is a weaker claim than a committed
// forecast, so the weaker word is the one the reader sees.
const tagFor = (projected: boolean, simulated: boolean): string => {
  if (simulated) {
    return "simulado";
  }
  if (projected) {
    return "estimado";
  }
  return "real";
};

function dotFor(point: MonthPoint, projected: boolean, cx: number, cy: number) {
  const { simulated } = point;
  const label = formatYyyymm(point.month);
  const value = formatMoney(point.cumulative);

  return {
    key: point.month,
    cx,
    cy,
    projected,
    simulated,
    // `plotX` is the dot's own x in PLOT coordinates, so the chart drops its
    // crosshair from the hover the bubble is already tracking rather than
    // holding a second piece of state that could disagree with it.
    tip: {
      title: label,
      tag: tagFor(projected, simulated),
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
  };
}

export { dotFor, tagFor };
