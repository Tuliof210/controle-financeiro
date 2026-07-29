import { expect, test } from "@playwright/test";
import {
  BUYER,
  FIRST_MONTH_LABEL,
  FIRST_MONTH_YEAR,
  openAs,
  PARCEL_MONEY,
  PARCELS,
  PURCHASE,
  SLOW,
  SPAN,
  seedInstallments,
  TOTAL_DIGITS,
  TOTAL_MONEY,
} from "./installments.helper";

test.beforeAll(seedInstallments);

test("divides a purchase into parcels and shows what each month owes", async ({
  page,
}) => {
  await openAs(page, BUYER);
  await page.getByRole("button", { name: "Nova compra parcelada" }).click();

  const form = page.getByRole("dialog").filter({ hasText: "Nova compra" });
  await form.getByLabel("O que você comprou").fill(PURCHASE);
  await form.getByLabel("Valor total da compra").fill(TOTAL_DIGITS);
  await form.getByLabel("Parcelas").selectOption(PARCELS);
  await form.getByLabel("Primeira parcela - mês").selectOption({
    label: FIRST_MONTH_LABEL,
  });
  await form
    .getByLabel("Primeira parcela - ano")
    .selectOption(FIRST_MONTH_YEAR);

  // The whole point of the screen: the parcel is on screen before anything is
  // saved, and nobody divided 2999 by 6 by hand.
  await expect(form.getByText(`6x de ${PARCEL_MONEY}`)).toBeVisible();

  await form.getByRole("button", { name: "Adicionar" }).click();

  const row = page
    .getByRole("listitem")
    .filter({ hasText: PURCHASE })
    .filter({ hasText: SPAN });
  await expect(row).toBeVisible(SLOW);
  await expect(row.getByText(PARCEL_MONEY, { exact: true })).toBeVisible();
  await expect(row.getByText(`Total ${TOTAL_MONEY}`)).toBeVisible();
});

test("keeps the purchase off Recorrências while every month still counts it", async ({
  page,
}) => {
  await openAs(page, BUYER);
  await expect(page.getByText(PURCHASE, { exact: true })).toBeVisible(SLOW);

  await page.goto("/recorrencias");
  await expect(page.getByRole("heading", { name: "Recorrências" })).toBeVisible(
    SLOW,
  );
  await expect(page.getByText(PURCHASE, { exact: true })).toHaveCount(0);
});

test("aggregates the parcels into one row per committed month", async ({
  page,
}) => {
  await openAs(page, BUYER);
  await page.getByRole("button", { name: "Por mês" }).click();

  // Filtered by a month, not taken bare: the desktop rail is a <ul> too.
  const list = page.getByRole("list").filter({ hasText: "Fev/26" });
  // Six months, one row each, every one owing exactly one parcel.
  await expect(list.getByRole("listitem")).toHaveCount(6, SLOW);
  for (const month of [
    "Fev/26",
    "Mar/26",
    "Abr/26",
    "Mai/26",
    "Jun/26",
    "Jul/26",
  ]) {
    const row = list.getByRole("listitem").filter({ hasText: month });
    await expect(row.getByText("1 compra")).toBeVisible();
    await expect(row.getByText(PARCEL_MONEY, { exact: true })).toBeVisible();
  }

  // Ago/26 is inside the projection range and holds no parcel of this buyer's,
  // so it must not appear at all — the tab lists commitments, not a calendar.
  await expect(
    list.getByRole("listitem").filter({ hasText: "Ago/26" }),
  ).toHaveCount(0);
});
