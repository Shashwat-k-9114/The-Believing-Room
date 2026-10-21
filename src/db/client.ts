import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { seedEcosystem } from "./seed";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const MIGRATIONS = path.join(/*turbopackIgnore: true*/ process.cwd(), "drizzle");

/**
 * The e2e suite sets TBR_TEST_DB=1 and wipes its database between runs. In that mode the app refuses to run against
 * anything except a disposable embedded directory, so a test run can never read or write a real database.
 */
function assertTestIsolation() {
  if (process.env.TBR_TEST_DB !== "1") return;
  const dir = process.env.PGLITE_DIR ?? "";
  const dataRoot = path.resolve(/*turbopackIgnore: true*/ process.cwd(), ".data");
  const ok = dir === "memory://" || (dir !== "" && path.dirname(path.resolve(dir)) === dataRoot && path.basename(dir).startsWith("pglite-e2e"));
  if (process.env.DATABASE_URL || !ok) {
    throw new Error("TBR_TEST_DB is set but the database is not a disposable test database (DATABASE_URL must be empty and PGLITE_DIR must be .data/pglite-e2e*). Refusing to start.");
  }
}

/**
 * With DATABASE_URL set, uses PostgreSQL via node-postgres.
 * Without it, uses an embedded on-disk PostgreSQL (PGlite) in .data/pglite
 * so local development needs no external service. Same SQL dialect, same schema.
 */
async function create(): Promise<Db> {
  assertTestIsolation();
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    // Serverless: every instance opens its own pool, so keep it small and let idle connections go. Point DATABASE_URL
    // at the provider's pooled (PgBouncer) endpoint, not the direct one. Fail fast instead of hanging a request.
    const pool = new Pool({
      connectionString: url,
      max: Number(process.env.DB_POOL_MAX ?? 3),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
    pool.on("error", (e) => console.error("[db] idle client error", e.message)); // never crash the instance on a dropped idle connection
    const db = drizzle(pool, { schema });
    try {
      if (process.env.DB_AUTO_MIGRATE === "true") await migrate(db, { migrationsFolder: MIGRATIONS });
      else await assertMigrated(pool);
    } catch (e) {
      await pool.end().catch(() => {}); // do not leak connections from a failed start; the next request retries
      throw e;
    }
    try {
      await seedEcosystem(db as unknown as Db);
    } catch (e) {
      // Two cold instances can race to seed; the loser hits a unique constraint. The seed is idempotent, so carry on.
      console.warn("[db] seed skipped:", e instanceof Error ? e.message : e);
    }
    return db as unknown as Db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const inMemory = process.env.PGLITE_DIR === "memory://";
  if (!inMemory) mkdirSync(path.dirname(dir), { recursive: true }); // PGlite creates only the leaf folder
  const open = async () => {
    const client = new PGlite(inMemory ? undefined : dir);
    const db = drizzlePglite(client, { schema });
    try {
      await migratePglite(db, { migrationsFolder: MIGRATIONS });
      await seedEcosystem(db);
    } catch (e) {
      await client.close().catch(() => {});
      throw e;
    }
    return db;
  };
  try {
    return await open();
  } catch (e) {
    // A process killed mid-write (out of memory, power loss, a synced folder) leaves a data directory PGlite
    // cannot open ("PGlite failed to initialize properly"). This embedded database is for local development
    // only, so move the broken directory aside (never delete it) and start clean, loudly.
    if (inMemory || !existsSync(dir)) throw e;
    const aside = `${dir}.corrupt-${Date.now()}`;
    renameSync(dir, aside);
    console.warn(`[db] Could not open the embedded database at ${dir}. Moved it to ${aside} and created a fresh one.`, e);
    return await open();
  }
}

/**
 * Migrations are applied by an explicit step (`npm run db:migrate`), not on every cold start: concurrent instances
 * would race, and a request should never pay for schema work. This check fails with a clear message if that step
 * was skipped, instead of surfacing as a confusing "relation does not exist" later.
 */
async function assertMigrated(pool: import("pg").Pool) {
  const expected = (JSON.parse(readFileSync(path.join(MIGRATIONS, "meta", "_journal.json"), "utf8")) as { entries: unknown[] }).entries.length;
  let applied = 0;
  try {
    const r = await pool.query("select count(*)::int as n from drizzle.__drizzle_migrations");
    applied = r.rows[0]?.n ?? 0;
  } catch {
    applied = 0;
  }
  if (applied < expected) throw new Error(`Database is not migrated (${applied} of ${expected} migrations applied). Run "npm run db:migrate" against this database, or set DB_AUTO_MIGRATE=true.`);
}

const g = globalThis as unknown as { __arenaDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  g.__arenaDb ??= create().catch((e) => {
    g.__arenaDb = undefined; // never cache a failed init
    throw e;
  });
  return g.__arenaDb;
}

export { schema };
