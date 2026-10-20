import "server-only";
import { existsSync, mkdirSync, renameSync } from "node:fs";
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
    const pool = new Pool({ connectionString: url, max: 5 });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    await seedEcosystem(db as unknown as Db);
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

const g = globalThis as unknown as { __arenaDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  g.__arenaDb ??= create().catch((e) => {
    g.__arenaDb = undefined; // never cache a failed init
    throw e;
  });
  return g.__arenaDb;
}

export { schema };
