import type { SettingMode } from "@/core/entities/settings.entity.ts";
import type { HeadroomKind } from "../../headroom.helper.ts";
import { maxHint } from "../../max-hint.helper.ts";

interface GoalsLimitSectionProps {
  mode: SettingMode;
  percent: number;
  cents: number;
  headroomKind: HeadroomKind;
  maxCents: number | null;
  onModeChange: (mode: SettingMode) => void;
  onPercentChange: (raw: string) => void;
  onCentsChange: (cents: number) => void;
}

function useGoalsLimitSection(props: GoalsLimitSectionProps) {
  return {
    ...props,
    isPercent: props.mode === "percent",
    percentValue: String(props.percent),
    maxHint: maxHint(props.headroomKind, props.maxCents),
  };
}

export type { GoalsLimitSectionProps };
export { useGoalsLimitSection };
