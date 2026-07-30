// Not a spec — playwright only collects `*.spec.ts`. The ceiling card's
// assertions that are not about the average: the first bar's geometry, the two
// header badges, and the no-ceiling state. Split from `ceiling-average.helper.ts`
// for the same reason `goals.spec.ts` has two helpers next to it — one file per
// spec could not hold them under the 100-line cap.
//
// Helpers rather than more spec files: `fullyParallel` is unset, so workers scale
// with spec FILE count, and a new one would load every geometry assertion in the
// suite harder for nothing.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  DEEPEST_RED_HOLE,
  FIRST_RED_HOLE,
  monthLabel,
  monthsLeftLabel,
} from "./ceiling.helper";
import { type CeilingMonth, SLOW } from "./ceiling-page.helper";
import { settle } from "./settle.helper";

// The bar is the month's own figure against its own worst balance ahead, so the
// FIRST month's is the fullest on the card: nothing has been authorised before
// it, so it takes the whole 80% and leaves only the safety margin. Expected
// width recomputed from the payload rather than written down, so it survives a
// change of fixture; the fill is the track's first <div>.
export async function expectFirstBarFill(
  page: Page,
  bars: Locator,
  month: CeilingMonth,
) {
  await settle(page, bars.first());
  const track = await bars.first().boundingBox();
  const fill = await bars.first().locator("div").first().boundingBox();
  expect(track && fill).toBeTruthy();
  expect(((fill?.width ?? 0) / (track?.width ?? 1)) * 100).toBeCloseTo(
    (month.budget / month.worstAhead) * 100,
    0,
  );
}

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
  // A red month anywhere ahead zeroes every figure, so there is nothing to draw.
  await expect(card.getByRole("img")).toHaveCount(0);
}
