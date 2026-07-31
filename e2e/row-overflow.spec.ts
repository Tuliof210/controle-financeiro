import { expect, test } from "@playwright/test";
import { LONG_NAME, LONG_PERSON_NAME, seed } from "./seed.helper";

// 767/768 bracket AppShell's rail threshold (src/styles/_theme.scss's "md"
// stop) — the rail materialising a 264px column plus wider padding is exactly
// the kind of edit that could reopen horizontal overflow.
const WIDTHS = [375, 767, 768, 1024, 1440];
// "/" joined once the Tooltip stopped centring on its trigger below `xl`: the
// dashboard used to overflow 12px at exactly 1024px, where `.kpis` goes to three
// columns and the rightmost StatCard's hint spilled past the edge.
const ROUTES = ["/previsoes", "/movimentacoes", "/configuracoes", "/"];

// What proves a route has real content on screen. "/" has no list row to wait
// for, so it waits on the one card that needs the whole payload to render.
const READY: Record<string, string> = { "/": "Teto de Gastos" };

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
      await expect(
        page.getByText(READY[path] ?? LONG_NAME).first(),
      ).toBeVisible({ timeout: 15_000 });
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
