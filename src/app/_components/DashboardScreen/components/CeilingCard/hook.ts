import type { Ceiling, CeilingRates } from "@/app/api/dashboard/ceiling.types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { useShowAll } from "../../show-all.hook";

// `current` is the range's current month — the only thing that makes a row the
// current one. It rides along in the same payload, so no extra fetch.
export type CeilingCardProps = { ceiling: Ceiling; current: number };

// Both headlines carry the same secondary line, so it is written once. The
// divisions already happened in the payload; this only formats them.
const splitsOf = (rates: CeilingRates) =>
  `${formatMoney(rates.weekly)}/sem · ${formatMoney(rates.daily)}/dia`;

export function useCeilingCard({ ceiling, current }: CeilingCardProps) {
  const { monthly, tightest, firstRed, months, average } = ceiling;

  // The same figure on every row — that is the whole point of the second
  // hypothesis — so it is formatted once, outside the map.
  const averageSpend = formatMoney(average.monthly);

  // Two readings of the same month, side by side. Nothing is computed here: the
  // payload carries both balances and both leftovers precisely so the screen
  // cannot arrive at a third answer.
  //
  // `negative` is asked of both sides even though only the average one can be
  // true today (a ceiling is floored against a suffix minimum that is itself at
  // or below the month's own balance). Both blocks render through one component,
  // and special-casing a branch that costs one boolean is the more expensive of
  // the two.
  const rows = months.map((month) => ({
    key: month.month,
    label: formatYyyymm(month.month),
    isCurrent: month.month === current,
    ceiling: {
      balance: formatMoney(month.ceilingBalance),
      spend: formatMoney(month.budget),
      left: formatMoney(month.ceilingLeft),
      negative: month.ceilingLeft < 0,
    },
    average: {
      balance: formatMoney(month.averageBalance),
      spend: averageSpend,
      left: formatMoney(month.averageLeft),
      negative: month.averageLeft < 0,
    },
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
      average: averageSpend,
      averageSplits: splitsOf(average),
      // `months` is the range's REMAINING months (current .. end, per
      // `ceiling.types.ts`), never its total length. It is also the average's
      // denominator, which is why it is said beside the average.
      monthsLeft: `${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}`,
    },
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
