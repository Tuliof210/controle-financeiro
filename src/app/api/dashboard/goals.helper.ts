import type { Goal } from "@/core/entities/goal.entity";
import { addMonths } from "@/lib/months";
import type { GoalProjection } from "./types";

type Horizon = {
  pace: number; // cents put aside per month
  monthsAhead: number; // current month .. range end, inclusive
  current: number; // YYYYMM
};

// Soonest first. Array.sort is stable, so goals tied on months keep the
// repository's createdAt order.
//
// The ?? branch is inert by construction, kept only to satisfy the type: pace
// is payload-global, so `months` is null for EVERY goal or for none — a list
// mixing the two cannot exist, and mutating the fallback changes nothing
// observable. MAX_SAFE_INTEGER rather than POSITIVE_INFINITY all the same,
// since Infinity - Infinity is NaN and a comparator returning NaN reads as a
// bug even though the spec coerces it to 0.
const wait = (goal: GoalProjection) => goal.months ?? Number.MAX_SAFE_INTEGER;

// Goal carries no deadline, so the questions are how long each target takes at
// the current saving pace, and whether the global period is long enough to get
// there. Math.ceil: a wait always rounds UP, and a target smaller than one
// month's pace is still one month, never zero.
//
// pace of 0 means no month in the range leaves anything to put aside — the
// null is what the card renders as "inalcançável no ritmo atual".
export function projectGoals(
  goals: Goal[],
  { pace, monthsAhead, current }: Horizon,
): GoalProjection[] {
  // The same for every goal: what the period funds before any target is named.
  const accruedCents = pace * monthsAhead;

  return goals
    .map((goal) => {
      const months = pace > 0 ? Math.ceil(goal.targetCents / pace) : null;
      return {
        id: goal.id,
        name: goal.name,
        targetCents: goal.targetCents,
        months,
        // Saving starts in the CURRENT month, so a one-month goal completes
        // this month, not the next — hence months - 1. `months <= monthsAhead`
        // is the same condition as `accruedCents >= targetCents` for integers,
        // which is what lets the card drive the date, the meter's length and
        // its colour off this one field. months is >= 1 whenever it is not
        // null: POST /api/goals rejects a targetCents below 1.
        doneMonth:
          months !== null && months <= monthsAhead
            ? addMonths(current, months - 1)
            : null,
        accruedCents,
        // monthsAhead is >= 1 by construction: buildCeiling runs from the current
        // month to the range end, and getDashboard already answered
        // "out_of_range" when the current month falls outside it. No guard.
        neededCents: Math.ceil(goal.targetCents / monthsAhead),
      };
    })
    .sort((a, b) => wait(a) - wait(b));
}
