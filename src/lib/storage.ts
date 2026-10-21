import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

/**
 * Private file storage. Files are never served from /public; they are read
 * only through admin-authorised routes. Two drivers:
 *  - local disk: development and single-server hosting.
 *  - postgres (the `stored_files` table): serverless hosts, whose disks are read-only or ephemeral. Résumés are at
 *    most 2 MB, so this needs no extra service and is backed up and erased with the rest of the data. If volume
 *    ever outgrows it, add an object-storage driver behind this same interface.
 * The postgres driver is chosen when DATABASE_URL is set (override with STORAGE_DRIVER=local|postgres).
 */
export interface Storage {
  put(bytes: Buffer, ext: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
}

const root = () => process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "uploads");

export const localStorageDriver: Storage = {
  async put(bytes, ext) {
    await mkdir(root(), { recursive: true });
    const key = `${randomUUID()}.${ext}`;
    await writeFile(path.join(root(), key), bytes, { flag: "wx" });
    return key;
  },
  async get(key) {
    if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(key)) return null; // blocks traversal
    try {
      return await readFile(path.join(root(), key));
    } catch {
      return null;
    }
  },
  async remove(key) {
    if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(key)) return;
    await unlink(path.join(root(), key)).catch(() => {});
  },
};

const KEY = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

export const dbStorageDriver: Storage = {
  async put(bytes, ext) {
    const key = `${randomUUID()}.${ext}`;
    await (await getDb()).insert(schema.storedFiles).values({ key, bytes, size: bytes.length });
    return key;
  },
  async get(key) {
    if (!KEY.test(key)) return null;
    const [row] = await (await getDb()).select().from(schema.storedFiles).where(eq(schema.storedFiles.key, key));
    return row ? row.bytes : null;
  },
  async remove(key) {
    if (!KEY.test(key)) return;
    await (await getDb()).delete(schema.storedFiles).where(eq(schema.storedFiles.key, key));
  },
};

export function storageDriverName(env: Record<string, string | undefined> = process.env): "postgres" | "local" {
  if (env.STORAGE_DRIVER === "local" || env.STORAGE_DRIVER === "postgres") return env.STORAGE_DRIVER;
  return env.DATABASE_URL ? "postgres" : "local";
}

const pick = () => (storageDriverName() === "postgres" ? dbStorageDriver : localStorageDriver);

export const storage: Storage = {
  put: (bytes, ext) => pick().put(bytes, ext),
  get: (key) => pick().get(key),
  remove: (key) => pick().remove(key),
};

export const RESUME_MAX_BYTES = 2 * 1024 * 1024;

/** Accepts only genuine PDFs (magic bytes), not just a .pdf filename. */
export function validateResume(file: File, bytes: Buffer): string | null {
  if (bytes.length === 0) return "The résumé file is empty.";
  if (bytes.length > RESUME_MAX_BYTES) return "Résumé must be 2 MB or smaller.";
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") return "Résumé must be a PDF file.";
  if (file.type && file.type !== "application/pdf") return "Résumé must be a PDF file.";
  return null;
}
