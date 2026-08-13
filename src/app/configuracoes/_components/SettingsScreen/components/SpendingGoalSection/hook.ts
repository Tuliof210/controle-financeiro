import { useEffect, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity.ts";
import { apiGet, apiPut } from "@/lib/api.ts";

// The save is reported beside the button, not on it. It used to swap the label
// to "Salvo" and the variant to `success`, which spent the semantic green on a
// past-tense readout, renamed the focused control without announcing it, and
// left the reader with a button that no longer said what pressing it would do.
const savedMessageFor = (saved: boolean): string => {
  if (saved) {
    return "Meta salva.";
  }
  return "";
};

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

  // Typing clears the confirmation — otherwise the card claims an amount is
  // stored while the field shows a different one.
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
    // Empty rather than absent: the <p> carrying this is a live region, and a
    // region has to be in the DOM before its text changes to be announced.
    savedMessage: savedMessageFor(saved),
  };
}
