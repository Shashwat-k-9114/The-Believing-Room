import { defineConfig, devices } from "@playwright/test";

/**
 * Acceptance run against a DEPLOYED protected preview. Not part of the normal suite.
 *   DEPLOYED_URL      the preview address
 *   VERCEL_BYPASS     automation bypass secret for the platform layer (temporary, revoked afterwards)
 *   GATE_PASSWORD     the application's SITE_GATE_PASSWORD
 *   ADMIN_PASSWORD    the preview's organiser password
 * Values come from the environment and are never written to disk by this config.
 */
const base = process.env.DEPLOYED_URL;
if (!base) throw new Error("Set DEPLOYED_URL");

export default defineConfig({
  testDir: "./tests/deployed",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: base,
    extraHTTPHeaders: process.env.VERCEL_BYPASS ? { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS, "x-vercel-set-bypass-cookie": "true" } : {},
    httpCredentials: process.env.GATE_PASSWORD ? { username: "reviewer", password: process.env.GATE_PASSWORD, origin: new URL(base).origin, send: "always" } : undefined,
  },
  projects: [
    { name: "desktop", testIgnore: /layout\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", testMatch: /layout\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
});
