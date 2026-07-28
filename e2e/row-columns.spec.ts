import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  LONG_NAME,
  SHORT_MOVEMENT,
  SHORT_RECURRENCE,
  seed,
} from "./seed.helper";

// Measured, not read off the viewport: at 1440px this app's shell leaves each
// row 1044px, past RowGrid's 660px one-line floor; at 375px the same row is
// 291px, well under it. 768px lands at 372px — between the two — which is why
// a viewport breakpoint can't decide this and a container query can.
const WIDE = 1440;
const NARROW = 375;
const SCREENS = [
  { path: "/recorrencias", sibling: SHORT_RECURRENCE },
  { path: "/movimentacoes", sibling: SHORT_MOVEMENT },
];

test.beforeAll(seed);

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("expected the element to have a box");
  return found;
}

// Everything a row shows, located the way a user sees it — by its text and by
// the button's accessible name, never by the class or attribute that places
// it. Generous timeout on the first wait: a fresh dev server also pays for
// Turbopack's cold compile of the route and API bundles.
async function openRow(page: Page, path: string, name: string) {
  await page.goto(path);
  await expect(page.getByText(LONG_NAME).first()).toBeVisible({
    timeout: 15_000,
  });
  const row = page
    .getByRole("list")
    .filter({ hasText: LONG_NAME })
    .getByRole("listitem")
    .filter({ hasText: name });
  return {
    row: await box(row),
    name: await box(row.getByText(name, { exact: true })),
    value: await box(row.getByText(/^R\$/)),
    edit: await box(row.getByRole("button", { name: `Editar ${name}` })),
  };
}

const overlaps = (a: { y: number; height: number }, b: typeof a) =>
  a.y < b.y + b.height && b.y < a.y + a.height;

for (const { path, sibling } of SCREENS) {
  test(`${path} puts a wide row on one line`, async ({ page }) => {
    await page.setViewportSize({ width: WIDE, height: 900 });

    for (const name of [LONG_NAME, sibling]) {
      const cells = await openRow(page, path, name);
      // Name, amount and the action pair all overlap vertically: that is what
      // "one line" means, and it goes red the moment the actions drop below
      // the name while the row still has room for both.
      expect(overlaps(cells.name, cells.value)).toBe(true);
      expect(overlaps(cells.name, cells.edit)).toBe(true);
    }
  });

  for (const width of [WIDE, NARROW]) {
    test(`${path} aligns its columns at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const long = await openRow(page, path, LONG_NAME);
      const short = await openRow(page, path, sibling);
      // One column for names and one for amounts, whatever each row holds.
      expect(short.name.x).toBeCloseTo(long.name.x, 0);
      expect(short.value.x + short.value.width).toBeCloseTo(
        long.value.x + long.value.width,
        0,
      );
    });
  }
}
