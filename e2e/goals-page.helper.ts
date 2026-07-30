// Not a spec — playwright only collects `*.spec.ts`. Everything the goals spec
// needs to reach the cards and read them, kept here so the spec itself stays
// assertions, and so neither file crosses the 100-line cap.
//
// Nothing here measures a box. `fullyParallel` is unset, so workers scale with
// spec FILE count and an eighth file loads every other spec harder — a spec that
// reads only text cannot redden someone else's geometry assertion, and cannot be
// reddened by the load it adds.

import { expect, type Locator, type Page } from "@playwright/test";
import { parseCents, rowsOf, SLOW } from "./ceiling-page.helper";

// The three metric labels, in the order the card renders them.
export const METRIC_LABELS = [
  "DEDICADO",
  "EM PARALELO",
  "UM DE CADA VEZ",
] as const;

// The banner is a plain <section> like SectionCard's, so its heading is the only
// handle. The dashboard is one scroll — no tab to click on the way.
export async function openGoals(page: Page, person: string): Promise<Locator> {
  await page.goto("/");
  await page.getByRole("combobox").selectOption({ label: person });
  const banner = page.locator("section").filter({
    has: page.getByRole("heading", { name: "CAPACIDADE DE POUPANÇA" }),
  });
  await expect(banner).toBeVisible(SLOW);
  return banner;
}

// "R$ 1.383,38 /mês" -> 138338. parseCents keeps only digits and the decimal
// comma, so the "/mês" it is glued to costs nothing.
export async function readCapacity(banner: Locator): Promise<number> {
  return parseCents(await banner.locator("p").first().innerText());
}

// Every month the ceiling covers, not just the rendered ones. `useShowAll` caps
// the list at 8 rows behind a "Ver todos" chip, while the capacity averages ALL
// of them — so a fixture that ever left more than 8 months ahead would have the
// caller comparing a mean over 8 against a mean over more, and failing for a
// reason that has nothing to do with the code under test. Expanding first is
// what keeps the two sides of that comparison the same set.
export async function expandCeiling(card: Locator) {
  const chip = card.getByRole("button", { name: /^Ver todos/ });
  if (await chip.isVisible()) await chip.click();
  const rows = rowsOf(card);
  await expect(rows.first()).toBeVisible(SLOW);
  return rows;
}

// "~37 meses · Jul/29" -> 37, and "ritmo zero" -> null. The month is captured
// too so a test can assert the card names one at all.
const parseMetric = (text: string) => {
  const match = text.match(/~(\d+)\s+m[êe]s(?:es)?\s+·\s+(\S+)/);
  return match
    ? { months: Number(match[1]), done: match[2] }
    : { months: null, done: null };
};

// A goal card is the only <section> on this page carrying an <h3>. Read through
// the DOM's own structure — the target is the heading's next sibling — rather
// than through a CSS-module class, whose hashed name is not a contract.
export async function readGoals(page: Page) {
  const raw = await page
    .locator("section")
    .filter({ has: page.locator("h3") })
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.querySelector("h3")?.textContent?.trim() ?? "",
        target: node.querySelector("h3")?.nextElementSibling?.textContent ?? "",
        labels: [...node.querySelectorAll("dt")].map((dt) =>
          (dt.textContent ?? "").trim(),
        ),
        values: [...node.querySelectorAll("dd")].map((dd) =>
          (dd.textContent ?? "").trim(),
        ),
      })),
    );

  return raw.map((card) => ({
    name: card.name,
    labels: card.labels,
    // formatMoneyShort drops the cents, so this is the target truncated to
    // whole reais — enough to order two goals, never enough to reproduce a
    // month count. No assertion here recomputes one from it.
    target: parseCents(card.target),
    dedicated: parseMetric(card.values[0] ?? ""),
    parallel: parseMetric(card.values[1] ?? ""),
    serialized: parseMetric(card.values[2] ?? ""),
  }));
}
