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
    onStartChange: (index: number) => (start: number) =>
      onUpdate(index, { start, end: intervals[index].end }),
    onEndChange: (index: number) => (end: number) =>
      onUpdate(index, { start: intervals[index].start, end }),
    onAdd,
    onRemove,
  };
}
