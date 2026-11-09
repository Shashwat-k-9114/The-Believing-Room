import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

/**
 * Keeps the admin portal and its API behind the sign-in cookie. Pages and route handlers check again
 * themselves; this is the first gate, not the only one.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const open = pathname === "/admin/login" || pathname === "/api/admin/login";

  if (!open && !(await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value))) {
    if (isApi) {
      return NextResponse.json({ error: "unauthorized", message: "Please sign in again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
