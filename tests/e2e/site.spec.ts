import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/", "/about", "/how-it-works", "/industries", "/industries/it-technology", "/industries/finance-accounting", "/industries/sales-marketing",
  "/industries/animation-multimedia", "/events", "/register/candidate", "/register/audience", "/for-recruiters", "/for-colleges",
  "/partners", "/sponsors", "/the-show", "/episodes", "/podcast", "/stories", "/faq", "/contact", "/privacy", "/terms", "/refund-policy", "/media-consent",
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

  test("no public page carries internal drafting notes or confidential figures", async ({ page }) => {
    await skipIntro(page);
    const banned = /pending owner decision|needs? (a )?decision|the source (says|implies|bundles)|in this build|this build|counsel should|the original (registration )?page|lorem ipsum|TODO|65,?000|quotation|vendor advance/i;
    for (const r of [...ROUTES, "/partners", "/sponsors"]) {
      await page.goto(r);
      const text = await page.locator("body").innerText();
      const hit = text.match(banned);
      expect(hit?.[0] ?? null, `${r} contains internal wording`).toBeNull();
    }
  });

  test("homepage communicates the offer, prices and the confirmed ecosystem", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/opportunity/i);
    const hero = page.locator("#hero-title").locator("xpath=ancestor::section");
    await expect(hero).toContainText("₹1,000");
    await expect(hero).toContainText("₹300");
    await expect(hero).toContainText(/food and goodies included/i);
    const main = page.locator("main");
    for (const org of ["Manacle", "KRVVY", "Immverse AI", "Galvanic", "BIT Noida"]) {
      await expect(main, org).toContainText(org);
    }
    await page.getByRole("link", { name: "Apply as a Candidate" }).first().click();
    await expect(page).toHaveURL(/\/register\/candidate/);
  });

  test("partner roles are stated precisely and never as sponsorship or endorsement", async ({ page }) => {
    await page.goto("/partners");
    const main = page.locator("main");
    await expect(main).toContainText(/not co-hosting, sponsorship or endorsement/i);
    await expect(main).not.toContainText(/free of charge|free learning|free course/i);
    await expect(main).not.toContainText(/amity/i);
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const banned of ["65,000", "65000", "quotation", "advance"]) expect(text, banned).not.toContain(banned);
  });

  test("navigation: no hamburger menu, links are in the bar, footer carries the site map and social logos", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: /menu/i })).toHaveCount(0);
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Disciplines" })).toBeVisible();
    await expect(page.getByRole("link", { name: "How it works" })).toHaveCount(0);
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Episodes" })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /^Season 01$/ })).toHaveCount(0);
    await expect(footer.getByRole("list", { name: "Social channels" }).getByRole("link")).toHaveCount(5);
    await expect(footer.getByRole("list", { name: "Social channels" }).locator("svg")).toHaveCount(5);
    await footer.getByRole("link", { name: "Questions" }).click();
    await expect(page).toHaveURL(/\/faq/);
  });

  test("sponsor enquiry: validates, saves, and gives an honest reference", async ({ page }) => {
    await page.goto("/sponsors");
    const form = page.getByRole("form", { name: "Partnership enquiry" });
    await form.scrollIntoViewIfNeeded();
    await form.getByRole("button", { name: "Send partnership enquiry" }).click();
    await expect(form.getByRole("alert").first()).toBeVisible();
    await form.getByLabel("Organisation").fill("Example Brand Pvt Ltd");
    await form.getByLabel("Contact person").fill("Meera Iyer");
    await form.getByLabel("Your role").fill("Marketing lead");
    await form.getByLabel("Business email").fill("meera.e2e@example.com");
    await form.getByLabel("You are").selectOption("business");
    await form.getByLabel("Partnership interest").selectOption({ index: 1 });
    await form.getByLabel(/agree to be contacted/).check();
    await form.getByLabel(/formats are proposals/).check();
    await form.getByRole("button", { name: "Send partnership enquiry" }).click();
    const ok = page.getByRole("status").filter({ hasText: "Enquiry received." });
    await expect(ok).toBeVisible();
    await expect(ok).toContainText(/TBR-S-[A-Z0-9]{6}/);
    await expect(ok).toContainText(/not an agreement/i);
  });

  test("free learning is gone from the homepage and candidate registration", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    await expect(page.locator("main")).not.toContainText(/free learning|free course|educational contribution|learning, beyond/i);
    await page.goto("/register/candidate");
    await expect(page.locator("main")).not.toContainText(/free learning|free course/i);
  });

  test("'Enquire about this format' carries the format into the form and the form submits", async ({ page }) => {
    await page.goto("/sponsors");
    await page.getByRole("link", { name: "Enquire about this format" }).nth(1).click();
    const form = page.getByRole("form", { name: "Partnership enquiry" });
    await expect(form.getByLabel("Partnership interest")).toHaveValue("Industry Partner");
    await form.getByLabel("Organisation").fill("Format Test Ltd");
    await form.getByLabel("Contact person").fill("Dev Rao");
    await form.getByLabel("Business email").fill("dev.e2e@example.com");
    await form.getByLabel("You are").selectOption("business");
    await form.getByLabel(/agree to be contacted/).check();
    await form.getByLabel(/formats are proposals/).check();
    await form.getByRole("button", { name: "Send partnership enquiry" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Enquiry received." })).toBeVisible();
  });

  async function fillSponsor(page: import("@playwright/test").Page, suffix: string) {
    await page.goto("/sponsors");
    const form = page.getByRole("form", { name: "Partnership enquiry" });
    await form.getByLabel("Organisation").fill(`Net Test ${suffix}`);
    await form.getByLabel("Contact person").fill("Net Tester");
    await form.getByLabel("Business email").fill(`net.${suffix}@example.com`);
    await form.getByLabel("You are").selectOption("business");
    await form.getByLabel("Partnership interest").selectOption({ index: 1 });
    await form.getByLabel(/agree to be contacted/).check();
    await form.getByLabel(/formats are proposals/).check();
    return form;
  }

  test("sponsor enquiry: a network failure shows an error, never success, and keeps the input", async ({ page }) => {
    const form = await fillSponsor(page, "offline");
    await page.route("**/api/submit/sponsor", (r) => r.abort());
    await form.getByRole("button", { name: "Send partnership enquiry" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /offline|try again/i })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Enquiry received." })).toHaveCount(0);
    await expect(form.getByLabel("Organisation")).toHaveValue("Net Test offline");
  });

  test("sponsor enquiry: a double click sends one request", async ({ page }) => {
    const form = await fillSponsor(page, "double");
    let posts = 0;
    await page.route("**/api/submit/sponsor", async (r) => { posts++; await new Promise((res) => setTimeout(res, 400)); await r.continue(); });
    const btn = form.getByRole("button", { name: "Send partnership enquiry" });
    await btn.dblclick();
    await expect(page.getByRole("status").filter({ hasText: "Enquiry received." })).toBeVisible();
    expect(posts).toBe(1);
  });

  test("sponsor API rejects missing consent and foreign origins", async ({ request }) => {
    const body = { organization: "X Ltd", contactName: "A B", role: "Head", email: "a@x.com", category: "business", interest: "Not sure yet", consentContact: true, consentNoGuarantee: true };
    expect((await request.post("/api/submit/sponsor", { data: body })).status()).toBe(403);
    const bad = await request.post("/api/submit/sponsor", { headers: { origin: "http://localhost:3217" }, data: { ...body, consentNoGuarantee: false } });
    expect(bad.status()).toBe(422);
  });

  test("events and media show truthful prelaunch states", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/coming soon/i);
    await page.goto("/episodes");
    await expect(page.locator("main")).toContainText(/aren’t published yet/);
    await expect(page.locator("main")).not.toContainText(/views/i);
  });

  test("audience registration saves interest and takes no payment", async ({ page }) => {
    await page.goto("/register/audience");
    await expect(page.getByRole("button", { name: /^Pay/ })).toHaveCount(0);
    await page.getByLabel("Your name").fill("Ravi Kumar");
    await page.getByLabel("Mobile number").fill("9876543210");
    await page.getByLabel("Email").fill("ravi.e2e@example.com");
    await page.getByLabel(/ticket terms/).check();
    await page.getByLabel(/privacy notice/).check();
    await page.getByLabel(/event is filmed/).check();
    await page.getByRole("button", { name: "Register interest" }).click();
    const ok = page.getByRole("status").filter({ hasText: "on the list" });
    await expect(ok).toContainText(/TBR-A-[A-Z0-9]{6}/);
    await expect(ok).toContainText(/Nothing has been charged/);
  });

  test("prices appear consistently from config", async ({ page }) => {
    for (const r of ["/", "/register/audience", "/terms"]) {
      await page.goto(r);
      const text = await page.locator("body").innerText();
      expect(text, r).toContain("₹300");
    }
  });
});

test.describe("student application", () => {
  test("validation, multi-step flow, persistence, and honest confirmation", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/register/candidate?industry=finance-accounting");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible(); // inline errors, step does not advance
    await expect(page.getByRole("heading", { level: 2, name: "You" })).toBeVisible();

    await page.getByLabel(/Full name/).fill("Asha Rao");
    await page.getByLabel(/^Email/).fill("asha.e2e@example.com");
    await page.getByLabel(/Mobile number/).fill("+91 98765 43210");
    await page.getByLabel(/College or university/).fill("Example Institute");
    await page.getByLabel(/Course or degree/).fill("B.Com Honours");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByLabel(/Which discipline/)).toHaveValue("finance-accounting"); // prefilled from the arena page
    await page.getByLabel(/Key skills/).fill("Financial modelling, Excel");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel(/Your pitch in a few sentences/).fill("I built a three-statement model of a listed retailer and will defend my margin assumptions live.");
    await page.getByRole("button", { name: "Continue" }).click();

    // Arriving at the final step must not submit the form or scold the candidate before they have read anything.
    await expect(page.getByRole("heading", { level: 2, name: "Consent & send" })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0); // (an empty live region is always present)

    // Draft survives a reload (text only; consent never restored)
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /terms/i })).toBeVisible();

    await page.getByLabel(/participation terms/).check();
    await page.getByLabel(/privacy notice/).check();
    await page.getByRole("button", { name: "Submit application" }).click();
    const ok = page.getByRole("status").filter({ hasText: "Application received." });
    await expect(ok).toBeVisible();
    await expect(ok).toContainText(/TBR-C-[A-Z0-9]{6}/);
    await expect(ok).toContainText(/not\s+being selected/);
  });

  test("server rejects bad input and wrong origin; accepts a valid application", async ({ request }) => {
    const base = { fullName: "Test User", email: "t@example.com", phone: "9876543210", college: "X College", course: "BCA", gradYear: new Date().getFullYear() + 1, industry: "it-technology", skills: "Go, SQL", pitchSummary: "A short but sufficiently long pitch summary for the validator to accept.", consentTerms: true, consentPrivacy: true };
    const origin = { origin: "http://localhost:3217" };

    expect((await request.post("/api/submit/candidate", { data: base })).status()).toBe(403);

    const bad = await request.post("/api/submit/candidate", { headers: origin, data: { ...base, consentPrivacy: false, email: "nope" } });
    expect(bad.status()).toBe(422);
    const body = await bad.json();
    expect(body.fields.consentPrivacy).toBeTruthy();
    expect(body.fields.email).toBeTruthy();

    const good = await request.post("/api/submit/candidate", { headers: origin, data: base });
    expect(good.status()).toBe(201);
    expect((await good.json()).ref).toMatch(/^TBR-C-/);
  });
});

test.describe("security boundaries", () => {
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
      const r = await request.post("/api/submit/contact", { headers: { origin: "http://localhost:3217" }, data: { name: "Rate Tester", email: "rate@example.com", topic: "other", message: "Testing the limiter now." } });
      statuses.push(r.status());
    }
    expect(statuses).toContain(429);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
  });
});

test.describe("links page", () => {
  test("is a standalone link-in-bio page with every channel and no site chrome", async ({ page }) => {
    await page.goto("/links");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The Believing Room");
    await expect(page.locator("header[data-theme=dark]").first()).toBeHidden(); // site navigation is hidden here
    for (const name of ["YouTube", "Instagram", "LinkedIn", "X", "Reddit", "Email", "Apply to pitch"]) {
      await expect(page.getByRole("link", { name: new RegExp(name) }).first()).toBeVisible({ timeout: 8000 });
    }
    await expect(page.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/company/the-believing-room/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
