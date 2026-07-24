import {
  composeYYYYMM,
  MONTH_LABELS,
  splitYYYYMM,
} from "@/components/MonthPicker/month.helper";

// ponytail: buildMonths/formatYyyymm are duplicated from the recurrences feature
// on purpose — that code (interval sliders/selects) is being reworked by the
// owner, so movements keeps its own copy to stay decoupled. Both are tiny, pure,
// and depend only on the stable shared @/components/MonthPicker/month.helper.
// Promote to a shared month module if a third consumer appears (rule of three).

// Every YYYYMM from `start` to `end` inclusive (rolls the year over at month 12).
// start > end yields [] so callers degrade gracefully.
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

// YYYYMM -> "Ago/26" (2-digit year).
export function formatYyyymm(value: number): string {
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}
