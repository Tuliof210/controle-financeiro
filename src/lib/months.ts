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

export function yearOptions(currentYear = new Date().getFullYear()) {
  const start = currentYear - 3;
  const end = currentYear + 8;
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

// YYYYMM -> "Ago/26" (2-digit year). null -> muted placeholder, for the
// Settings bounds which are unset until the owner saves a global period.
export function formatYyyymm(value: number | null): string {
  if (value == null) {
    return "—";
  }
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}
