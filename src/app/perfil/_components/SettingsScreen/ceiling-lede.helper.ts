import type { SettingMode } from "@/core/entities/settings.entity.ts";
import type { HeadroomKind } from "./headroom.helper.ts";

export function ceilingLede(
  kind: HeadroomKind,
  mode: SettingMode,
  percent: number,
): string {
  if (kind === "error") {
    return "Não foi possível calcular o teto agora.";
  }
  if (kind === "empty") {
    return "Sem previsões nem movimentações ainda — o teto aparece quando houver período.";
  }
  if (mode === "percent") {
    return `Com ${percent}% do saldo disponível, o teto deste mês é`;
  }
  return "Com o valor fixo, o teto deste mês é";
}
