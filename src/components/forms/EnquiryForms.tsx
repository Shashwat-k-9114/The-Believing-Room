"use client";

import { useState } from "react";
import { industryOptions } from "@/content/industries";
import { LiquidButton } from "../liquid/LiquidButton";
import { Check, FormAlert, postJson, readForm, SelectField, SuccessPanel, TextArea, TextField, type Errors } from "./ui";

function useEnquiry(url: string) {
  const [errors, setErrors] = useState<Errors>({});
  const [fail, setFail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref?: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFail("");
    const { ok, data } = await postJson(url, readForm(e.currentTarget));
    setBusy(false);
    if (ok) return setDone({ ref: data.ref });
    if (data.fields) setErrors(data.fields);
    else setFail(data.message ?? "Something went wrong. Please try again.");
  }
  return { errors, fail, busy, done, submit };
}

const COMPANY_INTERESTS = ["Hire interns", "Be a panelist", "Sponsor / brand visibility", "Appear on the show or podcast"];
const COLLEGE_INTERESTS = ["Send students to pitch", "Coordinated registrations", "Campus outreach", "Host a screening round"];

function Interests({ name, options }: { name: string; options: string[] }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="label mb-1 text-sm font-medium">What are you interested in?</legend>
      {options.map((o) => (
        <label key={o} className="check"><input type="checkbox" name={name} value={o} /> <span>{o}</span></label>
      ))}
    </fieldset>
  );
}

export function CompanyForm() {
  const f = useEnquiry("/api/enquiry/company");
  if (f.done)
    return (
      <SuccessPanel title="Enquiry received.">
        <p>Reference <strong className="mono text-[var(--fg)]">{f.done.ref}</strong>. A member of the team will review it and write to the work email you gave. This is not a commitment on either side.</p>
      </SuccessPanel>
    );
  return (
    <form onSubmit={f.submit} noValidate aria-label="Company partnership enquiry" className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="organization" label="Organisation" required autoComplete="organization" error={f.errors.organization} />
        <TextField name="contactName" label="Contact person" required autoComplete="name" error={f.errors.contactName} />
        <TextField name="role" label="Your role" required autoComplete="organization-title" error={f.errors.role} />
        <TextField name="email" label="Work email" type="email" required autoComplete="email" error={f.errors.email} />
        <SelectField name="industry" label="Primary industry" required options={industryOptions} error={f.errors.industry} />
        <SelectField name="mode" label="Internship mode" required options={[{ value: "onsite", label: "On-site" }, { value: "remote", label: "Remote" }, { value: "hybrid", label: "Hybrid" }]} error={f.errors.mode} />
      </div>
      <TextField name="functions" label="Internship functions you might hire for" required hint="e.g. backend engineering, equity research, performance marketing" error={f.errors.functions} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="openings" label="Expected number of openings" inputMode="numeric" hint="An estimate is fine. Not a commitment." error={f.errors.openings} />
        <TextField name="compensation" label="Expected stipend or compensation" hint="Optional now; shown publicly only if you confirm it." error={f.errors.compensation} />
      </div>
      <Interests name="interests" options={COMPANY_INTERESTS} />
      <TextArea name="message" label="Anything else we should know?" rows={4} maxLength={2000} error={f.errors.message} />
      {f.fail && <FormAlert>{f.fail}</FormAlert>}
      <div><LiquidButton type="submit" variant="primary" size="lg" disabled={f.busy}>{f.busy ? "Sending…" : "Send enquiry"}</LiquidButton></div>
    </form>
  );
}

export function CollegeForm() {
  const f = useEnquiry("/api/enquiry/college");
  if (f.done)
    return (
      <SuccessPanel title="Enquiry received.">
        <p>Reference <strong className="mono text-[var(--fg)]">{f.done.ref}</strong>. We’ll write to the email you gave to discuss how your students can take part.</p>
      </SuccessPanel>
    );
  return (
    <form onSubmit={f.submit} noValidate aria-label="College partnership enquiry" className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="institution" label="Institution" required error={f.errors.institution} />
        <TextField name="city" label="City" required error={f.errors.city} />
        <TextField name="contactName" label="Contact person" required autoComplete="name" error={f.errors.contactName} />
        <TextField name="role" label="Your role" required hint="e.g. Training & Placement Officer" error={f.errors.role} />
        <TextField name="email" label="Official email" type="email" required autoComplete="email" error={f.errors.email} />
        <TextField name="phone" label="Phone (optional)" type="tel" inputMode="tel" error={f.errors.phone} />
      </div>
      <TextField name="studentCount" label="Approximate students interested" inputMode="numeric" error={f.errors.studentCount} />
      <Interests name="interests" options={COLLEGE_INTERESTS} />
      <TextArea name="message" label="Anything else we should know?" rows={4} maxLength={2000} error={f.errors.message} />
      {f.fail && <FormAlert>{f.fail}</FormAlert>}
      <div><LiquidButton type="submit" variant="primary" size="lg" disabled={f.busy}>{f.busy ? "Sending…" : "Send enquiry"}</LiquidButton></div>
    </form>
  );
}

export function ContactForm() {
  const f = useEnquiry("/api/contact");
  if (f.done) return <SuccessPanel title="Message sent."><p>Thanks. We read every message and will reply to the email you gave.</p></SuccessPanel>;
  return (
    <form onSubmit={f.submit} noValidate aria-label="Contact form" className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Name" required autoComplete="name" error={f.errors.name} />
        <TextField name="email" label="Email" type="email" required autoComplete="email" error={f.errors.email} />
      </div>
      <SelectField
        name="topic" label="Topic" required error={f.errors.topic}
        options={[
          { value: "students", label: "I’m a student" }, { value: "audience", label: "Audience tickets" },
          { value: "companies", label: "I represent a company" }, { value: "colleges", label: "I represent a college" },
          { value: "media", label: "Media or collaboration" }, { value: "other", label: "Something else" },
        ]}
      />
      <TextArea name="message" label="Message" required rows={6} maxLength={3000} error={f.errors.message} />
      {f.fail && <FormAlert>{f.fail}</FormAlert>}
      <div><LiquidButton type="submit" variant="primary" size="lg" disabled={f.busy}>{f.busy ? "Sending…" : "Send message"}</LiquidButton></div>
    </form>
  );
}

export { Check };
