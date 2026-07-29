import { useRef, useState } from "react";
import { type Interval, monthsToIntervals } from "@/lib/month-intervals.helper";
import { currentYYYYMM } from "@/lib/months";

// A stable per-row key so React reconciles rows correctly across add/remove
// (index keys would mis-associate rows). Not persisted — UI-only.
export type KeyedInterval = Interval & { key: number };

// No period to seed a default interval from any more — a fresh interval
// (initial or added) starts as the current month, both ends non-null from the
// first render so MonthPicker's mount-time self-seed can never fire.
const defaultInterval = (): Interval => ({
  start: currentYYYYMM(),
  end: currentYYYYMM(),
});

export function useRecurrenceIntervals(initialMonths: number[] | undefined) {
  const nextKey = useRef(0);
  const withKeys = (list: Interval[]): KeyedInterval[] =>
    list.map((it) => ({ ...it, key: nextKey.current++ }));

  const [intervals, setIntervals] = useState<KeyedInterval[]>(() =>
    withKeys(
      initialMonths?.length
        ? monthsToIntervals(initialMonths)
        : [defaultInterval()],
    ),
  );

  const updateInterval = (index: number, next: Interval) =>
    setIntervals((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...next } : it)),
    );
  const addInterval = () =>
    setIntervals((prev) => [
      ...prev,
      { key: nextKey.current++, ...defaultInterval() },
    ]);
  const removeInterval = (index: number) =>
    setIntervals((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  return { intervals, updateInterval, addInterval, removeInterval };
}
