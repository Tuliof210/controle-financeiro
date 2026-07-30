import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DIP_PERSON,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import {
  expectAverageStory,
  expectHeadlineIsFirstRow,
} from "./ceiling-average.helper";
import {
  expectFirstBarFill,
  expectHeaderBadges,
  expectNoCeiling,
} from "./ceiling-expect.helper";
import {
  expectAccumulator,
  openCeiling,
  readMonths,
  SLOW,
} from "./ceiling-page.helper";
import { seed } from "./seed.helper";

// The "Teto de Gastos" card lists what each month may spend EXTRA, and the whole
// column has to be spendable in ORDER without any month closing in the red. Any
// single row reads the same under two wrong formulas, so every assertion here is
// about the series — see expectAccumulator in ceiling-page.helper.ts.
//
// The formula has two halves and each has its own mutation, because a fixture
// whose balance only rises cannot tell the second one apart from nothing:
//  - accumulator: drop `- authorised` from `gap` in `buildCeiling`
//    (src/app/api/dashboard/ceiling.helper.ts) and the accumulator assertions
//    fail from the second row on.
//  - suffix minimum: make `suffixMinimum` return `ahead.map((p) => p.cumulative)`
//    and the DIP_PERSON test below fails. Nothing else catches that one.

test.beforeAll(async () => {
  // Order matters, it is not politeness: the range is derived from EVERY entry
  // in the database, so the shared seed's 202611 forecast has to have landed
  // before this fixture's months mean anything.
  await seed();
  await seedCeiling();
});

test("each month's figure discounts the months before it", async ({ page }) => {
  const card = await openCeiling(page, CEILING_PERSON);
  const bars = card.getByRole("img");
  await expect(bars.first()).toBeVisible(SLOW);

  const months = await readMonths(bars);
  expect(months.length).toBeGreaterThanOrEqual(3);
  expect(months[0].budget).toBeGreaterThan(0);

  expectAccumulator(months);
  await expectHeadlineIsFirstRow(card, months[0].budget);
  await expectFirstBarFill(page, bars, months[0]);
});

test("a later dip, not the month's own balance, caps the first month", async ({
  page,
}) => {
  const card = await openCeiling(page, DIP_PERSON);
  const bars = card.getByRole("img");
  await expect(bars.first()).toBeVisible(SLOW);

  const months = await readMonths(bars);
  expect(months.length).toBeGreaterThanOrEqual(3);
  expectAccumulator(months);

  // This fixture falls in its second month and recovers in its third. Under a
  // suffix minimum the first two rows share ONE number — the dip — and the third
  // is larger. Under each month's own balance the first row would be the largest
  // of the three, so these two lines are what the identity mutation breaks.
  expect(months[0].worstAhead).toBe(months[1].worstAhead);
  expect(months[0].worstAhead).toBeLessThan(months[2].worstAhead);

  // And the consequence the owner cares about: the first month is allowed less
  // than its own balance would permit, because next month's dip is what binds.
  expect(months[0].budget).toBeLessThan(months[2].budget);
});

test("with no ceiling, the card names the first month in the red", async ({
  page,
}) => {
  await expectNoCeiling(await openCeiling(page, RED_PERSON));
});

test("names how many months remain, and which one caps this month", async ({
  page,
}) => {
  await expectHeaderBadges(await openCeiling(page, CEILING_PERSON));
});

test("the average is the mean of every month the card lists", async ({
  page,
}) => {
  await expectAverageStory(await openCeiling(page, CEILING_PERSON));
});
