import { readFile } from "node:fs/promises";
import path from "node:path";
import { PROSPECTUS_FILE } from "@/config/ecosystem";
import { prospectusApproved } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves the sponsorship prospectus only when (1) the organiser has recorded it as reviewed and externally approved and
 * (2) the file exists in /private. Otherwise a plain 404, so the route reveals nothing about drafts.
 */
export async function GET() {
  const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  if (!(await prospectusApproved())) return notFound();
  try {
    const file = await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), ...PROSPECTUS_FILE));
    if (file.subarray(0, 5).toString("latin1") !== "%PDF-") return notFound();
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="the-believing-room-sponsorship-prospectus.pdf"',
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
