import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

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

const buckets = new Map<string, number[]>();

/**
 * Sliding-window limiter, in memory. Fine for one instance; swap for a shared
 * store (Redis/Upstash) before running more than one server instance.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  return true;
}

/** True when `key` has already used its allowance. Does not record a hit. */
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  return (buckets.get(key) ?? []).filter((t) => now - t < windowMs).length >= limit;
}

export const clientIp =(req: Request) =>
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

/** Common gate for public POST endpoints. Returns a Response to short-circuit, or null. */
export function guard(req: Request, bucket: string, limit = 8, windowMs = 60_000): Response | null {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  if (!rateLimit(`${bucket}:${clientIp(req)}`, limit, windowMs))
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
