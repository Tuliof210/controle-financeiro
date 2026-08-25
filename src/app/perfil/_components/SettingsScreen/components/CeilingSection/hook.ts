import type { SettingMode } from "@/core/entities/settings.entity.ts";
import { ceilingLede } from "../../ceiling-lede.helper.ts";
import type { HeadroomKind } from "../../headroom.helper.ts";
import { maxHint } from "../../max-hint.helper.ts";

interface CeilingSectionProps {
  mode: SettingMode;
  percent: number;
  cents: number;
  headroomKind: HeadroomKind;
  maxCents: number | null;
  monthlyCents: number | null;
  onModeChange: (mode: SettingMode) => void;
  onPercentChange: (raw: string) => void;
  onCentsChange: (cents: number) => void;
}

function useCeilingSection(props: CeilingSectionProps) {
  const { headroomKind, mode, percent, monthlyCents } = props;
  return {
    ...props,
    isPercent: mode === "percent",
    percentValue: String(percent),
    maxHint: maxHint(headroomKind, props.maxCents),
    lede: ceilingLede(headroomKind, mode, percent),
    showFigure: headroomKind === "ok" && monthlyCents !== null,
    figureCents: monthlyCents ?? 0,
  };
}

export type { CeilingSectionProps };
export { useCeilingSection };
