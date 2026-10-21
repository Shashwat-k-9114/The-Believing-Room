import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { limitHit } from "./rate-limit";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function makeRef(prefix: string, length = 6): string {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${s}`;
}

export const makeToken = (bytes = 18) => randomBytes(bytes).toString("base64url");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const hmacHex = (secret: string, data: string | Buffer) =>
  createHmac("sha256", secret).update(data).digest("hex");

/* ------------------------------ Rate limiting ----------------------------- */
// Implemented in ./rate-limit (shared store on serverless, memory otherwise). Re-exported so existing imports keep working.
export { rateLimit, rateLimited } from "./rate-limit";

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";

/** Reject cross-site mutating requests. Browsers always send Origin on POST. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Buckets where a limiter outage must refuse the request rather than fall back to a per-instance counter. */
const FAIL_CLOSED_BUCKETS = new Set(["admin-login", "order", "verify", "cand-pay"]);

/** Common gate for public POST endpoints. Returns a Response to short-circuit, or null. */
export async function guard(req: Request, bucket: string, limit = 8, windowMs = 60_000): Promise<Response | null> {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  if (!(await limitHit(`${bucket}:${clientIp(req)}`, limit, windowMs, FAIL_CLOSED_BUCKETS.has(bucket))))
    return json({ error: "rate_limited", message: "Too many attempts. Please wait a minute and try again." }, 429, { "Retry-After": "60" });
  return null;
}

/** Parse JSON body with a size cap. */
export async function readJson(req: Request, maxBytes = 50_000): Promise<unknown | null> {
  const raw = await req.text();
  if (raw.length > maxBytes) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
