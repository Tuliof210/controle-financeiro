// Not a spec — playwright only collects `*.spec.ts`. The three metrics checked
// as a SET rather than card by card, the way ceiling-page.helper's
// expectAccumulator checks the ceiling column: any single card reads plausibly
// under the wrong formula, and only the relations between them do not.
//
// Separate from goals-page.helper.ts, which only reaches and reads, and out of
// the spec so that file stays under the 100-line cap.

import { expect } from "@playwright/test";
import type { readGoals } from "./goals-page.helper";

type Goal = Awaited<ReturnType<typeof readGoals>>[number];

// Every metric is a ceil of some target over one positive rate, so the whole
// list inherits the queue's order. Reversing the sort breaks the first two
// assertions; building the queue in a different order breaks the third.
export function expectCheapestFirst(goals: Goal[]) {
  const targets = goals.map((goal) => goal.target);
  expect(targets, "cheapest first").toEqual([...targets].sort((a, b) => a - b));

  const alone = goals.map((goal) => Number(goal.dedicated.months));
  expect(alone, "dedicated inherits that order").toEqual(
    [...alone].sort((a, b) => a - b),
  );
  expect(
    goals[0].serialized.months,
    "nothing is queued ahead of the cheapest goal",
  ).toBe(goals[0].dedicated.months);
}

// `count * alone` is NOT the answer: `alone` is itself rounded up, so
// multiplying it over-counts by up to one month per goal. The real figure
// divides once, at the end — which is what puts B inside this window, and what a
// per-goal share formed BEFORE the division would fall outside of.
export function expectParallelShare(goals: Goal[]) {
  const count = goals.length;
  for (const goal of goals) {
    const alone = Number(goal.dedicated.months);
    const shared = Number(goal.parallel.months);
    expect(
      shared,
      `${goal.name}: at most the naive multiple`,
    ).toBeLessThanOrEqual(count * alone);
    expect(
      shared,
      `${goal.name}: divided once, not rounded per goal`,
    ).toBeGreaterThanOrEqual(count * alone - (count - 1));
    // Strict ONLY above one month. A goal cheaper than a single month of
    // capacity has both ceils land on 1, and sharing genuinely costs it
    // nothing — asserting `>` unconditionally would redden on a fixture
    // amount with no defect behind it. The lower bound above already catches
    // the collapse this line was guarding against, so the guard costs nothing.
    if (alone > 1) {
      expect(shared, `${goal.name}: sharing is slower`).toBeGreaterThan(alone);
    }
  }
}

// The last goal is the one every other goal is queued ahead of, so it is where
// dropping the running sum shows: without it, C would equal A there. That is
// the only assertion in this file that catches the missing-sum mutation, so it
// stays strict — and its precondition is asserted rather than assumed, so a
// fixture that stops meeting it fails by NAME instead of reddening the
// inequality below with no defect behind it.
export function expectQueue(goals: Goal[], capacityCents: number) {
  for (const goal of goals) {
    expect(
      Number(goal.serialized.months),
      `${goal.name}: a queue is never faster than having it all`,
    ).toBeGreaterThanOrEqual(Number(goal.dedicated.months));
    expect(goal.serialized.done, `${goal.name}: names a month`).toBeTruthy();
  }

  const last = goals[goals.length - 1];
  const ahead = goals.slice(0, -1).reduce((sum, goal) => sum + goal.target, 0);
  expect(
    ahead,
    "FIXTURE: the goals queued ahead of the last must be worth at least one month of capacity, or waiting for them costs it no whole month and the check below is not a property of the formula",
  ).toBeGreaterThanOrEqual(capacityCents);
  expect(
    Number(last.serialized.months),
    "the most expensive goal waits for all the others",
  ).toBeGreaterThan(Number(last.dedicated.months));
}
