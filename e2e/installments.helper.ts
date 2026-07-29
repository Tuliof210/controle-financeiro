// Not a spec — playwright only collects `*.spec.ts`. Its own fixture rather
// than a line in seed.helper.ts, per the note there: the row specs keep the
// exact data they were written against, and ceiling.spec asserts figures
// derived from EVERY entry in the shared database.

import { expect, type Page } from "@playwright/test";
import { post, waitFor } from "./api.helper";

// Generous: the first navigation also pays for Turbopack's cold compile of the
// route and its API bundles.
export const SLOW = { timeout: 15_000 };

export const BUYER = "Compradora Parcelada";
export const PURCHASE = "Sofá E2E";

// Fev/26 through Jul/26. Hardcoded, and deliberately inside the window
// seed.helper.ts already spans (202601..202611): the projection range is a
// min/max over every recurrence in the database, so a month outside it would
// move ceiling.spec's divisor and redden a spec this one never touches.
export const FIRST_MONTH_LABEL = "Fev";
export const FIRST_MONTH_YEAR = "2026";
export const PARCELS = "6";
export const TOTAL_DIGITS = "299900";

// What the six parcels must read once the app has done the division.
export const PARCEL_MONEY = "R$ 499,84";
export const TOTAL_MONEY = "R$ 2.999,00";
export const SPAN = "Fev/26–Jul/26 · 6x";

// Same lock as the other fixtures: Person.name is the only @unique column.
// Only the buyer is seeded — the purchase itself is typed into the real form,
// because the division is the thing under test.
export async function seedInstallments() {
  const buyer = await post("/api/people", { name: BUYER, color: "amber" });
  if (!buyer) return waitFor("/api/people", BUYER);
}

// The header <select>, picked before any modal opens — the form has four
// comboboxes of its own and `getByRole("combobox")` would stop being unique.
export async function openAs(page: Page, person: string) {
  await page.goto("/parcelamentos");
  await expect(
    page.getByRole("heading", { name: "Parcelamentos" }),
  ).toBeVisible(SLOW);
  await page.getByRole("combobox").selectOption({ label: person });
}
