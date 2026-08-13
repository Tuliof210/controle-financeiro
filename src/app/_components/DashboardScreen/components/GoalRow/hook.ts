import type { GoalPace, GoalProjection } from "@/app/api/dashboard/types.ts";
import { formatMoneyShort } from "@/lib/money.ts";
import { MONTH_LABELS } from "@/lib/months.ts";

// `horizon` guards its own zero: an empty projection would make every bar NaN.
const barFor = (pace: GoalPace | null, horizon: number, color: string) => {
  if (pace === null || horizon <= 0) {
    return null;
  }
  const share = Math.min(PERCENT, (pace.months / horizon) * PERCENT);
  return { color, width: `${share}%` };
};

interface GoalRowProps {
  goal: GoalProjection;
  // Months left in the projection — what each bar is measured against. A metric
  // landing beyond it fills the bar, which is honest: completion dates are
  // deliberately not clamped to the period, so "past the end" is a real answer.
  horizon: number;
}

// The three funding assumptions, in the order they answer the question: what if
// this goal had the whole capacity, what if it shared it with the others, what
// if it had all of it but only once every cheaper goal was funded.
//
// Three CATEGORY hues at maximum HUE spread (violet ~262deg, lime ~92deg, amber
// ~33deg). The cobalt scale they replace failed its own premise: two of its three
// steps measured 1.03:1 apart, and two were cobalt on a screen spending it ten
// ways. MEASURED, not assumed: the ramp is luminance-FLAT — each hue is 3.42–4.52:1
// on --color-surface (clearing the 3:1 graphic floor) but the best-separated PAIR
// in it is 1.32:1, and these three are 1.12–1.28:1. Colour cannot carry this in
// greyscale and no hue swap would change that, which is why the bar stays the
// WEAKEST channel: the label and the landing date carry it, and `_bar.scss` marks
// the bar aria-hidden for the same reason.
const METRICS = [
  ["dedicated", "Dedicado", "var(--cat-violet)"],
  ["parallel", "Em paralelo", "var(--cat-lime)"],
  ["serialized", "Um de cada vez", "var(--cat-amber)"],
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
// YYYYMM packs the month into the last two digits.
const YEAR_SHIFT = 100;
const PERCENT = 100;

function monthWord(months: number): string {
  if (months === 1) {
    return "mês";
  }
  return "meses";
}

function landing(pace: GoalPace): string {
  if (pace === null) {
    return "ritmo zero";
  }
  const { months, doneMonth } = pace;
  const unit = monthWord(months);
  const label = MONTH_LABELS[(doneMonth % YEAR_SHIFT) - 1];
  return `~${months} ${unit} · ${label}/${Math.trunc(doneMonth / YEAR_SHIFT)}`;
}

// Calls no React hook, despite the `use` prefix the convention gives it.
function useGoalRow({ goal, horizon }: GoalRowProps) {
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
        bar: barFor(pace, horizon, color),
      };
    }),
  };
}

export type { GoalRowProps };
export { useGoalRow };
