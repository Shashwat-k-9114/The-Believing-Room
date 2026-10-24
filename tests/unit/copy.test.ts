import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Site copy never uses an em dash. This also catches the HTML entity and the JS escape for it. */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css|md)$/.test(f) ? [p] : [];
  });
}

describe("copy", () => {
  it("has no em dashes in source", () => {
    const bad = walk("src").filter((f) => /—|&mdash;|\\u2014/i.test(readFileSync(f, "utf8")));
    expect(bad).toEqual([]);
  });
});
