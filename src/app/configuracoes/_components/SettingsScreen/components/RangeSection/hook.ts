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
  // MonthPicker self-seeds to the current month the instant it sees a null
  // value, indistinguishable from a real pick at the call-site — so Salvar
  // must stay disabled until a pick happens while a value already exists
  // (a self-seed only ever fires while the tracked value is still null).
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data) {
        setRangeStartValue(data.rangeStart);
        setRangeEndValue(data.rangeEnd);
        setSavedRangeStart(data.rangeStart);
        setSavedRangeEnd(data.rangeEnd);
        setTouched(data.rangeStart !== null || data.rangeEnd !== null);
      }
    });
  }, []);

  const setRangeStart = (value: number) => {
    if (rangeStart !== null) setTouched(true);
    setRangeStartValue(value);
  };

  const setRangeEnd = (value: number) => {
    if (rangeEnd !== null) setTouched(true);
    setRangeEndValue(value);
  };

  const onSave = async () => {
    const result = await apiPut("/api/settings", { rangeStart, rangeEnd });
    setError(result.error);
    if (!result.error) {
      setSavedRangeStart(rangeStart);
      setSavedRangeEnd(rangeEnd);
      setOpen(false);
    }
  };

  const openModal = () => {
    setError(undefined);
    setOpen(true);
  };

  return {
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    savedRangeStart,
    savedRangeEnd,
    touched,
    error,
    open,
    openModal,
    closeModal: () => setOpen(false),
    onSave,
  };
}
