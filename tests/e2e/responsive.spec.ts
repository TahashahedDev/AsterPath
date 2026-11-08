import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { publicRoutes } from "./routes";

/** Elements that extend past the right edge of the viewport, for a useful failure message. */
async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders: string[] = [];
    // An element only causes sideways scrolling if no ancestor clips or scrolls it.
    const clipped = (el: Element) => {
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        if (getComputedStyle(node).overflowX !== "visible") return true;
      }
      return false;
    };
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || (rect.right <= width + 1 && rect.left >= -1)) return;
      if (clipped(el) || el.closest(".sr-only")) return;
      const name = el.getAttribute("class")?.split(" ").slice(0, 3).join(".") ?? "";
      offenders.push(`${el.tagName.toLowerCase()}.${name} (${Math.round(rect.left)}→${Math.round(rect.right)})`);
    });
    return { scroll: document.documentElement.scrollWidth - width, offenders: offenders.slice(0, 5) };
  });
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    // Reduced motion shows reveal-on-scroll content immediately, so contrast checks see final colours.
    test.use({ colorScheme: theme, reducedMotion: "reduce" });

    for (const route of publicRoutes) {
      test(`${route} fits the screen and is accessible`, async ({ page }, testInfo) => {
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const overflow = await horizontalOverflow(page);
        expect(overflow.offenders, "elements wider than the screen").toEqual([]);
        expect(overflow.scroll, "page scrolls sideways").toBeLessThanOrEqual(0);

        // Accessibility (incl. colour contrast) on one phone and one desktop size per theme.
        if (["phone", "laptop"].includes(testInfo.project.name)) {
          const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
          const summary = results.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
          expect(summary, "axe violations").toEqual([]);
        }
      });
    }
  });
}
