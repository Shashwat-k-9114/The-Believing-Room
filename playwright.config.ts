import { defineConfig, devices } from "@playwright/test";

const PORT = 3217;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Firefox and WebKit run only the browser-sensitive spec; the full suite is Chromium-only.
    { name: "firefox", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
    { name: "webkit", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    { command: "node tests/e2e/mock-sheet.mjs", port: 3218, reuseExistingServer: false },
    {
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`, GOOGLE_SHEET_WEBHOOK_URL: "http://localhost:3218", GOOGLE_SHEET_SECRET: "e2e-secret" },
    },
  ],
});
