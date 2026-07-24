import { useEffect } from "react";
import {
  composeYYYYMM,
  currentYYYYMM,
  MONTH_LABELS,
  splitYYYYMM,
  yearOptions,
} from "@/lib/months";

export type MonthPickerProps = {
  label: string;
  value: number | null;
  onChange: (yyyymm: number) => void;
  id: string;
};

export function useMonthPicker({
  label,
  value,
  onChange,
  id,
}: MonthPickerProps) {
  useEffect(() => {
    if (value === null) {
      onChange(currentYYYYMM());
    }
  }, [value, onChange]);

  const { year, month } = splitYYYYMM(value ?? currentYYYYMM());

  return {
    label,
    id,
    year,
    month,
    months: MONTH_LABELS,
    years: yearOptions(),
    onMonthChange: (nextMonth: number) =>
      onChange(composeYYYYMM(year, nextMonth)),
    onYearChange: (nextYear: number) =>
      onChange(composeYYYYMM(nextYear, month)),
  };
}
