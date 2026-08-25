import type { SettingMode } from "@/core/entities/settings.entity.ts";
import type { HeadroomKind } from "./headroom.helper.ts";

export function goalsLede(
  kind: HeadroomKind,
  mode: SettingMode,
  percent: number,
): string {
  if (kind === "error") {
    return "Não foi possível calcular o limite agora.";
  }
  if (kind === "empty") {
    return "Sem previsões nem movimentações ainda — o limite aparece quando houver período.";
  }
  if (mode === "percent") {
    return `Com ${percent}% do teto de gastos, o limite deste mês é`;
  }
  return "Com o valor fixo, o limite deste mês é";
}
