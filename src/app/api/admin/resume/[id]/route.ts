import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { isAdmin } from "@/lib/admin-auth";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

/** Admin-only résumé download. Files are never publicly addressable. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const db = await getDb();
  const [row] = await db.select().from(schema.studentApplications).where(eq(schema.studentApplications.id, id));
  if (!row?.resumeKey || row.deletedAt) return new Response("Not found", { status: 404 });
  const bytes = await storage.get(row.resumeKey);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.ref}-resume.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
