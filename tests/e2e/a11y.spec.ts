import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/industries/finance", "/register/student", "/register/audience", "/for-companies", "/faq", "/contact", "/podcast", "/privacy", "/events"];

for (const scheme of ["dark", "light"] as const) {
  test.describe(`axe WCAG 2.x A/AA (${scheme} scheme)`, () => {
    test.use({ colorScheme: scheme });
    for (const path of PAGES) {
      test(path, async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
        await page.goto(path);
        await page.waitForTimeout(600);
        // Reveal everything so below-the-fold sections are really scanned.
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")));
        await page.waitForTimeout(1100);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const summary = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s): ${v.nodes.slice(0, 4).map((n) => n.target.join(" ") + " :: " + (n.any[0]?.message ?? "")).join(" | ")}`);
        expect(summary, summary.join("\n")).toEqual([]);
      });
    }
  });
}
