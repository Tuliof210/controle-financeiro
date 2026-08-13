import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";
import { type CeilingCap, META_CAP } from "@/lib/ceiling-caps.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

// `monthly` is months[0].budget, produced as min(headroom, meta) — so it reaching
// the goal IS the goal having bound it. Equality counts as the goal: both are the
// limit, and the goal is the one the reader just chose.
//
// Exported because the hero band asks the same question: two copies of this
// predicate would be two ways to disagree about which limit a figure has.
function limitedByMeta(
  cap: CeilingCap,
  meta: number | null,
  monthly: number,
): boolean {
  return cap === META_CAP && meta !== null && monthly === meta;
}

// How much of the balance ARRIVING at the month its ceiling takes — the two
// figures either side of it, as one proportion. Guarded because a zero balance
// is a real state (a month whose money has not arrived yet) and it is the
// divisor; clamped because the type says `budget: number`, not "at most the
// cap's share", even though the arithmetic guarantees it.
function shareOf(budget: number, ceilingBalance: number): number {
  if (ceilingBalance <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, budget / ceilingBalance));
}

// The card's own one-sentence definition, visible in the body rather than buried
// in the hint bubble it used to open with. It is the concept the whole screen
// turns on, and a hover tooltip is the one place a touch reader never reaches.
const CEILING_DEFINITION =
  "Quanto dá para gastar a mais por mês sem nenhum mês futuro ficar no vermelho — a coluna inteira pode ser gasta em ordem.";

// The goal wins the label when both it and a month are the limit: the reader
// just chose it.
function limitLabel(byMeta: boolean, tightest: number | null): string | null {
  if (byMeta) {
    return "Limitado pela meta";
  }
  if (tightest === null) {
    return null;
  }
  return `Limitado por ${formatYyyymm(tightest)}`;
}

// Naming the FIRST month in the red says when it breaks, which is the deadline
// to act on; a deeper month later does not move that date.
function noteFor(firstRed: Ceiling["firstRed"]): string {
  if (firstRed === null) {
    return "Sem teto: o saldo acumulado projetado não cobre nenhum gasto extra recorrente.";
  }
  const when = formatYyyymm(firstRed.month);
  const how = formatMoney(firstRed.shortfall);
  return `Sem teto: ${when} fecha ${how} no vermelho.`;
}

function monthsWord(count: number): string {
  if (count === 1) {
    return "mês restante";
  }
  return "meses restantes";
}

export {
  CEILING_DEFINITION,
  limitedByMeta,
  limitLabel,
  monthsWord,
  noteFor,
  shareOf,
};
