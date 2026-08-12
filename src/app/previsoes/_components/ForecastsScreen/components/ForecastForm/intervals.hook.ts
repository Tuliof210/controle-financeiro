import { useRef, useState } from "react";
import { currentYyyymm } from "@/lib/months.ts";
import { type Interval, monthsToIntervals } from "./intervals.helper.ts";

// The last interval is never removed: a forecast with no months is not a
// forecast, and the form has no other way back.
const dropAt = <T>(rows: T[], index: number): T[] => {
  if (rows.length <= 1) {
    return rows;
  }
  return rows.filter((_, i) => i !== index);
};

const replaceAt = <T>(row: T, i: number, index: number, next: object): T => {
  if (i !== index) {
    return row;
  }
  return { ...row, ...next };
};

// A stable per-row key so React reconciles rows correctly across add/remove
// (index keys would mis-associate rows). Not persisted — UI-only.
type KeyedInterval = Interval & { key: number };

// No period to seed a default interval from any more — a fresh interval
// (initial or added) starts as the current month, both ends non-null from the
// first render so MonthPicker's mount-time self-seed can never fire.
const defaultInterval = (): Interval => ({
  start: currentYyyymm(),
  end: currentYyyymm(),
});

function useForecastIntervals(initialMonths: number[] | undefined) {
  const nextKey = useRef(0);
  const takeKey = (): number => {
    const key = nextKey.current;
    nextKey.current += 1;
    return key;
  };
  const withKeys = (list: Interval[]): KeyedInterval[] =>
    list.map((it) => ({ ...it, key: takeKey() }));

  const seed = () => {
    if (initialMonths && initialMonths.length > 0) {
      return monthsToIntervals(initialMonths);
    }
    return [defaultInterval()];
  };
  const [intervals, setIntervals] = useState<KeyedInterval[]>(() =>
    withKeys(seed()),
  );

  const updateInterval = (index: number, next: Interval) =>
    setIntervals((prev) => prev.map((it, i) => replaceAt(it, i, index, next)));
  const addInterval = () =>
    setIntervals((prev) => [...prev, { key: takeKey(), ...defaultInterval() }]);
  const removeInterval = (index: number) =>
    setIntervals((prev) => dropAt(prev, index));

  return { intervals, updateInterval, addInterval, removeInterval };
}

export type { KeyedInterval };
export { useForecastIntervals };
