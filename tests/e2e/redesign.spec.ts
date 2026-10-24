import { expect, test, type Page } from "@playwright/test";

/** The visual-first redesign: stage hero, lit step flow, three audience cards, typography, motion safety, no em dashes. */
const ROUTES = [
  "/", "/about", "/how-it-works", "/industries", "/industries/it-technology", "/events", "/register/candidate", "/register/audience",
  "/for-recruiters", "/for-colleges", "/partners", "/sponsors", "/the-show", "/episodes", "/podcast", "/stories", "/faq", "/contact",
  "/privacy", "/terms", "/refund-policy", "/media-consent", "/links",
];

async function skipIntro(page: Page) {
  await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
}

test.describe("visual-first redesign", () => {
  test("the three audience cards carry their headline, price or entry route and one clear action", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const ways = page.locator("[aria-labelledby=act-ways]");
    await ways.scrollIntoViewIfNeeded();
    const cards = ways.locator("article");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText("Get Seen. Get Discovered.");
    await expect(cards.nth(1)).toContainText("Watch. Learn. Grow.");
    await expect(cards.nth(2)).toContainText("Discover. Evaluate. Hire.");
    await expect(cards.nth(0).getByRole("link")).toHaveAttribute("href", "/register/candidate");
    await expect(cards.nth(1).getByRole("link")).toHaveAttribute("href", "/register/audience");
    await expect(cards.nth(2).getByRole("link")).toHaveAttribute("href", "/for-recruiters");
    // The aspirational headline is always next to the honest limit.
    await expect(ways).toContainText(/no offer is guaranteed/i);
    await expect(cards.nth(0)).toContainText("₹1,000");
    await expect(cards.nth(1)).toContainText("₹300");
  });

  test("the step flow lights the stage step by step as it scrolls into view", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await page.addStyleTag({ content: ".cv-auto{content-visibility:visible !important}" });
    const flow = page.locator(".flow");
    await expect(flow).toHaveAttribute("data-armed", "");
    await expect(flow.locator(".flow-step[data-lit=true]")).toHaveCount(0);
    await flow.scrollIntoViewIfNeeded();
    await expect(flow.locator(".flow-step[data-lit=true]")).toHaveCount(4, { timeout: 8000 });
    for (const t of ["Apply", "Take the Stage", "Pitch Live", "Get Discovered"]) await expect(flow).toContainText(t);
  });

  test("with reduced motion every step is simply lit and nothing is dimmed", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    await ctx.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
    const page = await ctx.newPage();
    await page.goto("/");
    const flow = page.locator(".flow");
    await expect(flow).not.toHaveAttribute("data-armed", "");
    await flow.scrollIntoViewIfNeeded();
    for (const o of await flow.locator(".flow-copy").all()) expect(await o.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    expect(await page.locator(".beam").first().evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
    await ctx.close();
  });

  test("without JavaScript the headline, steps, cards and calls to action are all present", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Your Opportunity.");
    const flow = page.locator(".flow");
    await expect(flow).not.toHaveAttribute("data-armed", "");
    await expect(flow).toContainText("Get Discovered");
    for (const s of await flow.locator(".flow-step").all()) await expect(s.locator(".flow-copy")).toBeVisible();
    await expect(page.locator("[aria-labelledby=act-ways] article")).toHaveCount(3);
    for (const r of await page.locator(".reveal").all()) expect(await r.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    await ctx.close();
  });

  test("headings use Space Grotesk and body text DM Sans", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const h = await page.locator("h1").evaluate((e) => getComputedStyle(e).fontFamily);
    const b = await page.locator("main p").first().evaluate((e) => getComputedStyle(e).fontFamily);
    expect(h).toMatch(/space grotesk/i);
    expect(b).toMatch(/dm sans/i);
    expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).fontStyle)).toBe("normal");
  });

  for (const [name, viewport] of [["phone", { width: 390, height: 844 }], ["tablet", { width: 820, height: 1180 }]] as const) {
    test(`home and how-it-works have no horizontal overflow on a ${name}`, async ({ page }) => {
      await skipIntro(page);
      await page.setViewportSize(viewport);
      for (const r of ["/", "/how-it-works", "/register/audience"]) {
        await page.goto(r);
        await page.waitForTimeout(600);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${r} on ${name}`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("no em dash appears in the visible copy of any public page", async ({ page }) => {
    await skipIntro(page);
    for (const r of ROUTES) {
      await page.goto(r);
      await page.addStyleTag({ content: ".cv-auto{content-visibility:visible !important}" });
      const text = await page.evaluate(() => document.body.innerText + " " + document.title + " " + (document.querySelector('meta[name="description"]')?.getAttribute("content") ?? ""));
      expect(text.includes("—"), `${r} contains an em dash`).toBe(false);
    }
  });


  test("the hero shows a candidate pitching to recruiters, with each part named", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const hero = page.locator("#hero-title").locator("xpath=ancestor::section");
    await expect(hero.getByRole("img", { name: /candidate pitching.*recruiters/i })).toBeVisible();
    for (const t of ["Candidate pitches", "Recruiters evaluate", "Filmed for YouTube", "Audience watches"]) await expect(hero.locator(".pitch-tag", { hasText: t })).toBeVisible();
  });

  const ART_PAGES = ["/about", "/how-it-works", "/the-show", "/podcast", "/stories", "/episodes", "/events", "/industries", "/partners", "/for-recruiters", "/for-colleges", "/register/candidate", "/register/audience", "/sponsors"];
  test("every marketing and journey page opens with an illustration", async ({ page }) => {
    await skipIntro(page);
    for (const r of ART_PAGES) {
      await page.goto(r);
      await expect(page.locator("main > section").first().locator('svg[role="img"]'), r).toHaveCount(1);
    }
  });

  const FLOW_PAGES = ["/how-it-works", "/for-recruiters", "/for-colleges", "/register/audience"];
  test("journey pages explain themselves with a four step flow, and it is lit without animation", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    await ctx.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
    const page = await ctx.newPage();
    for (const r of FLOW_PAGES) {
      await page.goto(r);
      await expect(page.locator(".flow .flow-step"), r).toHaveCount(4);
      for (const o of await page.locator(".flow-copy").all()) expect(await o.evaluate((e) => getComputedStyle(e).opacity), r).toBe("1");
    }
    await ctx.close();
  });

  test("no broken images and no failed same-origin requests on any public page", async ({ page }) => {
    await skipIntro(page);
    const failed: string[] = [];
    page.on("response", (res) => {
      if (res.url().startsWith("http://localhost") && res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
    });
    for (const r of ROUTES) {
      await page.goto(r);
      await page.addStyleTag({ content: ".cv-auto{content-visibility:visible !important}" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      });
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
      expect(broken, `${r} broken images`).toEqual([]);
    }
    expect(failed).toEqual([]);
  });

  test("how-it-works shows the same four steps above the detailed stages", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/how-it-works");
    await expect(page.locator(".flow .flow-step")).toHaveCount(4);
    await expect(page.locator("summary").getByText("Decision", { exact: true })).toBeVisible();
  });
});
