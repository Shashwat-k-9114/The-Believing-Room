import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // The proxy already gates this route; checking again keeps the page safe if the proxy is ever misconfigured.
  if (!(await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value))) redirect("/admin/login");
  return <AdminApp />;
}
