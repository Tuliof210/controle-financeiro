import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useMonthlyGoalSection() {
  const [monthlyGoalCents, setMonthlyGoalCents] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings").then(({ data }) => {
      if (data?.monthlyGoalCents != null) {
        setMonthlyGoalCents(data.monthlyGoalCents);
      }
    });
  }, []);

  const onSave = async () => {
    await apiPut("/api/settings", { monthlyGoalCents });
    setSaved(true);
  };

  return { monthlyGoalCents, setMonthlyGoalCents, saved, onSave };
}
