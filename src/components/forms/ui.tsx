"use client";

import { useId, useState, type ReactNode } from "react";

export type Errors = Record<string, string>;

export interface ApiData {
  error?: string;
  message?: string;
  fields?: Errors;
  ref?: string;
  token?: string;
  keyId?: string;
  providerOrderId?: string;
  amountPaise?: number;
  emailSent?: boolean;
  payUrl?: string;
}

export async function postJson(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: ApiData }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as ApiData;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network", message: "You appear to be offline. Check your connection and try again." } };
  }
}

interface FieldBase {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function TextField({
  name, label, hint, error, required, type = "text", autoComplete, inputMode, placeholder, defaultValue, value, onChange,
}: FieldBase & {
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden className="text-[var(--accent)]"> *</span>}
      </label>
      <input
        id={id} name={name} type={type} className="input" autoComplete={autoComplete} inputMode={inputMode}
        placeholder={placeholder} required={required} aria-required={required} aria-invalid={!!error}
        aria-describedby={describedBy} defaultValue={value === undefined ? defaultValue : undefined}
        value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
      {hint && <p id={`${id}-h`} className="hint">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="error-text">{error}</p>}
    </div>
  );
}

export function TextArea({
  name, label, hint, error, required, rows = 5, defaultValue, maxLength, value, onChange,
}: FieldBase & { rows?: number; defaultValue?: string; maxLength?: number; value?: string; onChange?: (v: string) => void }) {
  const id = useId();
  const [len, setLen] = useState(value?.length ?? defaultValue?.length ?? 0);
  const describedBy = [hint ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden className="text-[var(--accent)]"> *</span>}
      </label>
      <textarea
        id={id} name={name} rows={rows} className="input" required={required} aria-required={required}
        aria-invalid={!!error} aria-describedby={describedBy} maxLength={maxLength}
        {...(value === undefined ? { defaultValue } : { value })}
        onChange={(e) => { setLen(e.target.value.length); onChange?.(e.target.value); }}
      />
      <div className="flex justify-between gap-4">
        {hint ? <p id={`${id}-h`} className="hint">{hint}</p> : <span />}
        {maxLength && <p className="hint tabular-nums" aria-hidden>{len}/{maxLength}</p>}
      </div>
      {error && <p id={`${id}-e`} role="alert" className="error-text">{error}</p>}
    </div>
  );
}

export function SelectField({
  name, label, error, required, options, placeholder = "Choose…", defaultValue = "", value, onChange,
}: FieldBase & { options: { value: string; label: string }[]; placeholder?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden className="text-[var(--accent)]"> *</span>}
      </label>
      <select id={id} name={name} className="input" required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        {...(value === undefined ? { defaultValue } : { value })} onChange={(e) => onChange?.(e.target.value)}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p id={`${id}-e`} role="alert" className="error-text">{error}</p>}
    </div>
  );
}

export function Check({
  name, children, error, required, defaultChecked, checked, onChange,
}: { name: string; children: ReactNode; error?: string; required?: boolean; defaultChecked?: boolean; checked?: boolean; onChange?: (v: boolean) => void }) {
  const id = useId();
  return (
    <div>
      <label className="check" htmlFor={id}>
        <input id={id} type="checkbox" name={name} required={required} {...(checked === undefined ? { defaultChecked } : { checked })} onChange={(e) => onChange?.(e.target.checked)} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} />
        <span>{children}</span>
      </label>
      {error && <p id={`${id}-e`} role="alert" className="error-text ml-8 mt-1">{error}</p>}
    </div>
  );
}

/** Reads a form into a plain object. Checkboxes -> booleans; empty strings preserved. */
export function readForm(form: HTMLFormElement): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const el of Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]) {
    if (!el.name) continue;
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      const multi = form.querySelectorAll(`input[type=checkbox][name="${el.name}"]`).length > 1;
      if (multi) {
        const arr = (out[el.name] as string[]) ?? [];
        if (el.checked) arr.push(el.value);
        out[el.name] = arr;
      } else out[el.name] = el.checked;
    } else if (el instanceof HTMLInputElement && el.type === "file") continue;
    else out[el.name] = el.value;
  }
  return out;
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-[#e5484d]/50 bg-[#e5484d]/10 p-4 text-sm text-[var(--fg)]">
      {children}
    </div>
  );
}

export function SuccessPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="glass glass-frost p-8 sm:p-10 [--r:1.6rem]">
      <p className="eyebrow text-emerald-300">Received</p>
      <h2 className="display mt-3 text-4xl sm:text-5xl">{title}</h2>
      <div className="mt-5 grid gap-3 text-[var(--fg-dim)]">{children}</div>
    </div>
  );
}
