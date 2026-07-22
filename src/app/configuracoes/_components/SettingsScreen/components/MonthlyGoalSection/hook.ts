import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useMonthlyGoalSection() {
  const [monthlyGoalCents, setMonthlyGoalCentsValue] = useState(0);
  // Blocks Salvar until the initial GET resolves -- otherwise a click
  // before it lands PUTs the still-0 default over whatever was saved.
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data?.monthlyGoalCents != null) {
        setMonthlyGoalCentsValue(data.monthlyGoalCents);
      }
      setLoaded(true);
    });
  }, []);

  const setMonthlyGoalCents = (cents: number) => {
    setMonthlyGoalCentsValue(cents);
    setSaved(false);
  };

  const onSave = async () => {
    const result = await apiPut("/api/settings", { monthlyGoalCents });
    setError(result.error);
    setSaved(!result.error);
  };

  return {
    monthlyGoalCents,
    setMonthlyGoalCents,
    loaded,
    saved,
    error,
    onSave,
  };
}
