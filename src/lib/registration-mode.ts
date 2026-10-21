/**
 * Who may submit personal data through the registration forms.
 *
 *  closed             (default everywhere) no candidate, audience or waitlist submissions are accepted, and the forms
 *                     are replaced by a notice. Nothing personal is collected.
 *  preview-synthetic  forms work, under a banner telling testers to enter made-up data only. For a protected preview
 *                     against a disposable database.
 *  open               real people may register. Honoured only when REGISTRATION_APPROVAL_REF is also set to a short
 *                     reference to the written approval (privacy notice, candidate terms, refund policy). Without it
 *                     the site stays closed: a typo or a copied variable must not open registrations.
 *
 * Business enquiries (sponsor, company, college, contact) are not governed by this switch.
 */
export type RegistrationMode = "closed" | "preview-synthetic" | "open";

export function registrationMode(env: Record<string, string | undefined> = process.env): RegistrationMode {
  const v = (env.REGISTRATION_MODE ?? "").trim().toLowerCase();
  if (v === "preview-synthetic") return "preview-synthetic";
  if (v === "open" && (env.REGISTRATION_APPROVAL_REF ?? "").trim().length >= 6) return "open";
  return "closed";
}

export const registrationAccepting = (env: Record<string, string | undefined> = process.env) => registrationMode(env) !== "closed";

export const REGISTRATION_CLOSED_MESSAGE = "Registrations are not open yet. Nothing is being collected right now.";
