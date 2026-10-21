import { adminConfigured, checkPassword, createSession, issueDeviceMarker, knownDeviceId } from "@/lib/admin-auth";
import { audit } from "@/lib/audit";
import { limitHit, limitPeek } from "@/lib/rate-limit";
import { clientIp, guard, json, readJson } from "@/lib/security";

export const runtime = "nodejs";

/**
 * Sign-in throttling, in three layers:
 *  1. per client address: 5 attempts a minute (guard). The address comes from x-forwarded-for, which a client can
 *     rotate if the app is ever reachable without a proxy that overwrites it, so it is not the only layer.
 *  2. all clients together: 30 failed sign-ins in 10 minutes closes sign-in for browsers this server has not
 *     seen before. This is the brute-force backstop against address rotation.
 *  3. per known browser: 10 failures in 10 minutes.
 *
 * The shared cap is a denial-of-service lever if it applies to everyone, because anyone can burn it with wrong
 * guesses. So it does not apply to a browser that already signed in successfully (it carries the signed "known
 * device" marker). An attacker can therefore lock out only new browsers, and only for the 10-minute window.
 * Recovery if that happens: wait, or sign in from the usual browser, or rotate ADMIN_PASSWORD.
 *
 * There is one shared password and no user accounts, so the audit log records "organizer (shared credential)":
 * it shows that a sign-in happened, from which address, not which person.
 */
const GLOBAL_FAIL = { key: "admin-login-fail-global", limit: 30, windowMs: 10 * 60_000 };
const DEVICE_FAIL = { limit: 10, windowMs: 10 * 60_000 };

async function record(action: string, meta: Record<string, unknown>) {
  // The audit trail must never be the reason a login fails or succeeds.
  try {
    await audit(action, "admin_session", undefined, meta);
  } catch {}
}

export async function POST(req: Request) {
  const blocked = await guard(req, "admin-login", 5);
  if (blocked) return blocked;
  if (!adminConfigured()) return json({ error: "not_configured", message: "Admin access is not configured on this server." }, 503);

  const ip = clientIp(req);
  const device = await knownDeviceId();
  const tooMany = () => json({ error: "rate_limited", message: "Too many failed sign-ins. Please wait a few minutes." }, 429, { "Retry-After": "600" });

  if (device) {
    if (await limitPeek(`admin-device-fail:${device}`, DEVICE_FAIL.limit, DEVICE_FAIL.windowMs)) return tooMany();
  } else if (await limitPeek(GLOBAL_FAIL.key, GLOBAL_FAIL.limit, GLOBAL_FAIL.windowMs)) {
    return tooMany();
  }

  const body = (await readJson(req, 2000)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    if (device) await limitHit(`admin-device-fail:${device}`, DEVICE_FAIL.limit, DEVICE_FAIL.windowMs);
    else await limitHit(GLOBAL_FAIL.key, GLOBAL_FAIL.limit, GLOBAL_FAIL.windowMs);
    await record("admin.login_failed", { ip, knownDevice: !!device });
    // A small fixed delay makes online guessing slower without locking the organiser out.
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: "invalid", message: "Incorrect password." }, 401);
  }
  await createSession();
  await issueDeviceMarker();
  await record("admin.login", { ip, knownDevice: !!device, credential: "shared" });
  return json({ ok: true });
}
