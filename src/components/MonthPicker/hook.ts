import { useEffect } from "react";
import {
  composeYyyymm,
  currentYyyymm,
  MONTH_LABELS,
  splitYyyymm,
  yearOptions,
} from "@/lib/months.ts";

export interface MonthPickerProps {
  label: string;
  value: number | null;
  onChange: (yyyymm: number) => void;
  id: string;
}

export function useMonthPicker({
  label,
  value,
  onChange,
  id,
}: MonthPickerProps) {
  useEffect(() => {
    if (value === null) {
      onChange(currentYyyymm());
    }
  }, [value, onChange]);

  const { year, month } = splitYyyymm(value ?? currentYyyymm());

  return {
    label,
    id,
    year,
    month,
    months: MONTH_LABELS,
    years: yearOptions(),
    onMonthChange: (nextMonth: number) =>
      onChange(composeYyyymm(year, nextMonth)),
    onYearChange: (nextYear: number) =>
      onChange(composeYyyymm(nextYear, month)),
  };
}
