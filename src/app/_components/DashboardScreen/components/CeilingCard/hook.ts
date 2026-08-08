import type { Ceiling } from "@/app/api/dashboard/ceiling.types";
import { type CeilingCap, META_CAP } from "@/lib/ceiling-caps";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { useShowAll } from "../../show-all.hook";

// `current` is the range's current month — the only thing that makes a row the
// current one. It rides along in the same payload, so no extra fetch.
//
// `cap` passes through to the selector, and is read once more here: under Meta
// the figure has two possible limits and the badge must name the right one.
export type CeilingCardProps = {
  ceiling: Ceiling;
  // Baked into the figures below, so the card never prints it — only compares
  // against it, to tell "the goal capped this month" from "a later month did".
  meta: number | null;
  current: number;
  cap: CeilingCap;
  onCapChange: (cap: CeilingCap) => void;
};

export function useCeilingCard({
  ceiling,
  meta,
  current,
  cap,
  onCapChange,
}: CeilingCardProps) {
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
    // How much of the balance ARRIVING at the month its ceiling takes — the two
    // figures either side of it, as one proportion. Guarded because a zero
    // balance is a real state (a month whose money has not arrived yet) and it
    // is the divisor; clamped because the type says `budget: number`, not
    // "at most the cap's share", even though the arithmetic guarantees it.
    share:
      month.ceilingBalance > 0
        ? Math.min(1, Math.max(0, month.budget / month.ceilingBalance))
        : 0,
  }));

  const show = useShowAll(rows);

  // `monthly` is months[0].budget, produced as min(headroom, meta) — so it
  // reaching the goal IS the goal having bound it. Equality counts as the goal:
  // both are the limit, and the goal is the one the reader just chose.
  const byMeta = cap === META_CAP && meta !== null && monthly === meta;
  const month = tightest ? `Limitado por ${formatYyyymm(tightest)}` : null;
  const limit = byMeta ? "Limitado pela meta" : month;

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
    // Two labelled figures rather than the one "x/sem · y/dia" string they used
    // to be: the summary pane has the room, and a labelled figure is what the
    // rest of this card is made of.
    rates: [
      { key: "weekly", label: "Por semana", value: formatMoney(weekly) },
      { key: "daily", label: "Por dia", value: formatMoney(daily) },
    ],
    // `months` is the range's REMAINING months (current .. end, per
    // `ceiling.types.ts`), never its total length — it is exactly what the
    // column under the headline lists, which is why it sits on the headline.
    monthsLeft: `${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}`,
    // Null exactly when `monthly` is 0, i.e. exactly when `empty` is true, so
    // the badge simply does not render in that state.
    // Naming the tightest month is honest only while the HEADROOM binds. Under
    // Meta the normal case is the reverse — the goal is the smaller of the two,
    // and the badge would name a month that would have allowed more.
    limitedBy: limit,
    currentLabel: formatYyyymm(current),
    // How much of the list is on screen. The toggle beside it says the same
    // thing as an action; this says it as a fact, and survives the collapse.
    count: `${show.rows.length} de ${months.length} meses`,
    cap,
    hasMeta: meta !== null,
    onCapChange,
    ...show,
  };
}
