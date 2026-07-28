import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { seed } from "./seed.helper";

// extrato-import.ofx covers Jun/26, Jul/26 and Ago/26, and Jul/26 has no
// transaction — so a correct import writes three movements, not six: the
// zero-filled month must contribute nothing.
const FIXTURE = join(__dirname, "extrato-import.ofx");
const IDENTIFIER = "E2E-1";
const EXPECTED = [
  `Entrada ${IDENTIFIER} Jun/26`,
  `Saída ${IDENTIFIER} Jun/26`,
  `Saída ${IDENTIFIER} Ago/26`,
];
const NOT_EXPECTED = `Entrada ${IDENTIFIER} Jul/26`;

// The import is keyed on the file's SHA-256, which is unique across the whole
// database — so this fixture belongs to this spec and no other, and the run
// has to start cold. `npm run test` guarantees that (`rm -f e2e.db` in
// playwright.config.ts's webServer.command); a hand-started server or
// --repeat-each would find the file already imported and fail at the first
// expect below, which is the honest failure rather than a weakened assertion.
test.beforeAll(seed);

// Generous: the first navigation also pays for Turbopack's cold compile of the
// route and its API bundles.
const SLOW = { timeout: 15_000 };

test("imports every monthly total of an OFX statement once", async ({
  page,
}) => {
  await page.goto("/leitor-ofx");
  // The <input type="file"> is `hidden` so the Button beside it is the only
  // accessible control; setInputFiles drives it anyway, and there is no other
  // way to hand Playwright a file.
  await page.locator('input[type="file"]').setInputFiles(FIXTURE);
  await expect(page.getByText("extrato-import.ofx")).toBeVisible(SLOW);

  // .first(): the dialog's confirm button carries the same name, and
  // ImportAction renders this trigger before the Modal.
  const trigger = page
    .getByRole("button", { name: "Importar", exact: true })
    .first();
  await expect(trigger).toBeEnabled();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  // Pre-filled from the account number in the file; fill() replaces it.
  await expect(dialog.getByLabel("Identificador do documento")).toHaveValue(
    "12345-6",
  );
  await dialog.getByLabel("Identificador do documento").fill(IDENTIFIER);
  await expect(
    dialog.getByText("3 movimentações serão criadas."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Importar", exact: true }).click();

  // Success closes the dialog and the same file now reads as imported.
  await expect(dialog).toBeHidden(SLOW);
  await expect(trigger).toBeDisabled();

  await page.goto("/movimentacoes");
  for (const name of EXPECTED) {
    await expect(page.getByText(name, { exact: true })).toBeVisible(SLOW);
  }
  // Jul/26 is zero-filled: the endpoint rejects a valueCents of 0, so a row
  // for it would have refused the whole batch rather than appear here.
  await expect(page.getByText(NOT_EXPECTED, { exact: true })).toHaveCount(0);
});

test("refuses to import the same file twice", async ({ page }) => {
  await page.goto("/leitor-ofx");
  await page.locator('input[type="file"]').setInputFiles(FIXTURE);
  await expect(page.getByText("extrato-import.ofx")).toBeVisible(SLOW);

  const trigger = page
    .getByRole("button", { name: "Importar", exact: true })
    .first();
  // Disabled from the server's record, not from anything this browser did —
  // this is a fresh page with an empty sessionStorage.
  await expect(trigger).toBeDisabled(SLOW);
  // The reason has to be reachable: the disabled button fires no events, so
  // the hint hangs off its own focusable trigger beside it.
  await expect(
    page.getByRole("button", { name: "Por que não posso importar" }),
  ).toBeVisible();
});
