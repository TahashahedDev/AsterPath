import { expect, test } from "@playwright/test";

/**
 * Body background lightness (CIE L*, 0 to 100). Chrome reports the oklch paper
 * tokens as lab()/oklch()/rgb() depending on version, so compare lightness, not strings.
 */
async function paperLightness(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data).map((v) => v / 255);
    const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const y = 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
    return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
  });
}
const expectDark = async (page: import("@playwright/test").Page) => expect(await paperLightness(page)).toBeLessThan(15);
const expectLight = async (page: import("@playwright/test").Page) => expect(await paperLightness(page)).toBeGreaterThan(90);

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
    await expectDark(page);
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
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", "#0c1513");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectDark(page);
    expect(await page.evaluate(() => localStorage.getItem("asterpath-theme"))).toBe("dark");
  });

  test("footer switcher offers light, system and dark, with keyboard support", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/process");
    const group = page.getByRole("contentinfo").getByRole("radiogroup", { name: "Colour theme" });
    await expect(group.getByRole("radio", { name: "System theme" })).toHaveAttribute("aria-checked", "true");

    await group.getByRole("radio", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectLight(page);

    await page.keyboard.press("ArrowRight"); // light → system (device is dark)
    await expect(group.getByRole("radio", { name: "System theme" })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("asterpath-theme"))).toBeNull();
  });

  test("dark mode works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    await expectDark(page);
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
