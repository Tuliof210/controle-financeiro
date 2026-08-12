import { buildMonths, composeYyyymm, splitYyyymm } from "@/lib/months.ts";

interface Interval {
  start: number;
  end: number;
}

const DECEMBER = 12;
const JANUARY = 1;

// Next YYYYMM, rolling the year over after December.
function nextMonth(yyyymm: number): number {
  const { year, month } = splitYyyymm(yyyymm);
  return month === DECEMBER
    ? composeYyyymm(year + 1, JANUARY)
    : composeYyyymm(year, month + 1);
}

// Intervals -> the flat, de-duped, sorted set of active YYYYMM months. This is
// the canonical shape the entity/API/storage speak.
function intervalsToMonths(intervals: Interval[]): number[] {
  const set = new Set<number>();
  for (const { start, end } of intervals) {
    for (const m of buildMonths(start, end)) {
      set.add(m);
    }
  }
  return [...set].sort((a, b) => a - b);
}

// Months -> contiguous intervals. Consecutive months (including across a year
// boundary) collapse into one {start,end}; a gap starts a new interval — so
// non-contiguous selections survive the round-trip, and adjacent ones merge
// (semantically identical).
function monthsToIntervals(months: number[]): Interval[] {
  const sorted = [...new Set(months)].sort((a, b) => a - b);
  const intervals: Interval[] = [];
  for (const month of sorted) {
    const last = intervals.at(-1);
    if (last && nextMonth(last.end) === month) {
      last.end = month;
    } else {
      intervals.push({ start: month, end: month });
    }
  }
  return intervals;
}

export type { Interval };
export { intervalsToMonths, monthsToIntervals };
