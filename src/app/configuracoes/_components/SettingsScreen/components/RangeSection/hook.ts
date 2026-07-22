import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useRangeSection() {
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data) {
        setRangeStart(data.rangeStart);
        setRangeEnd(data.rangeEnd);
      }
    });
  }, []);

  const onSave = async () => {
    const result = await apiPut("/api/settings", { rangeStart, rangeEnd });
    setError(result.error);
    setSaved(!result.error);
  };

  return {
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    error,
    saved,
    onSave,
  };
}
