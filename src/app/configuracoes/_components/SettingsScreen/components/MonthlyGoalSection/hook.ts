import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity";
import { apiGet, apiPut } from "@/lib/api";

export function useMonthlyGoalSection() {
  const [monthlyGoalCents, setMonthlyGoalCentsValue] = useState(0);
  // The saved value shown in the summary — independent of the editable field.
  const [savedGoalCents, setSavedGoalCents] = useState(0);
  // Blocks Salvar until the initial GET resolves -- otherwise a click
  // before it lands PUTs the still-0 default over whatever was saved.
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings").then((result) => {
      if (result.data?.monthlyGoalCents != null) {
        setMonthlyGoalCentsValue(result.data.monthlyGoalCents);
        setSavedGoalCents(result.data.monthlyGoalCents);
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      setLoaded(true);
    });
  }, []);

  const onSave = async () => {
    const result = await apiPut("/api/settings", { monthlyGoalCents });
    setError(result.error);
    if (!result.error) {
      setSavedGoalCents(monthlyGoalCents);
      setOpen(false);
    }
  };

  const openModal = () => {
    setError(undefined);
    setOpen(true);
  };

  return {
    monthlyGoalCents,
    setMonthlyGoalCents: setMonthlyGoalCentsValue,
    savedGoalCents,
    loaded,
    error,
    open,
    openModal,
    closeModal: () => setOpen(false),
    onSave,
  };
}
