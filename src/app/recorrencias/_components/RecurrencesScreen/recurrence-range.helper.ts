import { MONTH_LABELS } from "@/components/MonthPicker/month.helper";
import { monthsToIntervals } from "./components/RecurrenceForm/intervals.helper";

// YYYYMM -> "Ago/26" (2-digit year). Local to this feature on purpose — see
// RangeSection/range.helper.ts for the settings-screen equivalent; a
// recurrence's months are never null, unlike Settings'.
export function formatYyyymm(value: number): string {
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}

// Active months -> their contiguous intervals, e.g. "Jan/26–Mar/26 · Jul/26–Dez/26".
// A single-month interval renders as just "Mai/26".
export function formatMonths(months: number[]): string {
  return monthsToIntervals(months)
    .map(({ start, end }) =>
      start === end
        ? formatYyyymm(start)
        : `${formatYyyymm(start)}–${formatYyyymm(end)}`,
    )
    .join(" · ");
}
