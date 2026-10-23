"use client";

import { useState } from "react";
import { LiquidButton } from "../liquid/LiquidButton";
import { Check, FormAlert, Honeypot, postJson, readForm, TextField, type Errors } from "./ui";

export function WaitlistForm({ kind, cta = "Notify me", note }: { kind: "audience" | "student" | "updates"; cta?: string; note?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [fail, setFail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrors({});
    setFail("");
    const { ok, data } = await postJson("/api/submit/waitlist", { ...readForm(e.currentTarget), kind });
    if (ok) return setState("done");
    setState("idle");
    if (data.fields) setErrors(data.fields);
    else setFail(data.message ?? "Something went wrong. Please try again.");
  }

  if (state === "done")
    return (
      <p role="status" className="glass p-5 text-sm [--r:1.1rem]">
        You are on the list. We will email you only about this: {note ?? "when there is something real to tell you"}.
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4" aria-label="Join the list">
      <TextField name="email" label="Email" type="email" autoComplete="email" required error={errors.email} />
      <Check name="consentContact" required error={errors.consentContact}>
        Email me about {note ?? "this event"}. No spam, no sharing, unsubscribe any time.
      </Check>
      <Honeypot />
      {fail && <FormAlert>{fail}</FormAlert>}
      <LiquidButton type="submit" variant="primary" disabled={state === "sending"}>
        {state === "sending" ? "Saving…" : cta}
      </LiquidButton>
    </form>
  );
}
