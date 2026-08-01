import { expect, type Page, test } from "@playwright/test";
import { openCeiling, readMonths, rowsOf, SLOW } from "./ceiling-page.helper";
import {
  BOARD_OWNER,
  FORM_OWNER,
  REAL_NAME,
  SIM_NAME,
  seedSimulation,
} from "./simulation.helper";

test.beforeAll(seedSimulation);

async function addForecast(page: Page, name: string, simulated: boolean) {
  await page.goto("/previsoes");
  await page
    .locator("section")
    .filter({ hasText: "Saídas" })
    .getByRole("button", { name: "Nova previsão" })
    .click();
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Valor").fill("15000");
  await page.getByLabel("Responsável").selectOption({ label: FORM_OWNER });
  if (simulated) {
    await page.getByRole("checkbox", { name: "Simulação" }).check();
  }
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(page.getByText(name)).toBeVisible();
}

// Scoped to the row and exact: the badge sits in EntryRow's metadata line, and a
// substring match would also find any name that happens to contain the word.
const badgeOf = (page: Page, name: string) =>
  page
    .locator("li")
    .filter({ hasText: name })
    .getByText("Simulado", { exact: true });

test("a forecast saved as a simulation reopens ticked and says so on its row", async ({
  page,
}) => {
  await addForecast(page, SIM_NAME, true);
  await expect(badgeOf(page, SIM_NAME)).toBeVisible();

  await page.getByRole("button", { name: `Editar ${SIM_NAME}` }).click();
  await expect(page.getByRole("checkbox", { name: "Simulação" })).toBeChecked();
});

test("a real forecast carries no badge, and the list shows both kinds", async ({
  page,
}) => {
  await addForecast(page, REAL_NAME, false);
  await expect(badgeOf(page, REAL_NAME)).toHaveCount(0);
  await expect(badgeOf(page, SIM_NAME)).toBeVisible();
});

// Nothing unmounts when the view changes — the board revalidates in place — so
// there is no appearing element to await; the arriving payload IS the figure
// moving. Same wait ceiling-cap.helper.ts uses for the cap.
test("the dashboard counts a simulation only when asked to", async ({
  page,
}) => {
  const card = await openCeiling(page, BOARD_OWNER);
  const budget = async () => (await readMonths(rowsOf(card)))[0].budget;

  const real = await budget();
  await page.getByLabel("Dados do dashboard").selectOption("all");
  await expect.poll(budget, SLOW).not.toBe(real);
  // A simulated expense eats headroom, so counting it can only lower the
  // ceiling. The direction is the assertion; never an absolute figure.
  expect(await budget()).toBeLessThan(real);

  await page.reload();
  await expect(page.getByLabel("Dados do dashboard")).toHaveValue("all");
});
