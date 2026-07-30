import { expect, test } from "@playwright/test";
import { CEILING_PERSON, RED_PERSON, seedCeiling } from "./ceiling.helper";
import { openCeiling, readMonths, SLOW } from "./ceiling-page.helper";
import {
  expectCheapestFirst,
  expectParallelShare,
  expectQueue,
} from "./goals-expect.helper";
import {
  METRIC_LABELS,
  openGoals,
  readCapacity,
  readGoals,
} from "./goals-page.helper";
import { seed } from "./seed.helper";

// Each goal answers "when does this land" three ways, differing only in how much
// of the monthly capacity it is assumed to get. Any single card reads plausibly
// under the wrong formula, so every assertion is about how the three relate —
// see goals-expect.helper.ts, which holds them. No count, month or amount is
// written down here: the range is derived from every entry in the database and
// the current month comes from the clock.
//
// The mutations these catch, each reddening exactly one test: reverse the
// `queue` sort in goals.helper.ts ("orders the goals"); give `parallel` the
// `dedicated` argument ("sharing the capacity"); drop the `queued` running sum
// from `serialized` ("queueing"); in pace.helper.ts divide by PACE_DIVISOR
// alone rather than by the month count too ("the capacity is a quarter").

test.beforeAll(async () => {
  // Order matters, as in ceiling.spec.ts: the range spans every entry, so the
  // shared seed's forecast has to land before this fixture means anything.
  // Goals are family-wide, so `seed`'s two are what every profile below sees.
  await seed();
  await seedCeiling();
});

test("orders the goals cheapest first, and the cheapest waits for nobody", async ({
  page,
}) => {
  await openGoals(page, CEILING_PERSON);
  const goals = await readGoals(page);
  expect(goals.length).toBeGreaterThanOrEqual(2);
  expect(goals[0].labels).toEqual([...METRIC_LABELS]);
  expectCheapestFirst(goals);
});

test("sharing the capacity costs every goal the other goals' time", async ({
  page,
}) => {
  await openGoals(page, CEILING_PERSON);
  const goals = await readGoals(page);
  expect(goals.length).toBeGreaterThanOrEqual(2);
  expectParallelShare(goals);
});

test("queueing makes each goal wait for the cheaper ones", async ({ page }) => {
  await openGoals(page, CEILING_PERSON);
  const goals = await readGoals(page);
  expect(goals.length).toBeGreaterThanOrEqual(2);
  expectQueue(goals);
});

test("the capacity is a quarter of the average monthly ceiling", async ({
  page,
}) => {
  const card = await openCeiling(page, CEILING_PERSON);
  // The bars, not the card: each announces its own month's figure in its
  // accessible name, which is where readMonths reads them from.
  const bars = card.getByRole("img");
  await expect(bars.first()).toBeVisible(SLOW);
  const budgets = (await readMonths(bars)).map((month) => month.budget);
  expect(budgets.length).toBeGreaterThanOrEqual(3);

  const banner = await openGoals(page, CEILING_PERSON);
  const total = budgets.reduce((sum, budget) => sum + budget, 0);
  // Floor, and the division done once: a quarter of an already-floored mean
  // would round twice and land up to a cent low.
  expect(await readCapacity(banner)).toBe(
    Math.floor(total / (4 * budgets.length)),
  );
});

test("a period with no ceiling leaves every goal without a rate", async ({
  page,
}) => {
  // RED_PERSON's projected balance goes underwater, which zeroes every monthly
  // figure — so there is no capacity to divide three ways.
  await openGoals(page, RED_PERSON);
  const goals = await readGoals(page);
  expect(goals.length).toBeGreaterThanOrEqual(2);

  for (const goal of goals) {
    expect([
      goal.dedicated.months,
      goal.parallel.months,
      goal.serialized.months,
    ]).toEqual([null, null, null]);
  }
});
