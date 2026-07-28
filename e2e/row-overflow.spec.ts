import { expect, test } from "@playwright/test";

// "localhost", matching playwright.config.ts's baseURL — see the comment
// there on why 127.0.0.1 doesn't work against Next 16 dev.
const BASE_URL = "http://localhost:3100";
const WIDTHS = [375, 768, 1024];
const ROUTES = ["/recorrencias", "/movimentacoes"];
// One unbroken run of letters, no spaces: the worst case for a name column
// that can only wrap at word boundaries — proves overflow-wrap, not just
// ordinary text wrap, is doing the work.
const LONG_NAME =
  "Financiamentodoapartamentonovoextraordinariamentelongoesemespacos";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}

const OWNER_NAME = "Fernanda Alexandrina";

// Seeds one row per screen so this spec exercises real primary/secondary
// tiers (name, amount, owner, period) instead of an empty-state card, which
// would never touch RowLayout's wrap behaviour at all. Idempotent — reruns
// (retries, a second worker) reuse the existing person instead of hitting
// its unique-name constraint.
async function seed() {
  const people: { id: string; name: string }[] =
    (await fetch(`${BASE_URL}/api/people`).then((r) => r.json())).data ?? [];
  const existing = people.find((p) => p.name === OWNER_NAME);
  if (existing) return;

  const person = await post("/api/people", {
    name: OWNER_NAME,
    color: "violet",
  });
  await post("/api/recurrences", {
    name: LONG_NAME,
    valueCents: 123456,
    type: "expense",
    ownerId: person.id,
    months: [202601, 202602, 202603],
  });
  await post("/api/movements", {
    name: LONG_NAME,
    valueCents: 987654,
    type: "income",
    ownerId: person.id,
    month: 202601,
  });
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
    });
  }
}
