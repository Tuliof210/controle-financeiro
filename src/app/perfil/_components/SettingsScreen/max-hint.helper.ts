import { formatMoney } from "@/lib/money.ts";
import type { HeadroomKind } from "./headroom.helper.ts";

export function maxHint(kind: HeadroomKind, maxCents: number | null): string {
  if (kind === "error") {
    return "Não foi possível calcular o máximo agora.";
  }
  if (kind === "empty" || maxCents === null) {
    return "Sem previsões nem movimentações ainda, não há máximo a respeitar.";
  }
  return `No máximo ${formatMoney(maxCents)} — acima disso algum mês futuro fecharia no vermelho.`;
}
