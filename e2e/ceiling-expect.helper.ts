// Not a spec — playwright only collects `*.spec.ts`. Every assertion the ceiling
// card gets: the column as a series, the headline against its first row, the two
// header badges, and the no-ceiling state. Kept out of `ceiling.spec.ts` so that
// file stays one `test` per behaviour and under the 100-line cap.
//
// Helpers rather than more spec files: `fullyParallel` is unset, so workers scale
// with spec FILE count, and a new one would load every geometry assertion in the
// suite harder for nothing.

import { expect, type Locator } from "@playwright/test";
import {
  DEEPEST_RED_HOLE,
  FIRST_RED_HOLE,
  monthLabel,
  monthsLeftLabel,
} from "./ceiling.helper";
import {
  type CeilingMonth,
  parseCents,
  rowsOf,
  SLOW,
} from "./ceiling-page.helper";

// The count sits on the headline because it is what the column under it lists:
// the months REMAINING, never the period's length. Then the two header badges —
// CEILING_PERSON's balance only rises, so the month holding the worst balance
// ahead is the current one and both name it, by different routes, which is why
// they are asserted separately. The second is matched by `title` because the
// bare month label also appears on the first row.
export async function expectHeaderBadges(card: Locator) {
  await expect(card.getByText(monthsLeftLabel())).toBeVisible(SLOW);
  await expect(card.getByText(`Limitado por ${monthLabel()}`)).toBeVisible();
  await expect(card.getByTitle("Mês em curso")).toHaveText(monthLabel());
}

// Naming the first month says WHEN it breaks, which is the deadline to act on;
// naming the deepest would say how much and lose the date. Asserting on the hole
// rather than on the month label keeps this independent of the clock.
export async function expectNoCeiling(card: Locator) {
  await expect(card.getByText(FIRST_RED_HOLE)).toBeVisible(SLOW);
  await expect(card.getByText(DEEPEST_RED_HOLE)).toHaveCount(0);
  // A red month anywhere ahead zeroes every figure, so there is no table at all
  // — the card is one line of prose.
  await expect(rowsOf(card)).toHaveCount(0);
}

// The card's whole promise, checked as a SERIES rather than row by row. Both
// halves of the ceiling formula have a mutation only the series catches, and
// with `worstAhead` no longer on screen both now land on the same assertion —
// spend the column in order and NO month closes under. Against DIP_PERSON:
//  - drop `- authorised` from `gap` in `buildCeiling` and row 1 leaves −R$ 7,20;
//  - make `suffixMinimum` return `ahead.map((p) => p.cumulative)` and row 1
//    leaves −R$ 12,00. Nothing else catches that one.
//
// The subtraction below is not the tautology it reads as. `ceilingBalance` is
// `cumulative - authorised` taken BEFORE this month is authorised and
// `ceilingLeft` is the same expression taken after, so the payload reaches the
// two by different routes — strip the accumulator off either one and this is
// what notices. It is also what replaces the cross-scenario compounding check
// that went with the average column.
export function expectScenarios(months: CeilingMonth[]) {
  months.forEach((month, at) => {
    expect(month.ceilingLeft, `month ${at}: balance less this month's ceiling`) //
      .toBe(month.ceilingBalance - month.budget);
    expect(
      month.ceilingLeft,
      `month ${at}: spending every ceiling never closes under`,
    ).toBeGreaterThanOrEqual(0);
  });
}

// The headline is THIS month's figure, not a rate that holds for the period, so
// it has to equal the first row. A big number measuring one thing while the rows
// beneath it measure another is the failure `.squad/learnings.md` records once.
//
// The headline leads with its figure and then runs an inline-block chip straight
// onto it ("R$ 299,393 MESES RESTANTES"), so the money is sliced off the front by
// its cents pair — not by the first LINE, which would swallow the chip's digits,
// and not by a bare digit class, which would swallow them too.
export async function expectHeadlineIsFirstRow(card: Locator, budget: number) {
  const headline = card.locator("dd").first();
  await expect(headline).toBeVisible(SLOW);
  const money = (await headline.innerText()).match(/^R\$ [\d.]*\d,\d\d/)?.[0];
  expect(parseCents(money ?? "")).toBe(budget);
}
