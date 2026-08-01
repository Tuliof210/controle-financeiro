// Not a spec — playwright only collects `*.spec.ts`. Everything the ceiling
// spec needs to reach the card and read it, kept here so the spec itself stays
// assertions. Separate from ceiling.helper.ts, which only seeds.

import { expect, type Locator, type Page } from "@playwright/test";

// Generous timeout: the first navigation in a fresh dev server also pays for
// Turbopack's cold compile of the route and API bundles.
export const SLOW = { timeout: 15_000 };

// "R$ 1.200,00" -> 120000. The minus sign formatMoney emits is U+2212, not a
// hyphen, so stripping non-digits loses it — the sign is read from the string
// rather than from the number, or a negative survivor would parse as positive
// and the assertion it exists to catch would pass.
export const parseCents = (money: string) => {
  const digits = Number(money.replace(/[^\d,]/g, "").replace(",", "."));
  return Math.round(digits * 100) * (money.includes("−") ? -1 : 1);
};

// SectionCard renders an unnamed <section>, so it carries no region role to
// target by name — the heading inside it is the only handle there is.
const cardOf = (page: Page) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Teto de Gastos" }) });

export const rowsOf = (card: Locator) => card.locator("tbody tr");

// The dashboard is one scroll, so reaching the card is a profile pick and
// nothing else — there is no tab to click on the way.
export async function openCeiling(
  page: Page,
  person: string,
): Promise<Locator> {
  await page.goto("/");
  // By its accessible name, not by role alone: the dashboard has a second
  // combobox now (the simulation view), and the bare role is a strict-mode
  // violation the moment a screen grows one more select.
  await page.getByLabel("Perfil ativo").selectOption({ label: person });
  const card = cardOf(page);
  await expect(
    card.getByRole("heading", { name: "Teto de Gastos" }),
  ).toBeVisible(SLOW);
  return card;
}

// Three figures per row, read positionally off the cells: cell 0 is the month
// label, then the balance ARRIVING at the month, that month's ceiling, and what
// is left once it has been spent. Positional and not by text, because the
// stacked tier repeats those same headers inside every cell as a `data-label`,
// so a text match would find each header twice.
//
// `textContent` and not `innerText`: the stacked layout prints each cell's
// column label through a `::before`, which innerText would fold into the value.
// The spend column carries a presentational U+2212 that parseCents reads as a
// sign, so it is taken as a magnitude — it is the amount subtracted, and the
// subtraction already shows in the leftover beside it.
export async function readMonths(rows: Locator) {
  const cells = await rows.evaluateAll((nodes) =>
    nodes.map((node) => [...node.children].map((c) => c.textContent ?? "")),
  );
  return cells.map((row) => ({
    ceilingBalance: parseCents(row[1]),
    budget: Math.abs(parseCents(row[2])),
    ceilingLeft: parseCents(row[3]),
  }));
}

export type CeilingMonth = Awaited<ReturnType<typeof readMonths>>[number];
