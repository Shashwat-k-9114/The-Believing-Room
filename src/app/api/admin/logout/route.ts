import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/admin/session";
import { json, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Cross-site request blocked." }, 403);
  (await cookies()).delete(SESSION_COOKIE);
  return json({ ok: true });
}
