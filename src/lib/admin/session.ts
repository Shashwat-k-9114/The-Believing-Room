/**
 * Admin sign-in: one shared password, a signed httpOnly cookie, no database.
 *   ADMIN_PASSWORD        the sign-in password (10+ characters)
 *   ADMIN_SESSION_SECRET  optional extra signing secret; changing it (or the password) signs everyone out
 *
 * Uses Web Crypto only, so the same code runs in the proxy and in route handlers.
 */
export const SESSION_COOKIE = "tbr_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

const enc = new TextEncoder();
const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

function password(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length >= 10 ? pw : null;
}

export const adminConfigured = () => password() !== null;

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(payload: string): Promise<string> {
  const material = `${process.env.ADMIN_SESSION_SECRET ?? ""}\n${password() ?? ""}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(material), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload))));
}

export async function passwordMatches(input: string): Promise<boolean> {
  const pw = password();
  if (!pw) return false;
  // Hash both sides so the comparison is constant-length whatever was typed.
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(input)), crypto.subtle.digest("SHA-256", enc.encode(pw))]);
  return safeEqual(toHex(new Uint8Array(a)), toHex(new Uint8Array(b)));
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(8)));
  const payload = `${exp}.${nonce}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!token || !password()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) <= Math.floor(now / 1000)) return false;
  return safeEqual(sig, await sign(`${exp}.${nonce}`));
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export const isAdminRequest = (req: Request) => verifySessionToken(readCookie(req.headers.get("cookie"), SESSION_COOKIE));
