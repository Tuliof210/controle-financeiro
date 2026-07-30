import type { Interval } from "../../intervals.helper";
import type { KeyedInterval } from "../../intervals.hook";

export type IntervalListProps = {
  intervals: KeyedInterval[];
  onUpdate: (index: number, next: Interval) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

// The per-row handlers moved down to IntervalCard's hook: they are all
// index-bound, and a card that owns its own index needs no curried factory.
export function useIntervalList({
  intervals,
  onUpdate,
  onAdd,
  onRemove,
}: IntervalListProps) {
  return {
    intervals,
    canRemove: intervals.length > 1,
    onUpdate,
    onAdd,
    onRemove,
  };
}
