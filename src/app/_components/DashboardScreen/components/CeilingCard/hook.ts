import type { Ceiling } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { sharePercent } from "../../list-cards.helper";
import { useShowAll } from "../../show-all.hook";

// `current` is the range's current month — the only thing that makes a row a
// projection. It rides along in the same payload, so no extra fetch.
export type CeilingCardProps = { ceiling: Ceiling; current: number };

export function useCeilingCard({ ceiling, current }: CeilingCardProps) {
  const { monthly, weekly, daily, tightest, firstRed, months } = ceiling;

  // Two quantities per row, and they are not the same one: `budget` is what that
  // month may spend, the bar is what is left of the worst balance ahead once
  // every budget up to it has been taken. Each carries its own label on screen
  // and both go into the accessible name, so a bar can never be read as
  // measuring the figure beside it.
  //
  // No divisor guard needed: `monthly > 0` implies every `worstAhead` here is
  // positive, and the bars only render in that case.
  const rows = months.map((month) => {
    const label = formatYyyymm(month.month);
    const budget = formatMoney(month.budget);
    const remaining = formatMoney(month.remaining);
    const of = formatMoney(month.worstAhead);
    return {
      key: month.month,
      label,
      percent: sharePercent(month.remaining, month.worstAhead),
      projected: month.month > current,
      budget,
      remaining,
      of,
      srLabel: `${label}: gasto extra ${budget}, restam ${remaining} de ${of}`,
    };
  });

  return {
    empty: monthly === 0,
    // Naming the FIRST month in the red says when it breaks, which is the
    // deadline to act on; a deeper month later does not move that date.
    note: firstRed
      ? `Sem teto: ${formatYyyymm(firstRed.month)} fecha ${formatMoney(firstRed.shortfall)} no vermelho.`
      : "Sem teto: o saldo acumulado projetado não cobre nenhum gasto extra recorrente.",
    monthly: formatMoney(monthly),
    splits: `${formatMoney(weekly)}/sem · ${formatMoney(daily)}/dia`,
    // The headline is THIS month's figure, so it no longer "vale" for the whole
    // period the way a flat rate did — the count says how many months the list
    // below covers, and `tightest` names the month whose balance caps the
    // headline. `months` is the range's REMAINING months (current .. end, per
    // `types.ts`), never its total length — a range read anywhere but its first
    // month has fewer months left than it is long.
    //
    // Inert by construction, kept only to satisfy the type: `tightest` is
    // null exactly when `monthly` is 0, which is the same condition `empty`
    // above short-circuits on — so this branch is never rendered with it.
    // Mutating the fallback changes nothing observable; there is no test for
    // it because there is no reachable behaviour.
    horizon: tightest
      ? `${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}. Este mês é limitado por ${formatYyyymm(tightest)}.`
      : null,
    ...useShowAll(rows),
  };
}
