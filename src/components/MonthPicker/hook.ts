import { type ChangeEvent, useEffect } from "react";
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
    // The <select> event is unwrapped here so index.tsx passes a plain
    // reference instead of building a closure in the JSX.
    onMonthChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(composeYyyymm(year, Number(event.target.value))),
    onYearChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(composeYyyymm(Number(event.target.value), month)),
  };
}
