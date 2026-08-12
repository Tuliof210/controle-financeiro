import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

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

export { limitLabel, monthsWord, noteFor, shareOf };
