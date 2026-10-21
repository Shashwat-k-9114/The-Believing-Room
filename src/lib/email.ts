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

export function shortlistedMail(name: string, ref: string, payUrl: string, to: string): Mail {
  const subject = `You have been shortlisted for ${brand.name} (${ref})`;
  const text = `Hi ${name},

Your application ${ref} has been shortlisted. Please confirm your place using your private link: ${payUrl}

Shortlisting is not a guarantee of an offer. Selection depends entirely on the panel's decision.`;
  const html = `<p>Hi ${esc(name)},</p><p>Your application <strong>${esc(ref)}</strong> has been shortlisted. <a href="${esc(payUrl)}">Confirm your place</a> using your private link.</p><p>Shortlisting is not a guarantee of an offer. Selection depends entirely on the panel's decision.</p>`;
  return { to, subject, text, html };
}

export function ticketMail(name: string, ref: string, url: string, to: string): Mail {
  const subject = `Your ${brand.name} tickets (${ref})`;
  const text = `Hi ${name},\n\nPayment confirmed. Your tickets are here: ${url}\n\nShow the QR code at entry. Food is included.`;
  const html = `<p>Hi ${esc(name)},</p><p>Payment confirmed. <a href="${esc(url)}">Open your tickets</a>. Show the QR code at entry. Food is included.</p>`;
  return { to, subject, text, html };
}

type SponsorMailInput = { organization: string; contactName: string; role: string; email: string; phone?: string; interest: string; category: string; budgetRange?: string; message?: string };

export function sponsorEnquiryOrganiserMail(d: SponsorMailInput, ref: string, to: string): Mail {
  const subject = `New partnership enquiry: ${d.organization} (${ref})`;
  const lines = [
    `Reference: ${ref}`, `Organisation: ${d.organization}`, `Contact: ${d.contactName}${d.role ? `, ${d.role}` : ""}`, `Email: ${d.email}`, `Phone: ${d.phone ?? "not given"}`,
    `Interest: ${d.interest}`, `Type: ${d.category}`, `Indicative budget: ${d.budgetRange ?? "not given"}`, "", d.message ?? "(no message)",
  ];
  return { to, subject, text: lines.join("\n"), html: lines.map((l) => `<p>${esc(l)}</p>`).join("") };
}

export function sponsorEnquiryReceiptMail(name: string, ref: string, to: string): Mail {
  const subject = `We received your partnership enquiry (${ref})`;
  const text = `Hi ${name},\n\nThank you for your interest in partnering with ${brand.name}. Your reference is ${ref}.\n\nThis is a receipt, not an agreement. A member of the team will review your enquiry and reply by email. Sponsorship formats are proposals until agreed in writing, and no audience reach or recruitment outcome is promised.\n\n${brand.name}`;
  const html = `<p>Hi ${esc(name)},</p><p>Thank you for your interest in partnering with ${esc(brand.name)}. Your reference is <strong>${esc(ref)}</strong>.</p><p>This is a receipt, not an agreement. A member of the team will review your enquiry and reply by email. Sponsorship formats are proposals until agreed in writing, and no audience reach or recruitment outcome is promised.</p>`;
  return { to, subject, text, html };
}
