import type { SettingMode } from "@/core/entities/settings.entity.ts";
import { goalsLede } from "../../goals-lede.helper.ts";
import type { HeadroomKind } from "../../headroom.helper.ts";
import { maxHint } from "../../max-hint.helper.ts";

const PERCENT = 100;
const TETO_CAP = "o teto de gastos deste mês.";

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
  const { headroomKind, mode, percent, cents, maxCents } = props;
  let share = 0;
  if (maxCents !== null) {
    share = Math.floor((maxCents * percent) / PERCENT);
  }
  let figureCents = cents;
  if (mode === "percent") {
    figureCents = share;
  }

  return {
    ...props,
    isPercent: mode === "percent",
    percentValue: String(percent),
    maxHint: maxHint(headroomKind, maxCents, TETO_CAP),
    lede: goalsLede(headroomKind, mode, percent),
    showFigure: headroomKind === "ok" && maxCents !== null,
    figureCents,
  };
}

export type { GoalsLimitSectionProps };
export { useGoalsLimitSection };
