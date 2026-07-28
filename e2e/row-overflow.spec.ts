import { expect, test } from "@playwright/test";

// "localhost", matching playwright.config.ts's baseURL — see the comment
// there on why 127.0.0.1 doesn't work against Next 16 dev.
const BASE_URL = "http://localhost:3100";
const WIDTHS = [375, 768, 1024];
const ROUTES = ["/recorrencias", "/movimentacoes", "/configuracoes"];
// One unbroken run of letters, no spaces: the worst case for a name column
// that can only wrap at word boundaries — proves overflow-wrap, not just
// ordinary text wrap, is doing the work.
const LONG_NAME =
  "Financiamentodoapartamentonovoextraordinariamentelongoesemespacos";
// Person.name caps at 60 (LONG_NAME is 65) — its own word, not a substring
// of LONG_NAME, or the row locator below would match both rows.
const LONG_PERSON_NAME = "Reformaestruturaldacoberturaeavarandadositiofamiliar";
async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}
const OWNER_NAME = "Fernanda Alexandrina";

// Seeds one long-name row per screen, each idempotent on its own — reruns
// (retries, a second worker) reuse whatever already exists.
async function seed() {
  const people: { id: string; name: string }[] =
    (await fetch(`${BASE_URL}/api/people`).then((r) => r.json())).data ?? [];
  let owner = people.find((p) => p.name === OWNER_NAME);
  if (!owner) {
    owner = await post("/api/people", { name: OWNER_NAME, color: "violet" });
    await post("/api/recurrences", {
      name: LONG_NAME,
      valueCents: 123456,
      type: "expense",
      ownerId: owner.id,
      months: [202601, 202602, 202603],
    });
    await post("/api/movements", {
      name: LONG_NAME,
      valueCents: 987654,
      type: "income",
      ownerId: owner.id,
      month: 202601,
    });
  }
  if (!people.some((p) => p.name === LONG_PERSON_NAME)) {
    await post("/api/people", { name: LONG_PERSON_NAME, color: "lime" });
  }
  const goals: { name: string }[] =
    (await fetch(`${BASE_URL}/api/goals`).then((r) => r.json())).data ?? [];
  if (!goals.some((g) => g.name === LONG_NAME)) {
    await post("/api/goals", { name: LONG_NAME, targetCents: 500000 });
  }
}

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
