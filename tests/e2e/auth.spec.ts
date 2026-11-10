import { expect, test } from "@playwright/test";

// The test server runs a production build with no Supabase project configured.
test.describe("accounts before Supabase is connected", () => {
  test("sign-in and sign-up say accounts are not open, and every control is disabled", async ({ page }) => {
    for (const path of ["/sign-in", "/sign-up"]) {
      await page.goto(path);
      await expect(page.getByText(/Student accounts aren.t open yet/)).toBeVisible();
      await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
      await expect(page.getByRole("textbox", { name: "Email" })).toBeDisabled();
    }
  });

  test("the portal and admin workspace are not served", async ({ page }) => {
    for (const path of ["/portal", "/admin", "/admin/team", "/admin/audit"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test("auth routes fall back safely", async ({ page }) => {
    await page.goto("/auth/google");
    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto("/auth/callback?code=forged&next=https://evil.example");
    await expect(page).toHaveURL(/\/sign-in\?error=link$/);
  });
});
