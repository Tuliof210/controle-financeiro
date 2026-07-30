import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DEEPEST_RED_HOLE,
  DIP_PERSON,
  FIRST_RED_HOLE,
  monthLabel,
  monthsLeftLabel,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import { expectAverage, readHero } from "./ceiling-average.helper";
import {
  expectAccumulator,
  openCeiling,
  parseCents,
  readMonths,
  SLOW,
} from "./ceiling-page.helper";
import { expandCeiling } from "./goals-page.helper";
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
  // First `dd` on the card, and it stays the first: the average headline sits
  // after it. Sliced to the leading money rather than to the first LINE — the
  // "N× a média" chip is inline-block, so innerText runs it straight onto the
  // figure ("R$ 800,002,7× A MÉDIA") and its digits would be parsed in. Anchored
  // on the cents pair, not on a digit class, for the same reason.
  const headline = await card.locator("dd").first().innerText();
  expect(parseCents(headline.match(/^R\$ [\d.]*\d,\d\d/)?.[0] ?? "")).toBe(
    months[0].budget,
  );

  // The bar is the month's own figure against its own ceiling, so the FIRST
  // month's is the fullest one on the card: nothing has been authorised before
  // it, so it takes the whole 80% and leaves only the safety margin. Expected
  // width recomputed from the payload rather than written down, so it survives
  // a change of fixture; the fill is the track's first <div>.
  await settle(page, bars.first());
  const trackBox = await bars.first().boundingBox();
  const fillBox = await bars.first().locator("div").first().boundingBox();
  expect(trackBox && fillBox).toBeTruthy();
  expect(((fillBox?.width ?? 0) / (trackBox?.width ?? 1)) * 100).toBeCloseTo(
    (months[0].budget / months[0].worstAhead) * 100,
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

test("names how many months remain, and which one caps this month", async ({
  page,
}) => {
  const card = await openCeiling(page, CEILING_PERSON);

  // The count sits beside the average, because it IS the average's denominator:
  // the months REMAINING, never the period's length.
  await expect(card.getByText(monthsLeftLabel())).toBeVisible(SLOW);

  // Two header badges. This fixture's balance only rises, so the month holding
  // the worst balance ahead is the current one and both name it — by different
  // routes, which is why the assertions are separate. Matched by `title`
  // because the bare month label also appears on the first row.
  await expect(card.getByText(`Limitado por ${monthLabel()}`)).toBeVisible();
  await expect(card.getByTitle("Mês em curso")).toHaveText(monthLabel());
});

test("the average is the mean of every month the card lists", async ({
  page,
}) => {
  const card = await openCeiling(page, CEILING_PERSON);
  // Expanded first, so the rows read here are every month the mean covers —
  // `useShowAll` caps the list at 8 while the average takes all of them.
  const budgets = (await readMonths(await expandCeiling(card))).map(
    (month) => month.budget,
  );
  expect(budgets.length).toBeGreaterThanOrEqual(3);

  const hero = await readHero(card);
  // Which headline is which, proven rather than assumed: the first is this
  // month's figure, so the second cannot also be it.
  expect(hero.monthly).toBe(budgets[0]);
  expectAverage(budgets, hero.average);

  // And the chip beside this month's figure is that division, not a third
  // number the card computed some other way.
  const ratio = (hero.monthly / hero.average).toFixed(1).replace(".", ",");
  await expect(card.getByText(`${ratio}× a média`)).toBeVisible();
});
