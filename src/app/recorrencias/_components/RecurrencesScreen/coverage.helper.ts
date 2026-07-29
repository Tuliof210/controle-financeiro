import type { Period } from "@/core/use-cases/period.service";
import { buildMonths } from "@/lib/months";
import { monthsToIntervals } from "./components/RecurrenceForm/intervals.helper";

// One positioned span per contiguous run of covered months, as percentages of
// the global projection range, so the bar can be laid out with left/width.
export type Segment = { left: string; width: string };

// 4 decimals is well past sub-pixel on any track width; it just keeps the
// generated CSS readable.
const pct = (value: number, total: number): string =>
  `${Number(((value / total) * 100).toFixed(4))}%`;

// Where a recurrence's months sit inside the global projection range.
//
// Returns one segment per contiguous interval — never a single span from first
// to last — so a recurrence with a gap draws exactly what its "Jan/26–Mar/26 ·
// Jul/26" label says. Months outside the range are dropped rather than
// clamped-and-drawn, so a recurrence starting before the range or running past
// its end fills the track's edge instead of overflowing it.
//
// Returns [] when nothing overlaps (or the range is inverted, which
// `buildMonths` already reports as []): the caller draws an empty track. The
// "no range at all" case never reaches here — `CoverageBar` renders no track.
export function coverage(months: number[], period: Period): Segment[] {
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
