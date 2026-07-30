import { addMonths, buildMonths, formatYyyymm } from "@/lib/months";
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
  // 0 when the user has pushed Fim behind Início — buildMonths returns [] there.
  const months = buildMonths(start, end).length;

  return {
    idPrefix: `forecast-interval-${key}`,
    start,
    end,
    isLocked,
    canRemove,
    rangeLabel: isLocked
      ? formatYyyymm(start)
      : `${formatYyyymm(start)} → ${formatYyyymm(end)}`,
    // An inverted range gets the same "—" placeholder formatYyyymm uses for a
    // missing value, rather than a "0 meses" that reads like a real duration.
    durationLabel:
      months === 0 ? "—" : months === 1 ? "1 mês" : `${months} meses`,
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
