import { describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { rateLimit, rateLimited, sharedHit, sharedPeek, usesSharedStore } from "@/lib/rate-limit";

describe("shared (Postgres) limiter", () => {
  it("counts atomically under concurrency: exactly `limit` of 40 simultaneous hits are allowed", async () => {
    const db = await getDb();
    const key = `t-concurrent-${Math.random()}`;
    const results = await Promise.all(Array.from({ length: 40 }, () => sharedHit(db, key, 7, 60_000)));
    expect(results.filter(Boolean)).toHaveLength(7);
  });

  it("peek records nothing, and reports a full window", async () => {
    const db = await getDb();
    const key = `t-peek-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(await sharedPeek(db, key, 2, 60_000)).toBe(false);
    expect(await sharedHit(db, key, 2, 60_000)).toBe(true);
    expect(await sharedHit(db, key, 2, 60_000)).toBe(true);
    expect(await sharedPeek(db, key, 2, 60_000)).toBe(true);
    expect(await sharedHit(db, key, 2, 60_000)).toBe(false);
  });

  it("starts a fresh allowance in the next window and keys are independent", async () => {
    const db = await getDb();
    const key = `t-window-${Math.random()}`;
    const t0 = 1_800_000_000_000;
    expect(await sharedHit(db, key, 1, 10_000, t0)).toBe(true);
    expect(await sharedHit(db, key, 1, 10_000, t0 + 1)).toBe(false);
    expect(await sharedHit(db, key, 1, 10_000, t0 + 10_000)).toBe(true);
    expect(await sharedHit(db, `${key}-other`, 1, 10_000, t0)).toBe(true);
  });
});

describe("memory limiter and store selection", () => {
  it("keeps the sliding-window behaviour", () => {
    const key = `t-mem-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimited(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
  it("uses the shared store only when a database URL is configured", () => {
    expect(usesSharedStore({})).toBe(false);
    expect(usesSharedStore({ DATABASE_URL: "postgres://x" })).toBe(true);
    expect(usesSharedStore({ DATABASE_URL: "postgres://x", RATE_LIMIT_STORE: "memory" })).toBe(false);
    expect(usesSharedStore({ RATE_LIMIT_STORE: "postgres" })).toBe(true);
  });
});
