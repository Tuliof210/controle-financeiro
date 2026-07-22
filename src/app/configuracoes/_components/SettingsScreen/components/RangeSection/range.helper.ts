import { MONTH_LABELS } from "@/components/MonthPicker/month.helper";

// YYYYMM -> "Ago/28" (2-digit year). null -> muted placeholder.
export function formatYyyymm(value: number | null): string {
  if (value == null) {
    return "—";
  }
  const year = Math.trunc(value / 100);
  const month = value % 100;
  return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
}
