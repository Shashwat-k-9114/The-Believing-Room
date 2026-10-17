import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Private file storage. Files are never served from /public; they are read
 * only through admin-authorised routes. The local driver is for development
 * and single-server hosting. Serverless hosts have read-only/ephemeral disks:
 * add an S3/R2/Blob driver implementing this interface before deploying there.
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

export const storage: Storage = localStorageDriver;

export const RESUME_MAX_BYTES = 2 * 1024 * 1024;

/** Accepts only genuine PDFs (magic bytes), not just a .pdf filename. */
export function validateResume(file: File, bytes: Buffer): string | null {
  if (bytes.length === 0) return "The résumé file is empty.";
  if (bytes.length > RESUME_MAX_BYTES) return "Résumé must be 2 MB or smaller.";
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") return "Résumé must be a PDF file.";
  if (file.type && file.type !== "application/pdf") return "Résumé must be a PDF file.";
  return null;
}
