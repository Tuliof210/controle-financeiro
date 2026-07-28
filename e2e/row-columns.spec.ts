import { expect, test } from "@playwright/test";
import { GUTTER, LISTS, openRow, overlaps, PAIR_GAP } from "./row.helper";
import { seed } from "./seed.helper";

// Measured, not read off the viewport: at 1440px this app's shell leaves an
// entry row 1044px and a Configurações row 484px — each past its own list's
// one-line floor — while at 375px both are 291px, well under either. An entry
// row is also narrower at 768px (372px) than at 764px (680px), which is why a
// viewport breakpoint can't decide this and a container query can.
const WIDE = 1440;
const NARROW = 375;
// The app's worst width, and one neither endpoint above reaches: the
// two-column Configurações grid has just kicked in but the viewport has not
// grown to pay for it, so a row gets 148px — narrower than the 291px it gets
// at 375px. Nothing else covers it: row-overflow.spec.ts runs at 768px but
// asserts only scrollWidth, which stays clean *because* the text wraps.
const PINCHED = 768;
// ~11 chars of the mono face. Under it a name stops being a line of text and
// becomes the column of syllables this story exists to remove — the 148px
// Pessoas row measured a 0px name over 19 lines before the second stack tier.
const FLOOR = 100;

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
      // Floor as well as ceiling — the gutters ride on the cells, and a rule
      // that stopped matching them would collapse every gap to 0 and pass a
      // ceiling-only assertion harder than a correct row does.
      if (list.bare) {
        const gap = cells.edit.x - (cells.name.x + cells.name.width);
        expect(gap).toBeLessThan(GUTTER + 1);
        expect(gap).toBeGreaterThan(GUTTER - 1);
      }
    }
  });

  test(`${list.path} ${list.short} keeps a readable name at ${PINCHED}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: PINCHED, height: 900 });

    for (const name of [list.long, list.short]) {
      const cells = await openRow(page, list, name);
      expect(cells.name.width).toBeGreaterThan(FLOOR);
    }
  });

  for (const width of [WIDE, NARROW]) {
    test(`${list.path} ${list.short} keeps its controls together at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const name of [list.long, list.short]) {
        const cells = await openRow(page, list, name);
        // One line, one gap. Both come from the same rule on the controls
        // half, and the row has no class of its own to fall back on, so a
        // pair that quietly wrapped onto two lines would still sit inside
        // the row's box and pass every other assertion in this suite.
        expect(overlaps(cells.edit, cells.remove)).toBe(true);
        expect(cells.remove.x - (cells.edit.x + cells.edit.width)).toBeCloseTo(
          PAIR_GAP,
          0,
        );
      }
    });

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
