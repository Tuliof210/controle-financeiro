// Not a spec — playwright only collects `*.spec.ts`. Reading the card's two
// headlines and checking the mean, kept out of `ceiling.spec.ts` so that file
// stays one `test` per behaviour and under the 100-line cap. Its sibling
// `ceiling-expect.helper.ts` holds the card's other assertions.

import { expect, type Locator } from "@playwright/test";
import { parseCents, readMonths, SLOW } from "./ceiling-page.helper";
import { expandCeiling } from "./goals-page.helper";

// Both headlines lead with their figure and then run an inline-block chip
// straight onto it ("R$ 299,395 MESES RESTANTES"), so the money is sliced off
// the front by its cents pair — not by the first LINE, which would swallow the
// chip's digits, and not by a bare digit class, which would swallow them too.
const leadingMoney = async (dd: Locator) =>
  parseCents((await dd.innerText()).match(/^R\$ [\d.]*\d,\d\d/)?.[0] ?? "");

// The card's two headlines, in DOM order: this month's figure, then the mean.
const readHero = async (card: Locator) => ({
  monthly: await leadingMoney(card.locator("dd").first()),
  average: await leadingMoney(card.locator("dd").nth(1)),
});

// The headline is THIS month's figure, not a rate that holds for the period, so
// it has to equal the first row. A big number measuring one thing while the rows
// beneath it measure another is the failure `.squad/learnings.md` records once.
export async function expectHeadlineIsFirstRow(card: Locator, budget: number) {
  await expect(card.locator("dd").first()).toBeVisible(SLOW);
  expect((await readHero(card)).monthly).toBe(budget);
}

// Recomputed from the rows the card itself rendered, never written down: the
// ceiling spans every month from the current one to the range end, zeros
// included, so the denominator moves with the calendar. Expanded first, since
// `useShowAll` caps the list at 8 rows while the average takes all of them.
export async function expectAverageStory(card: Locator) {
  const budgets = (await readMonths(await expandCeiling(card))).map(
    (month) => month.budget,
  );
  expect(budgets.length).toBeGreaterThanOrEqual(3);

  const hero = await readHero(card);
  // Which headline is which, proven rather than assumed: the first is this
  // month's figure, so the second cannot also be it.
  expect(hero.monthly).toBe(budgets[0]);
  // One floor, and the division done once. A mean floored and then divided again
  // lands up to a cent low — the same double-rounding the goals banner's
  // capacity is pinned against, and the reason `average` is built in the payload
  // rather than derived on the client.
  const total = budgets.reduce((sum, budget) => sum + budget, 0);
  expect(hero.average).toBe(Math.floor(total / budgets.length));

  // And the chip beside this month's figure is that division, not a third number
  // the card computed some other way.
  const ratio = (hero.monthly / hero.average).toFixed(1).replace(".", ",");
  await expect(card.getByText(`${ratio}× a média`)).toBeVisible();
}
