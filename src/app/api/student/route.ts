import { getDb, schema } from "@/db/client";
import { studentApplicationsOpen } from "@/config/site";
import { applicationReceivedMail, sendMail } from "@/lib/email";
import { guard, json, makeRef } from "@/lib/security";
import { storage, validateResume } from "@/lib/storage";
import { fieldErrors, studentSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** multipart/form-data: `data` (JSON string) + optional `resume` (PDF). */
export async function POST(req: Request) {
  const blocked = guard(req, "student", 6);
  if (blocked) return blocked;
  if (!studentApplicationsOpen) return json({ error: "closed", message: "Applications are not open right now." }, 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "bad_request", message: "Could not read the form." }, 400);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return json({ error: "bad_request", message: "Malformed submission." }, 400);
  }

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const d = parsed.data;

  let resumeKey: string | undefined;
  let resumeName: string | undefined;
  const file = form.get("resume");
  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const problem = validateResume(file, bytes);
    if (problem) return json({ error: "validation", fields: { resume: problem } }, 422);
    resumeKey = await storage.put(bytes, "pdf");
    resumeName = file.name.replace(/[^\w.\- ]/g, "_").slice(0, 120);
  }

  const db = await getDb();
  const ref = makeRef("ARN-S");
  try {
    await db.insert(schema.studentApplications).values({ ...d, ref, resumeKey, resumeName });
  } catch (e) {
    if (resumeKey) await storage.remove(resumeKey);
    console.error("[student] insert failed", (e as Error).message);
    return json({ error: "server", message: "We could not save your application. Please try again." }, 500);
  }

  const mail = await sendMail(applicationReceivedMail(d.fullName, ref, d.email));
  return json({ ok: true, ref, emailSent: mail.sent }, 201);
}
