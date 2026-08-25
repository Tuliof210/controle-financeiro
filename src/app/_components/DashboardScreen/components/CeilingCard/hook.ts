import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { useShowAll } from "../../show-all.hook.ts";
import {
  limitLabel,
  monthsWord,
  noteFor,
  shareOf,
} from "./ceiling-card.helper.ts";

// `current` is the range's current month — the only thing that makes a row the
// current one. It rides along in the same payload, so no extra fetch.
//
// Two props and no callbacks: the card carries no control of its own any more.
// What the ceiling is comes off the Perfil screen, and the payload arrives
// already answering it.
export interface CeilingCardProps {
  ceiling: Ceiling;
  current: number;
}

export function useCeilingCard({ ceiling, current }: CeilingCardProps) {
  const { monthly, weekly, daily, tightest, firstRed, months, fixed } = ceiling;

  // Nothing is computed here: the payload carries both the balance arriving at
  // the month and what is left after it, precisely so the screen cannot arrive
  // at a third answer.
  const rows = months.map((row) => ({
    key: row.month,
    label: formatYyyymm(row.month),
    isCurrent: row.month === current,
    balance: formatMoney(row.ceilingBalance),
    spend: formatMoney(row.budget),
    left: formatMoney(row.ceilingLeft),
    share: shareOf(row.budget, row.ceilingBalance),
  }));

  const show = useShowAll(rows);

  return {
    // Empty means "nothing to offer anywhere in the period", NOT "nothing this
    // month". An owner whose money starts in a later month has `monthly === 0`
    // and real room further down the list — hiding it would keep broken exactly
    // the half of the problem this card was rewritten to fix.
    empty: months.every((row) => row.budget === 0),
    note: noteFor(firstRed),
    monthly,
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
    monthsLeft: `${months.length} ${monthsWord(months.length)}`,
    // Null exactly when `monthly` is 0, i.e. exactly when `empty` is true, so
    // the badge simply does not render in that state.
    // Naming the tightest month is honest only while the projection binds. Under
    // a fixed amount nothing about the months bound the figure — the saved value
    // did — and the badge would name a month that would have allowed more.
    limitedBy: limitLabel(fixed, tightest),
    currentLabel: formatYyyymm(current),
    // How much of the list is on screen. The toggle beside it says the same
    // thing as an action; this says it as a fact, and survives the collapse.
    count: `${show.rows.length} de ${months.length} meses`,
    ...show,
  };
}
