import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

/**
 * Exercises the hosted-PostgreSQL code path (node-postgres pool, explicit migration, shared limiter, database file
 * storage) against a real wire-protocol Postgres server: PGlite served over TCP. It proves the application logic and
 * the SQL; it cannot prove a provider's pooler, TLS or latency, which the preview smoke test covers.
 */
const PORT = 54329;
const HOST = "127.0.0.1";
const URL_ = `postgres://postgres:postgres@${HOST}:${PORT}/postgres?sslmode=disable`;
let server: PGLiteSocketServer;
let backing: PGlite;

// Asynchronous on purpose: the database server lives in this same process, so a blocking call would starve it.
const run = promisify(execFile);
const migrate = async (env: Record<string, string>) =>
  (await run(process.execPath, [path.join(process.cwd(), "scripts", "db-migrate.mjs")], { env: { ...process.env, ...env }, encoding: "utf8" })).stdout;

async function freshModules() {
  (globalThis as unknown as { __arenaDb?: unknown }).__arenaDb = undefined;
  vi.resetModules();
}

describe("hosted Postgres path", () => {
  beforeAll(async () => {
    backing = await PGlite.create();
    server = new PGLiteSocketServer({ db: backing, port: PORT, host: HOST, maxConnections: 8 });
    await server.start();
    process.env.DATABASE_URL = URL_;
    delete process.env.PGLITE_DIR;
    process.env.DB_POOL_MAX = "3";
  });
  afterAll(async () => {
    delete process.env.DATABASE_URL;
    process.env.PGLITE_DIR = "memory://";
    (globalThis as unknown as { __arenaDb?: unknown }).__arenaDb = undefined;
    await server.stop();
    await backing.close();
  });

  it("refuses to start against an unmigrated database, with a message that says what to do", async () => {
    await freshModules();
    const { getDb } = await import("@/db/client");
    await expect(getDb()).rejects.toThrow(/not migrated[\s\S]*db:migrate/);
  });

  it("the migration script refuses to run unless the target host is confirmed, and never prints credentials", async () => {
    let err: { code?: number; stdout?: string; stderr?: string } = {};
    try {
      await migrate({ DATABASE_URL: URL_, DB_MIGRATE_CONFIRM_HOST: "somewhere-else" });
    } catch (e) {
      err = e as typeof err;
    }
    expect(err.code).toBe(3);
    expect(`${err.stdout}${err.stderr}`).toContain(`host=${HOST}`);
    expect(`${err.stdout}${err.stderr}`).not.toContain("postgres:postgres");
  });

  it("applies every migration with the confirmed host, and is safe to run twice", async () => {
    const out = await migrate({ DATABASE_URL: URL_, DB_MIGRATE_CONFIRM_HOST: HOST });
    expect(out).toMatch(/Done\. 4 migrations are applied/);
    expect(await migrate({ DATABASE_URL: URL_, DB_MIGRATE_CONFIRM_HOST: HOST })).toMatch(/Done\. 4 migrations/);
  });

  it("then starts, seeds once, and answers queries through the pool", async () => {
    await freshModules();
    const { getDb, schema } = await import("@/db/client");
    const db = await getDb();
    const orgs = await db.select().from(schema.organizations);
    expect(orgs.map((o) => o.slug)).toContain("manacle");
    await freshModules();
    const again = await (await import("@/db/client")).getDb();
    expect((await again.select().from((await import("@/db/client")).schema.organizations)).length).toBe(orgs.length); // seed did not duplicate
  });

  it("the shared limiter counts exactly across concurrent pooled connections", async () => {
    await freshModules();
    const { limitHit, limitPeek, usesSharedStore } = await import("@/lib/rate-limit");
    expect(usesSharedStore()).toBe(true);
    const key = `pg-${Math.random()}`;
    const r = await Promise.all(Array.from({ length: 30 }, () => limitHit(key, 4, 60_000)));
    expect(r.filter(Boolean)).toHaveLength(4);
    expect(await limitPeek(key, 4, 60_000)).toBe(true);
  });

  it("résumé bytes survive a round trip through database storage, and bad keys are refused", async () => {
    await freshModules();
    const { storage, storageDriverName } = await import("@/lib/storage");
    expect(storageDriverName()).toBe("postgres");
    const bytes = Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.from([0, 1, 2, 255, 254, 128]), Buffer.from("tail")]);
    const key = await storage.put(bytes, "pdf");
    expect(key).toMatch(/^[0-9a-f-]{36}\.pdf$/);
    const back = await storage.get(key);
    expect(back && Buffer.compare(back, bytes)).toBe(0);
    expect(await storage.get("../../etc/passwd")).toBeNull();
    await storage.remove(key);
    expect(await storage.get(key)).toBeNull();
  });
});
