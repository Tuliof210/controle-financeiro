import type { SettingMode, Settings } from "@/core/entities/settings.entity.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { clampPercent } from "./percent.helper.ts";

export function prefsEdits(
  edit: (patch: Partial<Settings>) => void,
  maxCents: number | null,
) {
  return {
    onModeChange: (field: "ceilingMode" | "goalsMode", mode: SettingMode) =>
      edit({ [field]: mode }),
    onPercentChange: (field: "ceilingPercent" | "goalsPercent", raw: string) =>
      edit({ [field]: clampPercent(raw) }),
    onCentsChange: (field: "ceilingCents" | "goalsCents", cents: number) =>
      edit({ [field]: Math.min(cents, maxCents ?? MAX_CENTS) }),
    onSimulatedChange: (value: boolean) => edit({ showSimulated: value }),
  };
}
