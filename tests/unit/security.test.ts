import { describe, expect, it } from "vitest";
import { rateLimit, rateLimited, safeEqual } from "@/lib/security";

describe("rate limiting", () => {
  it("rateLimited peeks without recording a hit", () => {
    const key = `peek-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimited(key, 2, 60_000)).toBe(false);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimited(key, 2, 60_000)).toBe(false);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimited(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("safeEqual rejects different lengths and values", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
