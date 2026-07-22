import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useMonthlyGoalSection() {
  const [monthlyGoalCents, setMonthlyGoalCentsValue] = useState(0);
  const [saved, setSaved] = useState(false);

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
    await apiPut("/api/settings", { monthlyGoalCents });
    setSaved(true);
  };

  return { monthlyGoalCents, setMonthlyGoalCents, saved, onSave };
}
