import { expect, test } from "@playwright/test";
import { GUTTER, LISTS, openRow, overlaps, PAIR_GAP } from "./row.helper";
import { seed } from "./seed.helper";

// Measured, not read off the viewport: at 1440px this shell leaves an entry row
// 1044px and a Configurações row 484px, both past RowGrid's 440px one-line
// floor, while at 375px both are 291px and collapse. An entry row is also
// narrower at 768px than at 764px — a viewport breakpoint cannot decide this.
const WIDE = 1440;
const NARROW = 375;
// The app's worst width, and one neither endpoint above reaches: the two-column
// Configurações grid has kicked in but the viewport has not grown to pay for
// it, so a row gets 148px — narrower than the 291px it gets at 375px.
const PINCHED = 768;
// ~11 chars of the mono face. Under it the row truncates a name down to an
// ellipsis with almost nothing in front of it.
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
      // "one line" means, and it reddens the moment one drops below the name
      // while the row still has room for it.
      if (cells.value) expect(overlaps(cells.name, cells.value)).toBe(true);
      expect(overlaps(cells.name, cells.edit)).toBe(true);
      // An area no row in this list fills takes no width: no row in Pessoas has
      // an amount, so the name reaches the pair one gutter away. Floor as well
      // as ceiling — the gutters ride on the cells, and a rule that stopped
      // matching them would collapse every gap to 0 and pass a ceiling-only
      // assertion harder than a correct row does.
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

  for (const width of [WIDE, NARROW, PINCHED]) {
    test(`${list.path} ${list.short} keeps its controls together at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const name of [list.long, list.short]) {
        const cells = await openRow(page, list, name);
        // One line, one gap, both from the same rule on the `act` cell — the
        // row has no class of its own to fall back on, so a pair that quietly
        // wrapped would still sit inside the row's box and pass every other
        // assertion here. The gap is also the clearance IconButton's 44px hit
        // overlay needs behind its 30px paint: too small and a tap aimed at
        // Editar reaches Excluir.
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
      // Names start at one x whatever each row holds.
      expect(short.name.x).toBeCloseTo(long.name.x, 0);
      // Amounts share an edge, but not always the same one: flushed right on
      // one line, and starting under the name once they drop to a line of their
      // own, where a right-edge assertion would only measure how many digits
      // each row happens to have. Read which tier the row chose rather than
      // assume it from the viewport, so moving a threshold changes what this
      // asserts instead of reddening it.
      if (long.value && short.valueEdges && long.valueEdges) {
        const edge = overlaps(long.name, long.value) ? "right" : "left";
        expect(short.valueEdges[edge]).toBeCloseTo(long.valueEdges[edge], 0);
      }
    });
  }
}
