// Apply the SQL migrations in ./drizzle to the database named by DATABASE_URL, then exit.
//
//   DATABASE_URL=postgres://... DB_MIGRATE_CONFIRM_HOST=<the host in that URL> npm run db:migrate
//
// Safety: it prints the target host and database (never the credentials) and refuses to run unless
// DB_MIGRATE_CONFIRM_HOST equals that host, so a stale DATABASE_URL in your shell cannot migrate the wrong database.
// It only ever applies migrations that have not run yet; it never drops anything.
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Nothing to migrate.");
  process.exit(2);
}
let target;
try {
  const u = new URL(url);
  target = { host: u.hostname, db: u.pathname.replace(/^\//, "") };
} catch {
  console.error("DATABASE_URL is not a valid URL.");
  process.exit(2);
}
console.log(`Target: host=${target.host} database=${target.db}`);
if (process.env.DB_MIGRATE_CONFIRM_HOST !== target.host) {
  console.error(`Refusing to run. Set DB_MIGRATE_CONFIRM_HOST=${target.host} to confirm this is the intended database.`);
  process.exit(3);
}
const pool = new pg.Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15000 });
try {
  const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "drizzle");
  await migrate(drizzle(pool), { migrationsFolder: folder });
  const r = await pool.query("select count(*)::int as n from drizzle.__drizzle_migrations");
  console.log(`Done. ${r.rows[0].n} migrations are applied.`);
} catch (e) {
  console.error("Migration failed:", e instanceof Error ? e.message : e, e?.cause?.message ?? "");
  process.exitCode = 1;
} finally {
  await pool.end();
}
