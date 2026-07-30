// Not a spec — playwright only collects `*.spec.ts`. Reading the two headlines
// and checking the mean, kept out of ceiling.spec.ts so that file grows by a
// test and not by a parser. A helper rather than a fifth spec file on purpose:
// `fullyParallel` is unset, so workers scale with spec FILE count, and a new one
// would load every geometry assertion in the suite harder for nothing.

import { expect, type Locator } from "@playwright/test";
import { parseCents, SLOW } from "./ceiling-page.helper";

// Both headlines lead with their figure and then run an inline-block chip
// straight onto it ("R$ 299,395 MESES RESTANTES"), so the money is sliced off
// the front by its cents pair — not by the first LINE, which would swallow the
// chip's digits, and not by a bare digit class, which would swallow them too.
const leadingMoney = async (dd: Locator) =>
  parseCents((await dd.innerText()).match(/^R\$ [\d.]*\d,\d\d/)?.[0] ?? "");

// The card's two headlines, in DOM order: this month's figure, then the mean.
// The order is the contract — ceiling.spec.ts reads the first `dd` as this
// month's, and the caller below proves the second is not the same number.
export async function readHero(card: Locator) {
  const figures = card.locator("dd");
  await expect(figures.first()).toBeVisible(SLOW);
  return {
    monthly: await leadingMoney(figures.first()),
    average: await leadingMoney(figures.nth(1)),
  };
}

// Recomputed from the rows the card itself rendered, never written down: the
// ceiling spans every month from the current one to the range end, zeros
// included, so the denominator moves with the calendar.
export function expectAverage(budgets: number[], average: number) {
  const total = budgets.reduce((sum, budget) => sum + budget, 0);
  // One floor, and the division done once. A mean floored and then divided
  // again lands up to a cent low — the same double-rounding the goals banner's
  // capacity is pinned against, and the reason `average` is built in the
  // payload rather than derived on the client.
  expect(average).toBe(Math.floor(total / budgets.length));
}
