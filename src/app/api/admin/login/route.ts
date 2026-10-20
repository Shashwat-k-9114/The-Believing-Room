import { adminConfigured, checkPassword, createSession } from "@/lib/admin-auth";
import { audit } from "@/lib/audit";
import { clientIp, guard, json, rateLimit, rateLimited, readJson } from "@/lib/security";

export const runtime = "nodejs";

// Failed attempts across all clients. The per-IP limit trusts x-forwarded-for, which a client can rotate if the app is
// ever reachable without a proxy that overwrites it, so this cap does not depend on the address.
const GLOBAL_FAIL = { key: "admin-login-fail-global", limit: 30, windowMs: 10 * 60_000 };

async function record(action: string, ip: string) {
  // The audit trail must never be the reason a login fails or succeeds.
  try {
    await audit(action, "admin_session", undefined, { ip });
  } catch {}
}

export async function POST(req: Request) {
  // Strict: 5 attempts a minute per IP.
  const blocked = guard(req, "admin-login", 5);
  if (blocked) return blocked;
  if (!adminConfigured()) return json({ error: "not_configured", message: "Admin access is not configured on this server." }, 503);
  if (rateLimited(GLOBAL_FAIL.key, GLOBAL_FAIL.limit, GLOBAL_FAIL.windowMs))
    return json({ error: "rate_limited", message: "Too many failed sign-ins. Please wait a few minutes." }, 429, { "Retry-After": "600" });
  const ip = clientIp(req);
  const body = (await readJson(req, 2000)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    rateLimit(GLOBAL_FAIL.key, GLOBAL_FAIL.limit, GLOBAL_FAIL.windowMs);
    await record("admin.login_failed", ip);
    // A small fixed delay makes online guessing slower without locking the organiser out.
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: "invalid", message: "Incorrect password." }, 401);
  }
  await createSession();
  await record("admin.login", ip);
  return json({ ok: true });
}
