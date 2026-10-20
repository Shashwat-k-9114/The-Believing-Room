import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertDisposableTarget, IsolationError, resetTestDatabase, SENTINEL } from "../e2e/isolation";

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "tbr-iso-"));
  fs.mkdirSync(path.join(root, ".data"), { recursive: true });
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
const dir = (name = "pglite-e2e") => path.join(root, ".data", name);

describe("e2e database reset safety", () => {
  it("resets a missing or sentinel-marked test directory and re-marks it", () => {
    resetTestDatabase(root, {});
    expect(fs.existsSync(path.join(dir(), SENTINEL))).toBe(true);
    fs.writeFileSync(path.join(dir(), "old-data"), "x");
    resetTestDatabase(root, {});
    expect(fs.existsSync(path.join(dir(), "old-data"))).toBe(false);
  });

  it("accepts a recognisable PGlite directory from an older run", () => {
    fs.mkdirSync(dir());
    fs.writeFileSync(path.join(dir(), "PG_VERSION"), "17");
    expect(() => assertDisposableTarget({ root, dir: dir(), env: {} })).not.toThrow();
  });

  it.each(["DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"])("refuses when %s is set", (k) => {
    fs.mkdirSync(dir());
    fs.writeFileSync(path.join(dir(), "keep.txt"), "important");
    expect(() => resetTestDatabase(root, { [k]: "postgres://prod.example/db" })).toThrow(IsolationError);
    expect(fs.existsSync(path.join(dir(), "keep.txt"))).toBe(true);
  });

  it.each(["VERCEL_ENV", "VERCEL_URL", "RAILWAY_ENVIRONMENT"])("refuses in a hosted environment (%s)", (k) => {
    expect(() => assertDisposableTarget({ root, dir: dir(), env: { [k]: "production" } })).toThrow(IsolationError);
  });

  it("refuses NODE_ENV=production", () => {
    expect(() => assertDisposableTarget({ root, dir: dir(), env: { NODE_ENV: "production" } })).toThrow(IsolationError);
  });

  it("refuses a directory that is not a test database, and deletes nothing", () => {
    fs.mkdirSync(dir());
    fs.writeFileSync(path.join(dir(), "report.xlsx"), "a real file");
    expect(() => assertDisposableTarget({ root, dir: dir(), env: {} })).toThrow(/not recognisably/);
    expect(fs.existsSync(path.join(dir(), "report.xlsx"))).toBe(true);
  });

  it.each([
    ["the dev database", () => dir("pglite")],
    ["a name without the e2e prefix", () => dir("shared-db")],
    ["the repo root", () => root],
    ["the data root", () => path.join(root, ".data")],
    ["a nested path", () => path.join(root, ".data", "pglite-e2e", "inner")],
    ["a path outside .data", () => path.join(os.tmpdir(), "pglite-e2e")],
    ["a traversal path", () => path.join(root, ".data", "..", "pglite-e2e")],
  ])("refuses %s", (_n, get) => {
    expect(() => assertDisposableTarget({ root, dir: get(), env: {} })).toThrow(IsolationError);
  });

  it("refuses a symbolic link or junction", () => {
    const real = path.join(root, "elsewhere");
    fs.mkdirSync(real);
    fs.writeFileSync(path.join(real, SENTINEL), "x");
    try {
      fs.symlinkSync(real, dir(), "junction");
    } catch {
      return; // links cannot be created on this machine
    }
    expect(() => assertDisposableTarget({ root, dir: dir(), env: {} })).toThrow(/symbolic link/);
    expect(fs.existsSync(path.join(real, SENTINEL))).toBe(true);
  });
});
