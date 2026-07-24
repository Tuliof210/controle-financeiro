import { MONTH_LABELS } from "@/components/MonthPicker/month.helper";

// YYYYMM -> "Ago/26" (2-digit year). Local to this feature on purpose — see
// RangeSection/range.helper.ts for the settings-screen equivalent; a
// recurrence's rangeStart/rangeEnd are never null, unlike Settings'.
export function formatYyyymm(value: number): string {
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}

export function formatPeriod(start: number, end: number): string {
  return `${formatYyyymm(start)} → ${formatYyyymm(end)}`;
}
