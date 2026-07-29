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

  // Each bar is the share of that month's OWN projected balance that survives
  // the ceiling, so the month that pins it reads 20% — the safety margin, on
  // screen. No divisor guard needed: `monthly > 0` implies every `cumulative`
  // here is positive, and the bars only render in that case.
  const rows = months.map((month) => {
    const label = formatYyyymm(month.month);
    const remaining = formatMoney(month.remaining);
    const of = formatMoney(month.cumulative);
    return {
      key: month.month,
      label,
      percent: sharePercent(month.remaining, month.cumulative),
      projected: month.month > current,
      remaining,
      of,
      srLabel: `${label}: restam ${remaining} de ${of}`,
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
    // The horizon is part of the figure, not decoration: the same balance
    // spread over twice the months is worth half as much per month, so a
    // number shown without its period is not an answer. `months` is the
    // range's REMAINING months (current .. end, per `types.ts`), never its
    // total length — a range read anywhere but its first month has fewer
    // months left than it is long.
    //
    // Inert by construction, kept only to satisfy the type: `tightest` is
    // null exactly when `monthly` is 0, which is the same condition `empty`
    // above short-circuits on — so this branch is never rendered with it.
    // Mutating the fallback changes nothing observable; there is no test for
    // it because there is no reachable behaviour.
    horizon: tightest
      ? `Vale pelo${months.length === 1 ? "" : "s"} ${months.length} ${months.length === 1 ? "mês restante" : "meses restantes"}. Limitado por ${formatYyyymm(tightest)}.`
      : null,
    ...useShowAll(rows),
  };
}
