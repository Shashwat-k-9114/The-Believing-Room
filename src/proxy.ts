import { NextResponse, type NextRequest } from "next/server";
import { basicAuthOk, gateMode, GATE_EXEMPT } from "@/lib/site-gate";

/** See src/lib/site-gate.ts. Runs before every route; open mode returns immediately. */
export function proxy(req: NextRequest) {
  const mode = gateMode();
  if (mode === "open" || GATE_EXEMPT.test(req.nextUrl.pathname)) return NextResponse.next();
  const noindex = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
  if (mode === "password") {
    if (basicAuthOk(req.headers.get("authorization"), process.env.SITE_GATE_PASSWORD!)) {
      const res = NextResponse.next();
      for (const [k, v] of Object.entries(noindex)) res.headers.set(k, v);
      return res;
    }
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { ...noindex, "WWW-Authenticate": 'Basic realm="The Believing Room (private)", charset="UTF-8"' },
    });
  }
  return new NextResponse("This site is not publicly available yet.", { status: 503, headers: { ...noindex, "Content-Type": "text/plain; charset=utf-8" } });
}

export const config = { matcher: "/((?!_next/static|_next/image).*)" };
