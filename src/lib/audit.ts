import "server-only";
import { getDb, schema } from "@/db/client";

export async function audit(action: string, entity: string, entityId?: string, meta?: Record<string, unknown>) {
  const db = await getDb();
  await db.insert(schema.auditLog).values({ actor: "organizer", action, entity, entityId, meta });
}
