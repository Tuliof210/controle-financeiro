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

export async function openProjection(
  page: Page,
  person: string,
): Promise<Locator> {
  await page.goto("/");
  await page.getByRole("combobox").selectOption({ label: person });
  await page.getByRole("button", { name: "Projeção" }).click();
  const card = cardOf(page);
  await expect(
    card.getByRole("heading", { name: "Teto de Gastos" }),
  ).toBeVisible(SLOW);
  return card;
}

// Each bar announces itself as "Ago/26: restam R$ 960,00 de R$ 1.200,00" — the
// survivor and the balance it survived, in the order the months run.
export async function readMonths(bars: Locator) {
  const labels = await bars.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("aria-label") ?? ""),
  );
  return labels.map((label) => {
    const [remaining, cumulative] = label.split(/restam | de /).slice(1);
    return {
      remaining: parseCents(remaining),
      cumulative: parseCents(cumulative),
    };
  });
}
