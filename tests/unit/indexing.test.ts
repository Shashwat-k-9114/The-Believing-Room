import { describe, expect, it } from "vitest";
import { isIndexable } from "@/lib/indexing";

describe("indexing gate", () => {
  it("indexes production and unmanaged (local or self-hosted) environments only", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });
});
