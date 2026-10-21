import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Access gate in front of every page, as a second line behind the host's own deployment protection.
 *
 * Why: marking a deployment "noindex" hides it from search engines, it does not stop anyone who has the address. And
 * a host's protection setting can be changed or left at a default that does not cover every domain. This gate makes
 * the app itself refuse to serve visitors unless it is deliberately configured to.
 *
 *  password  SITE_GATE_PASSWORD (16+ characters) is set: HTTP Basic authentication, any user name.
 *  closed    no password and the deployment is a Vercel preview or production one: every request gets 503.
 *            Production stays closed until PUBLIC_LAUNCH_APPROVED=true, the explicit "go public" switch.
 *  open      local development, tests, or a deliberate opt-out (SITE_GATE=off, or PUBLIC_LAUNCH_APPROVED=true
 *            on production).
 */
export type GateMode = "open" | "password" | "closed";

export function gateMode(env: Record<string, string | undefined> = process.env): GateMode {
  const pw = env.SITE_GATE_PASSWORD ?? "";
  if (pw.length >= 16) return "password";
  if (env.SITE_GATE === "off") return "open";
  const where = env.VERCEL_ENV;
  if (where === "preview" || where === "development") return "closed";
  if (where === "production" && env.PUBLIC_LAUNCH_APPROVED !== "true") return "closed";
  return "open";
}

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Constant-time check of an Authorization header against the gate password. */
export function basicAuthOk(header: string | null, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const given = decoded.slice(decoded.indexOf(":") + 1);
  return timingSafeEqual(digest(given), digest(password));
}

/** Paths that must stay reachable by machines: payment-provider webhooks verify their own signatures. */
export const GATE_EXEMPT = /^\/api\/webhooks\//;
