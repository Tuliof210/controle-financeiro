import { expect, type Page, test } from "@playwright/test";
import { LISTS, openRow } from "./row.helper";
import { seed } from "./seed.helper";

// A row button PAINTS 30px (40px once the row collapses) but must still answer a
// 44px tap. Nothing else in the suite can see that: the mechanism is a bare
// `::after` overlay in IconButton with no paint of its own, so every geometry
// assertion in row-columns.spec.ts measures the small box and passes while the
// tap band silently shrinks to it. Two ordinary edits do exactly that — an
// `overflow: hidden` added to the row or to `.main` clips the overlay, and
// lowering `--icon-btn-size` far enough makes the pair's two overlays overlap.
//
// To prove this spec is not vacuous: delete the `&::after` block from
// `src/components/IconButton/style.module.scss` and every case here must fail.
const HIT = 44;
// One pixel inside the band's edge, and one pixel outside it. Both are outside
// the 30px paint, which is the point — a probe that only ever lands on the
// painted box would pass with no overlay at all.
const INSIDE = HIT / 2 - 1;
const OUTSIDE = HIT / 2 + 1;

test.beforeAll(seed);

// The button under the pointer, by its accessible name — not by class or by
// attribute, because what matters is which action a finger there would fire.
const labelAt = (page: Page, x: number, y: number) =>
  page.evaluate(
    ([px, py]) =>
      document
        .elementFromPoint(px as number, py as number)
        ?.closest("button")
        ?.getAttribute("aria-label") ?? null,
    [x, y],
  );

// 1440px keeps the row on one line with 30px buttons; 375px collapses it and
// steps them to 40px. The band is 44px in both, which is the whole claim.
for (const width of [1440, 375]) {
  for (const list of LISTS) {
    test(`${list.path} ${list.short} answers a ${HIT}px tap at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const edit = `Editar ${list.short}`;
      const remove = `Excluir ${list.short}`;
      // openRow navigates and waits for the row; the box comes from the button
      // itself afterwards, centred in the viewport first. `block: "center"`
      // rather than scrollIntoViewIfNeeded, which scrolls the minimum and can
      // leave the button flush against an edge — at 375px the fixed bottom nav
      // sits over it there, and every probe below would be reading that nav's
      // z-order instead of this button's band.
      await openRow(page, list, list.short);
      const button = page.getByRole("button", { name: edit });
      await button.evaluate((el) => el.scrollIntoView({ block: "center" }));
      const box = await button.boundingBox();
      if (!box) throw new Error("expected the edit button to have a box");
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      // Centre, then each edge of the band: all four are past the painted box.
      for (const [dx, dy] of [
        [0, 0],
        [INSIDE, 0],
        [-INSIDE, 0],
        [0, INSIDE],
        [0, -INSIDE],
      ]) {
        expect(await labelAt(page, x + dx, y + dy)).toBe(edit);
      }

      // One pixel past the band, towards the neighbour. This is the assertion
      // with teeth: the two bands are wider than the buttons they sit behind,
      // so a gap too narrow puts Excluir's band over Editar's paint and a tap
      // aimed at one fires the other. Measured at --space-2 before this story
      // widened it: 6px of overlap, and a tap 2px left of the seam deleted the
      // row.
      expect(await labelAt(page, x + OUTSIDE, y)).not.toBe(remove);
    });
  }
}
