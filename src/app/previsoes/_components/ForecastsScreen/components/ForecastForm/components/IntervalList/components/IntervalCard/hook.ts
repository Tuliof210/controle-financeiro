import { addMonths, buildMonths, formatYyyymm } from "@/lib/months.ts";
import type { Interval } from "../../../../intervals.helper.ts";
import type { KeyedInterval } from "../../../../intervals.hook.ts";

interface IntervalCardProps {
  interval: KeyedInterval;
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, next: Interval) => void;
  onRemove: (index: number) => void;
}

// A locked card is one month, so it shows that month alone rather than a range
// pointing at itself.
function rangeLabelOf(isLocked: boolean, start: number, end: number): string {
  if (isLocked) {
    return formatYyyymm(start);
  }
  return `${formatYyyymm(start)} → ${formatYyyymm(end)}`;
}

// An inverted range gets the same "—" placeholder formatYyyymm uses for a
// missing value, rather than a "0 meses" that reads like a real duration.
function durationLabelOf(months: number): string {
  if (months === 0) {
    return "—";
  }
  if (months === 1) {
    return "1 mês";
  }
  return `${months} meses`;
}

// Unlocking opens the range one month past its end; locking collapses it onto
// the start.
function unlockedRange(isLocked: boolean, start: number, end: number) {
  if (isLocked) {
    return { start, end: addMonths(end, 1) };
  }
  return { start, end: start };
}

function useIntervalCard({
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
    rangeLabel: rangeLabelOf(isLocked, start, end),
    durationLabel: durationLabelOf(months),
    removeLabel: `Remover intervalo ${index + 1}`,
    onStartChange: (value: number) => onUpdate(index, { start: value, end }),
    onEndChange: (value: number) => onUpdate(index, { start, end: value }),
    onMonthChange: (value: number) =>
      onUpdate(index, { start: value, end: value }),
    // Unlocking pushes `end` one month out, or the row would re-derive as
    // locked on the very next render and the toggle would look stuck.
    onLockToggle: () => onUpdate(index, unlockedRange(isLocked, start, end)),
    onRemove: () => onRemove(index),
  };
}

export type { IntervalCardProps };
export { useIntervalCard };
