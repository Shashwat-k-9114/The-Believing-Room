import "server-only";

/**
 * Submissions are appended to a Google Sheet through a small Apps Script web app (see google-sheets/SETUP.md).
 *   GOOGLE_SHEET_WEBHOOK_URL  the web app's /exec URL
 *   GOOGLE_SHEET_SECRET       shared secret, also stored in the script's properties
 */
export const sheetsConfigured = () => Boolean(process.env.GOOGLE_SHEET_WEBHOOK_URL && process.env.GOOGLE_SHEET_SECRET);

export type Cell = string | number | boolean | null | undefined;

export async function appendRow(tab: string, columns: readonly string[], row: Record<string, Cell>): Promise<void> {
  const res = await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL!, {
    method: "POST",
    // text/plain keeps Apps Script from rejecting the request; the body is still JSON.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret: process.env.GOOGLE_SHEET_SECRET, tab, columns, row }),
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !body?.ok) throw new Error(body?.error ?? `Sheet responded ${res.status}`);
}
