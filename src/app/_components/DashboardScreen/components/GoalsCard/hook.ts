import type { GoalProjection } from "@/app/api/dashboard/types";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { goalLabel, sharePercent } from "../../list-cards.helper";

export type GoalsCardProps = { goals: GoalProjection[]; pace: number };

// Dropped when months is null: "inalcançável no ritmo atual" already carries
// that, and "além do período" beside it would only add noise.
function doneLabel(goal: GoalProjection, reached: boolean): string | null {
  if (goal.months === null) return null;
  if (!reached) return "além do período";
  return `conclui em ${formatYyyymm(goal.doneMonth)}`;
}

export function useGoalsCard({ goals, pace }: GoalsCardProps) {
  return {
    empty: goals.length === 0,
    // The pace drives every projection below and, until now, appeared nowhere
    // on screen — only inside this card's tooltip, as a formula.
    headline: formatMoney(pace),
    rows: goals.map((goal) => {
      // One flag for all three channels: doneMonth is non-null exactly when
      // the period funds the target, so the bar's length, its colour and the
      // date cannot tell different stories.
      const reached = goal.doneMonth !== null;
      // Capped: a bar pinned at 100% beside "R$ 62.000 de R$ 50.000" reads as
      // a bug. sharePercent already returns 0 for a 0 divisor.
      const funded = Math.min(goal.accruedCents, goal.targetCents);
      const percent = sharePercent(funded, goal.targetCents);

      return {
        key: goal.id,
        name: goal.name,
        percent,
        tone: reached ? ("positive" as const) : ("negative" as const),
        // formatMoneyShort, not formatMoney: two grouped values share one line
        // in a one-third-width card, and the centavos are noise there.
        funded: `${formatMoneyShort(funded)} de ${formatMoneyShort(goal.targetCents)}`,
        wait: goalLabel(goal.months),
        unreachable: goal.months === null,
        done: doneLabel(goal, reached),
        needed: reached
          ? null
          : `precisaria de ${formatMoney(goal.neededCents)}/mês`,
        srLabel: `${goal.name}: ${Math.round(percent)}% do objetivo financiado até o fim do período`,
      };
    }),
  };
}
