import { addMonths } from "@/lib/months";
import type { Interval } from "../../intervals.helper";
import type { KeyedInterval } from "../../intervals.hook";

export type IntervalListProps = {
  intervals: KeyedInterval[];
  onUpdate: (index: number, next: Interval) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function useIntervalList({
  intervals,
  onUpdate,
  onAdd,
  onRemove,
}: IntervalListProps) {
  return {
    intervals,
    canRemove: intervals.length > 1,
    isLocked: (index: number) =>
      intervals[index].start === intervals[index].end,
    onStartChange: (index: number) => (start: number) =>
      onUpdate(index, { start, end: intervals[index].end }),
    onEndChange: (index: number) => (end: number) =>
      onUpdate(index, { start: intervals[index].start, end }),
    onMonthChange: (index: number) => (value: number) =>
      onUpdate(index, { start: value, end: value }),
    onLockToggle: (index: number) => () => {
      const { start, end } = intervals[index];
      onUpdate(
        index,
        start === end
          ? { start, end: addMonths(end, 1) }
          : { start, end: start },
      );
    },
    onAdd,
    onRemove,
  };
}
