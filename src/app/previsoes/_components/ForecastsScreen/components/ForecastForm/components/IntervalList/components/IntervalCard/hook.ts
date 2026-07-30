import { addMonths } from "@/lib/months";
import type { Interval } from "../../../../intervals.helper";
import type { KeyedInterval } from "../../../../intervals.hook";

export type IntervalCardProps = {
  interval: KeyedInterval;
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, next: Interval) => void;
  onRemove: (index: number) => void;
};

export function useIntervalCard({
  interval,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: IntervalCardProps) {
  const { key, start, end } = interval;
  // Derived, never stored: one month selected means start and end coincide.
  const isLocked = start === end;

  return {
    idPrefix: `forecast-interval-${key}`,
    start,
    end,
    isLocked,
    canRemove,
    removeLabel: `Remover intervalo ${index + 1}`,
    onStartChange: (value: number) => onUpdate(index, { start: value, end }),
    onEndChange: (value: number) => onUpdate(index, { start, end: value }),
    onMonthChange: (value: number) =>
      onUpdate(index, { start: value, end: value }),
    // Unlocking pushes `end` one month out, or the row would re-derive as
    // locked on the very next render and the toggle would look stuck.
    onLockToggle: () =>
      onUpdate(
        index,
        isLocked ? { start, end: addMonths(end, 1) } : { start, end: start },
      ),
    onRemove: () => onRemove(index),
  };
}
