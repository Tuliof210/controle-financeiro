import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DIP_PERSON,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import { expectCapMovesTheFigures } from "./ceiling-cap.helper";
import {
  expectHeaderBadges,
  expectHeadlineIsFirstRow,
  expectNoCeiling,
  expectScenarios,
} from "./ceiling-expect.helper";
import { openCeiling, readMonths, rowsOf, SLOW } from "./ceiling-page.helper";
import { seed } from "./seed.helper";

// The "Teto de Gastos" card reads each month as one row: the balance it arrives
// at once every earlier month has spent its own ceiling, that month's ceiling,
// and what is left after. Any single row reads the same under two wrong
// formulas, so every assertion here is about the series — see expectScenarios in
// ceiling-expect.helper.ts, which also names the two mutations the fixtures below
// are shaped to catch.

test.beforeAll(async () => {
  // Order matters, it is not politeness: the range is derived from EVERY entry
  // in the database, so the shared seed's 202611 forecast has to have landed
  // before this fixture's months mean anything.
  await seed();
  await seedCeiling();
});

test("each month's figure discounts the months before it", async ({ page }) => {
  const card = await openCeiling(page, CEILING_PERSON);
  const rows = rowsOf(card);
  await expect(rows.first()).toBeVisible(SLOW);

  const months = await readMonths(rows);
  expect(months.length).toBeGreaterThanOrEqual(3);
  expect(months[0].budget).toBeGreaterThan(0);

  expectScenarios(months);
  await expectHeadlineIsFirstRow(card, months[0].budget);
});

test("a later dip, not the month's own balance, caps the first month", async ({
  page,
}) => {
  const card = await openCeiling(page, DIP_PERSON);
  const rows = rowsOf(card);
  await expect(rows.first()).toBeVisible(SLOW);

  const months = await readMonths(rows);
  expect(months.length).toBeGreaterThanOrEqual(3);

  // This fixture falls in its second month and recovers in its third, which is
  // the only shape that tells the suffix minimum apart from each month's own
  // balance: price the first month against its OWN 3.000 and the second row's
  // "Sobra" closes below zero. That floor is inside expectScenarios, and this
  // fixture is what makes it bite.
  expectScenarios(months);

  // And the consequence the owner cares about: the first month is allowed less
  // than its own balance would permit, because next month's dip is what binds.
  expect(months[0].budget).toBeLessThan(months[0].ceilingBalance);
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

// DIP_PERSON, not the rising fixture: its second month falls, so it is the one
// shape where re-checking the floor at each cap catches a suffix minimum broken
// while `cap` was being threaded through buildCeiling.
test("the cap selector moves the figures, and never under", async ({
  page,
}) => {
  await expectCapMovesTheFigures(page, await openCeiling(page, DIP_PERSON));
});
