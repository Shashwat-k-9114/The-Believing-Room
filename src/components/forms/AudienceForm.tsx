"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR, inclusions, priceBreakdown, pricing } from "@/config/site";
import { LiquidButton } from "../liquid/LiquidButton";
import { LiquidSegmentedControl } from "../liquid/controls";
import { WaitlistForm } from "./WaitlistForm";
import { loadCheckout, type CheckoutResponse } from "./checkout";
import { Check, FormAlert, postJson, TextField, type Errors } from "./ui";

/**
 * `available` reflects the server: payments configured AND an event with audience sales open.
 * When false there is NO purchase path at all: only a waitlist. We never fake a purchase.
 */
export function AudienceForm({ available, unavailableReason }: { available: boolean; unavailableReason: string }) {
  const router = useRouter();
  const [qty, setQty] = useState("1");
  const [v, setV] = useState({ name: "", email: "", phone: "", consentTerms: false, consentPrivacy: false, consentFilming: false });
  const [names, setNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");

  const q = Number(qty);
  const price = priceBreakdown("audience", q);
  const set = (k: keyof typeof v) => (val: string | boolean) => setV((p) => ({ ...p, [k]: val }));

  const Summary = (
    <aside aria-label="Price summary" className="glass glass-frost h-fit p-7 [--r:1.6rem] lg:sticky lg:top-28">
      <p className="eyebrow">Order summary</p>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between"><dt>{pricing.audience.label} × {q}</dt><dd>{formatINR(price.subtotal)}</dd></div>
        {price.fee > 0 && <div className="flex justify-between"><dt>Platform fee</dt><dd>{formatINR(price.fee)}</dd></div>}
        {price.gst > 0 && <div className="flex justify-between"><dt>GST</dt><dd>{formatINR(price.gst)}</dd></div>}
        <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-4"><dt className="font-medium">Total</dt><dd className="display text-4xl">{formatINR(price.total)}</dd></div>
      </dl>
      <ul className="mt-5 grid gap-1 text-sm text-[var(--fg-dim)]">{inclusions.both.map((i) => <li key={i}>✓ {i}</li>)}</ul>
      <p className="mt-5 text-xs text-[var(--fg-faint)]">Entry and food only. Not a guarantee of selection, an internship or any hiring outcome. <Link className="underline" href="/refund-policy">Refund policy</Link>.</p>
    </aside>
  );

  if (!available) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass glass-frost p-8 sm:p-10 [--r:1.8rem]">
          <p className="eyebrow">Not on sale yet</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl">Tickets aren’t available to buy right now.</h2>
          <p className="mt-4 max-w-[52ch] text-[var(--fg-dim)]">{unavailableReason}</p>
          <p className="mt-2 text-[var(--fg-dim)]">No payment is taken on this page. Leave your email and we’ll tell you the moment sales open.</p>
          <div className="mt-8 max-w-md"><WaitlistForm kind="audience" cta="Join the audience waitlist" note="audience ticket sales" /></div>
        </div>
        {Summary}
      </div>
    );
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFail("");
    setErrors({});
    const attendeeNames = names.slice(0, q).map((n) => n.trim()).filter(Boolean);
    const { ok, data } = await postJson("/api/audience/order", { ...v, quantity: q, attendeeNames });
    if (!ok) {
      setBusy(false);
      if (data.fields) setErrors(data.fields);
      else setFail(data.message ?? "We couldn’t start the payment. You have not been charged.");
      return;
    }
    if (!(await loadCheckout()) || !window.Razorpay) {
      setBusy(false);
      setFail("The payment window couldn’t load (check your connection or ad-blocker). You have not been charged. Please try again.");
      return;
    }
    const rz = new window.Razorpay({
      key: data.keyId,
      order_id: data.providerOrderId,
      amount: data.amountPaise,
      currency: "INR",
      name: "The Believing Room",
      description: `${q} × Audience ticket`,
      prefill: { name: v.name, email: v.email, contact: v.phone },
      handler: async (resp: CheckoutResponse) => {
        const r = await postJson("/api/audience/verify", {
          providerOrderId: resp.razorpay_order_id,
          providerPaymentId: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
        });
        if (r.ok) router.push(`/tickets/${r.data.ref}?k=${r.data.token}`);
        else {
          setBusy(false);
          setFail(`We couldn’t confirm your payment yet. If money left your account, don’t pay again: your tickets will be confirmed automatically and emailed. Quote reference ${data.ref} if you need help.`);
        }
      },
      modal: { ondismiss: () => { setBusy(false); setFail("Payment window closed. You haven’t been charged. You can try again."); } },
    });
    rz.on("payment.failed", () => { setBusy(false); setFail("The payment didn’t go through. You haven’t been charged. Please try again or use another method."); });
    rz.open();
  }

  return (
    <form onSubmit={pay} noValidate aria-label="Audience tickets" className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid gap-6">
        <LiquidSegmentedControl
          name="qty" legend="How many tickets?" value={qty} onChange={setQty}
          options={Array.from({ length: pricing.maxAudienceQuantity }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Your name" required autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
          <TextField name="phone" label="Mobile number" type="tel" inputMode="tel" required autoComplete="tel" value={v.phone} onChange={set("phone")} error={errors.phone} />
          <div className="sm:col-span-2"><TextField name="email" label="Email (tickets are sent here)" type="email" required autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} /></div>
        </div>
        {q > 1 && (
          <fieldset className="grid gap-4">
            <legend className="eyebrow mb-1">Names on tickets (optional)</legend>
            {Array.from({ length: q }, (_, i) => (
              <TextField key={i} name={`attendee${i}`} label={`Attendee ${i + 1}`} value={names[i] ?? ""} onChange={(val) => setNames((p) => { const n = [...p]; n[i] = val; return n; })} />
            ))}
          </fieldset>
        )}
        <div className="grid gap-4">
          <Check name="consentTerms" checked={v.consentTerms} onChange={set("consentTerms")} error={errors.consentTerms}>I accept the <Link className="underline" href="/terms" target="_blank">ticket terms</Link> and <Link className="underline" href="/refund-policy" target="_blank">refund policy</Link>.</Check>
          <Check name="consentPrivacy" checked={v.consentPrivacy} onChange={set("consentPrivacy")} error={errors.consentPrivacy}>I agree to the <Link className="underline" href="/privacy" target="_blank">privacy notice</Link>.</Check>
          <Check name="consentFilming" checked={v.consentFilming} onChange={set("consentFilming")} error={errors.consentFilming}>I understand the event is filmed and I may appear in the background of recordings. <Link className="underline" href="/media-consent" target="_blank">Details</Link>.</Check>
        </div>
        {fail && <FormAlert>{fail}</FormAlert>}
        <div><LiquidButton type="submit" variant="primary" size="lg" disabled={busy}>{busy ? "Opening payment…" : `Pay ${formatINR(price.total)}`}</LiquidButton></div>
      </div>
      {Summary}
    </form>
  );
}
