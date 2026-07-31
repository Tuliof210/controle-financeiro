import type { GoalPace, GoalProjection } from "@/app/api/dashboard/types";
import { formatMoneyShort } from "@/lib/money";
import { MONTH_LABELS } from "@/lib/months";

export type GoalCardProps = {
  goal: GoalProjection;
  // Months left in the projection — what each bar is measured against. A metric
  // landing beyond it fills the bar, which is honest: completion dates are
  // deliberately not clamped to the period, so "past the end" is a real answer.
  horizon: number;
};

// The three funding assumptions, in the order they answer the question: what if
// this goal had the whole capacity, what if it shared it with the others, what
// if it had all of it but only once every cheaper goal was funded.
const METRICS = [
  ["dedicated", "DEDICADO", "var(--color-brand)"],
  ["parallel", "EM PARALELO", "var(--color-accent)"],
  ["serialized", "UM DE CADA VEZ", "var(--color-caution)"],
] as const;

// "~7 meses · Fev/2027", or the words that replace it when there is no capacity
// to divide at all. Singularised the way the retired etaLabel was — "~1 meses"
// is not Portuguese.
//
// The four-digit year is the reason this does not reuse `formatYyyymm`, which
// prints `String(year % 100)`. Two digits are right for a month the user typed
// and wrong here: completion dates are deliberately NOT clamped to the global
// period (owner's decision, 2026-07-30) and `parallel` multiplies a target by
// the goal count before dividing, so this is the one screen in the app that can
// land past the century — where "Fev/26" would read as a month already gone.
function landing(pace: GoalPace): string {
  if (pace === null) return "ritmo zero";
  const { months, doneMonth } = pace;
  const unit = months === 1 ? "mês" : "meses";
  const label = MONTH_LABELS[(doneMonth % 100) - 1];
  return `~${months} ${unit} · ${label}/${Math.trunc(doneMonth / 100)}`;
}

// Calls no React hook, despite the `use` prefix the convention gives it.
export function useGoalCard({ goal, horizon }: GoalCardProps) {
  return {
    name: goal.name,
    target: formatMoneyShort(goal.targetCents),
    // Mapped rather than three near-identical blocks in the JSX: repeating one
    // <div><dt/><dd/></div> three times is what the recursion rule answers with
    // a whole child component folder, and a list is the smaller answer.
    metrics: METRICS.map(([key, label, color]) => {
      const pace = goal[key];

      return {
        key,
        label,
        value: landing(pace),
        // Null exactly when the saving pace is zero, which is also when the
        // value reads "ritmo zero" — there is no length to draw for a goal
        // nothing is funding. `horizon` guards its own zero: an empty
        // projection would make every bar NaN.
        bar:
          pace === null || horizon <= 0
            ? null
            : {
                color,
                width: `${Math.min(100, (pace.months / horizon) * 100)}%`,
              },
      };
    }),
  };
}
