import { expect, test } from "@playwright/test";

const TOGGLE = "Alternar menu";
const NAV = "Navegação principal";
const MOBILE = { width: 375, height: 812 };

test.describe("mobile nav drawer", () => {
  test("no destination is reachable until the hamburger opens it", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: NAV })).toBeHidden();

    await page.getByRole("button", { name: TOGGLE }).click();
    const nav = page.getByRole("navigation", { name: NAV });
    await expect(nav).toBeVisible();
    for (const label of [
      "Dashboard",
      "Movimentações",
      "Previsões",
      "Leitor OFX",
      "OFX Decoder",
      "Configurações",
    ]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("Esc closes it", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    const nav = page.getByRole("navigation", { name: NAV });
    await expect(nav).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
  });

  test("a click outside the drawer closes it", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    const nav = page.getByRole("navigation", { name: NAV });
    await expect(nav).toBeVisible();

    // The drawer is a fixed, 264px-wide left panel — anywhere right of it is
    // the ::backdrop, which targets the <dialog> itself on click (Aside/hook.ts).
    await page.mouse.click(340, 400);
    await expect(nav).toBeHidden();
  });

  test("picking a destination navigates and leaves the drawer closed", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    await page.getByRole("link", { name: "Previsões" }).click();

    await expect(page).toHaveURL("/previsoes");
    await expect(page.getByRole("navigation", { name: NAV })).toBeHidden();
  });

  test("at desktop width the hamburger only collapses the rail, never a drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: NAV });
    await expect(nav).toBeVisible();

    await page.getByRole("button", { name: TOGGLE }).click();
    // Still there, just collapsed to the icon strip — not closed like a drawer.
    await expect(nav).toBeVisible();
    await expect(page.getByText("MENU", { exact: true })).toBeHidden();
  });
});
