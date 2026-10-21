import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { basicAuthOk, gateMode } from "@/lib/site-gate";
import { proxy } from "@/proxy";
import { registrationMode } from "@/lib/registration-mode";

const PW = "correct horse battery staple";
const basic = (pw: string) => "Basic " + Buffer.from(`anyone:${pw}`).toString("base64");

describe("gate mode", () => {
  it("is open locally and in tests", () => {
    expect(gateMode({})).toBe("open");
    expect(gateMode({ NODE_ENV: "production" })).toBe("open");
  });
  it("fails closed on Vercel preview and on production until launch is approved", () => {
    expect(gateMode({ VERCEL_ENV: "preview" })).toBe("closed");
    expect(gateMode({ VERCEL_ENV: "development" })).toBe("closed");
    expect(gateMode({ VERCEL_ENV: "production" })).toBe("closed");
    expect(gateMode({ VERCEL_ENV: "production", PUBLIC_LAUNCH_APPROVED: "yes" })).toBe("closed");
    expect(gateMode({ VERCEL_ENV: "production", PUBLIC_LAUNCH_APPROVED: "true" })).toBe("open");
  });
  it("a password switches to Basic auth anywhere, but only a long one counts", () => {
    expect(gateMode({ VERCEL_ENV: "preview", SITE_GATE_PASSWORD: PW })).toBe("password");
    expect(gateMode({ SITE_GATE_PASSWORD: PW })).toBe("password");
    expect(gateMode({ VERCEL_ENV: "preview", SITE_GATE_PASSWORD: "short" })).toBe("closed");
  });
  it("SITE_GATE=off opts a preview out, but never opens an unapproved production", () => {
    expect(gateMode({ VERCEL_ENV: "preview", SITE_GATE: "off" })).toBe("open");
    expect(gateMode({ VERCEL_ENV: "production", SITE_GATE: "off" })).toBe("open");
  });
  it("checks the password in constant time and rejects malformed headers", () => {
    expect(basicAuthOk(basic(PW), PW)).toBe(true);
    expect(basicAuthOk(basic(PW + "x"), PW)).toBe(false);
    expect(basicAuthOk(basic(""), PW)).toBe(false);
    expect(basicAuthOk(null, PW)).toBe(false);
    expect(basicAuthOk("Bearer abc", PW)).toBe(false);
    expect(basicAuthOk("Basic !!!not-base64", PW)).toBe(false);
  });
});

describe("proxy (the real request handler)", () => {
  const saved = { ...process.env };
  afterEach(() => {
    for (const k of ["VERCEL_ENV", "SITE_GATE_PASSWORD", "SITE_GATE", "PUBLIC_LAUNCH_APPROVED"]) delete process.env[k];
    Object.assign(process.env, saved);
  });
  const req = (path = "/", headers: Record<string, string> = {}) => new NextRequest(`http://localhost${path}`, { headers });

  it("lets everything through when open", () => {
    expect(proxy(req()).status).toBe(200);
  });
  it("answers 503 with noindex on a preview with no password configured", () => {
    process.env.VERCEL_ENV = "preview";
    const res = proxy(req("/the-show"));
    expect(res.status).toBe(503);
    expect(res.headers.get("x-robots-tag")).toMatch(/noindex/);
  });
  it("challenges with 401 when a password is set, accepts the right one, rejects the wrong one", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.SITE_GATE_PASSWORD = PW;
    const denied = proxy(req());
    expect(denied.status).toBe(401);
    expect(denied.headers.get("www-authenticate")).toMatch(/^Basic /);
    expect(proxy(req("/", { authorization: basic("wrong") })).status).toBe(401);
    expect(proxy(req("/", { authorization: basic(PW) })).status).toBe(200);
  });
  it("covers API routes and exempts only the payment-provider webhook", () => {
    process.env.VERCEL_ENV = "preview";
    expect(proxy(req("/api/candidate")).status).toBe(503);
    expect(proxy(req("/api/admin/login")).status).toBe(503);
    expect(proxy(req("/api/webhooks/razorpay")).status).toBe(200);
    expect(proxy(req("/api/webhooks-evil")).status).toBe(503);
  });
});

describe("registration mode", () => {
  it("is closed unless explicitly opened", () => {
    expect(registrationMode({})).toBe("closed");
    expect(registrationMode({ REGISTRATION_MODE: "" })).toBe("closed");
    expect(registrationMode({ REGISTRATION_MODE: "yes" })).toBe("closed");
    expect(registrationMode({ REGISTRATION_MODE: "Preview-Synthetic" })).toBe("preview-synthetic");
  });
  it("'open' needs a written-approval reference, or it stays closed", () => {
    expect(registrationMode({ REGISTRATION_MODE: "open" })).toBe("closed");
    expect(registrationMode({ REGISTRATION_MODE: "open", REGISTRATION_APPROVAL_REF: "x" })).toBe("closed");
    expect(registrationMode({ REGISTRATION_MODE: "open", REGISTRATION_APPROVAL_REF: "founders+counsel 2026-11-03" })).toBe("open");
  });
});
