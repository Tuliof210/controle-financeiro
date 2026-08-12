import type { Period } from "@/core/use-cases/period.service.ts";
import { buildMonths } from "@/lib/months.ts";
import { monthsToIntervals } from "./components/ForecastForm/intervals.helper.ts";

// One positioned span per contiguous run of covered months, as percentages of
// the global projection range, so the bar can be laid out with left/width.
interface Segment {
  left: string;
  width: string;
}

// 4 decimals is well past sub-pixel on any track width; it just keeps the
// generated CSS readable.
const PERCENT = 100;
const DECIMALS = 4;
const pct = (value: number, total: number): string =>
  `${Number(((value / total) * PERCENT).toFixed(DECIMALS))}%`;

// Where a forecast's months sit inside the global projection range.
//
// Returns one segment per contiguous interval — never a single span from first
// to last — so a forecast with a gap draws exactly what its "Jan/26–Mar/26 ·
// Jul/26" label says. Months outside the range are dropped rather than
// clamped-and-drawn, so a forecast starting before the range or running past
// its end fills the track's edge instead of overflowing it.
//
// Returns [] when nothing overlaps (or the range is inverted, which
// `buildMonths` already reports as []): the caller draws an empty track. The
// "no range at all" case never reaches here — `CoverageBar` renders no track.
function coverage(months: number[], period: Period): Segment[] {
  const axis = buildMonths(period.start, period.end);
  const indexOf = new Map(axis.map((month, index) => [month, index]));
  const inRange = months.filter((month) => indexOf.has(month));

  return monthsToIntervals(inRange).map(({ start, end }) => {
    const from = indexOf.get(start) ?? 0;
    const to = indexOf.get(end) ?? 0;
    return {
      left: pct(from, axis.length),
      width: pct(to - from + 1, axis.length),
    };
  });
}

export type { Segment };
export { coverage };
