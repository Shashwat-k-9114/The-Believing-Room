import fs from "node:fs";
import path from "node:path";

/**
 * Destructive-reset safety for the e2e suite.
 *
 * The suite wipes an embedded database before every run. That is only acceptable when we can PROVE the target is a
 * disposable, local, throw-away PGlite directory. If anything is ambiguous this throws and nothing is deleted.
 */
export const E2E_DB_DIR = path.join(".data", "pglite-e2e");
export const E2E_DB_PREFIX = "pglite-e2e";
/** Written into the directory by the suite so later runs can recognise it as theirs. */
export const SENTINEL = ".tbr-disposable-test-db";

/** Variables that could point something at a real, shared or hosted database. */
const DB_ENV = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_PRISMA_URL", "POSTGRES_URL_NO_SSL"];
/** Variables that indicate a hosted (preview/production) environment. */
const HOSTED_ENV = ["VERCEL_ENV", "VERCEL_URL", "RAILWAY_ENVIRONMENT", "RENDER", "FLY_APP_NAME"];

export class IsolationError extends Error {
  constructor(message: string) {
    super(`Refusing to reset the e2e database: ${message}. Nothing was deleted.`);
  }
}

export function resolveTestDbDir(root: string, dir = E2E_DB_DIR) {
  return path.resolve(root, dir);
}

/** Throws unless `dir` is provably a disposable PGlite test directory directly inside <root>/.data. Has no side effects. */
export function assertDisposableTarget(opts: { root: string; dir: string; env: Record<string, string | undefined> }) {
  const { root, env } = opts;
  const dir = path.resolve(opts.dir);
  for (const k of DB_ENV) if (env[k]) throw new IsolationError(`${k} is set in this shell, so the target database cannot be proven to be local`);
  for (const k of HOSTED_ENV) if (env[k]) throw new IsolationError(`${k} is set, which means this looks like a hosted environment`);
  if (env.NODE_ENV === "production") throw new IsolationError("NODE_ENV is production");

  const dataRoot = path.resolve(root, ".data");
  const rel = path.relative(dataRoot, dir);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || rel.includes(path.sep)) {
    throw new IsolationError(`${dir} is not a direct child of ${dataRoot}`);
  }
  if (!path.basename(dir).startsWith(E2E_DB_PREFIX)) throw new IsolationError(`${path.basename(dir)} does not start with "${E2E_DB_PREFIX}"`);

  if (!fs.existsSync(dir)) return; // nothing to delete, so nothing to protect
  if (fs.lstatSync(dir).isSymbolicLink()) throw new IsolationError(`${dir} is a symbolic link or junction`);
  if (!fs.statSync(dir).isDirectory()) throw new IsolationError(`${dir} is not a directory`);
  const entries = fs.readdirSync(dir);
  if (entries.length > 0 && !entries.includes(SENTINEL) && !entries.includes("PG_VERSION")) {
    throw new IsolationError(`${dir} is not recognisably an embedded PostgreSQL test database`);
  }
}

/** Prove isolation, then wipe and re-mark the directory. The only place the suite deletes data. */
export function resetTestDatabase(root: string, env: Record<string, string | undefined> = process.env) {
  const dir = resolveTestDbDir(root);
  assertDisposableTarget({ root, dir, env });
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, SENTINEL), "Disposable end-to-end test database. Safe to delete.\n");
  return dir;
}
