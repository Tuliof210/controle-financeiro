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

// YYYYMM packs the month into the last two digits, so 100 is the shift between
// the two halves and 12 closes the year.
const YEAR_SHIFT = 100;
const MONTHS_PER_YEAR = 12;
const DECEMBER = 12;
const JANUARY = 1;

export function splitYyyymm(value: number) {
  return { year: Math.trunc(value / YEAR_SHIFT), month: value % YEAR_SHIFT };
}

export function composeYyyymm(year: number, month: number) {
  return year * YEAR_SHIFT + month;
}

export function currentYyyymm(now = new Date()) {
  return composeYyyymm(now.getFullYear(), now.getMonth() + 1);
}

// YYYYMM advanced by N months. Goes through a flat month count so December ->
// January is arithmetic, not a special case.
export function addMonths(value: number, count: number): number {
  const { year, month } = splitYyyymm(value);
  const total = year * MONTHS_PER_YEAR + (month - 1) + count;
  return composeYyyymm(
    Math.trunc(total / MONTHS_PER_YEAR),
    (total % MONTHS_PER_YEAR) + 1,
  );
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
  let { year, month } = splitYyyymm(start);
  let current = start;
  while (current <= end) {
    months.push(current);
    month += 1;
    if (month > DECEMBER) {
      month = JANUARY;
      year += 1;
    }
    current = composeYyyymm(year, month);
  }
  return months;
}

// YYYYMM -> "Ago/26" (2-digit year). null -> muted placeholder, for a caller
// that may not have a value yet.
export function formatYyyymm(value: number | null): string {
  if (value === null) {
    return "—";
  }
  const year = Math.trunc(value / YEAR_SHIFT);
  const month = value % YEAR_SHIFT;
  const shortYear = String(year % YEAR_SHIFT).padStart(2, "0");
  return `${MONTH_LABELS[month - 1]}/${shortYear}`;
}
