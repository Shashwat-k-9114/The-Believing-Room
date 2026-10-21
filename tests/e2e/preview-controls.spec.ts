import { expect, test } from "@playwright/test";

/** Runs against the main test server, which is started in preview-synthetic mode. */
test.describe("protected preview controls", () => {
  test("registration pages carry the made-up-data banner and a working form", async ({ page }) => {
    for (const path of ["/register/candidate"]) {
      await page.goto(path);
      await expect(page.locator("[data-registration-synthetic]")).toContainText(/made-up details only/i);
      await expect(page.locator("[data-registration-closed]")).toHaveCount(0);
      await expect(page.locator("main form").first()).toBeVisible();
    }
  });

  test("health reports synthetic mode, payments off, and an embedded database locally", async ({ request }) => {
    const j = await (await request.get("/api/health")).json();
    expect(j).toMatchObject({ status: "ok", registrationMode: "preview-synthetic", paymentsCollecting: false, rateLimitStore: "memory", fileStorage: "local" });
  });

  test("the sponsorship prospectus and payment surfaces stay closed", async ({ request }) => {
    expect((await request.get("/sponsors/prospectus")).status()).toBe(404);
    const order = await request.post("/api/audience/order", { headers: { origin: "http://localhost:3217" }, data: {} });
    expect([422, 503, 400, 409]).toContain(order.status());
  });

  test("no analytics or advertising script is loaded on any key page", async ({ page }) => {
    const hosts: string[] = [];
    page.on("request", (r) => hosts.push(new URL(r.url()).host));
    for (const p of ["/", "/register/candidate", "/sponsors", "/the-show"]) await page.goto(p);
    const bad = hosts.filter((h) => /google-analytics|googletagmanager|facebook|fbcdn|doubleclick|hotjar|clarity/.test(h));
    expect(bad).toEqual([]);
  });
});
