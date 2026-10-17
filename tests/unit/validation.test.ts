import { describe, expect, it } from "vitest";
import { audienceSchema, phone, studentSchema } from "@/lib/validation";
import { priceBreakdown, pricing } from "@/config/site";
import { validateResume } from "@/lib/storage";

const validStudent = {
  fullName: "Asha Rao",
  email: "Asha@Example.com ",
  phone: "+91 98765 43210",
  college: "Example Institute",
  course: "B.Tech CSE",
  gradYear: new Date().getFullYear() + 1,
  industry: "it-technology",
  skills: "React, Python",
  pitchSummary: "I built a tool that helps rural clinics schedule vaccine stock and I can demo it live.",
  consentTerms: true,
  consentPrivacy: true,
};

describe("phone", () => {
  it.each([
    ["9876543210", "9876543210"],
    ["+91 98765-43210", "9876543210"],
    ["09876543210", "9876543210"],
  ])("normalises %s", (input, out) => expect(phone.parse(input)).toBe(out));
  it.each(["12345", "5876543210", "98765432101", "abcdefghij"])("rejects %s", (v) =>
    expect(phone.safeParse(v).success).toBe(false),
  );
});

describe("studentSchema", () => {
  it("accepts a valid application and normalises fields", () => {
    const r = studentSchema.parse(validStudent);
    expect(r.email).toBe("asha@example.com");
    expect(r.phone).toBe("9876543210");
    expect(r.consentFilming).toBe(false); // media consent is never implied
    expect(r.consentPublishPitch).toBe(false);
  });
  it("requires terms and privacy consent explicitly", () => {
    expect(studentSchema.safeParse({ ...validStudent, consentTerms: false }).success).toBe(false);
    expect(studentSchema.safeParse({ ...validStudent, consentPrivacy: undefined }).success).toBe(false);
  });
  it("rejects unknown industries and non-http links", () => {
    expect(studentSchema.safeParse({ ...validStudent, industry: "crypto" }).success).toBe(false);
    expect(studentSchema.safeParse({ ...validStudent, githubUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("strips control characters", () => {
    const r = studentSchema.parse({ ...validStudent, fullName: "Asha\u0000 Rao" });
    expect(r.fullName).toBe("Asha Rao");
  });
});

describe("audienceSchema and pricing", () => {
  const base = { name: "Ravi K", email: "r@example.com", phone: "9876543210", quantity: 2, consentTerms: true, consentPrivacy: true, consentFilming: true };
  it("caps quantity", () => {
    expect(audienceSchema.safeParse({ ...base, quantity: pricing.maxAudienceQuantity + 1 }).success).toBe(false);
    expect(audienceSchema.safeParse({ ...base, quantity: 0 }).success).toBe(false);
  });
  it("requires the filming acknowledgement", () => {
    expect(audienceSchema.safeParse({ ...base, consentFilming: false }).success).toBe(false);
  });
  it("computes totals from config only", () => {
    expect(priceBreakdown("audience", 2).total).toBe(pricing.audience.amount * 2);
    expect(priceBreakdown("candidate").total).toBe(pricing.candidate.amount);
  });
});

describe("validateResume", () => {
  const pdf = Buffer.from("%PDF-1.7\n...");
  it("accepts a PDF", () => expect(validateResume(new File([pdf], "cv.pdf", { type: "application/pdf" }), pdf)).toBeNull());
  it("rejects a renamed non-PDF", () => {
    const exe = Buffer.from("MZ\x90\x00");
    expect(validateResume(new File([exe], "cv.pdf", { type: "application/pdf" }), exe)).toMatch(/PDF/);
  });
  it("rejects oversize and empty", () => {
    const big = Buffer.concat([pdf, Buffer.alloc(2 * 1024 * 1024)]);
    expect(validateResume(new File([big], "cv.pdf"), big)).toMatch(/2 MB/);
    expect(validateResume(new File([], "cv.pdf"), Buffer.alloc(0))).toMatch(/empty/);
  });
});
