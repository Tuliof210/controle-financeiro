import type { SettingMode, Settings } from "@/core/entities/settings.entity.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { clampPercent } from "./percent.helper.ts";

export function prefsEdits(
  edit: (patch: Partial<Settings>) => void,
  caps: { ceiling: number | null; goals: number | null },
) {
  const capOf = (field: "ceilingCents" | "goalsCents") =>
    (field === "goalsCents" ? caps.goals : caps.ceiling) ?? MAX_CENTS;

  return {
    onModeChange: (field: "ceilingMode" | "goalsMode", mode: SettingMode) =>
      edit({ [field]: mode }),
    onPercentChange: (field: "ceilingPercent" | "goalsPercent", raw: string) =>
      edit({ [field]: clampPercent(raw) }),
    onCentsChange: (field: "ceilingCents" | "goalsCents", cents: number) =>
      edit({ [field]: Math.min(cents, capOf(field)) }),
    onSimulatedChange: (value: boolean) => edit({ showSimulated: value }),
  };
}
