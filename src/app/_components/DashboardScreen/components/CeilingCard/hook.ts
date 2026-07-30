import type { Ceiling } from "@/app/api/dashboard/ceiling.types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { useShowAll } from "../../show-all.hook";

// `current` is the range's current month — the only thing that makes a row the
// current one. It rides along in the same payload, so no extra fetch.
export type CeilingCardProps = { ceiling: Ceiling; current: number };

export function useCeilingCard({ ceiling, current }: CeilingCardProps) {
  const { monthly, weekly, daily, tightest, firstRed, months } = ceiling;

  // Nothing is computed here: the payload carries both the balance arriving at
  // the month and what is left after it, precisely so the screen cannot arrive
  // at a third answer.
  const rows = months.map((month) => ({
    key: month.month,
    label: formatYyyymm(month.month),
    isCurrent: month.month === current,
    balance: formatMoney(month.ceilingBalance),
    spend: formatMoney(month.budget),
    left: formatMoney(month.ceilingLeft),
  }));

  const show = useShowAll(rows);

  return {
    // Empty means "nothing to offer anywhere in the period", NOT "nothing this
    // month". An owner whose money starts in a later month has `monthly === 0`
    // and real room further down the list — hiding it would keep broken exactly
    // the half of the problem this card was rewritten to fix.
    empty: months.every((month) => month.budget === 0),
    // Naming the FIRST month in the red says when it breaks, which is the
    // deadline to act on; a deeper month later does not move that date.
    note: firstRed
      ? `Sem teto: ${formatYyyymm(firstRed.month)} fecha ${formatMoney(firstRed.shortfall)} no vermelho.`
      : "Sem teto: o saldo acumulado projetado não cobre nenhum gasto extra recorrente.",
    monthly: formatMoney(monthly),
    // The divisions already happened in the payload; this only formats them.
    splits: `${formatMoney(weekly)}/sem · ${formatMoney(daily)}/dia`,
    // `months` is the range's REMAINING months (current .. end, per
    // `ceiling.types.ts`), never its total length — it is exactly what the
    // column under the headline lists, which is why it sits on the headline.
    monthsLeft: `${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}`,
    // Null exactly when `monthly` is 0, i.e. exactly when `empty` is true, so
    // the badge simply does not render in that state.
    limitedBy: tightest ? `Limitado por ${formatYyyymm(tightest)}` : null,
    currentLabel: formatYyyymm(current),
    // How much of the list is on screen. The toggle beside it says the same
    // thing as an action; this says it as a fact, and survives the collapse.
    count: `${show.rows.length} de ${months.length} meses`,
    ...show,
  };
}
