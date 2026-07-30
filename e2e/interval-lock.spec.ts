import { expect, test } from "@playwright/test";
import { post } from "./api.helper";
import { seed } from "./seed.helper";
import { settle } from "./settle.helper";

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

// dialog[open], not getByRole("dialog"): the nav drawer is a <dialog> too, so
// the role alone is a strict-mode violation. Summary texts are anchored at BOTH
// ends, or an ancestor whose text merely starts with them matches instead.
test("the card's summary reads back the range and its duration", async ({
  page,
}) => {
  await openAddExpense(page);
  const modal = page.locator("dialog[open]");
  await expect(modal.getByText(/^1 mês$/)).toBeVisible();

  const lock = page.getByRole("checkbox", { name: "Mês único" });
  await lock.uncheck();
  // Years pinned: a fresh row seeds from the clock, so the expected labels would
  // otherwise depend on the year the suite runs in.
  await page.getByLabel("Início - mês").selectOption("1");
  await page.getByLabel("Início - ano").selectOption("2026");
  await page.getByLabel("Fim - mês").selectOption("3");
  await page.getByLabel("Fim - ano").selectOption("2026");
  await expect(
    modal.getByText("Jan/26 → Mar/26", { exact: true }),
  ).toBeVisible();
  await expect(modal.getByText(/^3 meses$/)).toBeVisible();

  await lock.check();
  await expect(modal.getByText("Jan/26", { exact: true })).toBeVisible();
  await expect(modal.getByText(/^1 mês$/)).toBeVisible();
});

test("two cards fit 375px and keep a 44px tap band", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await openAddExpense(page);
  await page.getByRole("button", { name: "Adicionar intervalo" }).click();
  const remove = page.getByRole("button", { name: "Remover intervalo 2" });
  await expect(remove).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  // The label carries the toggle's tap band; the 20px box inside it never did.
  // block: "center", not scrollIntoViewIfNeeded — the minimum scroll can leave
  // the target under the sticky header, and the box then reads short.
  const label = page.locator("label").filter({ hasText: "Mês único" }).first();
  for (const target of [label, remove]) {
    await target.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await settle(page, target);
    const box = await target.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  expect((await remove.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(44);
});
