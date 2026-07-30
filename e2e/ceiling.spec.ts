import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DEEPEST_RED_HOLE,
  FIRST_RED_HOLE,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import {
  expectAccumulator,
  openProjection,
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
// To prove this spec is not vacuous: drop the `- authorised` term from `gap` in
// `buildCeiling` (src/app/api/dashboard/ceiling.helper.ts), which turns every
// figure into 80% of its own worst balance in isolation, and the accumulator
// assertions must fail from the second row on.

test.beforeAll(async () => {
  // Order matters, it is not politeness: the range is derived from EVERY entry
  // in the database, so the shared seed's 202611 forecast has to have landed
  // before this fixture's months mean anything.
  await seed();
  await seedCeiling();
});

test("each month's figure discounts the months before it", async ({ page }) => {
  const card = await openProjection(page, CEILING_PERSON);
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

test("with no ceiling, the card names the first month in the red", async ({
  page,
}) => {
  const card = await openProjection(page, RED_PERSON);

  // Naming the first month says WHEN it breaks, which is the deadline to act
  // on; naming the deepest would say how much and lose the date. Asserting on
  // the hole rather than the month label keeps this independent of the clock.
  await expect(card.getByText(FIRST_RED_HOLE)).toBeVisible(SLOW);
  await expect(card.getByText(DEEPEST_RED_HOLE)).toHaveCount(0);
  // A red month anywhere ahead zeroes every figure, so there is nothing to draw.
  await expect(card.getByRole("img")).toHaveCount(0);
});

// Range end is the shared seed's SPLIT_FORECAST reach (202611, Nov/26 —
// seed.helper.ts), computed here rather than hardcoded so this keeps reading
// correctly whenever it runs, including the one month a year (November) that
// exercises the singular branch — "1 mês restante", not "1 meses restantes",
// the same rule GoalCard's timeline.helper.ts already enforces.
const RANGE_END = 202611;
const monthIndex = (yyyymm: number) =>
  Math.floor(yyyymm / 100) * 12 + (yyyymm % 100) - 1;
const now = new Date();
const CURRENT = now.getFullYear() * 100 + now.getMonth() + 1;
const REMAINING = monthIndex(RANGE_END) - monthIndex(CURRENT) + 1;
// This fixture's balance only rises, so the worst balance ahead is the current
// month's own — the headline is limited by itself. Formatted locally: the suite
// drives the app from outside and owns no app code.
const LABELS = "Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez".split(" ");
const TIGHTEST = `${LABELS[(CURRENT % 100) - 1]}/${String(Math.trunc(CURRENT / 100) % 100).padStart(2, "0")}`;

test("names how many months remain, not the period's length", async ({
  page,
}) => {
  const card = await openProjection(page, CEILING_PERSON);
  const label =
    REMAINING === 1
      ? `1 mês restante. Este mês é limitado por ${TIGHTEST}.`
      : `${REMAINING} meses restantes. Este mês é limitado por ${TIGHTEST}.`;
  await expect(card.getByText(label)).toBeVisible(SLOW);
});
