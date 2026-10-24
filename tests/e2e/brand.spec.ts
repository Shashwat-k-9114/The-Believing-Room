import { expect, test, type Page } from "@playwright/test";

async function skipIntro(page: Page) {
  await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
}

test.describe("brand assets and identity", () => {
  test("favicon, app icons, manifest and social images are served as the right types", async ({ request }) => {
    const want: [string, RegExp][] = [
      ["/icon.png", /image\/png/], ["/favicon.ico", /image\/(x-icon|vnd\.microsoft\.icon)/], ["/apple-icon.png", /image\/png/],
      ["/brand/icon-192.png", /image\/png/], ["/brand/icon-512.png", /image\/png/], ["/brand/icon-maskable-512.png", /image\/png/],
      ["/manifest.webmanifest", /json/], ["/opengraph-image", /image\/png/], ["/twitter-image", /image\/png/],
      ["/brand/show-emblem-1024.webp", /image\/webp/], ["/brand/show-wordmark-1408.webp", /image\/webp/],
    ];
    for (const [url, type] of want) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
      expect(res.headers()["content-type"], url).toMatch(type);
      expect((await res.body()).length, url).toBeGreaterThan(300);
    }
  });

  test("head links icons, declares social metadata and carries only factual structured data", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /icon|favicon/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
    expect(ld["@type"]).toBe("Organization");
    expect(JSON.stringify(ld)).not.toMatch(/startDate|aggregateRating|review|\d{4}-\d{2}-\d{2}/);
  });

  test("header shows the show logo in an accessible home link and keeps the menu working", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/the-show");
    const home = page.getByRole("link", { name: /The Believing Room, home/ });
    await expect(home.locator("img.logo-b")).toBeVisible();
    await home.hover();
    await page.mouse.wheel(0, 600);
    await expect(home).toBeVisible();
    await expect(page.getByRole("button", { name: /menu/i })).toHaveCount(0);
  });

  test("reduced motion removes the logo tilt", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await skipIntro(page);
    await page.goto("/");
    const home = page.getByRole("link", { name: /The Believing Room, home/ });
    await home.hover();
    const t = await home.locator("img.logo-b").evaluate((el) => getComputedStyle(el).transform);
    expect(t).toBe("none");
    await ctx.close();
  });

  test("the show page loads both artworks with real alt text and does not overflow on a phone", async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/the-show");
    const figs = page.locator("#show-identity").locator("xpath=ancestor::section").locator("img");
    await expect(figs).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const img = figs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      expect(((await img.getAttribute("alt")) ?? "").length).toBeGreaterThan(30);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  test("footer watermark is decorative, behind content and faint", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/about");
    const wm = page.locator("footer .footer-b");
    await expect(wm).toHaveAttribute("aria-hidden", "true");
    const s = await wm.evaluate((el) => { const c = getComputedStyle(el); return { o: parseFloat(c.opacity), z: c.zIndex, pe: c.pointerEvents }; });
    expect(s.o).toBeLessThan(0.1);
    expect(Number(s.z)).toBeLessThan(0);
    expect(s.pe).toBe("none");
    await expect(page.locator("footer")).toContainText("Where Opportunity Meets Belief.");
  });

  test("hero says what the show is, offers three ways in and says it is not a job board", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const hero = page.locator("#hero-title").locator("xpath=ancestor::section");
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(/Your Talent\.\s*Your Stage\.\s*Your Opportunity\./);
    await expect(hero).toContainText("Pitch live. Meet recruiters. Unlock opportunities.");
    await expect(hero).toContainText(/live pitch show/i);
    await expect(hero).toContainText(/not a job board/i);
    await expect(hero.getByRole("link", { name: "Apply as a Candidate" })).toHaveAttribute("href", "/register/candidate");
    await expect(hero.getByRole("link", { name: "Join the Audience" })).toHaveAttribute("href", "/register/audience");
    await expect(hero.getByRole("link", { name: "Partner as a Recruiter" })).toHaveAttribute("href", "/for-recruiters");
  });

  test("sponsor enquiry accepts the reduced field set (role is optional)", async ({ request }) => {
    const body = { organization: "Minimal Fields Ltd", contactName: "Asha Rao", email: "asha.e2e@example.com", category: "business", interest: "Not sure yet", consentContact: true, consentNoGuarantee: true };
    const res = await request.post("/api/submit/sponsor", { headers: { origin: "http://localhost:3217" }, data: body });
    expect(res.status()).toBe(201);
    expect((await res.json()).ref).toMatch(/^TBR-S-/);
  });

  test("robots allows crawling here and hides private routes", async ({ request }) => {
    const t = await (await request.get("/robots.txt")).text();
    expect(t).toMatch(/Allow: \//);
    expect(t).toMatch(/Disallow: \/api\//);
    expect(t).toMatch(/Sitemap:/);
  });
});
