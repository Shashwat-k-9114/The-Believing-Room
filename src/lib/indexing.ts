/**
 * Only the production deployment may be indexed. Vercel preview and development deployments set VERCEL_ENV to
 * "preview" / "development"; anywhere else (local, self-hosted) it is unset and the site stays indexable.
 */
export function isIndexable(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.VERCEL_ENV;
  return !v || v === "production";
}
