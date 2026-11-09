import { TAB_SPECS } from "@/lib/admin/meta";
import { isAdminRequest } from "@/lib/admin/session";
import type { AdminData, AdminTab } from "@/lib/admin/types";
import { json } from "@/lib/security";
import { callSheet, sheetsConfigured } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SheetTab = { name: string; headers: string[]; rows: { r: number; f: string; v: string[] }[] };

/** Everything in the Google Sheet, grouped into the site's forms first and any other tabs after them. */
export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) return json({ error: "unauthorized", message: "Please sign in again." }, 401);
  if (!sheetsConfigured()) {
    return json({ error: "unavailable", message: "GOOGLE_SHEET_WEBHOOK_URL / GOOGLE_SHEET_SECRET are not set, so there is no sheet to read." }, 503);
  }

  let sheet: { spreadsheetUrl?: string; tabs: SheetTab[] };
  try {
    sheet = await callSheet(({ action: "list" }), 45_000);
  } catch (e) {
    const msg = (e as Error).message;
    console.error("[admin] sheet read failed", msg);
    // An older Apps Script deployment ignores "action" and tries to append: tell the owner what to do.
    const stale = /bad request|unknown action/i.test(msg);
    return json({
      error: "sheet",
      message: stale
        ? "The Google Apps Script is the old version. Paste the new google-sheets/Code.gs and redeploy it (Deploy > Manage deployments > Edit > New version)."
        : `Couldn't read the Google Sheet: ${msg}`,
    }, 502);
  }

  const byName = new Map(sheet.tabs.map((t) => [t.name, t]));
  const known = new Set<string>();
  const tabs: AdminTab[] = [];

  for (const spec of TAB_SPECS) {
    known.add(spec.tab);
    const found = byName.get(spec.tab);
    tabs.push({
      key: spec.key,
      name: spec.tab,
      label: spec.label,
      singular: spec.singular,
      description: spec.description,
      defaultColumns: spec.defaultColumns,
      headers: found && found.headers.length ? found.headers : spec.headers,
      rows: found?.rows ?? [],
    });
  }
  for (const t of sheet.tabs) {
    if (known.has(t.name) || t.headers.length === 0) continue;
    tabs.push({
      key: `tab:${t.name}`,
      name: t.name,
      label: t.name,
      singular: "row",
      description: "An extra tab in your Google Sheet.",
      defaultColumns: t.headers.slice(0, 6),
      headers: t.headers,
      rows: t.rows,
    });
  }

  const data: AdminData = { spreadsheetUrl: sheet.spreadsheetUrl ?? null, fetchedAt: new Date().toISOString(), tabs };
  return json(data);
}
