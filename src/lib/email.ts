import "server-only";
import { brand, emailConfigured } from "@/config/site";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type MailResult = { sent: true } | { sent: false; reason: "not_configured" | "provider_error" };

/**
 * Sends through Resend's HTTPS API when RESEND_API_KEY + EMAIL_FROM are set.
 * Otherwise reports `not_configured` so the UI can say so truthfully instead
 * of promising an email that will never arrive.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  if (!emailConfigured()) return { sent: false, reason: "not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text }),
    });
    if (!res.ok) {
      console.error("[mail] provider rejected message", res.status);
      return { sent: false, reason: "provider_error" };
    }
    return { sent: true };
  } catch {
    console.error("[mail] provider unreachable");
    return { sent: false, reason: "provider_error" };
  }
}

export function applicationReceivedMail(name: string, ref: string, to: string): Mail {
  const subject = `We received your application (${ref})`;
  const text = `Hi ${name},\n\nWe received your application to pitch at ${brand.name}. Your reference is ${ref}.\n\nThis is a receipt, not a selection. Applications are screened by the organisers and we will write to you with the outcome. Applying is free; you pay nothing unless you are shortlisted and choose to confirm your place.\n\n${brand.name}`;
  const html = `<p>Hi ${esc(name)},</p><p>We received your application to pitch at ${esc(brand.name)}. Your reference is <strong>${esc(ref)}</strong>.</p><p>This is a receipt, not a selection. Applications are screened by the organisers and we will write to you with the outcome. Applying is free; you pay nothing unless you are shortlisted and choose to confirm your place.</p>`;
  return { to, subject, text, html };
}

export function ticketMail(name: string, ref: string, url: string, to: string): Mail {
  const subject = `Your ${brand.name} tickets (${ref})`;
  const text = `Hi ${name},\n\nPayment confirmed. Your tickets are here: ${url}\n\nShow the QR code at entry. Food is included.`;
  const html = `<p>Hi ${esc(name)},</p><p>Payment confirmed. <a href="${esc(url)}">Open your tickets</a>. Show the QR code at entry. Food is included.</p>`;
  return { to, subject, text, html };
}
