import "server-only";
import { cookies } from "next/headers";
import { hmacHex, makeToken, safeEqual } from "./security";

const COOKIE = "arena_admin";
const TTL_MS = 8 * 60 * 60 * 1000;
const DEVICE_COOKIE = "arena_device";
const DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

/**
 * "Known device" marker, set after a successful sign-in. It grants no access. It only exempts the browser from the
 * shared, all-clients failed-login cap (see /api/admin/login), so that an attacker who burns that cap cannot also
 * lock the organiser out of a browser they have already used. A stolen marker still faces the per-IP and
 * per-device limits and still needs the password.
 */
export async function issueDeviceMarker(): Promise<void> {
  if (!adminConfigured()) return;
  const payload = Buffer.from(JSON.stringify({ id: makeToken(9), exp: Date.now() + DEVICE_TTL_MS })).toString("base64url");
  (await cookies()).set(DEVICE_COOKIE, `${payload}.${sign("device." + payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_TTL_MS / 1000,
  });
}

/** The verified device id, or null when the marker is missing, forged or expired. */
export async function knownDeviceId(): Promise<string | null> {
  if (!adminConfigured()) return null;
  const raw = (await cookies()).get(DEVICE_COOKIE)?.value;
  const [payload, sig] = (raw ?? "").split(".");
  if (!payload || !sig || !safeEqual(sig, sign("device." + payload))) return null;
  try {
    const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof id === "string" && typeof exp === "number" && exp > Date.now() ? id : null;
  } catch {
    return null;
  }
}
