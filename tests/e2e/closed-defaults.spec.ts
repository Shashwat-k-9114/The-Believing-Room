import { expect, test } from "@playwright/test";

/**
 * Runs against a server started with every switch at its shipped default: registrations closed, no gate password.
 * This is what a deployment looks like before anyone has approved opening registrations.
 */
const ORIGIN = "http://localhost:3218";

test.describe("shipped defaults: registrations closed", () => {
  test("candidate and audience pages show a notice, not a form", async ({ page }) => {
    for (const path of ["/register/candidate", "/register/audience"]) {
      await page.goto(path);
      await expect(page.locator("[data-registration-closed]")).toBeVisible();
      await expect(page.locator("main form")).toHaveCount(0);
      await expect(page.locator("main")).toContainText(/Nothing is being collected/);
    }
  });

  test("the notification list is closed too, and nothing else on the page breaks", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("[data-registration-closed]")).toBeVisible();
    await expect(page.getByRole("form", { name: "Join the list" })).toHaveCount(0);
  });

  test("the APIs refuse personal data with 403 even when called directly", async ({ request }) => {
    const h = { origin: ORIGIN };
    const wl = await request.post("/api/waitlist", { headers: h, data: { email: "closed.e2e@example.com", kind: "updates", consentContact: true } });
    expect(wl.status()).toBe(403);
    expect((await wl.json()).error).toBe("closed");
    const cand = await request.post("/api/candidate", { headers: h, multipart: { data: JSON.stringify({ fullName: "Test" }) } });
    expect(cand.status()).toBe(403);
    const aud = await request.post("/api/audience/order", { headers: h, data: {} });
    expect(aud.status()).toBe(403);
  });

  test("health reports closed registrations and no payment collection, and leaks nothing else", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j).toMatchObject({ status: "ok", database: "ok", registrationMode: "closed", paymentsCollecting: false });
    expect(Object.keys(j).sort()).toEqual(["database", "fileStorage", "paymentsCollecting", "rateLimitStore", "registrationMode", "status"]);
  });

  test("business enquiries (sponsors) still work while registrations are closed", async ({ request }) => {
    const res = await request.post("/api/enquiry/sponsor", {
      headers: { origin: ORIGIN },
      data: { organization: "Closed Mode Ltd", contactName: "Ravi Nair", email: "ravi.e2e@example.com", category: "business", interest: "Not sure yet", consentContact: true, consentNoGuarantee: true },
    });
    expect(res.status()).toBe(201);
  });
});

test.describe("admin sign-in cannot be turned into a lockout", () => {
  test.skip(!process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD not set");
  test.setTimeout(120_000);

  test("after the shared failure cap is burned, new browsers are held but a known browser still signs in", async ({ browser }) => {
    const pw = process.env.ADMIN_PASSWORD!;
    const post = (ctx: Awaited<ReturnType<typeof browser.newContext>>, password: string, ip: string) =>
      ctx.request.post("/api/admin/login", { headers: { origin: ORIGIN, "x-forwarded-for": ip }, data: { password } });

    // A browser that has signed in once is "known".
    const known = await browser.newContext({ baseURL: ORIGIN });
    expect((await post(known, pw, "198.51.100.1")).status()).toBe(200);

    // An attacker rotates addresses and burns the shared cap with wrong guesses.
    const attacker = await browser.newContext({ baseURL: ORIGIN });
    let held = 0;
    for (let i = 0; i < 34; i++) {
      const r = await post(attacker, `wrong-guess-${i}`, `203.0.113.${i + 1}`);
      if (r.status() === 429) held++;
    }
    expect(held).toBeGreaterThan(0);

    // A new browser, even with the right password, is held for the window...
    const fresh = await browser.newContext({ baseURL: ORIGIN });
    expect((await post(fresh, pw, "192.0.2.50")).status()).toBe(429);
    // ...but the known browser is not locked out.
    expect((await post(known, pw, "198.51.100.2")).status()).toBe(200);
    // And a known browser's wrong guesses are still limited on their own.
    let deviceHeld = false;
    for (let i = 0; i < 12; i++) if ((await post(known, `nope-${i}`, `198.51.100.${10 + i}`)).status() === 429) deviceHeld = true;
    expect(deviceHeld).toBe(true);
    await Promise.all([known.close(), attacker.close(), fresh.close()]);
  });
});
