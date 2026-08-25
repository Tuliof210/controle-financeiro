import { formatMoney } from "@/lib/money.ts";
import type { HeadroomKind } from "./headroom.helper.ts";

const RED_MONTHS = "acima disso algum mês futuro fecharia no vermelho.";

export function maxHint(
  kind: HeadroomKind,
  maxCents: number | null,
  cap = RED_MONTHS,
): string {
  if (kind === "error") {
    return "Não foi possível calcular o máximo agora.";
  }
  if (kind === "empty" || maxCents === null) {
    return "Sem previsões nem movimentações ainda, não há máximo a respeitar.";
  }
  return `No máximo ${formatMoney(maxCents)} — ${cap}`;
}
