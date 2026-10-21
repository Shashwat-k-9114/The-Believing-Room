import { expect, test } from "@playwright/test";

const BASE = process.env.DEPLOYED_URL!;
const origin = { origin: new URL(BASE).origin };
const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\n"), Buffer.from([0, 1, 2, 250, 255, 128, 7]), Buffer.from("\n%%EOF")]);
const stamp = `syn${Date.now()}`;
const cand = {
  fullName: "Synthetic Tester",
  email: `${stamp}@example.com`,
  phone: "9876543210",
  college: "Synthetic Test College",
  course: "BCA",
  gradYear: new Date().getFullYear() + 1,
  industry: "it-technology",
  skills: "Go, SQL",
  pitchSummary: "Synthetic preview record: a made-up pitch long enough for the validator to accept it.",
  consentTerms: true,
  consentPrivacy: true,
};
const state: { ref?: string } = {};

test.describe.serial("deployed preview: end to end", () => {
  test("health: database, shared limiter and database file storage are live; payments are off", async ({ request }) => {
    const r = await request.get("/api/health");
    expect(r.status()).toBe(200);
    const h = await r.json();
    console.log("health:", JSON.stringify(h));
    expect(h.database).toBe("ok");
    expect(h.registrationMode).toBe("preview-synthetic");
    expect(h.paymentsCollecting).toBe(false);
    expect(String(h.rateLimitStore)).toMatch(/postgres|shared/);
    expect(String(h.fileStorage)).toBe("postgres");
    expect(JSON.stringify(h)).not.toMatch(/postgres(ql)?:\/\/|password|secret|neon\.tech/i);
  });

  test("public sections render with one h1, no console errors and no analytics hosts", async ({ page }) => {
    const hosts = new Set<string>();
    const errors: string[] = [];
    page.on("request", (q) => hosts.add(new URL(q.url()).hostname));
    // vercel.live is the platform's own preview toolbar, injected only on preview deployments; the app's CSP blocks it by design.
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && !/favicon|vercel\.live/.test(m.text()) && errors.push(m.text()));
    for (const p of ["/", "/partners", "/sponsors", "/events", "/the-show", "/podcast", "/faq", "/stories"]) {
      const r = await page.goto(p);
      expect(r?.status(), p).toBe(200);
      await expect(page.locator("h1"), p).toHaveCount(1);
    }
    expect(errors).toEqual([]);
    for (const h of hosts) expect(h, "no third-party tracker").not.toMatch(/google-analytics|googletagmanager|facebook|fbcdn|doubleclick|hotjar|clarity/);
  });

  test("registration pages say the data is synthetic", async ({ page }) => {
    await page.goto("/register/candidate");
    await expect(page.locator("[data-registration-synthetic]")).toBeVisible();
    await expect(page.locator("[data-registration-closed]")).toHaveCount(0);
  });

  test("candidate API validates, rejects wrong origin and fake PDFs, accepts a synthetic application with a résumé", async ({ request }) => {
    expect((await request.post("/api/candidate", { multipart: { data: JSON.stringify(cand) } })).status()).toBe(403);
    const bad = await request.post("/api/candidate", { headers: origin, multipart: { data: JSON.stringify({ ...cand, email: "nope", consentPrivacy: false }) } });
    expect(bad.status()).toBe(422);
    const fake = await request.post("/api/candidate", { headers: origin, multipart: { data: JSON.stringify(cand), resume: { name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("MZ not a pdf") } } });
    expect(fake.status()).toBe(422);
    const ok = await request.post("/api/candidate", { headers: origin, multipart: { data: JSON.stringify(cand), resume: { name: "cv.pdf", mimeType: "application/pdf", buffer: PDF } } });
    expect(ok.status(), await ok.text()).toBe(201);
    state.ref = (await ok.json()).ref;
    expect(state.ref).toMatch(/^TBR-C-/);
  });

  test("sponsor enquiry is stored", async ({ request }) => {
    const r = await request.post("/api/enquiry/sponsor", {
      headers: origin,
      data: { organization: `Synthetic Sponsor ${stamp}`, contactName: "Synthetic Contact", email: `s-${stamp}@example.com`, category: "business", interest: "Not sure yet", consentContact: true, consentNoGuarantee: true },
    });
    expect(r.status(), await r.text()).toBe(201);
    expect((await r.json()).ref).toMatch(/^TBR-S-/);
  });

  test("admin: anonymous and wrong password are refused; the right one lists the application and serves identical résumé bytes", async ({ page, request }) => {
    const anon = await request.get("/api/admin/resume/00000000-0000-0000-0000-000000000000");
    expect([401, 403, 404]).toContain(anon.status());
    expect((await request.post("/api/admin/login", { headers: origin, data: { password: "definitely-not-the-password" } })).status()).toBe(401);

    await page.goto("/admin");
    await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator("[data-synthetic-admin]")).toBeVisible();
    await page.goto("/admin?tab=students");
    const row = page.locator("tr", { hasText: state.ref! });
    await expect(row).toBeVisible();
    const href = await row.getByRole("link", { name: /Résumé/ }).getAttribute("href");
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/pdf/);
    expect(Buffer.compare(await res.body(), PDF)).toBe(0);
    await page.goto("/admin?tab=audit");
    await expect(page.locator("main")).toContainText("admin.login");
    await expect(page.locator("main")).toContainText("resume_download");
  });

  test("payments are off and the prospectus is not published", async ({ request }) => {
    expect((await request.get("/sponsors/prospectus")).status()).toBe(404);
    const order = await request.post("/api/audience/order", {
      headers: origin,
      data: { name: "Synthetic", email: "x@example.com", phone: "9876543210", quantity: 1, attendeeNames: ["Synthetic"], consentTerms: true, consentPrivacy: true, consentFilming: true },
    });
    expect([422, 503]).toContain(order.status());
    if (order.status() === 503) expect((await order.json()).error).toBe("unavailable");
    expect((await request.post("/api/webhooks/razorpay", { data: "{}", headers: { "content-type": "application/json" } })).status()).toBe(400);
    expect((await request.post("/api/audience/verify", { headers: origin, data: { providerOrderId: "o", providerPaymentId: "p", signature: "0".repeat(64) } })).status()).toBe(400);
  });

  test("no environment secrets or internal documents are reachable", async ({ request }) => {
    for (const p of ["/.env", "/.env.local", "/docs/VERCEL-PREVIEW-RELEASE-PLAN.md", "/brand-source/", "/drizzle/0000_init.sql", "/package.json", "/.git/config", "/.vercel/project.json"]) {
      const r = await request.get(p);
      const t = await r.text();
      expect(t, p).not.toMatch(/ADMIN_PASSWORD=|SESSION_SECRET=|DATABASE_URL=|postgres(ql)?:\/\/|CREATE TABLE/);
      expect(r.status(), p).not.toBe(200);
    }
  });

  test("the shared limiter throttles repeated bad requests", async ({ request }) => {
    const codes: number[] = [];
    for (let i = 0; i < 9; i++) codes.push((await request.post("/api/candidate", { headers: origin, multipart: { data: "{}" } })).status());
    expect(codes).toContain(429);
  });

  test("repeat requests are stable", async ({ request }) => {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const t = Date.now();
      const r = await request.get("/api/health");
      expect(r.status()).toBe(200);
      times.push(Date.now() - t);
    }
    console.log("health latency ms", times.join(","));
  });
});
