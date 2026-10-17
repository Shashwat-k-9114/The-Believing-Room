import { adminConfigured, checkPassword, createSession } from "@/lib/admin-auth";
import { guard, json, readJson } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Strict: 5 attempts a minute per IP.
  const blocked = guard(req, "admin-login", 5);
  if (blocked) return blocked;
  if (!adminConfigured()) return json({ error: "not_configured", message: "Admin access is not configured on this server." }, 503);
  const body = (await readJson(req, 2000)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !checkPassword(body.password))
    return json({ error: "invalid", message: "Incorrect password." }, 401);
  await createSession();
  return json({ ok: true });
}
