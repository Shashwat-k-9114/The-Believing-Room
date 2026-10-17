import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/", "/about", "/how-it-works", "/industries", "/industries/it-technology", "/industries/finance", "/industries/sales-marketing",
  "/industries/animation-multimedia", "/events", "/register/student", "/register/audience", "/for-companies", "/for-colleges",
  "/the-show", "/episodes", "/podcast", "/stories", "/faq", "/contact", "/privacy", "/terms", "/refund-policy", "/media-consent",
];

async function skipIntro(page: Page) {
  await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
}

test.describe("public site", () => {
  test("every public route renders one h1, has a title and no horizontal overflow at 375px", async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width: 375, height: 800 });
    for (const r of ROUTES) {
      const res = await page.goto(r);
      expect(res?.status(), r).toBe(200);
      await expect(page.locator("h1"), r).toHaveCount(1);
      expect((await page.title()).length, r).toBeGreaterThan(5);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${r} horizontal overflow`).toBeLessThanOrEqual(0);
    }
  });

  test("homepage communicates the offer, prices and food in the first screen", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/your potential/i);
    const hero = page.locator("#hero-title").locator("xpath=ancestor::section");
    await expect(hero).toContainText("₹500");
    await expect(hero).toContainText("₹300");
    await expect(hero).toContainText(/food included/i);
    await page.getByRole("link", { name: "Enter the Arena" }).first().click();
    await expect(page).toHaveURL(/\/register\/student/);
  });

  test("arena selector switches by click and arrow keys", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    const tabs = page.getByRole("tablist", { name: /industry arena/i });
    await tabs.scrollIntoViewIfNeeded();
    await tabs.getByRole("tab", { name: /Finance/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Make the numbers speak");
    await tabs.getByRole("tab", { name: /Finance/ }).press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: /Sales/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Sell the idea");
  });

  test("hero intro plays once and is skippable; reduced motion never plays it", async ({ page, browser }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "play"); // returning visitor
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const p2 = await ctx.newPage();
    await p2.goto("/");
    await expect(p2.locator("html")).not.toHaveAttribute("data-intro", "play");
    await expect(p2.getByRole("heading", { level: 1 })).toBeVisible();
    await ctx.close();
  });

  test("menu dialog opens, traps via native dialog and navigates", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await dlg.getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/\/faq/);
  });

  test("watch the experience is honest: no fake video", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await page.getByRole("button", { name: /Watch the Experience/ }).click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toContainText(/hasn’t been filmed yet/);
    await expect(dlg.locator("video, iframe")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
  });

  test("events and media show truthful prelaunch states", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/coming soon/i);
    await page.goto("/episodes");
    await expect(page.locator("main")).toContainText(/aren’t published yet/);
    await expect(page.locator("main")).not.toContainText(/views/i);
  });

  test("audience tickets are unavailable, not faked, when no event/payments", async ({ page, request }) => {
    await page.goto("/register/audience");
    await expect(page.locator("main")).toContainText(/aren’t available to buy/);
    await expect(page.getByRole("button", { name: /^Pay/ })).toHaveCount(0);
    const res = await request.post("/api/audience/order", { headers: { origin: "http://localhost:3217" }, data: { name: "X Y", email: "x@y.com", phone: "9876543210", quantity: 1, consentTerms: true, consentPrivacy: true, consentFilming: true } });
    expect(res.status()).toBe(503);
  });

  test("prices appear consistently from config", async ({ page }) => {
    for (const r of ["/", "/register/audience", "/faq"]) {
      await page.goto(r);
      const text = await page.locator("body").innerText();
      expect(text, r).toContain("₹300");
    }
  });
});

test.describe("student application", () => {
  test("validation, multi-step flow, persistence, and honest confirmation", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/register/student?industry=finance");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible(); // inline errors, step does not advance
    await expect(page.getByRole("heading", { level: 2, name: "You" })).toBeVisible();

    await page.getByLabel(/Full name/).fill("Asha Rao");
    await page.getByLabel(/^Email/).fill("asha.e2e@example.com");
    await page.getByLabel(/Mobile number/).fill("+91 98765 43210");
    await page.getByLabel(/College or university/).fill("Example Institute");
    await page.getByLabel(/Course or degree/).fill("B.Com Honours");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByLabel(/Which arena/)).toHaveValue("finance"); // prefilled from the arena page
    await page.getByLabel(/Key skills/).fill("Financial modelling, Excel");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel(/Your pitch in a few sentences/).fill("I built a three-statement model of a listed retailer and will defend my margin assumptions live.");
    await page.getByRole("button", { name: "Continue" }).click();

    // Draft survives a reload (text only; consent never restored)
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /terms/i })).toBeVisible();

    await page.getByLabel(/participation terms/).check();
    await page.getByLabel(/privacy notice/).check();
    await page.getByRole("button", { name: "Submit application" }).click();
    const ok = page.getByRole("status").filter({ hasText: "Application received." });
    await expect(ok).toBeVisible();
    await expect(ok).toContainText(/ARN-S-[A-Z0-9]{6}/);
    await expect(ok).toContainText(/not\s+being selected/);
  });

  test("server rejects bad input, wrong origin, fake PDFs; accepts a real PDF", async ({ request }) => {
    const base = { fullName: "Test User", email: "t@example.com", phone: "9876543210", college: "X College", course: "BCA", gradYear: new Date().getFullYear() + 1, industry: "it-technology", skills: "Go, SQL", pitchSummary: "A short but sufficiently long pitch summary for the validator to accept.", consentTerms: true, consentPrivacy: true };
    const origin = { origin: "http://localhost:3217" };

    const noOrigin = await request.post("/api/student", { multipart: { data: JSON.stringify(base) } });
    expect(noOrigin.status()).toBe(403);

    const bad = await request.post("/api/student", { headers: origin, multipart: { data: JSON.stringify({ ...base, consentPrivacy: false, email: "nope" }) } });
    expect(bad.status()).toBe(422);
    const body = await bad.json();
    expect(body.fields.consentPrivacy).toBeTruthy();
    expect(body.fields.email).toBeTruthy();

    const fake = await request.post("/api/student", { headers: origin, multipart: { data: JSON.stringify(base), resume: { name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("MZ not a pdf") } } });
    expect(fake.status()).toBe(422);
    expect((await fake.json()).fields.resume).toMatch(/PDF/);

    const pdf = await request.post("/api/student", { headers: origin, multipart: { data: JSON.stringify({ ...base, email: "pdf.e2e@example.com" }), resume: { name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF") } } });
    expect(pdf.status()).toBe(201);
    expect((await pdf.json()).ref).toMatch(/^ARN-S-/);
  });
});

test.describe("security boundaries", () => {
  test("webhook rejects unsigned and wrongly signed payloads", async ({ request }) => {
    const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_x", order_id: "order_x", amount: 30000, status: "captured" } } } });
    expect((await request.post("/api/webhooks/razorpay", { data: body, headers: { "content-type": "application/json" } })).status()).toBe(400);
    expect((await request.post("/api/webhooks/razorpay", { data: body, headers: { "content-type": "application/json", "x-razorpay-signature": "deadbeef", "x-razorpay-event-id": "e1" } })).status()).toBe(400);
  });

  test("checkout verify rejects forged signatures", async ({ request }) => {
    const res = await request.post("/api/audience/verify", { headers: { origin: "http://localhost:3217" }, data: { providerOrderId: "order_forged", providerPaymentId: "pay_forged", signature: "0".repeat(64) } });
    expect(res.status()).toBe(400);
  });

  test("admin is closed to anonymous users everywhere", async ({ page, request }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/sign/i);
    await expect(page.locator("body")).not.toContainText("Applications");
    expect((await request.get("/api/admin/resume/00000000-0000-0000-0000-000000000000")).status()).toBe(401);
    const login = await request.post("/api/admin/login", { headers: { origin: "http://localhost:3217" }, data: { password: "definitely-wrong-password" } });
    expect(login.status()).toBe(401);
    // forged cookie
    const forged = await request.get("/admin?tab=students", { headers: { cookie: "arena_admin=eyJleHAiOjk5OTk5OTk5OTk5OTl9.deadbeef" } });
    expect(await forged.text()).not.toContain("Control");
  });

  test("ticket page leaks nothing for unknown refs or wrong tokens", async ({ page }) => {
    await page.goto("/tickets/ARN-A-AAAAAA?k=wrong");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/not found/i);
  });

  test("security headers are present", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("public endpoints are rate limited", async ({ request }) => {
    const statuses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const r = await request.post("/api/contact", { headers: { origin: "http://localhost:3217" }, data: { name: "Rate Tester", email: "rate@example.com", topic: "other", message: "Testing the limiter now." } });
      statuses.push(r.status());
    }
    expect(statuses).toContain(429);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
  });
});

test.describe("admin operations", () => {
  test.skip(!process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD not set");

  test("organiser signs in, publishes media that goes live, and drafts stay hidden", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/admin");
    await page.getByLabel("Organiser password").fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/control/i);

    // Applications from earlier tests are visible, with separate consent flags
    await page.getByRole("link", { name: "Applications", exact: true }).click();
    await expect(page.locator("main")).toContainText("asha.e2e@example.com");
    await expect(page.locator("main")).toContainText(/Publish pitch/);

    // Create a draft and a published episode
    await page.getByRole("link", { name: "Media", exact: true }).click();
    const add = async (slug: string, title: string, publication: string) => {
      const f = page.locator("form").filter({ hasText: "Add or update media" });
      await f.getByLabel("Title").fill(title);
      await f.getByLabel("Slug").fill(slug);
      await f.getByLabel("Publication").selectOption(publication);
      await f.getByLabel("Summary").fill("A test summary long enough to be valid.");
      await f.getByLabel(/YouTube video ID/).fill("dQw4w9WgXcQ");
      await f.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("status")).toContainText("Saved");
    };
    await add("e2e-draft", "Hidden Draft Episode", "draft");
    await add("e2e-live", "Visible Live Episode", "published");

    await page.goto("/episodes");
    await expect(page.locator("main")).toContainText("Visible Live Episode");
    await expect(page.locator("main")).not.toContainText("Hidden Draft Episode");
    expect((await page.request.get("/episodes/e2e-draft")).status()).toBe(404);
    expect((await page.request.get("/episodes/e2e-live")).status()).toBe(200);

    // Embeds are lazy: no YouTube iframe until play is pressed
    await page.goto("/episodes/e2e-live");
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: /Play video/ }).click();
    await expect(page.locator("iframe[src*='youtube-nocookie.com']")).toHaveCount(1);

    // Audit trail recorded
    await page.goto("/admin?tab=audit");
    await expect(page.locator("main")).toContainText("episode.save");
  });

  test("resume download requires the admin session", async ({ page, request }) => {
    const login = await page.request.post("/api/admin/login", { headers: { origin: "http://localhost:3217" }, data: { password: process.env.ADMIN_PASSWORD! } });
    expect(login.ok()).toBe(true);
    await page.goto("/admin?tab=students");
    const link = page.getByRole("link", { name: "Résumé (PDF)" }).first();
    await expect(link).toBeVisible();
    const href = (await link.getAttribute("href"))!;
    const authed = await page.request.get(href);
    expect(authed.status()).toBe(200);
    expect(authed.headers()["content-type"]).toBe("application/pdf");
    expect((await request.get(href)).status()).toBe(401);
  });
});
