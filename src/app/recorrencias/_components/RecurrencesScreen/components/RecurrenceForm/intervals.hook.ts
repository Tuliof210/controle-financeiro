import { useRef, useState } from "react";
import { type Interval, monthsToIntervals } from "./intervals.helper";

// A stable per-row key so React reconciles rows correctly across add/remove
// (index keys would mis-associate rows). Not persisted — UI-only.
export type KeyedInterval = Interval & { key: number };

export function useRecurrenceIntervals(
  initialMonths: number[] | undefined,
  period: { start: number; end: number } | null,
) {
  const nextKey = useRef(0);
  const withKeys = (list: Interval[]): KeyedInterval[] =>
    list.map((it) => ({ ...it, key: nextKey.current++ }));

  const [intervals, setIntervals] = useState<KeyedInterval[]>(() =>
    withKeys(
      initialMonths?.length
        ? monthsToIntervals(initialMonths)
        : period
          ? [{ start: period.start, end: period.end }]
          : [],
    ),
  );

  const updateInterval = (index: number, next: Interval) =>
    setIntervals((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...next } : it)),
    );
  const addInterval = () =>
    period &&
    setIntervals((prev) => [
      ...prev,
      { key: nextKey.current++, start: period.start, end: period.end },
    ]);
  const removeInterval = (index: number) =>
    setIntervals((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  return { intervals, updateInterval, addInterval, removeInterval };
}
