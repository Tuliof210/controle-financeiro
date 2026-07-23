import {
  composeYYYYMM,
  splitYYYYMM,
} from "@/components/MonthPicker/month.helper";

// Enumerates every YYYYMM from `start` to `end` inclusive — the discrete axis
// a two-thumb slider walks by index rather than raw YYYYMM math. start > end
// yields [] so callers degrade gracefully instead of crashing.
export function buildMonths(start: number, end: number): number[] {
  const months: number[] = [];
  let { year, month } = splitYYYYMM(start);
  let current = start;
  while (current <= end) {
    months.push(current);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    current = composeYYYYMM(year, month);
  }
  return months;
}
