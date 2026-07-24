import { formatYyyymm } from "@/app/recorrencias/_components/RecurrencesScreen/recurrence-range.helper";
import { type Interval, intervalBounds } from "../../intervals.helper";
import type { KeyedInterval } from "../../intervals.hook";

export type IntervalListProps = {
  months: number[];
  intervals: KeyedInterval[];
  onUpdate: (index: number, next: Interval) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const toOptions = (list: number[]) =>
  list.map((month) => ({ value: month, label: formatYyyymm(month) }));

export function useIntervalList({
  months,
  intervals,
  onUpdate,
  onAdd,
  onRemove,
}: IntervalListProps) {
  const rows = intervals.map((it, i) => {
    const { startMonths, endMonths } = intervalBounds(months, intervals, i);
    return {
      key: it.key,
      start: it.start,
      end: it.end,
      startOptions: toOptions(startMonths),
      endOptions: toOptions(endMonths),
    };
  });

  const lastEnd = intervals[intervals.length - 1]?.end;
  const canAdd =
    lastEnd !== undefined && months.indexOf(lastEnd) < months.length - 1;

  return {
    rows,
    canRemove: intervals.length > 1,
    canAdd,
    onStartChange: (i: number) => (value: number) =>
      onUpdate(i, { start: value, end: intervals[i].end }),
    onEndChange: (i: number) => (value: number) =>
      onUpdate(i, { start: intervals[i].start, end: value }),
    onAdd,
    onRemove,
  };
}
