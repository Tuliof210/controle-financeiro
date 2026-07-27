import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";

export type GoalCardProps = { goal: GoalProjection };

// Two facts, deliberately separate: how long the goal takes at the current
// pace, and whether that lands inside the global period.
// "~7 MESES · CONCLUI EM Fev/27" / "RITMO ZERO · ALÉM DO PERÍODO".
// (.eta uppercases the month label in CSS — the string stays readable, the way
// SectionCard keeps its titles readable for screen readers and Tooltip labels.)
function etaLabel({ months, doneMonth }: GoalProjection): string {
  // Singularised, as the retired goalLabel was: "~1 MESES" is not Portuguese.
  const pace =
    months === null
      ? "RITMO ZERO"
      : `~${months} ${months === 1 ? "MÊS" : "MESES"}`;
  const lands =
    doneMonth === null
      ? "ALÉM DO PERÍODO"
      : `CONCLUI EM ${formatYyyymm(doneMonth)}`;
  return `${pace} · ${lands}`;
}

// Calls no React hook, so it is directly testable — see hook.test.ts.
export function useGoalCard({ goal }: GoalCardProps) {
  const { name, targetCents, doneMonth, accruedCents, neededCents } = goal;

  // ONE quantity, stated three ways: how much of the goal the projected slack
  // covers before the range ends. NOT money already set aside — there is no
  // savedCents on Goal, no contributions table, nothing. `.squad/learnings.md`
  // records a meter shipping backwards because its length measured one thing
  // while its colour and label measured another, so the bar's width, the badge
  // and `covered` below are all derived from this single number, capped
  // together. A 0 target would divide by zero; there is no coverage of nothing.
  const percent =
    targetCents > 0
      ? Math.min(100, Math.round((accruedCents / targetCents) * 100))
      : 0;
  // Drives the tone and the icon off the DISPLAYED percentage, so a full bar,
  // a green badge and "100%" can never disagree. `eta` reports doneMonth, a
  // different fact, so a goal that rounds up to 100% can still say ALÉM DO
  // PERÍODO — that is the honest reading, not a contradiction.
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
    note: doneMonth
      ? `conclui em ${formatYyyymm(doneMonth)} no ritmo atual`
      : `precisaria de ${formatMoney(neededCents)}/mês para fechar no prazo`,
    // The bar is a colour and a length; rule 7 says meaning is never
    // colour-only, so the same percentage is announced in words.
    srLabel: `${name}: o período cobre ${percent}% do objetivo`,
  };
}
