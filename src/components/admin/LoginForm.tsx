"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ next, configured }: { next: string; configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(configured ? null : "Admin sign-in isn't set up yet. Set ADMIN_PASSWORD (10+ characters) and redeploy.");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      setError(body?.message ?? "Couldn't sign in. Try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    }
    setBusy(false);
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit} noValidate>
        <div className="adm-login-mark" aria-hidden="true"><Lock size={20} /></div>
        <p className="adm-eyebrow">The Believing Room</p>
        <h1>Admin sign in</h1>
        <p className="adm-muted">Submissions, registrations and enquiries, straight from your Google Sheet.</p>
        <label htmlFor="adm-pw">Password</label>
        <input
          id="adm-pw" type="password" autoComplete="current-password" autoFocus required
          value={password} onChange={(e) => setPassword(e.target.value)} disabled={!configured}
          aria-invalid={error ? true : undefined} aria-describedby={error ? "adm-pw-err" : undefined}
        />
        {error && <p id="adm-pw-err" className="adm-error" role="alert">{error}</p>}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy || !password || !configured}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
