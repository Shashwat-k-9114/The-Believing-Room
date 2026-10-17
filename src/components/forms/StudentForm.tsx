"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { industries, industryOptions } from "@/content/industries";
import { formatINR, pricing } from "@/config/site";
import { studentSchema, fieldErrors } from "@/lib/validation";
import { LiquidButton } from "../liquid/LiquidButton";
import { Check, FormAlert, SelectField, SuccessPanel, TextArea, TextField, type Errors } from "./ui";

const DRAFT_KEY = "arena-student-draft-v1";
const thisYear = new Date().getFullYear();

const initial = {
  fullName: "", email: "", phone: "", college: "", course: "", gradYear: String(thisYear + 1),
  industry: "", skills: "", portfolioUrl: "", githubUrl: "", linkedinUrl: "",
  pitchSummary: "", experience: "",
  consentTerms: false, consentPrivacy: false, consentFilming: false,
  consentPublishPitch: false, consentShowNameCollege: false, consentPromoClips: false,
};
type Values = typeof initial;

const STEPS = [
  { title: "You", fields: ["fullName", "email", "phone", "college", "course", "gradYear"] },
  { title: "Your arena", fields: ["industry", "skills", "portfolioUrl", "githubUrl", "linkedinUrl"] },
  { title: "Your pitch", fields: ["pitchSummary", "experience", "resume"] },
  { title: "Consent & send", fields: ["consentTerms", "consentPrivacy"] },
] as const;

export function StudentForm({ defaultIndustry }: { defaultIndustry?: string }) {
  const [v, setV] = useState<Values>({ ...initial, industry: industries.some((i) => i.slug === defaultIndustry) ? defaultIndustry! : "" });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState<{ ref: string; emailSent: boolean } | null>(null);
  const [resumed, setResumed] = useState(false);
  const file = useRef<File | null>(null);
  const [fileName, setFileName] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  // Save & resume: text answers only. Never consents, never the file.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Partial<Values>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      setV((p) => ({ ...p, ...d, industry: p.industry || d.industry || "", consentTerms: false, consentPrivacy: false, consentFilming: false, consentPublishPitch: false, consentShowNameCollege: false, consentPromoClips: false }));
      setResumed(true);
    } catch {}
  }, []);
  useEffect(() => {
    if (done) return;
    const { consentTerms, consentPrivacy, consentFilming, consentPublishPitch, consentShowNameCollege, consentPromoClips, ...text } = v;
    void consentTerms; void consentPrivacy; void consentFilming; void consentPublishPitch; void consentShowNameCollege; void consentPromoClips;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(text)); } catch {}
  }, [v, done]);

  const set = <K extends keyof Values>(k: K) => (val: Values[K]) => setV((p) => ({ ...p, [k]: val }));

  const validate = (only?: readonly string[]) => {
    const r = studentSchema.safeParse(v);
    const all: Errors = r.success ? {} : fieldErrors(r.error);
    const out: Errors = only ? Object.fromEntries(Object.entries(all).filter(([k]) => only.includes(k))) : all;
    if (only?.includes("resume") || !only) {
      const f = file.current;
      if (f && (f.size > 2 * 1024 * 1024 || (f.type && f.type !== "application/pdf"))) out.resume = "Résumé must be a PDF of 2 MB or less.";
    }
    return out;
  };

  const go = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const next = () => {
    const e = validate(STEPS[step].fields);
    setErrors(e);
    if (Object.keys(e).length) return;
    go(step + 1);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate();
    setErrors(all);
    if (Object.keys(all).length) {
      const bad = STEPS.findIndex((s) => s.fields.some((f) => all[f]));
      if (bad >= 0) go(bad);
      return;
    }
    setSending(true);
    setFail("");
    const fd = new FormData();
    fd.set("data", JSON.stringify(v));
    if (file.current) fd.set("resume", file.current);
    try {
      const res = await fetch("/api/student", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        setDone({ ref: data.ref, emailSent: !!data.emailSent });
        return;
      }
      if (data.fields) {
        setErrors(data.fields);
        const bad = STEPS.findIndex((s) => s.fields.some((f) => data.fields[f]));
        if (bad >= 0) go(bad);
      } else setFail(data.message ?? "Something went wrong. Your answers are saved here; please try again.");
    } catch {
      setFail("You appear to be offline. Your answers are saved in this browser; try again when you are back online.");
    } finally {
      setSending(false);
    }
  }

  if (done)
    return (
      <SuccessPanel title="Application received.">
        <p>
          Your reference is <strong className="mono text-[var(--fg)]">{done.ref}</strong>. Keep it: it’s how we’ll identify you.
        </p>
        <p>
          {done.emailSent
            ? "A receipt is on its way to your inbox."
            : "Email confirmations aren’t switched on for this server yet, so no receipt was sent. Please note your reference above."}
        </p>
        <p>
          <strong className="text-[var(--fg)]">What happens next:</strong> organisers screen applications against the published criteria for your industry. Being received is not
          being selected. Applying costs nothing; the {formatINR(pricing.student.amount)} Student Pass (food included) is requested only if you are shortlisted.
        </p>
        <div className="mt-2 flex gap-3">
          <LiquidButton href="/how-it-works" variant="glass">How it works</LiquidButton>
          <LiquidButton href="/" variant="quiet">Back home</LiquidButton>
        </div>
      </SuccessPanel>
    );

  return (
    <form onSubmit={submit} noValidate aria-label="Student application" className="grid gap-8">
      <ol className="flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`} />
            <p className={`mono mt-2 ${i === step ? "text-[var(--fg)]" : "text-[var(--fg-faint)]"} max-sm:hidden`}>{i + 1}. {s.title}</p>
          </li>
        ))}
      </ol>
      <p className="mono sm:hidden" aria-live="polite">Step {step + 1} of {STEPS.length}: {STEPS[step].title}</p>

      {resumed && step === 0 && <p className="glass p-4 text-sm [--r:1rem]" role="status">We restored your earlier answers from this browser. Consents always need re-confirming.</p>}

      <h2 ref={heading} tabIndex={-1} className="display text-4xl outline-none sm:text-5xl">{STEPS[step].title}</h2>

      {step === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="fullName" label="Full name" required autoComplete="name" value={v.fullName} onChange={set("fullName")} error={errors.fullName} />
          <TextField name="email" label="Email" type="email" required autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} />
          <TextField name="phone" label="Mobile number" type="tel" inputMode="tel" required autoComplete="tel" hint="10-digit Indian mobile. +91 is fine." value={v.phone} onChange={set("phone")} error={errors.phone} />
          <TextField name="gradYear" label="Graduation year" inputMode="numeric" required value={v.gradYear} onChange={set("gradYear")} error={errors.gradYear} />
          <TextField name="college" label="College or university" required autoComplete="organization" value={v.college} onChange={set("college")} error={errors.college} />
          <TextField name="course" label="Course or degree" required value={v.course} onChange={set("course")} error={errors.course} />
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5">
          <SelectField name="industry" label="Which arena will you pitch in?" required options={industryOptions} value={v.industry} onChange={set("industry")} error={errors.industry} />
          <TextField name="skills" label="Key skills" required hint="Comma-separated, e.g. React, Python, financial modelling" value={v.skills} onChange={set("skills")} error={errors.skills} />
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField name="portfolioUrl" label="Portfolio / Behance" type="url" inputMode="url" placeholder="https://" value={v.portfolioUrl} onChange={set("portfolioUrl")} error={errors.portfolioUrl} />
            <TextField name="githubUrl" label="GitHub" type="url" inputMode="url" placeholder="https://" value={v.githubUrl} onChange={set("githubUrl")} error={errors.githubUrl} />
            <TextField name="linkedinUrl" label="LinkedIn" type="url" inputMode="url" placeholder="https://" value={v.linkedinUrl} onChange={set("linkedinUrl")} error={errors.linkedinUrl} />
          </div>
          <p className="hint text-sm text-[var(--fg-faint)]">Links are optional but strongly help screening for Technology and Animation & Multimedia.</p>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5">
          <TextArea name="pitchSummary" label="Your pitch in a few sentences" required rows={6} maxLength={1200} hint="What will you show or argue on stage, and why should a panel care? (40+ characters)" value={v.pitchSummary} onChange={set("pitchSummary")} error={errors.pitchSummary} />
          <TextArea name="experience" label="Relevant projects or experience" rows={5} maxLength={1500} value={v.experience} onChange={set("experience")} error={errors.experience} />
          <div className="field">
            <label htmlFor="resume">Résumé (optional, PDF, up to 2 MB)</label>
            <input
              id="resume" name="resume" type="file" accept="application/pdf" className="input !py-3"
              aria-invalid={!!errors.resume}
              onChange={(e) => { file.current = e.target.files?.[0] ?? null; setFileName(file.current?.name ?? ""); setErrors((p) => ({ ...p, resume: "" })); }}
            />
            {fileName && !errors.resume && <p className="hint">Selected: {fileName}</p>}
            {errors.resume && <p role="alert" className="error-text">{errors.resume}</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6">
          <fieldset className="grid gap-4">
            <legend className="eyebrow mb-2">Required to apply</legend>
            <Check name="consentTerms" checked={v.consentTerms} onChange={set("consentTerms")} error={errors.consentTerms}>
              I have read the <Link className="underline" href="/terms" target="_blank">participation terms</Link> and understand that applying does not guarantee selection, a pitching slot or an internship.
            </Check>
            <Check name="consentPrivacy" checked={v.consentPrivacy} onChange={set("consentPrivacy")} error={errors.consentPrivacy}>
              I agree to my details being processed as set out in the <Link className="underline" href="/privacy" target="_blank">privacy notice</Link>.
            </Check>
          </fieldset>
          <fieldset className="grid gap-4 rounded-2xl border border-[var(--line)] p-5">
            <legend className="eyebrow px-2">Filming and publication: each is separate and optional</legend>
            <p className="text-sm text-[var(--fg-dim)]">Saying no to any of these will not affect your screening or selection. <Link className="underline" href="/media-consent">What each one means</Link>.</p>
            <Check name="consentFilming" checked={v.consentFilming} onChange={set("consentFilming")}>You may record me on the day if I pitch (recording only, not publication).</Check>
            <Check name="consentPublishPitch" checked={v.consentPublishPitch} onChange={set("consentPublishPitch")}>You may publish my recorded pitch on the YouTube channel.</Check>
            <Check name="consentShowNameCollege" checked={v.consentShowNameCollege} onChange={set("consentShowNameCollege")}>You may show my name and college alongside published content.</Check>
            <Check name="consentPromoClips" checked={v.consentPromoClips} onChange={set("consentPromoClips")}>You may use short clips of me in promotion and social media.</Check>
          </fieldset>
          <p className="text-sm text-[var(--fg-dim)]">
            Cost: applying is free. If shortlisted, the Student Pass is {formatINR(pricing.student.amount)}, food included, requested only then.
          </p>
        </div>
      )}

      {fail && <FormAlert>{fail}</FormAlert>}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && <LiquidButton variant="glass" onClick={() => go(step - 1)}>Back</LiquidButton>}
        {step < STEPS.length - 1 ? (
          <LiquidButton variant="primary" onClick={next}>Continue</LiquidButton>
        ) : (
          <LiquidButton type="submit" variant="primary" size="lg" disabled={sending}>{sending ? "Sending…" : "Submit application"}</LiquidButton>
        )}
        <p className="hint text-sm text-[var(--fg-faint)]">Draft saved in this browser.</p>
      </div>
    </form>
  );
}
