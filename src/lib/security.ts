import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function makeRef(prefix: string, length = 6): string {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${s}`;
}

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

/**
 * Per-instance sliding-window limiter. On serverless each instance counts separately, so this only blunts a single
 * client hammering one instance; the honeypot and the Apps Script quota are the other lines of defence.
 */
const hits = new Map<string, number[]>();
export function limitHit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
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
