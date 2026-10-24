"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR, inclusions, pricing } from "@/config/site";
import { LiquidButton } from "../liquid/LiquidButton";
import { LiquidSegmentedControl } from "../liquid/controls";
import { Check, FormAlert, Honeypot, postJson, SuccessPanel, TextField, type Errors } from "./ui";

const CUSTOM = "custom";

/** Registers interest in audience tickets. No payment is taken on the site; the team writes to confirm. */
export function AudienceForm() {
  const [qty, setQty] = useState("1");
  const [v, setV] = useState({ name: "", email: "", phone: "", consentTerms: false, consentPrivacy: false, consentFilming: false });
  const [names, setNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState<{ ref?: string } | null>(null);

  const { quickPickMax, maxPerOrder } = pricing.audienceTickets;
  const custom = qty === CUSTOM;
  const [customQty, setCustomQty] = useState(String(quickPickMax + 1));
  // Anything that is not a whole number in range is sent as 0 and rejected by the server rather than silently clamped.
  const q = custom ? (/^\d+$/.test(customQty.trim()) ? Number(customQty) : 0) : Number(qty);
  const set = (k: keyof typeof v) => (val: string | boolean) => setV((p) => ({ ...p, [k]: val }));

  if (done)
    return (
      <SuccessPanel title="You’re on the list.">
        <p>Reference <strong className="mono text-[var(--fg)]">{done.ref}</strong>. We have noted {q} audience {q === 1 ? "ticket" : "tickets"} for you.</p>
        <p>Nothing has been charged. We’ll email you with the date, venue and how to confirm your place once they are final.</p>
        <div className="mt-2"><LiquidButton href="/" variant="quiet">Back home</LiquidButton></div>
      </SuccessPanel>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (custom && (q < quickPickMax + 1 || q > maxPerOrder)) {
      setErrors({ quantity: `Enter a whole number of ${quickPickMax + 1} or more.` });
      return;
    }
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setBusy(true);
    setFail("");
    setErrors({});
    const attendeeNames = names.slice(0, q).map((n) => n.trim()).filter(Boolean);
    const { ok, data } = await postJson("/api/submit/audience", { ...v, quantity: q, attendeeNames, website });
    setBusy(false);
    if (ok) return setDone({ ref: data.ref });
    if (data.fields) setErrors(data.fields);
    else setFail(data.message ?? "Something went wrong. Please try again.");
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Audience tickets" className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid gap-6">
        <LiquidSegmentedControl
          name="qty" legend="How many tickets?" value={qty} onChange={setQty}
          options={[
            ...Array.from({ length: Math.min(quickPickMax, maxPerOrder) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
            ...(maxPerOrder > quickPickMax ? [{ value: CUSTOM, label: "More" }] : []),
          ]}
        />
        {custom && (
          <TextField
            name="customQty" label={`How many tickets? (${quickPickMax + 1} or more)`} inputMode="numeric" required
            value={customQty} onChange={setCustomQty} error={errors.quantity}
            hint="Enter the whole number of tickets you need."
          />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Your name" required autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
          <TextField name="phone" label="Mobile number" type="tel" inputMode="tel" required autoComplete="tel" value={v.phone} onChange={set("phone")} error={errors.phone} />
          <div className="sm:col-span-2"><TextField name="email" label="Email" type="email" required autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} /></div>
        </div>
        {q > 1 && q <= 20 && (
          <fieldset className="grid gap-4">
            <legend className="eyebrow mb-1">Names on tickets (optional)</legend>
            {Array.from({ length: q }, (_, i) => (
              <TextField key={i} name={`attendee${i}`} label={`Attendee ${i + 1}`} value={names[i] ?? ""} onChange={(val) => setNames((p) => { const n = [...p]; n[i] = val; return n; })} />
            ))}
          </fieldset>
        )}
        <div className="grid gap-4">
          <Check name="consentTerms" checked={v.consentTerms} onChange={set("consentTerms")} error={errors.consentTerms}>I accept the <Link className="underline" href="/terms" target="_blank">ticket terms</Link>.</Check>
          <Check name="consentPrivacy" checked={v.consentPrivacy} onChange={set("consentPrivacy")} error={errors.consentPrivacy}>I agree to the <Link className="underline" href="/privacy" target="_blank">privacy notice</Link>.</Check>
          <Check name="consentFilming" checked={v.consentFilming} onChange={set("consentFilming")} error={errors.consentFilming}>I understand the event is filmed and I may appear in the background of recordings. <Link className="underline" href="/media-consent" target="_blank">Details</Link>.</Check>
        </div>
        <Honeypot />
        {fail && <FormAlert>{fail}</FormAlert>}
        <div><LiquidButton type="submit" variant="primary" size="lg" disabled={busy}>{busy ? "Sending…" : "Register interest"}</LiquidButton></div>
      </div>
      <aside aria-label="Ticket summary" className="glass glass-frost h-fit p-7 [--r:1.6rem] lg:sticky lg:top-28">
        <p className="eyebrow">Planned price</p>
        <p className="display mt-3 text-4xl">{formatINR(pricing.audience.amount)} <span className="text-base text-[var(--fg-dim)]">per ticket</span></p>
        <ul className="mt-5 grid gap-1 text-sm text-[var(--fg-dim)]">{inclusions.both.map((i) => <li key={i}>✓ {i}</li>)}</ul>
        <p className="mt-5 text-xs text-[var(--fg-faint)]">Nothing is charged now. Entry, food and goodies only: not a guarantee of selection, an internship or any hiring outcome.</p>
      </aside>
    </form>
  );
}
