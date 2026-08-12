import { formatYyyymm } from "@/lib/months.ts";
import { monthsToIntervals } from "./components/ForecastForm/intervals.helper.ts";

// A one-month interval names the month rather than a range pointing at itself.
const rangeLabel = (start: number, end: number): string => {
  if (start === end) {
    return formatYyyymm(start);
  }
  return `${formatYyyymm(start)}–${formatYyyymm(end)}`;
};

// Active months -> their contiguous intervals, e.g. "Jan/26–Mar/26 · Jul/26–Dez/26".
// A single-month interval renders as just "Mai/26".
export function formatMonths(months: number[]): string {
  return monthsToIntervals(months)
    .map(({ start, end }) => rangeLabel(start, end))
    .join(" · ");
}
