import { expect, test } from "@playwright/test";
import { CEILING_PERSON, RED_PERSON, seedCeiling } from "./ceiling.helper";
import { openCeiling, readMonths } from "./ceiling-page.helper";
import {
  expectCheapestFirst,
  expectParallelShare,
  expectQueue,
} from "./goals-expect.helper";
import {
  expandCeiling,
  METRIC_LABELS,
  openGoals,
  readCapacity,
  readGoals,
} from "./goals-page.helper";
import { seed } from "./seed.helper";

// Each goal answers "when does this land" three ways, differing only in how much
// of the monthly capacity it is assumed to get. Any single card reads plausibly
// under the wrong formula, so every assertion is about how the three relate —
// see goals-expect.helper.ts. No count, month or amount is written down here.
//
// One test each catches: reversing the `queue` sort, giving `parallel` the
// `dedicated` argument, dropping the `queued` running sum (all goals.helper.ts),
// and dividing by PACE_DIVISOR without the month count (pace.helper.ts).

test.beforeAll(async () => {
  // Order matters, as in ceiling.spec.ts: the range spans every entry, so the
  // shared seed's forecast has to land first. Goals are family-wide, so
  // `seed`'s two are what every profile below sees.
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
  // Criterion 2 where a user would see it, not just in the type-checker.
  await expect(page.getByText(/Meta mensal/i)).toHaveCount(0);
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
  const banner = await openGoals(page, CEILING_PERSON);
  const capacity = await readCapacity(banner);
  const goals = await readGoals(page);
  expect(goals.length).toBeGreaterThanOrEqual(2);
  expectQueue(goals, capacity);
});

test("the capacity is a quarter of the average monthly ceiling", async ({
  page,
}) => {
  const card = await openCeiling(page, CEILING_PERSON);
  // Expanded first, so the rows read here are every month the capacity averages
  // over — see expandCeiling.
  const budgets = (await readMonths(await expandCeiling(card))).map(
    (month) => month.budget,
  );
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
