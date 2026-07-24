import { useRef, useState } from "react";
import { type Interval, monthsToIntervals } from "./intervals.helper";

// A stable per-row key so React reconciles rows correctly across add/remove
// (index keys would mis-associate rows). Not persisted — UI-only.
export type KeyedInterval = Interval & { key: number };

export function useRecurrenceIntervals(
  initialMonths: number[] | undefined,
  months: number[],
) {
  const nextKey = useRef(0);
  const withKeys = (list: Interval[]): KeyedInterval[] =>
    list.map((it) => ({ ...it, key: nextKey.current++ }));

  const [intervals, setIntervals] = useState<KeyedInterval[]>(() => {
    if (initialMonths?.length)
      return withKeys(monthsToIntervals(initialMonths));
    return months.length
      ? withKeys([{ start: months[0], end: months[months.length - 1] }])
      : [];
  });

  const updateInterval = (index: number, next: Interval) =>
    setIntervals((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...next } : it)),
    );
  // Append a new interval starting the month AFTER the last one ends, so the
  // ordered non-overlapping chain holds by construction. No-op if the last
  // interval already reaches the end of the period.
  const addInterval = () =>
    setIntervals((prev) => {
      const lastEnd = prev[prev.length - 1]?.end;
      const startIdx = lastEnd !== undefined ? months.indexOf(lastEnd) + 1 : 0;
      const start = months[startIdx];
      if (start === undefined) return prev;
      return [
        ...prev,
        { key: nextKey.current++, start, end: months[months.length - 1] },
      ];
    });
  const removeInterval = (index: number) =>
    setIntervals((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  return { intervals, updateInterval, addInterval, removeInterval };
}
