import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import { resetTestDatabase, resolveTestDbDir } from "./tests/e2e/isolation";

// Admin credentials come from .env.local (never committed). Tests that need them skip if absent.
// Database variables are deliberately never loaded: the suite must not be able to inherit a real connection string.
const NEVER_LOAD = /^(DATABASE_URL|POSTGRES_)/;
function loadEnv(file: string) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !NEVER_LOAD.test(m[1]) && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv(".env.local");

// Every run starts from an empty embedded database so tests never depend on a previous run's data. This must happen
// at config load (the web server opens the database during its readiness probe, before globalSetup would run), and
// only in the main process: workers re-evaluate this file and must not wipe the database mid-run. resetTestDatabase
// proves the target is disposable first and throws, deleting nothing, if it cannot (see tests/e2e/isolation.ts).
const TEST_DB_DIR = resolveTestDbDir(process.cwd());
if (process.env.TEST_WORKER_INDEX === undefined) resetTestDatabase(process.cwd());

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
    // Database variables are blanked (not merely unset) so Next cannot fill them in from an .env file, and TBR_TEST_DB
    // makes the app itself refuse to start against anything but the disposable directory (see src/db/client.ts).
    env: {
      TBR_TEST_DB: "1",
      PGLITE_DIR: TEST_DB_DIR,
      DATABASE_URL: "",
      DATABASE_URL_UNPOOLED: "",
      POSTGRES_URL: "",
      POSTGRES_URL_NON_POOLING: "",
      POSTGRES_PRISMA_URL: "",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
