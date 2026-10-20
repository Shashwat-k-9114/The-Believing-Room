import { expect, test, type Page } from "@playwright/test";

/**
 * Browser-sensitive behaviour, run on Chromium, Firefox and WebKit: the native <dialog> menu, focus handling,
 * form submission, reduced motion, and layout at phone width. (The full suite stays Chromium-only.)
 */
const ROUTES = ["/", "/partners", "/sponsors", "/events", "/register/candidate", "/industries/finance-accounting", "/the-show", "/podcast", "/faq", "/contact"];

async function skipIntro(page: Page) {
  await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
}

test.describe("cross-browser", () => {
  test("routes render one h1 with no horizontal overflow at 375px", async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width: 375, height: 800 });
    for (const r of ROUTES) {
      const res = await page.goto(r);
      expect(res?.status(), r).toBe(200);
      await expect(page.locator("h1"), r).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${r} horizontal overflow`).toBeLessThanOrEqual(0);
    }
  });

  test("hero headline is never clipped from 320px to 1920px", async ({ page }) => {
    await skipIntro(page);
    for (const w of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await page.waitForTimeout(2200); // line-by-line reveal
      const clipped = await page.evaluate(() => [...document.querySelectorAll("#hero-title .hero-line > span")].filter((e) => e.scrollWidth > (e.parentElement as HTMLElement).clientWidth + 1).map((e) => e.textContent));
      expect(clipped, `${w}px`).toEqual([]);
    }
  });

  test("menu: opens, Escape closes, focus returns, Tab never reaches the page behind", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Open menu" });
    await opener.click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    for (let i = 0; i < 28; i++) {
      await page.keyboard.press("Tab");
      const behind = await page.evaluate(() => {
        const a = document.activeElement;
        return !!a && a !== document.body && a !== document.documentElement && !a.closest("dialog");
      });
      expect(behind, `Tab ${i} reached the page behind the dialog`).toBe(false);
    }
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("sponsor enquiry persists and the confirmation does not claim email was sent", async ({ page, browserName }) => {
    await page.goto("/sponsors");
    const form = page.getByRole("form", { name: "Partnership enquiry" });
    await form.getByLabel("Organisation").fill(`Cross ${browserName} Ltd`);
    await form.getByLabel("Contact person").fill("Dev Rao");
    await form.getByLabel("Your role").fill("Brand lead");
    await form.getByLabel("Business email").fill(`dev.${browserName}@example.com`);
    await form.getByLabel("You are").selectOption("business");
    await form.getByLabel("Partnership interest").selectOption({ index: 2 });
    await form.getByLabel(/agree to be contacted/).check();
    await form.getByLabel(/formats are proposals/).check();
    await form.getByRole("button", { name: "Send partnership enquiry" }).click();
    const ok = page.getByRole("status").filter({ hasText: "Enquiry received." });
    await expect(ok).toBeVisible();
    await expect(ok).toContainText(/TBR-S-[A-Z0-9]{6}/);
    // E-mail is not configured in the test environment, so the page must say so rather than imply delivery.
    await expect(ok).toContainText(/not been able to send an automatic receipt/i);
    await expect(ok).not.toContainText(/receipt has been emailed/i);
  });

  test("candidate application advances past step 1 only when valid", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/register/candidate");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.getByLabel(/Full name/).fill("Isha Nair");
    await page.getByLabel(/^Email/).fill(`isha.${test.info().project.name}@example.com`);
    await page.getByLabel(/Mobile number/).fill("9876543210");
    await page.getByLabel(/College or university/).fill("Example Institute");
    await page.getByLabel(/Course or degree/).fill("BBA");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByLabel(/Which discipline/)).toBeVisible();
  });

  test("reduced motion: nothing stays hidden and nothing animates forever", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await skipIntro(page);
    for (const r of ["/", "/partners", "/sponsors"]) {
      await page.goto(r);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const hidden = await page.evaluate(() => [...document.querySelectorAll(".reveal")].filter((e) => getComputedStyle(e).opacity < "0.5").length);
      expect(hidden, `${r} reveals hidden`).toBe(0);
      const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getTiming().iterations === Infinity).length);
      expect(running, `${r} infinite animations`).toBe(0);
    }
    await ctx.close();
  });

  test("sponsor CTAs scroll to their target on phone and desktop", async ({ page }) => {
    await skipIntro(page);
    for (const [w, h] of [[390, 844], [1440, 900]]) {
      await page.setViewportSize({ width: w, height: h });
      for (const [link, target] of [["Start a conversation", "#enquiry"], ["Request the prospectus", "#prospectus"]] as const) {
        await page.goto("/sponsors");
        await page.getByRole("link", { name: link }).first().click();
        await expect.poll(async () => page.evaluate((sel) => Math.round(document.querySelector(sel)!.getBoundingClientRect().top), target), { message: `${link} at ${w}px`, timeout: 6000 }).toBeLessThan(220);
        const top = await page.evaluate((sel) => document.querySelector(sel)!.getBoundingClientRect().top, target);
        expect(top, `${link} at ${w}px overshoots`).toBeGreaterThanOrEqual(-10);
      }
    }
  });

  test("prospectus is not available until reviewed and approved", async ({ page, request }) => {
    expect((await request.get("/sponsors/prospectus")).status()).toBe(404);
    await page.goto("/sponsors");
    await expect(page.getByRole("link", { name: /Download the prospectus/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Request the prospectus" }).first()).toBeVisible();
  });
});
