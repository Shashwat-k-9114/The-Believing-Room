import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Admin credentials come from .env.local (never committed). Tests that need them skip if absent.
function loadEnv(file: string) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv(".env.local");

// Every run starts from an empty embedded database so tests never depend on a previous run's data. This must happen
// at config load (the web server opens the database during its readiness probe, before globalSetup would run), and
// only in the main process: workers re-evaluate this file and must not wipe the database mid-run.
if (process.env.TEST_WORKER_INDEX === undefined) fs.rmSync(".data/pglite-e2e", { recursive: true, force: true });

const PORT = 3217;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PGLITE_DIR: ".data/pglite-e2e", NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
  },
});
