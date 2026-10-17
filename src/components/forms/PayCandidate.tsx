"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR, pricing } from "@/config/site";
import { LiquidButton } from "../liquid/LiquidButton";
import { loadCheckout, type CheckoutResponse } from "./checkout";
import { FormAlert, postJson } from "./ui";

/** Pays the candidate ticket for one application. The browser's word is never enough: the server verifies the signature. */
export function PayCandidate({ appRef, token, name }: { appRef: string; token: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");

  async function pay() {
    setBusy(true);
    setFail("");
    const { ok, data } = await postJson("/api/candidate/pay", { ref: appRef, token });
    if (!ok) {
      setBusy(false);
      return setFail(data.message ?? "We could not start the payment. You have not been charged.");
    }
    if (!(await loadCheckout()) || !window.Razorpay) {
      setBusy(false);
      return setFail("The payment window could not load (check your connection or ad-blocker). You have not been charged.");
    }
    const rz = new window.Razorpay({
      key: data.keyId,
      order_id: data.providerOrderId,
      amount: data.amountPaise,
      currency: "INR",
      name: "The Believing Room",
      description: "Candidate ticket",
      prefill: { name },
      handler: async (resp: CheckoutResponse) => {
        const r = await postJson("/api/audience/verify", { providerOrderId: resp.razorpay_order_id, providerPaymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        if (r.ok) router.push(`/tickets/${r.data.ref}?k=${r.data.token}`);
        else {
          setBusy(false);
          setFail(`We could not confirm your payment yet. If money left your account, do not pay again: it will be confirmed automatically. Quote ${data.ref} if you need help.`);
        }
      },
      modal: { ondismiss: () => { setBusy(false); setFail("Payment window closed. You have not been charged."); } },
    });
    rz.on("payment.failed", () => { setBusy(false); setFail("The payment did not go through. You have not been charged. Please try again."); });
    rz.open();
  }

  return (
    <div className="grid gap-5">
      {fail && <FormAlert>{fail}</FormAlert>}
      <div><LiquidButton variant="primary" size="lg" onClick={pay} disabled={busy}>{busy ? "Opening payment…" : `Pay ${formatINR(pricing.candidate.amount)}`}</LiquidButton></div>
    </div>
  );
}
