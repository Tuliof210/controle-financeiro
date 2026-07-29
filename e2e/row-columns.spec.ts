import { expect, test } from "@playwright/test";
import { GUTTER, LISTS, openRow, overlaps, PAIR_GAP } from "./row.helper";
import { seed } from "./seed.helper";

// Measured, not read off the viewport: at 1440px this shell leaves a row
// 640px (both an entry row and a Configurações row — the two-column grid
// gives every card the same width), past RowGrid's `$row-one-line-floor`
// (440px), while at 375px both are 291px and collapse.
const WIDE = 1440;
const NARROW = 375;
// The point AppShell's rail arrives (src/styles/_theme.scss's "md" stop,
// 768px) — kept as a sample distinct from WIDE and NARROW. It used to be the
// app's worst width: before the rail's threshold moved (2026-07-29), the
// two-column Configurações grid had kicked in but the viewport had not grown
// to pay for it, so a row got 148px here, narrower than at 375px. Fixed by
// RowGrid's `$row-one-line-floor`-derived container query (the two-column
// grid can no longer arrive before a row can afford it).
const PINCHED = 768;
// Just below the rail's arrival. Sampled by the monotonicity test below
// against NARROW, never against PINCHED: the rail materialising a 264px
// column plus wider padding right at 768px is a measured, owner-chosen
// narrowing (2026-07-29), not a regression to guard against.
const MD_BEFORE = 767;
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

  // Checked on each side of the rail's arrival, never across it: NARROW→
  // MD_BEFORE stays rail-free on every list, PINCHED→WIDE stays rail-active on
  // every list (both measured, both well clear of the pre-existing, out of
  // scope two-column-split question tracked in debt.md), so this isolates
  // "growing the window never narrows a row" from the one point where it is
  // allowed to — the rail materialising at 768px, an accepted cost of this
  // task, not the property under test.
  test(`${list.path} ${list.short} never gets narrower within a column tier as the window grows`, async ({
    page,
  }) => {
    for (const [narrower, wider] of [
      [NARROW, MD_BEFORE],
      [PINCHED, WIDE],
    ]) {
      await page.setViewportSize({ width: narrower, height: 900 });
      const before = await openRow(page, list, list.short);
      await page.setViewportSize({ width: wider, height: 900 });
      const after = await openRow(page, list, list.short);
      expect(after.row.width).toBeGreaterThanOrEqual(before.row.width - 1);
    }
  });
}

// GoalRow renders no `who` cell, so column 1 collapses to zero width and
// `main`/`amt` both land in column 2 — the gutter reset used to key on DOM
// order (`:first-child`), which zeroed `main`'s margin (source-first) but not
// `amt`'s (source-second), leaving them 12px apart despite sharing a column.
// NARROW puts a goal row under the one-line floor, where `_tiers.scss`
// re-aligns `amt` to `justify-self: start` and the mismatch becomes visible.
test("/configuracoes Viagem keeps name and dropped amount flush at the same edge", async ({
  page,
}) => {
  const goals = LISTS.find(
    (list) => list.path === "/configuracoes" && !list.bare,
  );
  if (!goals) throw new Error("expected a non-bare /configuracoes list");
  await page.setViewportSize({ width: NARROW, height: 900 });
  const cells = await openRow(page, goals, goals.short);
  if (!cells.valueEdges) throw new Error("expected an amount to measure");
  expect(cells.name.x).toBeCloseTo(cells.valueEdges.left, 0);
});
