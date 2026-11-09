import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";

const MOCK = "http://localhost:3218";
const SECRET = "e2e-secret";
const PASSWORD = "e2e-admin-password";

const call = async (payload: Record<string, unknown>) =>
  (await fetch(MOCK, { method: "POST", body: JSON.stringify({ secret: SECRET, ...payload }) })).json();

const CAND_COLS = ["Submitted at", "Reference", "Full name", "Email", "Phone", "College", "Course", "Graduation year", "Industry"];
const candidate = (i: number, name: string, college: string, industry: string, daysAgo: number) =>
  call({
    tab: "Candidates", columns: CAND_COLS,
    row: {
      "Submitted at": new Date(Date.now() - daysAgo * 86_400_000).toISOString(), Reference: `TBR-C-AAAA0${i}`, "Full name": name,
      Email: `${name.split(" ")[0].toLowerCase()}@example.com`, Phone: "9876543210", College: college, Course: "B.Tech", "Graduation year": "2027", Industry: industry,
    },
  });

async function seed() {
  await call({ action: "__reset" });
  await candidate(1, "Asha Rao", "BIT Noida", "IT & Technology", 0);
  await candidate(2, "Ben Iyer", "BIT Noida", "Finance", 2);
  await candidate(3, "Chitra Nair", "IIT Delhi", "IT & Technology", 5);
  await call({
    tab: "Contact", columns: ["Submitted at", "Name", "Email", "Topic", "Message"],
    row: { "Submitted at": new Date().toISOString(), Name: "Dev Shah", Email: "dev@example.com", Topic: "Press", Message: "Hello there" },
  });
}

const STATE = "test-results/admin-session.json";
const SIGNED_OUT = { cookies: [], origins: [] };

/** Opens the portal with the session created once in beforeAll (sign-in is rate limited, as it should be). */
async function signIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
}

/** Sidebar entry for a tab (the overview cards and activity list repeat the names). */
const goTab = (page: Page, label: string) => page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: new RegExp(`^${label}`) });

test.describe.configure({ mode: "serial" });
test.use({ storageState: STATE });
test.beforeAll(async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: "http://localhost:3217" });
  const res = await api.post("/api/admin/login", { data: { password: PASSWORD }, headers: { origin: "http://localhost:3217" } });
  expect(res.status()).toBe(200);
  await api.storageState({ path: STATE });
  await api.dispose();
});
test.beforeEach(seed);

test.describe("admin access", () => {
  test.use({ storageState: SIGNED_OUT });

  test("the portal and its API are closed to anyone who hasn't signed in", async ({ page, request }) => {
    const res = await page.goto("/admin");
    expect(page.url()).toContain("/admin/login");
    expect(res?.headers()["x-robots-tag"] ?? "").toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect((await request.get("/api/admin/data")).status()).toBe(401);
    expect((await request.post("/api/admin/rows", { data: {}, headers: { origin: "http://localhost:3217" } })).status()).toBe(401);
  });

  test("a wrong password is refused, the right one gets in, sign out closes it again", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("#adm-pw-err")).toContainText("isn't right");
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    const cookie = (await page.context().cookies()).find((c) => c.name === "tbr_admin");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Strict");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("admin data from the sheet", () => {
  test("the public site chrome stays on the public site, and is absent from the portal", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("arena-intro-v1", "1"));
    await page.goto("/");
    await expect(page.locator("footer").first()).toBeVisible();
    await signIn(page);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("#curtain-intro")).toHaveCount(0);
  });

  test("overview counts what is in the sheet, and a real form submission shows up", async ({ page, request }) => {
    const sent = await request.post("/api/submit/contact", {
      headers: { origin: "http://localhost:3217" },
      data: { name: "Priya Menon", email: "priya@example.com", topic: "media", message: "We would love to sponsor an episode." },
    });
    expect(sent.status()).toBe(201);

    await signIn(page);
    // 3 candidates + 1 seeded contact + 1 submitted through the site
    await expect(page.locator(".adm-stat").filter({ hasText: "All submissions" })).toContainText("5");
    await goTab(page, "Contact").click();
    await expect(page.getByRole("heading", { name: "Contact", level: 1 })).toBeVisible();
    await expect(page.getByRole("row", { name: /Open Priya Menon/ })).toBeVisible();
  });

  test("search, status chips and category filters narrow the table; sort and group reorder it", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    const rows = page.locator("tbody tr.adm-row");
    await expect(rows).toHaveCount(3);

    // newest first by default
    await expect(rows.first()).toContainText("Asha Rao");

    await page.getByRole("searchbox", { name: "Search Candidates" }).fill("iit");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Chitra Nair");
    await page.getByRole("button", { name: "Clear all filters" }).click();
    await expect(rows).toHaveCount(3);

    await page.getByRole("button", { name: /^Filters/ }).click();
    await page.getByRole("group", { name: "College" }).getByRole("button", { name: /BIT Noida/ }).click();
    await expect(rows).toHaveCount(2);
    await page.getByRole("button", { name: "Clear all filters" }).click();

    await page.getByRole("button", { name: "Full name", exact: true }).click();
    await expect(rows.first()).toContainText("Asha Rao");
    await page.getByRole("button", { name: "Full name", exact: true }).click();
    await expect(rows.first()).toContainText("Chitra Nair");

    await page.getByLabel("Group by").selectOption("College");
    await expect(page.locator("tr.adm-group-row")).toHaveCount(2);
  });

  test("status and notes edits are written back to the sheet", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    await page.getByRole("row", { name: /Open Ben Iyer/ }).click();

    const drawer = page.getByRole("dialog", { name: /details/ });
    await drawer.getByLabel("Status", { exact: true }).selectOption("Shortlisted");
    await drawer.getByLabel(/Internal notes/).fill("Strong pitch, call on Monday");
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved to your Google Sheet.")).toBeVisible();

    // The sheet itself now holds both, under managed columns created on first use.
    const sheet = await call({ action: "list" });
    const tab = sheet.tabs.find((t: { name: string }) => t.name === "Candidates");
    const row = tab.rows.find((r: { v: string[] }) => r.v.includes("Ben Iyer"));
    expect(row.v[tab.headers.indexOf("Status")]).toBe("Shortlisted");
    expect(row.v[tab.headers.indexOf("Notes")]).toBe("Strong pitch, call on Monday");

    // And a fresh load of the portal reads it back from the sheet.
    await drawer.getByRole("button", { name: "Close details" }).click();
    await page.getByRole("button", { name: "Refresh from Google Sheet" }).click();
    await expect(page.getByRole("row", { name: /Open Ben Iyer/ })).toContainText("Shortlisted");
  });

  test("editing a field changes the cell but never the submission date or reference", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    await page.getByRole("row", { name: /Open Asha Rao/ }).click();
    const drawer = page.getByRole("dialog", { name: /details/ });
    await drawer.getByRole("button", { name: "Edit fields" }).click();
    await drawer.getByLabel("College").fill("Delhi University");
    await expect(drawer.getByLabel("Reference")).toHaveCount(0); // read-only: not offered as an input
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved to your Google Sheet.")).toBeVisible();

    const sheet = await call({ action: "list" });
    const tab = sheet.tabs.find((t: { name: string }) => t.name === "Candidates");
    const row = tab.rows.find((r: { v: string[] }) => r.v.includes("Asha Rao"));
    expect(row.v[tab.headers.indexOf("College")]).toBe("Delhi University");
    expect(row.v[tab.headers.indexOf("Reference")]).toBe("TBR-C-AAAA01");
  });

  test("bulk status change, then delete with confirmation, leaves the right rows", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    const rows = page.locator("tbody tr.adm-row");

    await page.getByRole("checkbox", { name: "Select all rows on this page" }).check();
    await page.getByLabel("Set status").selectOption("In review");
    await expect(page.getByText("Updated 3 rows.")).toBeVisible();
    await expect(page.getByRole("button", { name: /^In review/ })).toContainText("3");

    await page.getByRole("checkbox", { name: "Select Asha Rao" }).uncheck();
    await page.getByRole("button", { name: "Delete", exact: true }).first().click();
    const confirm = page.getByRole("dialog", { name: "Delete 2 rows?" });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Delete from sheet" }).click();
    await expect(page.getByText("2 rows deleted.")).toBeVisible();
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Asha Rao");

    const sheet = await call({ action: "list" });
    const tab = sheet.tabs.find((t: { name: string }) => t.name === "Candidates");
    expect(tab.rows).toHaveLength(1);

    // The remaining row moved up in the sheet; editing it must still hit the right row.
    await rows.first().click();
    await page.getByRole("dialog", { name: /details/ }).getByLabel("Status", { exact: true }).selectOption("Confirmed");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved to your Google Sheet.")).toBeVisible();
    const after = await call({ action: "list" });
    const row = after.tabs.find((t: { name: string }) => t.name === "Candidates").rows[0];
    expect(row.v).toContain("Asha Rao");
    expect(row.v).toContain("Confirmed");
  });

  test("a stale edit is refused instead of overwriting a row that changed in the sheet", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    await page.getByRole("row", { name: /Open Ben Iyer/ }).click();

    // Someone sorts / edits the sheet by hand while the drawer is open.
    await call({ action: "__reset" });
    await candidate(9, "Zed Other", "Elsewhere", "Finance", 1);

    const drawer = page.getByRole("dialog", { name: /details/ });
    await drawer.getByLabel("Status", { exact: true }).selectOption("Declined");
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/not saved/)).toBeVisible();

    const sheet = await call({ action: "list" });
    const tab = sheet.tabs.find((t: { name: string }) => t.name === "Candidates");
    expect(tab.headers).not.toContain("Status"); // nothing was written to the wrong row
  });

  test("export downloads a CSV of what is filtered, and copy-as-table fills the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await signIn(page);
    await goTab(page, "Candidates").click();
    await page.getByRole("searchbox", { name: "Search Candidates" }).fill("BIT");

    await page.getByRole("button", { name: "Export" }).click();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("menuitem", { name: /Download CSV/ }).click()]);
    expect(download.suggestedFilename()).toMatch(/^believing-room-candidates-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = fs.readFileSync((await download.path())!, "utf8");
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM so Excel reads UTF-8
    expect(csv).toContain("Asha Rao");
    expect(csv).toContain("Ben Iyer");
    expect(csv).not.toContain("Chitra Nair");
    expect(csv).toContain("New"); // blank status exports as the effective status

    await page.getByRole("button", { name: "Export" }).click();
    await page.getByRole("menuitem", { name: /Copy 2 emails/ }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("asha@example.com; ben@example.com");
  });

  test("an entry can be added by hand and appears with a reference", async ({ page }) => {
    await signIn(page);
    await goTab(page, "Candidates").click();
    await page.getByRole("button", { name: "Add entry" }).click();
    const dialog = page.getByRole("dialog", { name: /Add candidate/ });
    await dialog.getByLabel("Full name").fill("Walk In Student");
    await dialog.getByLabel("Email").fill("walkin@example.com");
    await dialog.getByRole("button", { name: "Add to sheet" }).click();
    await expect(page.getByText("Entry added to your Google Sheet.")).toBeVisible();
    await expect(page.getByRole("row", { name: /Open Walk In Student/ })).toContainText(/TBR-C-/);
  });
});
