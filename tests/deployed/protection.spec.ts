import { expect, test, request as pwRequest } from "@playwright/test";

const BASE = process.env.DEPLOYED_URL!;
const PATHS = ["/", "/the-show", "/terms", "/robots.txt", "/api/health", "/api/admin/login", "/api/admin/resume/00000000-0000-0000-0000-000000000000"];

test.describe("protection layers", () => {
  test("no credentials at all: the platform turns every path away, API included", async () => {
    const anon = await pwRequest.newContext({ baseURL: BASE, extraHTTPHeaders: {} });
    for (const p of PATHS) {
      const r = await anon.get(p, { maxRedirects: 0 });
      expect([301, 302, 303, 307, 401, 403], `${p} -> ${r.status()}`).toContain(r.status());
      expect(r.headers()["location"] ?? "", p).toMatch(/vercel\.com\/sso-api|^$/);
      expect(await r.text(), p).not.toMatch(/Believing Room|"status"/);
    }
    const post = await anon.post("/api/candidate", { data: {}, headers: { origin: BASE } });
    expect([401, 403]).toContain(post.status());
    await anon.dispose();
  });

  test("platform pass but wrong or missing app password: the app gate refuses with 401", async () => {
    const noPw = await pwRequest.newContext({ baseURL: BASE, extraHTTPHeaders: { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS ?? "" } });
    for (const p of PATHS) {
      const r = await noPw.get(p, { maxRedirects: 0 });
      expect(r.status(), p).toBe(401);
      expect(r.headers()["www-authenticate"], p).toMatch(/Basic/);
    }
    const wrong = await noPw.get("/", { headers: { authorization: "Basic " + Buffer.from("x:wrong-password-wrong").toString("base64") } });
    expect(wrong.status()).toBe(401);
    const post = await noPw.post("/api/candidate", { data: {}, headers: { origin: BASE } });
    expect(post.status()).toBe(401);
    await noPw.dispose();
  });

  test("both layers passed: pages render and every response is marked noindex", async ({ request }) => {
    for (const p of ["/", "/the-show", "/partners"]) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(200);
      expect(r.headers()["x-robots-tag"] ?? "", p).toMatch(/noindex/);
      expect(await r.text(), p).toMatch(/<meta name="robots" content="noindex/);
    }
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toMatch(/Disallow: \//);
  });
});
