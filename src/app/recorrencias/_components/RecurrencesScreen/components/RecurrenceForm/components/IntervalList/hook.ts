import type { Interval } from "../../intervals.helper";
import type { KeyedInterval } from "../../intervals.hook";

export type IntervalListProps = {
  months: number[];
  intervals: KeyedInterval[];
  onUpdate: (index: number, next: Interval) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function useIntervalList({
  months,
  intervals,
  onUpdate,
  onAdd,
  onRemove,
}: IntervalListProps) {
  return {
    months,
    intervals,
    canRemove: intervals.length > 1,
    // Adapt the slider's {rangeStart,rangeEnd} back to the form's {start,end}.
    onSliderChange:
      (index: number) => (next: { rangeStart: number; rangeEnd: number }) =>
        onUpdate(index, { start: next.rangeStart, end: next.rangeEnd }),
    onAdd,
    onRemove,
  };
}
