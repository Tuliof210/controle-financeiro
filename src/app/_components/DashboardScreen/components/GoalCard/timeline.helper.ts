import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";

// The two sentences that answer WHEN the goal lands. They read `doneMonth` and
// `months`, which are different facts from the bar's percentage — so they live
// apart from the coverage math in hook.ts, which reads only accrued vs target.
// Split out when hook.test.ts hit ARCHITECTURE's 100-line cap.

// Two facts, deliberately separate: how long the goal takes at the current
// pace, and whether that lands inside the global period.
// "~7 MESES · CONCLUI EM Fev/27" / "RITMO ZERO · ALÉM DO PERÍODO".
// (.eta uppercases the month label in CSS — the string stays readable, the way
// SectionCard keeps its titles readable for screen readers and Tooltip labels.)
export function etaLabel({ months, doneMonth }: GoalProjection): string {
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

// doneMonth is the producer's only flag for "funded inside the range", so it is
// what picks between reporting the date and reporting the shortfall.
export function noteLabel({ doneMonth, neededCents }: GoalProjection): string {
  return doneMonth
    ? `conclui em ${formatYyyymm(doneMonth)} no ritmo atual`
    : `precisaria de ${formatMoney(neededCents)}/mês para fechar no prazo`;
}
