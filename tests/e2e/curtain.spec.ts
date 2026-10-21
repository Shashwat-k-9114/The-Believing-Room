import { expect, test } from "@playwright/test";

const covers = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const [l, r] = [".curtain-l", ".curtain-r"].map((s) => document.querySelector(s)!.getBoundingClientRect());
    return { left: Math.round(l.right), right: Math.round(r.left), w: window.innerWidth };
  });

test.describe("curtain intro", () => {
  test("curtains start closed over the logo, part to reveal the page, then get out of the way", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator("#curtain-intro");
    await expect(intro).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".curtain-logo img")).toHaveAttribute("src", "/brand/b-mark.svg");
    await expect(page.locator(".curtain-logo")).toContainText("The Believing Room");

    // Early: the two panels meet in the middle, covering the whole viewport.
    const early = await covers(page);
    expect(early.left).toBeGreaterThanOrEqual(early.w / 2 - 2);
    expect(early.right).toBeLessThanOrEqual(early.w / 2 + 2);

    // Late: they have slid fully off-screen and the overlay is hidden.
    await expect(intro).toHaveCSS("visibility", "hidden", { timeout: 6000 });
    const late = await covers(page);
    expect(late.left).toBeLessThanOrEqual(0);
    expect(late.right).toBeGreaterThanOrEqual(late.w);
    await expect(page.locator("#hero-title")).toBeVisible();
  });

  test("never intercepts clicks, even while it is playing", async ({ page }) => {
    await page.goto("/");
    const top = await page.evaluate(() => getComputedStyle(document.querySelector("#curtain-intro")!).pointerEvents);
    expect(top).toBe("none");
    await page.getByRole("link", { name: "Skip to content" }).focus();
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });

  test("plays once per session: a second page in the same session starts without it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#curtain-intro")).toBeVisible();
    await page.goto("/faq");
    await expect(page.locator("html")).toHaveAttribute("data-curtain", "seen");
    await expect(page.locator("#curtain-intro")).toBeHidden();
  });

  test("is not shown at all for visitors who prefer reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("#curtain-intro")).toBeHidden();
    await ctx.close();
  });

  test("adds no horizontal overflow and does not cover the page for no-script visitors", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("#curtain-intro")).toHaveCSS("visibility", "hidden", { timeout: 6000 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
    await ctx.close();
  });
});
