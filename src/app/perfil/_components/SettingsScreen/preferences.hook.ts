import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import type { SettingMode, Settings } from "@/core/entities/settings.entity.ts";
import { apiGet, apiPut } from "@/lib/api.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import { clampPercent } from "./percent.helper.ts";

// Empty rather than absent: the <p> carrying it is a live region, and a region
// has to be in the DOM before its text changes to be announced.
const savedMessageFor = (saved: boolean): string => {
  if (saved) {
    return "Ajustes salvos.";
  }
  return "";
};

// Only the "ok" arm carries a ceiling: with no period there is no headroom to
// clamp a fixed amount against, and no maximum for the cards to announce.
const headroomOf = (data: DashboardData): number | null => {
  if (data.status === "ok") {
    return data.ceiling.headroomCents;
  }
  return null;
};

const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

const isDirty = (edited: Settings, loaded: Settings): boolean =>
  KEYS.some((key) => edited[key] !== loaded[key]);

// The screen owns the seven fields, not the three cards that show them: the PUT
// is all-or-nothing, so three cards each fetching and saving their own copy
// would have every save overwrite the other two. The cards are presentational.
export function usePreferences() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // What the GET brought: `dirty` compares against the stored row, not defaults.
  const [loaded, setLoaded] = useState<Settings>(DEFAULT_SETTINGS);
  const [maxCents, setMaxCents] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings | null>("/api/settings").then((result) => {
      if (result.error) {
        setError(result.error);
        return;
      }
      // `null` is the never-saved state; both ends read it as DEFAULT_SETTINGS.
      const stored = result.data ?? DEFAULT_SETTINGS;
      setSettings(stored);
      setLoaded(stored);
    });
    // The route demands `owner` and defaults `cap`/`simulation` on its own, so
    // this one param is the whole query. A failed dashboard costs the maximum,
    // never the settings, so it does not raise the screen's error.
    apiGet<DashboardData>(`/api/dashboard?owner=${FAMILY_PROFILE}`).then(
      (result) => {
        if (result.data) {
          setMaxCents(headroomOf(result.data));
        }
      },
    );
  }, []);

  // Editing anything clears the confirmation: otherwise the line claims the
  // shown values are stored while one of them is not.
  const edit = (patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  const onSave = async () => {
    const result = await apiPut("/api/settings", settings);
    setError(result.error);
    setSaved(!result.error);
    if (!result.error) {
      setLoaded(settings);
    }
  };

  return {
    settings,
    maxCents,
    dirty: isDirty(settings, loaded),
    error,
    savedMessage: savedMessageFor(saved),
    onModeChange: (field: "ceilingMode" | "goalsMode", mode: SettingMode) =>
      edit({ [field]: mode }),
    onPercentChange: (field: "ceilingPercent" | "goalsPercent", raw: string) =>
      edit({ [field]: clampPercent(raw) }),
    // The ceiling clamp: a fixed amount cannot exceed the headroom, and with no
    // period it falls back to the same guard the money Field already applies.
    onCentsChange: (field: "ceilingCents" | "goalsCents", cents: number) =>
      edit({ [field]: Math.min(cents, maxCents ?? MAX_CENTS) }),
    onSimulatedChange: (value: boolean) => edit({ showSimulated: value }),
    onSave,
  };
}
