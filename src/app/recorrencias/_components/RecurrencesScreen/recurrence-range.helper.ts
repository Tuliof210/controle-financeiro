import { formatYyyymm } from "@/lib/months";
import { monthsToIntervals } from "./components/RecurrenceForm/intervals.helper";

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
