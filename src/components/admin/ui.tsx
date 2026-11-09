"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { isIsoDate } from "@/lib/admin/table";
import type { AdminRow, AdminTab } from "@/lib/admin/types";

/* ------------------------------------------------------------------ browser helpers */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on insecure origins and in some embedded browsers.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadFile(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

export const fmtDate = (iso: string) => (isIsoDate(iso) ? dateFmt.format(new Date(iso)) : iso);
export const fmtDay = (d: Date) => dayFmt.format(d);

export function timeAgo(iso: string, now = Date.now()): string {
  if (!isIsoDate(iso)) return "";
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(iso);
}

/** The most human label for a row: a name, an organisation, an email, or its reference. */
export function titleOf(tab: Pick<AdminTab, "headers">, row: AdminRow): string {
  for (const key of ["Full name", "Name", "Organisation", "Institution", "Email", "Reference"]) {
    const i = tab.headers.indexOf(key);
    const v = i === -1 ? "" : (row.v[i] ?? "").trim();
    if (v) return v;
  }
  return `Row ${row.r}`;
}

/* ------------------------------------------------------------------ components */

export const statusSlug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

export function StatusPill({ status }: { status: string }) {
  return <span className={`adm-pill adm-pill-${statusSlug(status)}`}>{status}</span>;
}

/** Centered dialog with Escape-to-close and focus returned to whatever opened it. */
export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, []);
  return (
    <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`adm-modal${wide ? " adm-modal-wide" : ""}`}>
        <header className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer && <footer className="adm-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export type ToastMsg = { id: number; text: string; kind: "ok" | "error" };

export function Toasts({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: number) => void }) {
  return (
    <div className="adm-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, dismiss }: { toast: ToastMsg; dismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), toast.kind === "error" ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [toast, dismiss]);
  return (
    <div className={`adm-toast adm-toast-${toast.kind}`}>
      <span>{toast.text}</span>
      <button type="button" className="adm-icon-btn" onClick={() => dismiss(toast.id)} aria-label="Dismiss"><X size={14} /></button>
    </div>
  );
}

/** Closes a popover when a click lands outside it or Escape is pressed. */
export function usePopover(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}
