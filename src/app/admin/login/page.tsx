import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured, SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/** Only same-site /admin paths are valid destinations after signing in. */
const safeNext = (n: string | undefined) => (n && /^\/admin(\/|\?|$)/.test(n) && !n.startsWith("//") ? n : "/admin");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value)) redirect(safeNext(next));
  return <LoginForm next={safeNext(next)} configured={adminConfigured()} />;
}
