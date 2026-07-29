import { expect, type Locator, type Page } from "@playwright/test";
import {
  LONG_NAME,
  LONG_PERSON_NAME,
  SHORT_FORECAST,
  SHORT_GOAL,
  SHORT_MOVEMENT,
  SHORT_PERSON,
} from "./seed.helper";
import { settle } from "./settle.helper";

// Not a spec (playwright only collects `*.spec.ts`): the row locators, shared
// by the specs next to it — see seed.helper.ts for the same arrangement.

// One entry per LIST, not per screen: `long` is the name that identifies its
// <ul> on a page holding several, `short` a sibling row inside the same list,
// and `bare` marks the list whose rows carry no amount at all.
export const LISTS = [
  { path: "/previsoes", long: LONG_NAME, short: SHORT_FORECAST },
  { path: "/movimentacoes", long: LONG_NAME, short: SHORT_MOVEMENT },
  { path: "/configuracoes", long: LONG_NAME, short: SHORT_GOAL },
  {
    path: "/configuracoes",
    long: LONG_PERSON_NAME,
    short: SHORT_PERSON,
    bare: true,
  },
];

// --space-3: the one gutter that separates two cells that do exist.
export const GUTTER = 12;

// --space-4, the gap inside the control pair. Not --space-2: IconButton paints
// 30px in a row but keeps a 44px hit overlay behind it, and two of those need
// at least 44 - 30 between them or the overlays overlap — measured at 6px of
// overlap on --space-2, with a tap left of the seam firing Excluir. The rule
// lives in one place and the rows have no `.actions` class to fall back on, so
// if it ever stops matching the two buttons are free to drift apart or wrap.
export const PAIR_GAP = 16;

export const overlaps = (a: { y: number; height: number }, b: typeof a) =>
  a.y < b.y + b.height && b.y < a.y + a.height;

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("expected the element to have a box");
  return found;
}

// The amount's box is not the amount. Its cell stretches to fill the grid
// track, so the box ends at the track's edge whether the text inside is flushed
// there or not — a box-only assertion stays green with the alignment visibly
// broken. A Range over the node's contents measures what is painted. Both edges
// are read because the amount changes which one it is flushed to: it ends at
// the row's right on one line, and starts under the name once it drops to its
// own.
const textEdges = (locator: Locator) =>
  locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const { left, right } = range.getBoundingClientRect();
    return { left, right };
  });

// Everything a row shows, located the way a user sees it — by its text and by
// the button's accessible name, never by the class or attribute that places
// it. Generous timeout on the first wait: a fresh dev server also pays for
// Turbopack's cold compile of the route and API bundles.
export async function openRow(
  page: Page,
  list: (typeof LISTS)[number],
  name: string,
) {
  await page.goto(list.path);
  const row = page
    .getByRole("list")
    .filter({ hasText: list.long })
    .getByRole("listitem")
    .filter({ hasText: name });
  // The row itself, not its text anywhere on the page: /configuracoes also
  // renders every person's name in the header's hidden <select> options.
  await expect(row).toBeVisible({ timeout: 15_000 });
  await settle(page, row);
  const value = row.getByText(/^R\$/);
  return {
    // The row's own box — inline size, not any cell's — for assertions about
    // the row as a whole (e.g. that it never gets narrower as the window
    // grows), as distinct from the per-cell boxes below.
    row: await box(row),
    name: await box(row.getByText(name, { exact: true })),
    value: list.bare ? null : await box(value),
    valueEdges: list.bare ? null : await textEdges(value),
    edit: await box(row.getByRole("button", { name: `Editar ${name}` })),
    remove: await box(row.getByRole("button", { name: `Excluir ${name}` })),
  };
}
