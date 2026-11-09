import { z } from "zod";
import { TAB_SPECS } from "@/lib/admin/meta";
import { isAdminRequest } from "@/lib/admin/session";
import { NOTES_COL, READ_ONLY_COLS, STATUS_COL, STATUSES, type OpResult } from "@/lib/admin/types";
import { cell } from "@/lib/forms";
import { json, makeRef, readJson, sameOrigin } from "@/lib/security";
import { appendRow, callSheet, sheetsConfigured } from "@/lib/sheets";

export const runtime = "nodejs";
export const maxDuration = 60;

const value = z.string().max(5_000);
const opSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("update"),
    row: z.number().int().min(2),
    fp: z.string().max(60),
    set: z.record(z.string().min(1).max(120), value).refine((s) => Object.keys(s).length > 0 && Object.keys(s).length <= 60),
  }),
  z.object({ type: z.literal("delete"), row: z.number().int().min(2), fp: z.string().max(60) }),
]);
const batchSchema = z.object({ tab: z.string().min(1).max(100), ops: z.array(opSchema).min(1).max(200) });
const addSchema = z.object({ tab: z.string().min(1).max(100), row: z.record(z.string().max(120), value) });

async function guard(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  if (!(await isAdminRequest(req))) return json({ error: "unauthorized", message: "Please sign in again." }, 401);
  if (!sheetsConfigured()) return json({ error: "unavailable", message: "The Google Sheet isn't connected." }, 503);
  return null;
}

/** Edit or delete existing rows. The script re-checks every row's fingerprint before touching it. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const parsed = batchSchema.safeParse(await readJson(req, 400_000));
  if (!parsed.success) return json({ error: "bad_request", message: "Malformed request." }, 400);
  const { tab, ops } = parsed.data;

  for (const op of ops) {
    if (op.type !== "update") continue;
    for (const [k, v] of Object.entries(op.set)) {
      if (READ_ONLY_COLS.includes(k)) return json({ error: "bad_request", message: `${k} can't be edited.` }, 400);
      if (k === STATUS_COL && v !== "" && !(STATUSES as readonly string[]).includes(v)) return json({ error: "bad_request", message: "Unknown status." }, 400);
    }
  }

  try {
    const res = await callSheet<{ results: OpResult[] }>({ action: "batch", tab, ops }, 55_000);
    return json({ ok: true, results: res.results });
  } catch (e) {
    console.error("[admin] sheet write failed", (e as Error).message);
    return json({ error: "sheet", message: `Couldn't update the Google Sheet: ${(e as Error).message}` }, 502);
  }
}

/** Add an entry by hand, for example a walk-in or a registration that came in by phone. */
export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const parsed = addSchema.safeParse(await readJson(req, 100_000));
  if (!parsed.success) return json({ error: "bad_request", message: "Malformed request." }, 400);
  const spec = TAB_SPECS.find((s) => s.tab === parsed.data.tab);
  if (!spec) return json({ error: "bad_request", message: "Entries can only be added to the site's own tabs." }, 400);

  const allowed = new Set([...spec.headers, STATUS_COL, NOTES_COL]);
  const row: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(parsed.data.row)) if (allowed.has(k) && v.trim()) row[k] = cell(v.trim());
  if (Object.keys(row).length === 0) return json({ error: "bad_request", message: "Fill in at least one field." }, 400);

  row["Submitted at"] = new Date().toISOString();
  if (spec.headers.includes("Reference") && spec.prefix) row["Reference"] = makeRef(spec.prefix);
  const columns = [...spec.headers, ...(STATUS_COL in row ? [STATUS_COL] : []), ...(NOTES_COL in row ? [NOTES_COL] : [])];

  try {
    await appendRow(spec.tab, columns, row);
  } catch (e) {
    console.error("[admin] manual add failed", (e as Error).message);
    return json({ error: "sheet", message: `Couldn't add the entry: ${(e as Error).message}` }, 502);
  }
  return json({ ok: true }, 201);
}
