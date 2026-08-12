import { buildMonths, composeYYYYMM, splitYYYYMM } from "@/lib/months.ts";

export interface Interval {
  start: number;
  end: number;
}

// Next YYYYMM, rolling the year over after December.
function nextMonth(yyyymm: number): number {
  const { year, month } = splitYYYYMM(yyyymm);
  return month === 12
    ? composeYYYYMM(year + 1, 1)
    : composeYYYYMM(year, month + 1);
}

// Intervals -> the flat, de-duped, sorted set of active YYYYMM months. This is
// the canonical shape the entity/API/storage speak.
export function intervalsToMonths(intervals: Interval[]): number[] {
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
export function monthsToIntervals(months: number[]): Interval[] {
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
