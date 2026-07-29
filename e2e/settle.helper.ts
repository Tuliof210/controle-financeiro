// Not a spec — playwright only collects `*.spec.ts`. One wait, shared by every
// spec that asserts on a coordinate.

import { expect, type Locator, type Page } from "@playwright/test";

// A visible element is not a settled one, and most assertions in this suite are
// geometry. Two things land after the first paint and both move boxes: the mono
// webfont, which decides how wide the text is, and RowGrid's container query,
// which picks a row's tier from its own measured width. A `scrollIntoView` still
// in flight moves them again, and `boundingBox` and `elementFromPoint` are both
// viewport-relative, so a probe taken mid-scroll silently aims somewhere else.
//
// Measuring in either window reads a layout the user never sees. It stayed
// invisible while the suite ran four spec files on four workers; the fifth file
// added a fifth worker, and the machine got slow enough for the gap to open —
// which is why this is a fix and not a `retries: 1`.
//
// To prove this is load-bearing: delete both `settle` calls and run
// `npm run test` ten times. It reddens roughly three runs in ten, in
// row-columns.spec.ts or row-hit-target.spec.ts depending on which worker loses.
export async function settle(page: Page, target: Locator) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  let previous = "";
  await expect
    .poll(
      async () => {
        const current = JSON.stringify(await target.boundingBox());
        const stable = current !== "null" && current === previous;
        previous = current;
        return stable;
      },
      { timeout: 10_000, intervals: [50, 50, 50, 100, 100, 200] },
    )
    .toBe(true);
}
