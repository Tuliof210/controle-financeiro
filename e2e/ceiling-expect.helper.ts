// Not a spec — playwright only collects `*.spec.ts`. The ceiling card's
// assertions that are not about the average: the two scenarios as a series, the
// two header badges, and the no-ceiling state. Split from `ceiling-average.helper.ts`
// for the same reason `goals.spec.ts` has two helpers next to it — one file per
// spec could not hold them under the 100-line cap.
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
import { type CeilingMonth, rowsOf, SLOW } from "./ceiling-page.helper";

// The count sits beside the average because it IS the average's denominator: the
// months REMAINING, never the period's length. Then the two header badges —
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
// The average side gets no such floor and must not be given one: it is a flat
// spend against a balance that has not arrived yet, so it is allowed to go red.
export function expectScenarios(months: CeilingMonth[]) {
  const average = months[0].average;
  months.forEach((month, at) => {
    expect(month.average, `month ${at}: one average, every row`).toBe(average);
    expect(month.ceilingLeft, `month ${at}: balance less this month's ceiling`) //
      .toBe(month.ceilingBalance - month.budget);
    expect(month.averageLeft, `month ${at}: balance less the average`) //
      .toBe(month.averageBalance - average);
    expect(
      month.ceilingLeft,
      `month ${at}: spending every ceiling never closes under`,
    ).toBeGreaterThanOrEqual(0);
    if (at > 0) {
      // What makes both columns CUMULATIVE: a row opens where the row above it
      // closed, plus that month's own result — one figure, so the two
      // hypotheses have to be carried apart by exactly the same amount.
      const previous = months[at - 1];
      expect(
        month.ceilingBalance - previous.ceilingLeft,
        `month ${at}: both scenarios compound by the same month`,
      ).toBe(month.averageBalance - previous.averageLeft);
    }
  });
}
