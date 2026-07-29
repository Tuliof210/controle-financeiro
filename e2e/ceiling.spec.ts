import { expect, test } from "@playwright/test";
import {
  CEILING_PERSON,
  DEEPEST_RED_HOLE,
  FIRST_RED_HOLE,
  RED_PERSON,
  seedCeiling,
} from "./ceiling.helper";
import {
  openProjection,
  parseCents,
  readMonths,
  SLOW,
} from "./ceiling-page.helper";
import { seed } from "./seed.helper";

// The "Teto de Gastos" card promises a figure that can be spent EVERY month
// without any month closing in the red. The formula that broke that promise
// priced one month's spend in isolation, and a single row reads identically
// either way — so every assertion below is about the whole series.
//
// To prove this spec is not vacuous: drop the `(pin + 1)` divisor from
// `buildCeiling` in src/app/api/dashboard/ceiling.helper.ts and the
// non-negative survivor assertion must fail.

test.beforeAll(async () => {
  // Order matters, it is not politeness: the range is derived from EVERY entry
  // in the database, so the shared seed's 202611 recurrence has to have landed
  // before this fixture's months mean anything.
  await seed();
  await seedCeiling();
});

test("the ceiling survives being spent in every month of the period", async ({
  page,
}) => {
  const card = await openProjection(page, CEILING_PERSON);
  const bars = card.getByRole("img");
  await expect(bars.first()).toBeVisible(SLOW);

  const months = await readMonths(bars);
  expect(months.length).toBeGreaterThanOrEqual(3);

  // The figure is only an answer if spending it every month is survivable, so
  // it is read off the first month and then held against every later one. One
  // month at a time is exactly the reading that used to pass.
  const monthly = months[0].cumulative - months[0].remaining;
  expect(monthly).toBeGreaterThan(0);

  months.forEach((month, index) => {
    expect(month.remaining).toBe(month.cumulative - monthly * (index + 1));
    // The promise itself: no month closes under once the ceiling has been
    // spent in every month up to it.
    expect(month.remaining).toBeGreaterThanOrEqual(0);
  });

  // The headline and the bars must be the same quantity — a meter whose length
  // measures one thing while the number beside it measures another is the
  // failure `.squad/learnings.md` already records once.
  const headline = (await card.locator("dd").first().innerText()).split("\n");
  expect(parseCents(headline[0])).toBe(monthly);

  // The month that pins the ceiling keeps exactly the 20% safety margin, and in
  // this fixture that is the last one: the cumulative goes flat after the third
  // month, so the ratio keeps falling to the end of the range.
  const track = bars.last();
  const trackBox = await track.boundingBox();
  const fillBox = await track.locator("div").first().boundingBox();
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
  // No ceiling means there are no survivors to draw.
  await expect(card.getByRole("img")).toHaveCount(0);
});

// Range end is the shared seed's SPLIT_RECURRENCE reach (202611, Nov/26 —
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

test("names how many months remain, not the period's length", async ({
  page,
}) => {
  const card = await openProjection(page, CEILING_PERSON);
  const label =
    REMAINING === 1
      ? "Vale pelo 1 mês restante. Limitado por Nov/26."
      : `Vale pelos ${REMAINING} meses restantes. Limitado por Nov/26.`;
  await expect(card.getByText(label)).toBeVisible(SLOW);
});
