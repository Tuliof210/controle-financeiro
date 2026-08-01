// Not a spec — playwright only collects `*.spec.ts`. Everything the goals spec
// needs to reach the savings card and read its rows, kept here so the spec stays
// assertions, and so neither file crosses the 100-line cap.
//
// Nothing here measures a box. `fullyParallel` is unset, so workers scale with
// spec FILE count and an eighth file loads every other spec harder — a spec that
// reads only text cannot redden someone else's geometry assertion, nor be
// reddened by the load it adds.

import { expect, type Locator, type Page } from "@playwright/test";
import { parseCents, rowsOf, SLOW } from "./ceiling-page.helper";

// The three metric labels, in the order a goal row renders them.
export const METRIC_LABELS = [
  "DEDICADO",
  "EM PARALELO",
  "UM DE CADA VEZ",
] as const;

// The savings card is a plain <section> like SectionCard's, so its heading is
// the only handle. The capacity band stopped being a <section> of its own when
// the block became one card, so this resolves to exactly one element.
const cardOf = (page: Page) =>
  page.locator("section").filter({
    has: page.getByRole("heading", { name: "CAPACIDADE DE POUPANÇA" }),
  });

export async function openGoals(page: Page, person: string): Promise<Locator> {
  await page.goto("/");
  await page.getByLabel("Perfil ativo").selectOption({ label: person });
  const card = cardOf(page);
  await expect(card).toBeVisible(SLOW);
  return card;
}

// "R$ 1.383,38 /mês" -> 138338. Picked BY that suffix, never as the card's first
// <p>: the caption and the empty state are paragraphs too, and reading one would
// not redden — parseCents of prose is 0, and expectQueue's FIXTURE guard passes
// vacuously against a zero capacity.
export async function readCapacity(card: Locator): Promise<number> {
  const perMonth = card.locator("p").filter({ hasText: /\/mês$/ });
  return parseCents(await perMonth.innerText());
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

// "~37 meses · Jul/29" -> 37, "ritmo zero" -> null. The month is captured too,
// so a test can assert the row names one at all.
const parseMetric = (text: string) => {
  const match = text.match(/~(\d+)\s+m[êe]s(?:es)?\s+·\s+(\S+)/);
  return match
    ? { months: Number(match[1]), done: match[2] }
    : { months: null, done: null };
};

// A goal is a row of that card's table: an <li> in its one <ul>, name and target
// marked by `data-cell` — the DOM's own structure, never a hashed CSS-module
// class. Scoped to the card, not `getByRole("list")`: the nav drawer is a list
// too. And `evaluateAll` is not strict-mode-checked, so a handle matching
// nothing returns [] and reads as `expected >= 2, received 0` in the spec.
export async function readGoals(page: Page) {
  const raw = await cardOf(page)
    .getByRole("listitem")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name:
          node.querySelector('[data-cell="name"]')?.textContent?.trim() ?? "",
        target: node.querySelector('[data-cell="target"]')?.textContent ?? "",
        labels: [...node.querySelectorAll("dt")].map((dt) =>
          (dt.textContent ?? "").trim(),
        ),
        values: [...node.querySelectorAll("dd")].map((dd) =>
          (dd.textContent ?? "").trim(),
        ),
      })),
    );
  return raw.map((row) => ({
    name: row.name,
    labels: row.labels,
    // formatMoneyShort drops the cents, so this is the target truncated to
    // whole reais — enough to order two goals, never enough to reproduce a
    // month count. No assertion here recomputes one from it.
    target: parseCents(row.target),
    dedicated: parseMetric(row.values[0] ?? ""),
    parallel: parseMetric(row.values[1] ?? ""),
    serialized: parseMetric(row.values[2] ?? ""),
  }));
}
