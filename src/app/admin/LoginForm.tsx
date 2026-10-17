"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { FormAlert, postJson, TextField } from "@/components/forms/ui";

export function LoginForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-5"
      aria-label="Organiser sign in"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const pw = new FormData(e.currentTarget).get("password");
        const { ok, data } = await postJson("/api/admin/login", { password: pw });
        setBusy(false);
        if (ok) router.refresh();
        else setErr(data.message ?? "Sign-in failed.");
      }}
    >
      <TextField name="password" label="Organiser password" type="password" autoComplete="current-password" required />
      {err && <FormAlert>{err}</FormAlert>}
      <LiquidButton type="submit" variant="primary" disabled={busy}>{busy ? "Checking…" : "Sign in"}</LiquidButton>
    </form>
  );
}
