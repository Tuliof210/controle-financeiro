import { expect, test } from "@playwright/test";
import { LONG_NAME, LONG_PERSON_NAME, seed } from "./seed.helper";

// 767/768 bracket AppShell's rail threshold (src/styles/_theme.scss's "md"
// stop) — the rail materialising a 264px column plus wider padding is exactly
// the kind of edit that could reopen horizontal overflow.
const WIDTHS = [375, 767, 768, 1024, 1440];
// "/" is deliberately NOT here yet, and that is a known gap: the dashboard is
// clean at 375/390/414/767/768/1440 but still overflows 12px at exactly 1024px,
// where `.kpis` goes to three columns and the rightmost StatCard's Tooltip is
// centred close enough to the edge to spill. That overflow is identical on
// `main` — this route was simply never measured — so closing it is its own
// change, not a review fix. See the debt entry.
const ROUTES = ["/previsoes", "/movimentacoes", "/configuracoes"];

test.beforeAll(seed);

for (const path of ROUTES) {
  for (const width of WIDTHS) {
    test(`${path} has no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Generous timeout: the first navigation in a fresh dev server also
      // pays for Turbopack's cold compile of the route and API bundles.
      await expect(page.getByText(LONG_NAME).first()).toBeVisible({
        timeout: 15_000,
      });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      if (path !== "/configuracoes") return;
      // The regression this story fixes: the edit/delete cluster drifting
      // off its own row. Assert both buttons stay inside their <li>'s box.
      for (const name of [LONG_PERSON_NAME, LONG_NAME]) {
        const row = page.locator("li").filter({ hasText: name });
        const rowBox = await row.boundingBox();
        for (const label of [`Editar ${name}`, `Excluir ${name}`]) {
          const box = await row
            .getByRole("button", { name: label })
            .boundingBox();
          expect(rowBox && box).toBeTruthy();
          expect(box?.y).toBeGreaterThanOrEqual(rowBox?.y ?? 0);
          const bottom = (box?.y ?? 0) + (box?.height ?? 0);
          expect(bottom).toBeLessThanOrEqual(
            (rowBox?.y ?? 0) + (rowBox?.height ?? 0) + 1,
          );
        }
      }
    });
  }
}
