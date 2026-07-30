import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DEEPEST_RED_HOLE,
  DIP_PERSON,
  FIRST_RED_HOLE,
  horizonLabel,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import {
  expectAccumulator,
  openCeiling,
  parseCents,
  readMonths,
  SLOW,
} from "./ceiling-page.helper";
import { seed } from "./seed.helper";
import { settle } from "./settle.helper";

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

  // The headline is THIS month's figure, not a rate that holds for the period,
  // so it has to equal the first row. A big number measuring one thing while the
  // rows beneath it measure another is the failure `.squad/learnings.md` already
  // records once.
  const headline = (await card.locator("dd").first().innerText()).split("\n");
  expect(parseCents(headline[0])).toBe(months[0].budget);

  // Front-loaded, and visibly so: nothing has been taken before the FIRST month,
  // so it keeps exactly the 20% safety margin of its worst balance ahead. Every
  // later month keeps less, because the earlier figures already spent into it —
  // which is why this reads the first bar and not the last.
  await settle(page, bars.first());
  const trackBox = await bars.first().boundingBox();
  const fillBox = await bars.first().locator("div").first().boundingBox();
  expect(trackBox && fillBox).toBeTruthy();
  expect(((fillBox?.width ?? 0) / (trackBox?.width ?? 1)) * 100).toBeCloseTo(
    20,
    0,
  );
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
  const card = await openCeiling(page, RED_PERSON);

  // Naming the first month says WHEN it breaks, which is the deadline to act
  // on; naming the deepest would say how much and lose the date. Asserting on
  // the hole rather than the month label keeps this independent of the clock.
  await expect(card.getByText(FIRST_RED_HOLE)).toBeVisible(SLOW);
  await expect(card.getByText(DEEPEST_RED_HOLE)).toHaveCount(0);
  // A red month anywhere ahead zeroes every figure, so there is nothing to draw.
  await expect(card.getByRole("img")).toHaveCount(0);
});

test("names how many months remain, not the period's length", async ({
  page,
}) => {
  const card = await openCeiling(page, CEILING_PERSON);
  await expect(card.getByText(horizonLabel())).toBeVisible(SLOW);
});
