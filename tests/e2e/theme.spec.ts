import { expect, test } from "@playwright/test";

const DARK_PAPER = "rgb(11, 20, 32)";
const LIGHT_PAPER = "rgb(248, 245, 238)";
const bodyBackground = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("theme", () => {
  test("follows the device setting before the page first renders", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    // Record the theme at DOMContentLoaded — i.e. before React hydrates — to prove there is no light flash.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { themeAtDcl?: string }).themeAtDcl = document.documentElement.dataset.theme;
      });
    });
    await page.goto("/");
    expect(await page.evaluate(() => (window as unknown as { themeAtDcl?: string }).themeAtDcl)).toBe("dark");
    expect(await bodyBackground(page)).toBe(DARK_PAPER);
  });

  test("reacts live when the device switches theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/pricing");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("a chosen theme overrides the device and survives reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", "#0b1420");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bodyBackground(page)).toBe(DARK_PAPER);
    expect(await page.evaluate(() => localStorage.getItem("asterpath-theme"))).toBe("dark");
  });

  test("footer switcher offers light, system and dark, with keyboard support", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/process");
    const group = page.getByRole("contentinfo").getByRole("radiogroup", { name: "Colour theme" });
    await expect(group.getByRole("radio", { name: "System theme" })).toHaveAttribute("aria-checked", "true");

    await group.getByRole("radio", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bodyBackground(page)).toBe(LIGHT_PAPER);

    await page.keyboard.press("ArrowRight"); // light → system (device is dark)
    await expect(group.getByRole("radio", { name: "System theme" })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("asterpath-theme"))).toBeNull();
  });

  test("dark mode works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await bodyBackground(page)).toBe(DARK_PAPER);
    await context.close();
  });
});

test.describe("mobile navigation", () => {
  test("menu opens with the theme switcher and closes with Escape", async ({ page }, testInfo) => {
    test.skip(!["phone-small", "phone", "tablet"].includes(testInfo.project.name), "menu is only collapsed below 1024px");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("radiogroup", { name: "Colour theme" })).toBeVisible();
    await menu.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("enquiry form is usable at this size", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Full name is required")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
  });
});
