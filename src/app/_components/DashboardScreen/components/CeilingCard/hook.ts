import type { Ceiling, CeilingRates } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { sharePercent } from "../../list-cards.helper";
import { useShowAll } from "../../show-all.hook";

// `current` is the range's current month — the only thing that makes a row a
// projection. It rides along in the same payload, so no extra fetch.
export type CeilingCardProps = { ceiling: Ceiling; current: number };

// Both headlines carry the same secondary line, so it is written once. The
// divisions already happened in the payload; this only formats them.
const splitsOf = (rates: CeilingRates) =>
  `${formatMoney(rates.weekly)}/sem · ${formatMoney(rates.daily)}/dia`;

export function useCeilingCard({ ceiling, current }: CeilingCardProps) {
  const { monthly, tightest, firstRed, months, average } = ceiling;

  // The bar is the month's OWN figure as a share of its own ceiling — so every
  // row reads on the same 0..100 axis and the average can be drawn across it.
  // `restam` rides along as text, not as the bar: it is a third quantity and a
  // bar can only ever be one. All three go into the accessible name, so the bar
  // can never be read as measuring whichever figure it sits nearest.
  //
  // The divisor guard lives in `sharePercent` (whole > 0 -> 0), and it is load
  // bearing now rather than belt-and-braces: the card renders whenever ANY month
  // has room, so a leading month with a `worstAhead` of 0 can reach here.
  const rows = months.map((month) => {
    const label = formatYyyymm(month.month);
    const budget = formatMoney(month.budget);
    const remaining = formatMoney(month.remaining);
    const of = formatMoney(month.worstAhead);
    return {
      key: month.month,
      label,
      percent: sharePercent(month.budget, month.worstAhead),
      mark: sharePercent(average.monthly, month.worstAhead),
      projected: month.month > current,
      isCurrent: month.month === current,
      budget,
      remaining,
      of,
      srLabel: `${label}: gasto extra ${budget}, restam ${remaining}, teto ${of}`,
    };
  });

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
    // Grouped rather than spread flat, so the card can hand `<Hero>` its whole
    // prop set without a rest spread that would silently adopt any field added
    // here later.
    hero: {
      monthly: formatMoney(monthly),
      splits: splitsOf(ceiling),
      // What this month is worth NEXT TO the period — the one thing a bare
      // figure cannot say. No divisor guard: `average.monthly` is 0 exactly when
      // every month's budget is 0, the condition `empty` above short-circuits
      // on, so this is never built over a zero denominator.
      ratio: `${(monthly / average.monthly).toFixed(1).replace(".", ",")}× a média`,
      average: formatMoney(average.monthly),
      averageSplits: splitsOf(average),
      // `months` is the range's REMAINING months (current .. end, per
      // `types.ts`), never its total length. It is also the average's
      // denominator, which is why it is said beside the average.
      monthsLeft: `${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}`,
    },
    // Null exactly when `monthly` is 0, i.e. exactly when `empty` is true, so
    // the badge simply does not render in that state.
    limitedBy: tightest ? `Limitado por ${formatYyyymm(tightest)}` : null,
    currentLabel: formatYyyymm(current),
    // What the dashed rule on every bar is, said once in words.
    markLabel: `Média dos tetos: ${formatMoney(average.monthly)}/mês`,
    // How much of the list is on screen. The toggle beside it says the same
    // thing as an action; this says it as a fact, and survives the collapse.
    count: `${show.rows.length} de ${months.length} meses`,
    // Each bar is measured against its own month's ceiling, not against the
    // largest one in the period, so a small month still fills its bar.
    scaleNote: "Barras em % do teto de cada mês",
    ...show,
  };
}
