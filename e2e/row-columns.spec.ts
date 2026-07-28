import { expect, test } from "@playwright/test";
import { GUTTER, LISTS, openRow, overlaps } from "./row.helper";
import { seed } from "./seed.helper";

// Measured, not read off the viewport: at 1440px this app's shell leaves an
// entry row 1044px and a Configurações row 484px — each past its own list's
// one-line floor — while at 375px both are 291px, well under either. An entry
// row is also narrower at 768px (372px) than at 764px (680px), which is why a
// viewport breakpoint can't decide this and a container query can.
const WIDE = 1440;
const NARROW = 375;

test.beforeAll(seed);

for (const list of LISTS) {
  test(`${list.path} ${list.short} puts a wide row on one line`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: WIDE, height: 900 });

    for (const name of [list.long, list.short]) {
      const cells = await openRow(page, list, name);
      // Name, amount and the action pair all overlap vertically: that is what
      // "one line" means, and it goes red the moment the actions drop below
      // the name while the row still has room for both.
      if (cells.value) expect(overlaps(cells.name, cells.value)).toBe(true);
      expect(overlaps(cells.name, cells.edit)).toBe(true);
      // A column no row in this list fills takes no width: no row in Pessoas
      // has an amount or an owner, so the name cell reaches the action pair
      // one gutter away instead of stopping short of two dead columns.
      if (list.bare) {
        expect(cells.edit.x - (cells.name.x + cells.name.width)).toBeLessThan(
          GUTTER + 1,
        );
      }
    }
  });

  for (const width of [WIDE, NARROW]) {
    test(`${list.path} ${list.short} aligns its columns at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const long = await openRow(page, list, list.long);
      const short = await openRow(page, list, list.short);
      // One column for names and one for amounts, whatever each row holds.
      expect(short.name.x).toBeCloseTo(long.name.x, 0);
      if (short.valueRight && long.valueRight) {
        expect(short.valueRight).toBeCloseTo(long.valueRight, 0);
      }
    });
  }
}
