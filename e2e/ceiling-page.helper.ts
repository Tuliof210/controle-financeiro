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

// Each bar announces itself as "Ago/26: gasto extra R$ 1,92, restam R$ 0,48 de
// R$ 12,00" — the month's own figure first, then the pair the bar measures. All
// three come off the accessible name rather than the cells, so the numbers under
// assertion are the ones a screen reader is handed.
export async function readMonths(bars: Locator) {
  const labels = await bars.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("aria-label") ?? ""),
  );
  return labels.map((label) => {
    const [budget, remaining, worstAhead] = label
      .split(/: gasto extra |, restam | de /)
      .slice(1);
    return {
      budget: parseCents(budget),
      remaining: parseCents(remaining),
      worstAhead: parseCents(worstAhead),
    };
  });
}

type CeilingMonth = Awaited<ReturnType<typeof readMonths>>[number];

// The card's whole promise, checked as a SERIES rather than row by row: each
// month's figure is 80% of what is left of its worst balance ahead once the
// earlier months have been taken, and what survives never goes under.
//
// Row by row, two wrong formulas read identically to the right one — a flat rate,
// and a bare suffix minimum that prices each month in isolation. Both fail here,
// and the isolation one fails from the second row on, because by then the running
// total already exceeds that month's worst balance.
export function expectAccumulator(months: CeilingMonth[]) {
  let authorised = 0;
  months.forEach((month, index) => {
    const headroom = month.worstAhead - authorised;
    expect(month.budget, `month ${index}: 80% of its remaining headroom`).toBe(
      Math.floor((4 * headroom) / 5),
    );
    authorised += month.budget;
    expect(
      month.remaining,
      `month ${index}: survives every earlier figure`,
    ).toBe(month.worstAhead - authorised);
    expect(
      month.remaining,
      `month ${index}: does not close under`,
    ).toBeGreaterThanOrEqual(0);
    // The worst balance ahead is a suffix minimum, so it can only rise as the
    // months advance. A per-month balance in its place would not have to.
    if (index > 0) {
      expect(
        month.worstAhead,
        `month ${index}: suffix minimum never falls`,
      ).toBeGreaterThanOrEqual(months[index - 1].worstAhead);
    }
  });
}
