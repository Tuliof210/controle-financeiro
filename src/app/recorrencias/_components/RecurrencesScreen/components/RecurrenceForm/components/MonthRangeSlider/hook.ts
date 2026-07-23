import { formatYyyymm } from "@/app/recorrencias/_components/RecurrencesScreen/recurrence-range.helper";

export type MonthRangeSliderProps = {
  months: number[];
  rangeStart: number;
  rangeEnd: number;
  onChange: (next: { rangeStart: number; rangeEnd: number }) => void;
};

export function useMonthRangeSlider({
  months,
  rangeStart,
  rangeEnd,
  onChange,
}: MonthRangeSliderProps) {
  const lastIndex = Math.max(months.length - 1, 0);
  const startIdx = Math.max(months.indexOf(rangeStart), 0);
  const endIdxRaw = months.indexOf(rangeEnd);
  const endIdx = endIdxRaw === -1 ? lastIndex : endIdxRaw;

  // Pin start/end together instead of letting either thumb cross the other.
  const emit = (nextStart: number, nextEnd: number) =>
    onChange({ rangeStart: months[nextStart], rangeEnd: months[nextEnd] });

  return {
    disabled: months.length <= 1,
    lastIndex,
    startIdx,
    endIdx,
    startLabel:
      months[startIdx] !== undefined ? formatYyyymm(months[startIdx]) : "—",
    endLabel: months[endIdx] !== undefined ? formatYyyymm(months[endIdx]) : "—",
    fillStartPct: lastIndex ? (startIdx / lastIndex) * 100 : 0,
    fillEndPct: lastIndex ? (endIdx / lastIndex) * 100 : 100,
    onStartChange: (index: number) => emit(Math.min(index, endIdx), endIdx),
    onEndChange: (index: number) => emit(startIdx, Math.max(index, startIdx)),
  };
}
