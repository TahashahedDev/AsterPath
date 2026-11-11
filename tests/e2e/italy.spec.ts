import { expect, test } from "@playwright/test";

test.describe("Italy site interactions", () => {
  test("region explorer shows each region's scholarship body", async ({ page }) => {
    await page.goto("/scholarships");
    await page.getByLabel("Choose a region").selectOption({ label: "Lazio" });
    await expect(page.getByRole("link", { name: /DiSCo Lazio/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sapienza University of Rome", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Show all of Italy" }).click();
    await expect(page.getByText(/Select a region on the map/)).toBeVisible();
  });

  test("clicking a region on the map selects it", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "phone-small", "map regions are tiny at 320px; the select is the primary control there");
    await page.goto("/scholarships");
    await page.locator("path", { has: page.locator("title", { hasText: "Toscana" }) }).click();
    await expect(page.getByRole("link", { name: /DSU Toscana/ })).toBeVisible();
  });

  test("a region lists its universities, each linking to its page and official website", async ({ page }) => {
    await page.goto("/regions/lazio");
    await page.getByRole("link", { name: "University of Cassino and Southern Lazio", exact: true }).click();
    await expect(page).toHaveURL(/\/universities\/university-of-cassino$/);
    await expect(page.getByRole("link", { name: /Visit the official website/ })).toHaveAttribute("href", "https://www.unicas.it");
  });

  test("legacy URLs redirect, and /destinations/italy goes to the Italy guide", async ({ page }) => {
    await page.goto("/destinations/italy");
    await expect(page).toHaveURL(/\/study-in-italy$/);
    await page.goto("/services/visa-preparation");
    await expect(page).toHaveURL(/\/documents$/);
    await page.goto("/how-it-works");
    await expect(page).toHaveURL(/\/process$/);
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/legal\/privacy$/);
  });

  test("hero map is present and described for screen readers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /Routes from India's four Italian missions/ })).toBeVisible();
  });

  test("a half-finished enquiry is offered back on the same device, without contact details", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Synthetic Tester");
    await page.getByLabel("Email").fill("synthetic@example.com");
    await page.getByLabel("WhatsApp number").fill("+91 90000 00000");
    await page.getByLabel("Where do you live?").selectOption("Karnataka");
    await page.getByRole("button", { name: "Continue" }).click();
    // The radio itself is visually hidden; people tap its label.
    await page.locator("label").filter({ has: page.getByRole("radio", { name: "Master's" }) }).click();
    await page.getByLabel("Field of study").fill("Data Science");

    await page.reload();
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await page.getByRole("button", { name: "Use saved answers" }).click();
    await expect(page.getByText(/Welcome back/)).toBeHidden();
    // Contact details were never stored; plans come back once step one is filled again.
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByLabel("Where do you live?")).toHaveValue("Karnataka");
    await page.getByLabel("Full name").fill("Synthetic Tester");
    await page.getByLabel("Email").fill("synthetic@example.com");
    await page.getByLabel("WhatsApp number").fill("+91 90000 00000");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("radio", { name: "Master's" })).toBeChecked();
    await expect(page.getByLabel("Field of study")).toHaveValue("Data Science");

    const stored = await page.evaluate(() => localStorage.getItem("asterpath:enquiry-draft:v1") ?? "");
    expect(stored).not.toContain("synthetic@example.com");
    expect(stored).not.toContain("90000");
    expect(stored).not.toContain("Synthetic Tester");
  });

  test("Start over discards the saved answers", async ({ page }) => {
    await page.goto("/contact");
    await page.evaluate(() => localStorage.setItem("asterpath:enquiry-draft:v1", JSON.stringify({ savedAt: Date.now(), values: { level: "masters" } })));
    await page.reload();
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.getByText(/Welcome back/)).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem("asterpath:enquiry-draft:v1"))).toBeNull();
  });

  test("enquiry asks where the student lives, for mission jurisdiction", async ({ page }) => {
    await page.goto("/contact?level=masters");
    await page.getByLabel("Full name").fill("Synthetic Tester");
    await page.getByLabel("Email").fill("synthetic@example.com");
    await page.getByLabel("WhatsApp number").fill("+91 90000 00000");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Choose where you live")).toBeVisible();
    await page.getByLabel("Where do you live?").selectOption("Karnataka");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Your plans" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Master's" })).toBeChecked();
  });
});
