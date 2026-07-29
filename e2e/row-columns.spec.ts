import { expect, test } from "@playwright/test";
import { GUTTER, LISTS, openRow, overlaps, PAIR_GAP } from "./row.helper";
import { seed } from "./seed.helper";

// Measured, not read off the viewport: at 1440px this shell leaves a row
// 640px (both an entry row and a Configurações row — the two-column grid
// gives every card the same width), past RowGrid's `$row-one-line-floor`
// (440px), while at 375px both are 291px and collapse.
const WIDE = 1440;
const NARROW = 375;
// A mid-range width below AppShell's rail threshold — see the "rail" stop in
// src/styles/_theme.scss — kept as a sample distinct from WIDE and NARROW.
// It used to be the app's worst width: before the rail's threshold moved
// (2026-07-29), the two-column Configurações grid had kicked in but the
// viewport had not grown to pay for it, so a row got 148px here, narrower
// than at 375px. Fixed by RowGrid's `$row-one-line-floor`-derived container
// query (the two-column grid can no longer arrive before a row can afford
// it) and by the rail moving off this width entirely.
const PINCHED = 768;
// One below and one at the point AppShell's rail can appear without shrinking
// the content beside it (src/styles/_theme.scss's "rail" stop, 1904px).
// Sampling both sides is how "growing the window never narrows a row" is
// actually exercised, not just asserted in a comment — see the monotonicity
// test below.
const RAIL_BEFORE = 1903;
const RAIL_AFTER = 1904;
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

  // The property AppShell's rail threshold exists to guarantee, checked within
  // a single RowGrid tier at a time so this isolates the rail from the
  // separate (pre-existing, out of scope here) question of whether the
  // two-column grid split itself is ever narrower than the single column it
  // replaces — see debt.md on that gap. NARROW→PINCHED stays single-column on
  // every list (both well under the two-column threshold); RAIL_BEFORE→
  // RAIL_AFTER stays two-column on every list (both well over it) and brackets
  // the rail's own arrival, the thing this task changes.
  test(`${list.path} ${list.short} never gets narrower within a column tier as the window grows`, async ({
    page,
  }) => {
    for (const [narrower, wider] of [
      [NARROW, PINCHED],
      [RAIL_BEFORE, RAIL_AFTER],
    ]) {
      await page.setViewportSize({ width: narrower, height: 900 });
      const before = await openRow(page, list, list.short);
      await page.setViewportSize({ width: wider, height: 900 });
      const after = await openRow(page, list, list.short);
      expect(after.row.width).toBeGreaterThanOrEqual(before.row.width - 1);
    }
  });
}
