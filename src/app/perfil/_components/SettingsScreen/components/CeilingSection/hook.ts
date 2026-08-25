import type { SettingMode } from "@/core/entities/settings.entity.ts";
import { formatMoney } from "@/lib/money.ts";

interface CeilingSectionProps {
  mode: SettingMode;
  percent: number; // 0..100
  cents: number;
  maxCents: number | null; // null = sem período; sem máximo a anunciar
  onModeChange: (mode: SettingMode) => void;
  onPercentChange: (raw: string) => void;
  onCentsChange: (cents: number) => void;
}

// The maximum a fixed ceiling may name, as the field's own hint. The input
// saturates there rather than refusing (the owner's call), so the number has to
// be on screen or the reader only learns the limit by hitting it.
const maxHint = (maxCents: number | null): string => {
  if (maxCents === null) {
    return "Sem previsões nem movimentações ainda, não há máximo a respeitar.";
  }
  return `No máximo ${formatMoney(maxCents)} — acima disso algum mês futuro fecharia no vermelho.`;
};

function useCeilingSection(props: CeilingSectionProps) {
  return {
    ...props,
    isPercent: props.mode === "percent",
    // The percent input rides Field's text arm: FieldProps has no percent arm,
    // and adding one for two call sites is not the trade. The parse is
    // clampPercent, one layer up.
    percentValue: String(props.percent),
    maxHint: maxHint(props.maxCents),
  };
}

export type { CeilingSectionProps };
export { useCeilingSection };
