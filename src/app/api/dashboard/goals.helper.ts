import type { Goal } from "@/core/entities/goal.entity.ts";
import { addMonths } from "@/lib/months.ts";
import type { GoalPace, GoalProjection } from "./types.ts";

interface Horizon {
  pace: number; // cents put aside per month — the whole monthly capacity
  current: number; // YYYYMM, the month saving starts in
}

// Math.ceil: a wait always rounds UP, and a target smaller than one month's pace
// is still one month, never zero. `months` is therefore >= 1 whenever it is not
// null — POST /api/goals rejects a targetCents below 1 — so `months - 1` below
// never runs off the start of the range.
//
// Saving starts in the CURRENT month, hence `months - 1`: a one-month goal
// completes this month, not the next.
//
// A pace of 0 means no month in the period leaves anything to put aside. Null is
// the one guard the three metrics need, and it is shared: pace is payload-global,
// so all three are null for every goal or for none.
function paceOf(cents: number, pace: number, current: number): GoalPace {
  if (pace <= 0) {
    return null;
  }
  const months = Math.ceil(cents / pace);
  return { months, doneMonth: addMonths(current, months - 1) };
}

// Goal carries no deadline, so the question is how long each target takes — and
// that has three honest answers depending on what else is being saved for at the
// same time. Cheapest first, which is both the queue metric C is defined by and
// the order metrics A and C agree on; Array.sort is stable, so goals tied on
// target keep the repository's createdAt order.
export function projectGoals(
  goals: Goal[],
  { pace, current }: Horizon,
): GoalProjection[] {
  const queue = [...goals].sort((a, b) => a.targetCents - b.targetCents);
  // Metric C's running total: every cheaper goal is fully funded before this one
  // starts, so what it waits on is the sum of the queue up to and including it.
  let queued = 0;

  return queue.map((goal) => {
    queued += goal.targetCents;
    return {
      id: goal.id,
      name: goal.name,
      targetCents: goal.targetCents,
      dedicated: paceOf(goal.targetCents, pace, current),
      // `target * count / pace`, never `target / (pace / count)`: the share of a
      // goal is a fraction of a cent, and forming it would put a rounding step
      // between the two metrics that are meant to be comparable.
      parallel: paceOf(goal.targetCents * queue.length, pace, current),
      serialized: paceOf(queued, pace, current),
    };
  });
}
