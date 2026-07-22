import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useRangeSection() {
  const [rangeStart, setRangeStartValue] = useState<number | null>(null);
  const [rangeEnd, setRangeEndValue] = useState<number | null>(null);
  // What the server actually has saved — independent of rangeStart/rangeEnd,
  // which MonthPicker auto-seeds to the current month whenever null. The
  // summary must reflect "unset" until a real save, never that auto-seed.
  const [savedRangeStart, setSavedRangeStart] = useState<number | null>(null);
  const [savedRangeEnd, setSavedRangeEnd] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data) {
        setRangeStartValue(data.rangeStart);
        setRangeEndValue(data.rangeEnd);
        setSavedRangeStart(data.rangeStart);
        setSavedRangeEnd(data.rangeEnd);
      }
    });
  }, []);

  const setRangeStart = (value: number) => {
    setRangeStartValue(value);
    setSaved(false);
  };

  const setRangeEnd = (value: number) => {
    setRangeEndValue(value);
    setSaved(false);
  };

  const onSave = async () => {
    const result = await apiPut("/api/settings", { rangeStart, rangeEnd });
    setError(result.error);
    setSaved(!result.error);
    if (!result.error) {
      setSavedRangeStart(rangeStart);
      setSavedRangeEnd(rangeEnd);
    }
  };

  return {
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    savedRangeStart,
    savedRangeEnd,
    error,
    saved,
    onSave,
  };
}
