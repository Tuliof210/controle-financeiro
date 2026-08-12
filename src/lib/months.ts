export const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export function splitYYYYMM(value: number) {
  return { year: Math.trunc(value / 100), month: value % 100 };
}

export function composeYYYYMM(year: number, month: number) {
  return year * 100 + month;
}

export function currentYYYYMM(now = new Date()) {
  return composeYYYYMM(now.getFullYear(), now.getMonth() + 1);
}

// YYYYMM advanced by N months. Goes through a flat month count so December ->
// January is arithmetic, not a special case.
export function addMonths(value: number, count: number): number {
  const { year, month } = splitYYYYMM(value);
  const total = year * 12 + (month - 1) + count;
  return composeYYYYMM(Math.trunc(total / 12), (total % 12) + 1);
}

// Fixed, not relative-to-now: a movement or forecast interval can land on
// any month in this domain regardless of when it is entered, so the picker's
// options can't drift with the clock either.
export function yearOptions() {
  const start = 2000;
  const end = 2099;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

// Enumerates every YYYYMM from `start` to `end` inclusive — the discrete axis
// a two-thumb slider walks by index rather than raw YYYYMM math, and the option
// list of a single-month select. start > end yields [] so callers degrade
// gracefully instead of crashing.
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

// YYYYMM -> "Ago/26" (2-digit year). null -> muted placeholder, for a caller
// that may not have a value yet.
export function formatYyyymm(value: number | null): string {
  if (value === null) {
    return "—";
  }
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}
