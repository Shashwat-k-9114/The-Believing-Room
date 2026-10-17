import "server-only";
import { cookies } from "next/headers";
import { hmacHex, safeEqual } from "./security";

const COOKIE = "arena_admin";
const TTL_MS = 8 * 60 * 60 * 1000;

export function adminConfigured(): boolean {
  const p = process.env.ADMIN_PASSWORD ?? "";
  const s = process.env.SESSION_SECRET ?? "";
  return p.length >= 12 && s.length >= 32;
}

export function checkPassword(candidate: string): boolean {
  if (!adminConfigured()) return false;
  return safeEqual(hmacHex("pw", candidate), hmacHex("pw", process.env.ADMIN_PASSWORD!));
}

function sign(payload: string) {
  return hmacHex(process.env.SESSION_SECRET!, payload);
}

export async function createSession() {
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp, sub: "organizer" })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Server-side check. Call at the top of every admin page, action and route. */
export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("UNAUTHORIZED");
}
