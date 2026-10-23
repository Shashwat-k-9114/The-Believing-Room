"use client";

import { useState } from "react";
import { BUDGET_RANGES, SPONSOR_INTERESTS } from "@/config/ecosystem";
import { LiquidButton } from "../liquid/LiquidButton";
import { Check, FormAlert, Honeypot, postJson, readForm, SelectField, SuccessPanel, TextArea, TextField, type Errors } from "./ui";

const TYPES = [
  { value: "business", label: "A business or brand" },
  { value: "recruitment_company", label: "A recruitment or staffing company" },
  { value: "education", label: "An education or training provider" },
  { value: "media_brand", label: "A media or content partner" },
  { value: "individual", label: "An individual supporter" },
  { value: "other", label: "Something else" },
];

export function SponsorForm({ defaultInterest }: { defaultInterest?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [fail, setFail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref?: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFail("");
    const { ok, data } = await postJson("/api/submit/sponsor", readForm(e.currentTarget));
    setBusy(false);
    if (ok) return setDone({ ref: data.ref });
    if (data.fields) setErrors(data.fields);
    else setFail(data.message ?? "Something went wrong. Please try again.");
  }

  if (done)
    return (
      <SuccessPanel title="Enquiry received.">
        <p>Reference <strong className="mono text-[var(--fg)]">{done.ref}</strong>. It has been saved and a member of the team will review it and reply to the email you gave.</p>
        <p>Please keep this reference. This is not an agreement; formats are proposals until agreed in writing.</p>
      </SuccessPanel>
    );

  return (
    <form onSubmit={submit} noValidate aria-label="Partnership enquiry" className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="organization" label="Organisation" required autoComplete="organization" error={errors.organization} />
        <TextField name="contactName" label="Contact person" required autoComplete="name" error={errors.contactName} />
        <TextField name="email" label="Business email" type="email" required autoComplete="email" error={errors.email} />
        <SelectField name="category" label="You are" required options={TYPES} error={errors.category} />
        <SelectField name="interest" label="Partnership interest" required defaultValue={defaultInterest ?? ""} options={SPONSOR_INTERESTS.map((v) => ({ value: v, label: v }))} error={errors.interest} />
      </div>
      <fieldset className="grid gap-5 sm:grid-cols-3">
        <legend className="eyebrow mb-4">Optional, if you would like to say more</legend>
        <TextField name="role" label="Your role (optional)" autoComplete="organization-title" error={errors.role} />
        <TextField name="phone" label="Business phone (optional)" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone} />
        <SelectField name="budgetRange" label="Indicative budget (optional)" placeholder="Prefer not to say" options={BUDGET_RANGES.map((v) => ({ value: v, label: v }))} error={errors.budgetRange} />
      </fieldset>
      <TextArea name="message" label="Tell us what you have in mind" rows={5} maxLength={3000} error={errors.message} hint="Optional. Goals, timing, content you would like to be part of." />
      <div className="grid gap-3">
        <Check name="consentContact" required error={errors.consentContact}>I agree to be contacted about this enquiry.</Check>
        <Check name="consentNoGuarantee" required error={errors.consentNoGuarantee}>I understand that formats are proposals until agreed in writing, and that no audience reach, views or recruitment outcomes are guaranteed.</Check>
      </div>
      <Honeypot />
      {fail && <FormAlert>{fail}</FormAlert>}
      <div><LiquidButton type="submit" variant="primary" size="lg" disabled={busy} aria-busy={busy}>{busy ? "Sending…" : "Send partnership enquiry"}</LiquidButton></div>
    </form>
  );
}
