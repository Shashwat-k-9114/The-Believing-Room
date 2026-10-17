import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const MIGRATIONS = path.join(/*turbopackIgnore: true*/ process.cwd(), "drizzle");

/**
 * With DATABASE_URL set, uses PostgreSQL via node-postgres.
 * Without it, uses an embedded on-disk PostgreSQL (PGlite) in .data/pglite
 * so local development needs no external service. Same SQL dialect, same schema.
 */
async function create(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url, max: 5 });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    return db as unknown as Db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const inMemory = process.env.PGLITE_DIR === "memory://";
  if (!inMemory) mkdirSync(path.dirname(dir), { recursive: true }); // PGlite creates only the leaf folder
  const client = new PGlite(inMemory ? undefined : dir);
  const db = drizzlePglite(client, { schema });
  await migratePglite(db, { migrationsFolder: MIGRATIONS });
  return db;
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
