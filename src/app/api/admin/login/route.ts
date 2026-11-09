import { cookies } from "next/headers";
import { adminConfigured, createSessionToken, passwordMatches, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin/session";
import { clientIp, json, limitHit, readJson, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  if (!adminConfigured()) {
    console.error("[admin] ADMIN_PASSWORD is missing or shorter than 10 characters");
    return json({ error: "unavailable", message: "Admin sign-in isn't set up yet. Set ADMIN_PASSWORD (10+ characters) and redeploy." }, 503);
  }
  // Per-address and overall limits: this is a single shared password, so guessing must stay slow.
  if (!limitHit(`admin-login:${clientIp(req)}`, 5) || !limitHit("admin-login:all", 40)) {
    return json({ error: "rate_limited", message: "Too many attempts. Wait a minute and try again." }, 429, { "Retry-After": "60" });
  }

  const body = (await readJson(req, 2_000)) as { password?: unknown } | null;
  const pw = typeof body?.password === "string" ? body.password : "";
  if (!pw || !(await passwordMatches(pw))) {
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: "invalid", message: "That password isn't right." }, 401);
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return json({ ok: true });
}
