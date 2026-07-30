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

// The dashboard is one scroll, so reaching the card is a profile pick and
// nothing else — there is no tab to click on the way.
export async function openCeiling(
  page: Page,
  person: string,
): Promise<Locator> {
  await page.goto("/");
  await page.getByRole("combobox").selectOption({ label: person });
  const card = cardOf(page);
  await expect(
    card.getByRole("heading", { name: "Teto de Gastos" }),
  ).toBeVisible(SLOW);
  return card;
}

// Each bar announces itself as "Ago/26: gasto extra R$ 1,92, restam R$ 0,48,
// teto R$ 12,00" — the month's own figure, what survives it, and the ceiling the
// bar measures it against. All three come off the accessible name rather than
// the cells, so the numbers under assertion are the ones a screen reader is
// handed. The separators here are the contract: reword `srLabel` in
// CeilingCard/hook.ts and every value below silently parses to NaN.
export async function readMonths(bars: Locator) {
  const labels = await bars.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("aria-label") ?? ""),
  );
  return labels.map((label) => {
    const [budget, remaining, worstAhead] = label
      .split(/: gasto extra |, restam |, teto /)
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
// earlier months have been taken, and what survives never goes under. Row by row,
// a flat rate and a bare suffix minimum both read identically to the right
// answer; here they do not. The suffix minimum can only RISE as months advance —
// a per-month balance in its place would not have to.
export function expectAccumulator(months: CeilingMonth[]) {
  let authorised = 0;
  months.forEach((month, at) => {
    const headroom = month.worstAhead - authorised;
    expect(month.budget, `month ${at}: 80% of its remaining headroom`).toBe(
      Math.floor((4 * headroom) / 5),
    );
    authorised += month.budget;
    expect(month.remaining, `month ${at}: survives earlier figures`).toBe(
      month.worstAhead - authorised,
    );
    expect(
      month.remaining,
      `month ${at}: does not close under`,
    ).toBeGreaterThanOrEqual(0);
    if (at > 0) {
      expect(
        month.worstAhead,
        `month ${at}: suffix minimum never falls`,
      ).toBeGreaterThanOrEqual(months[at - 1].worstAhead);
    }
  });
}
