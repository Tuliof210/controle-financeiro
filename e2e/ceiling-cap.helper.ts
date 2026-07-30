// Not a spec — playwright only collects `*.spec.ts`. The cap selector's whole
// story, kept out of `ceiling.spec.ts` so that file stays one `test` per
// behaviour and under the 100-line cap.
//
// A helper and not a fifth ceiling spec, for the reason its siblings already
// record: `fullyParallel` is unset, so workers scale with spec FILE count and a
// new one loads every geometry assertion in the suite harder for nothing.

import { expect, type Locator, type Page } from "@playwright/test";
import { expectScenarios } from "./ceiling-expect.helper";
import { readMonths, rowsOf, SLOW } from "./ceiling-page.helper";
import { expandCeiling } from "./goals-page.helper";

// Clicked by its visible label, which is what a reader clicks — the radio itself
// is a 1px box clipped behind it. `{ exact: true }` because the bare string
// would also match the <label> wrapping the span.
//
// `was` is the first row's ceiling BEFORE the click, and polling until it moves
// is the whole wait. Nothing unmounts on a cap change — the board revalidates in
// place — so there is no appearing element to await; the arriving payload IS the
// figure changing.
async function pickCap(card: Locator, cap: string, was: number) {
  await card.getByText(`${cap}%`, { exact: true }).click();
  const first = async () => (await readMonths(rowsOf(card)))[0].budget;
  await expect.poll(first, SLOW).not.toBe(was);
  return first();
}

// Relations, never written-down amounts — the doctrine the specs open with. A
// per-month floor drifts the exact ratio between two caps by up to a cent, so
// what is pinned is the direction.
//
// The FIRST month only, and that is not laziness. Raising the cap hands the
// early months more, which leaves the accumulator less for the later ones, so a
// month further down can legitimately be SMALLER at 75 than at 50 — asserted
// per-month this reddens on honest output, which is how it was found. Month 0 is
// the one whose gap no earlier month has touched, so it alone moves with the cap
// monotonically. Anything dropping `cap` along route → service → payload →
// buildCeiling makes the three equal and fails both comparisons.
function expectCapOrder(low: number, mid: number, high: number) {
  expect(low, "a lower cap gives this month less").toBeLessThan(mid);
  expect(high, "a higher cap gives this month more").toBeGreaterThan(mid);
}

// The floor is re-checked at every cap, and that is the highest-value half of
// this: a cap refactor inside buildCeiling is exactly when the suffix minimum
// gets broken again, and `ceilingLeft >= 0` is what catches it.
export async function expectCapMovesTheFigures(page: Page, card: Locator) {
  await expandCeiling(card);
  const settled = async () => {
    const months = await readMonths(rowsOf(card));
    expect(months.length).toBeGreaterThanOrEqual(3);
    expectScenarios(months);
    return months[0].budget;
  };

  const at50 = await settled();
  const at25 = await pickCap(card, "25", at50);
  await settled();
  const at75 = await pickCap(card, "75", at25);
  await settled();
  expectCapOrder(at25, at50, at75);

  // Native radios precisely so this comes from the platform rather than from a
  // keydown handler — which only a real key press can prove.
  await card.getByRole("radio", { name: "25%" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(card.getByRole("radio", { name: "50%" })).toBeChecked();
}
