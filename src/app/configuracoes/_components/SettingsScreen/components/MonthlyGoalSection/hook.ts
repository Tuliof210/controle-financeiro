import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useMonthlyGoalSection() {
  const [monthlyGoalCents, setMonthlyGoalCentsValue] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data?.monthlyGoalCents != null) {
        setMonthlyGoalCentsValue(data.monthlyGoalCents);
      }
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

  return { monthlyGoalCents, setMonthlyGoalCents, saved, error, onSave };
}
