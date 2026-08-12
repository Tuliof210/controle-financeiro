import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity.ts";
import { apiGet, apiPut } from "@/lib/api.ts";

// No modal and no refetch, unlike its two neighbours: this section is one row
// that always exists, so there is nothing to open and nothing to re-list. The
// PUT's own response is the saved state.
export function useSpendingGoalSection() {
  const [cents, setCents] = useState(0);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings | null>("/api/settings").then((result) => {
      if (result.error) {
        setError(result.error);
        return;
      }
      // `null` is the never-saved state, and zero is how it reads: the Meta
      // target is off either way, so the field starts empty in both.
      setCents(result.data?.monthlyGoalCents ?? 0);
    });
  }, []);

  // Typing invalidates the "Salvo" label — otherwise the button claims an
  // amount is stored while the field shows a different one.
  const onChange = (value: number) => {
    setCents(value);
    setSaved(false);
  };

  const onSave = async () => {
    const result = await apiPut("/api/settings", { monthlyGoalCents: cents });
    setError(result.error);
    setSaved(!result.error);
  };

  return {
    cents,
    error,
    onChange,
    onSave,
    // The button reports the last save rather than offering the same action
    // twice, so the label and the variant move together.
    saveVariant: saved ? ("success" as const) : ("primary" as const),
    saveLabel: saved ? "Salvo" : "Salvar",
  };
}
