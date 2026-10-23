import type { ZodType } from "zod";
import { cell, FORMS, isFormKey } from "@/lib/forms";
import { clientIp, json, limitHit, makeRef, readJson, sameOrigin } from "@/lib/security";
import { appendRow, sheetsConfigured } from "@/lib/sheets";
import { fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";

/** One endpoint for every form: validate, then append a row to that form's tab in the Google Sheet. */
export async function POST(req: Request, ctx: { params: Promise<{ form: string }> }) {
  const { form } = await ctx.params;
  if (!isFormKey(form)) return json({ error: "not_found", message: "Unknown form." }, 404);
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  if (!limitHit(`${form}:${clientIp(req)}`, 6)) {
    return json({ error: "rate_limited", message: "Too many attempts. Please wait a minute and try again." }, 429, { "Retry-After": "60" });
  }

  const body = await readJson(req);
  if (!body || typeof body !== "object") return json({ error: "bad_request", message: "Malformed submission." }, 400);
  // Honeypot: a hidden field real visitors never fill. Pretend success so bots learn nothing.
  if ((body as { website?: unknown }).website) return json({ ok: true }, 201);

  const spec = FORMS[form];
  const parsed = (spec.schema as ZodType<Record<string, unknown>>).safeParse(body);
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);

  if (!sheetsConfigured()) {
    console.error("[submit] GOOGLE_SHEET_WEBHOOK_URL / GOOGLE_SHEET_SECRET are not set");
    return json({ error: "unavailable", message: "We can't take submissions right now. Please email us instead." }, 503);
  }

  const ref = "prefix" in spec ? makeRef(spec.prefix) : undefined;
  const columns = ["Submitted at", ...(ref ? ["Reference"] : []), ...Object.values(spec.columns)];
  const row: Record<string, string | number> = { "Submitted at": new Date().toISOString(), ...(ref ? { Reference: ref } : {}) };
  for (const [key, label] of Object.entries(spec.columns)) row[label] = cell(parsed.data[key]);

  try {
    await appendRow(spec.tab, columns, row);
  } catch (e) {
    console.error("[submit] sheet append failed", form, (e as Error).message);
    return json({ error: "server", message: "We couldn't save that. Please try again in a moment." }, 502);
  }
  return json({ ok: true, ref }, 201);
}
