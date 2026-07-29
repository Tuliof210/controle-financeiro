import { expect, test } from "@playwright/test";
import { post } from "./api.helper";
import { seed } from "./seed.helper";

// Own person, not seed.helper.ts's fixtures: those rows are shared with the
// row-* specs and editing one from here would redden them.
const OWNER_NAME = "Locktoggle Spec Owner";
const FORECAST_NAME = "Aluguelunicomensal";

test.beforeAll(async () => {
  await seed();
  await post("/api/people", { name: OWNER_NAME, color: "cyan" });
});

async function openAddExpense(page: import("@playwright/test").Page) {
  await page.goto("/previsoes");
  await page
    .locator("section")
    .filter({ hasText: "Saídas" })
    .getByRole("button", { name: "Nova previsão" })
    .click();
}

test("a new row starts locked; unlocking reveals the pair, locking again collapses it", async ({
  page,
}) => {
  await openAddExpense(page);

  await expect(page.getByLabel("Mês - mês")).toBeVisible();
  await expect(page.getByLabel("Fim - mês")).toHaveCount(0);

  const lock = page.getByRole("checkbox", { name: "Mês único" });
  await lock.uncheck();
  await expect(page.getByLabel("Início - mês")).toBeVisible();
  await expect(page.getByLabel("Fim - mês")).toBeVisible();

  await lock.check();
  await expect(page.getByLabel("Mês - mês")).toBeVisible();
  await expect(page.getByLabel("Fim - mês")).toHaveCount(0);
});

test("saving a locked row persists a single month; reopening shows it locked", async ({
  page,
}) => {
  await openAddExpense(page);

  await page.getByLabel("Nome").fill(FORECAST_NAME);
  await page.getByLabel("Valor").fill("15000");
  await page.getByLabel("Responsável").selectOption({ label: OWNER_NAME });
  await page.getByLabel("Mês - mês").selectOption("1");
  await page.getByLabel("Mês - ano").selectOption("2026");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();

  await expect(page.getByText(FORECAST_NAME)).toBeVisible();

  await page.getByRole("button", { name: `Editar ${FORECAST_NAME}` }).click();
  await expect(page.getByLabel("Mês - mês")).toHaveValue("1");
  await expect(page.getByLabel("Mês - ano")).toHaveValue("2026");
  await expect(page.getByLabel("Fim - mês")).toHaveCount(0);
});
