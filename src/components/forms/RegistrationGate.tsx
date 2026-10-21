import type { ReactNode } from "react";
import { brand } from "@/config/site";
import { registrationMode } from "@/lib/registration-mode";

/**
 * Wraps any form that collects a visitor's personal data (candidate, audience, notification list).
 * closed: a plain notice replaces the form. preview-synthetic: the form, under a "made-up data only" banner. open: the form.
 * The matching API routes enforce the same mode, so hiding the form is never the only control.
 */
export function RegistrationGate({ children, what = "registrations" }: { children: ReactNode; what?: string }) {
  const mode = registrationMode();
  if (mode === "closed") {
    return (
      <div role="status" data-registration-closed className="glass glass-frost max-w-xl p-8 [--r:1.6rem]">
        <p className="eyebrow mb-3">Not open yet</p>
        <p className="display text-2xl">The {what} are not open yet.</p>
        <p className="mt-3 text-[var(--fg-dim)]">
          Nothing is being collected right now. We will open them once the privacy notice and the participation terms are final. Questions in the meantime: <a className="link-u" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>.
        </p>
      </div>
    );
  }
  return (
    <>
      {mode === "preview-synthetic" && (
        <p role="note" data-registration-synthetic className="mb-6 rounded-2xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-5 py-4 text-sm">
          <strong>Test preview.</strong> This copy of the site is for testing. Enter made-up details only. Do not use your real name, email, phone number or résumé. Entries are not read by anyone and are deleted.
        </p>
      )}
      {children}
    </>
  );
}
