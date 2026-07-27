import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoneyShort } from "@/lib/money";
import { sharePercent } from "../../list-cards.helper";
import { etaLabel, noteLabel } from "./timeline.helper";

export type GoalCardProps = { goal: GoalProjection };

// Calls no React hook, so it is directly testable — see hook.test.ts.
export function useGoalCard({ goal }: GoalCardProps) {
  const { name, targetCents, accruedCents } = goal;

  // ONE quantity, stated three ways: how much of the goal the projected slack
  // covers before the range ends. NOT money already set aside — there is no
  // savedCents on Goal, no contributions table, nothing. `.squad/learnings.md`
  // records a meter shipping backwards because its length measured one thing
  // while its colour and label measured another, so the bar's width, the badge
  // and `covered` below are all derived from this single number, capped
  // together. sharePercent (shared with SlackCard) carries the zero-divisor
  // guard: a 0 target would divide by zero, and there is no coverage of nothing.
  //
  // FLOOR, never round. Rounding announced "100%" for anything from 99.5% up,
  // so a short bar on a goal the period misses told a screen reader it was
  // fully funded. 100 is reserved for a genuinely full bar.
  const percent = Math.min(
    100,
    Math.floor(sharePercent(accruedCents, targetCents)),
  );
  // With floor, `full` is exactly `accruedCents >= targetCents` — the same
  // condition the producer uses for doneMonth (api/dashboard/goals.helper.ts),
  // so the tone, the badge, `covered` and `eta` cannot disagree. Rounding was
  // what let a green "100%" card sit next to ALÉM DO PERÍODO.
  const full = percent >= 100;

  return {
    name,
    percent,
    full,
    badge: `${percent}%`,
    // "o período cobre …", never "R$ 12k de R$ 50k" on its own — the latter
    // reads as money in the bank. min() so the sentence cannot overshoot the
    // capped bar beside it.
    covered: `o período cobre ${formatMoneyShort(Math.min(accruedCents, targetCents))} de ${formatMoneyShort(targetCents)}`,
    eta: etaLabel(goal),
    note: noteLabel(goal),
    // The bar is a colour and a length; rule 7 says meaning is never
    // colour-only, so the same percentage is announced in words.
    srLabel: `${name}: o período cobre ${percent}% do objetivo`,
  };
}
