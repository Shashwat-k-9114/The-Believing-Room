import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";

/**
 * Request limiting that works on serverless hosts.
 *
 * Two stores, same interface:
 *  - memory: sliding window in one process. Used for local development, tests, and as the fallback when the shared
 *    store is unreachable. On serverless it is per instance, so it only slows a determined client.
 *  - postgres: fixed-window counters in the `rate_limits` table, shared by every instance. One atomic upsert per
 *    request. A fixed window allows up to twice the limit across a window boundary; that is acceptable for the
 *    abuse limits used here (single digits per minute).
 *
 * The shared store is used when DATABASE_URL is set, unless RATE_LIMIT_STORE=memory. A store failure never blocks a
 * request: it falls back to memory and logs. Failing closed would let a database blip take the whole site down.
 */

const buckets = new Map<string, number[]>();

/** Sliding-window limiter, in memory. Returns false when the call is over the limit. */
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

type Executor = { execute(query: SQL): Promise<unknown> };
const rowsOf = (res: unknown): Record<string, unknown>[] => ((res as { rows?: Record<string, unknown>[] })?.rows ?? (Array.isArray(res) ? (res as Record<string, unknown>[]) : []));

/** Records one hit and reports whether it is within the limit. Exported for tests; takes any Drizzle Postgres handle. */
export async function sharedHit(db: Executor, key: string, limit: number, windowMs: number, now = Date.now()): Promise<boolean> {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = windowStart + windowMs * 2;
  const res = await db.execute(sql`
    INSERT INTO rate_limits (key, window_start, hits, expires_at) VALUES (${key}, ${windowStart}, 1, ${expiresAt})
    ON CONFLICT (key, window_start) DO UPDATE SET hits = rate_limits.hits + 1
    RETURNING hits`);
  const hits = Number(rowsOf(res)[0]?.hits ?? 1);
  if (Math.random() < 0.02) await db.execute(sql`DELETE FROM rate_limits WHERE expires_at < ${now}`);
  return hits <= limit;
}

/** True when the current window for `key` is already at its limit. Records nothing. */
export async function sharedPeek(db: Executor, key: string, limit: number, windowMs: number, now = Date.now()): Promise<boolean> {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const res = await db.execute(sql`SELECT hits FROM rate_limits WHERE key = ${key} AND window_start = ${windowStart}`);
  return Number(rowsOf(res)[0]?.hits ?? 0) >= limit;
}

export function usesSharedStore(env: Record<string, string | undefined> = process.env): boolean {
  if (env.RATE_LIMIT_STORE === "memory") return false;
  return env.RATE_LIMIT_STORE === "postgres" || !!env.DATABASE_URL;
}

let warned = 0;
function degrade(e: unknown) {
  if (warned++ % 50 === 0) console.warn("[rate-limit] shared store unavailable; using the in-memory limiter for this request.", e instanceof Error ? e.message : e);
}

/**
 * Record a hit. True means the request is allowed.
 * `failClosed`: when the shared store is configured but errors, deny instead of falling back to the per-instance
 * memory counter. A memory counter is not shared across serverless instances, so for sign-in and payment routes it
 * would quietly remove the protection exactly when the database is struggling.
 */
export async function limitHit(key: string, limit: number, windowMs: number, failClosed = false): Promise<boolean> {
  if (usesSharedStore()) {
    try {
      return await sharedHit(await getDb(), key, limit, windowMs);
    } catch (e) {
      if (failClosed) {
        console.error("[rate-limit] shared store unavailable; refusing a security-sensitive request.", e instanceof Error ? e.message : e);
        return false;
      }
      degrade(e);
    }
  }
  return rateLimit(key, limit, windowMs);
}

/** True when the allowance is already used up. Records nothing. */
export async function limitPeek(key: string, limit: number, windowMs: number, failClosed = false): Promise<boolean> {
  if (usesSharedStore()) {
    try {
      return await sharedPeek(await getDb(), key, limit, windowMs);
    } catch (e) {
      if (failClosed) {
        console.error("[rate-limit] shared store unavailable; refusing a security-sensitive request.", e instanceof Error ? e.message : e);
        return true;
      }
      degrade(e);
    }
  }
  return rateLimited(key, limit, windowMs);
}
