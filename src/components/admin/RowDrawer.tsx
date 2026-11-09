"use client";

import { ChevronLeft, ChevronRight, Copy, ExternalLink, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { orderedColumns } from "@/lib/admin/table";
import { NOTES_COL, READ_ONLY_COLS, STATUS_COL, STATUSES, type AdminRow, type AdminTab } from "@/lib/admin/types";
import { copyText, fmtDate, StatusPill, timeAgo, titleOf } from "./ui";

const LONG = /message|summary|experience|skills|notes|attendee|interests|functions/i;

function linkFor(name: string, value: string): { href: string; external: boolean } | null {
  const v = value.trim();
  if (/^https?:\/\/\S+$/i.test(v)) return { href: v, external: true };
  if (/email/i.test(name) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { href: `mailto:${v}`, external: false };
  if (/phone/i.test(name) && /^\+?[\d\s-]{7,15}$/.test(v)) return { href: `tel:${v.replace(/[\s-]/g, "")}`, external: false };
  return null;
}

export function RowDrawer({
  tab, headers, row, position, total, onClose, onPrev, onNext, onSave, onDelete, onCopied,
}: {
  tab: AdminTab;
  headers: string[];
  row: AdminRow;
  position: number;
  total: number;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  onSave: (set: Record<string, string>) => Promise<boolean>;
  onDelete: () => void;
  onCopied: (what: string) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const get = (name: string) => {
    if (name in draft) return draft[name];
    const i = headers.indexOf(name);
    return i === -1 ? "" : row.v[i] ?? "";
  };
  const set = (name: string, value: string) => {
    const i = headers.indexOf(name);
    const original = i === -1 ? "" : row.v[i] ?? "";
    setDraft((d) => {
      const next = { ...d, [name]: value };
      if (value === original) delete next[name];
      return next;
    });
  };

  const cols = orderedColumns(headers);
  const fields = cols.filter((c) => ![STATUS_COL, NOTES_COL, ...READ_ONLY_COLS].includes(c.name));
  const status = get(STATUS_COL).trim() || "New";
  const dirty = Object.keys(draft).length > 0;
  const submitted = get("Submitted at");
  const reference = get("Reference");

  async function save() {
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) {
      setDraft({});
      setEditing(false);
    }
  }

  async function copy(text: string, what: string) {
    if (await copyText(text)) onCopied(what);
  }

  const allText = [...cols.filter((c) => c.name !== NOTES_COL || get(NOTES_COL)), ]
    .map((c) => `${c.name}: ${get(c.name)}`)
    .join("\n");

  return (
    <div className="adm-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={panel} tabIndex={-1} className="adm-drawer" role="dialog" aria-modal="true" aria-label={`${tab.singular} details`}>
        <header className="adm-drawer-head">
          <div className="adm-drawer-title">
            <p className="adm-eyebrow">{tab.label}{reference ? ` · ${reference}` : ""}</p>
            <h2>{titleOf({ headers }, { ...row, v: headers.map((h) => get(h)) })}</h2>
            <p className="adm-muted">
              {submitted ? <>Submitted {fmtDate(submitted)} <span aria-hidden="true">·</span> {timeAgo(submitted)}</> : `Row ${row.r} in the sheet`}
            </p>
          </div>
          <div className="adm-drawer-nav">
            <button type="button" className="adm-icon-btn" onClick={onPrev ?? undefined} disabled={!onPrev} aria-label="Previous row"><ChevronLeft size={18} /></button>
            <span className="adm-muted" aria-live="polite">{position} / {total}</span>
            <button type="button" className="adm-icon-btn" onClick={onNext ?? undefined} disabled={!onNext} aria-label="Next row"><ChevronRight size={18} /></button>
            <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button>
          </div>
        </header>

        <div className="adm-drawer-body">
          <section className="adm-triage" aria-label="Review">
            <div>
              <label htmlFor="adm-status">Status</label>
              <div className="adm-status-row">
                <StatusPill status={status} />
                <select id="adm-status" value={STATUSES.includes(status as (typeof STATUSES)[number]) ? status : ""} onChange={(e) => set(STATUS_COL, e.target.value === "New" ? "" : e.target.value)}>
                  {!STATUSES.includes(status as (typeof STATUSES)[number]) && <option value="">{status}</option>}
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="adm-notes">Internal notes <span className="adm-muted">(only you see these)</span></label>
              <textarea id="adm-notes" rows={3} value={get(NOTES_COL)} onChange={(e) => set(NOTES_COL, e.target.value)} placeholder="Add a note for the team" maxLength={5000} />
            </div>
          </section>

          <div className="adm-fields-head">
            <h3>Details</h3>
            <button type="button" className={`adm-btn adm-btn-small${editing ? " is-on" : ""}`} onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
              <Pencil size={14} /> {editing ? "Editing fields" : "Edit fields"}
            </button>
          </div>

          <dl className="adm-fields">
            {fields.map((c) => {
              const value = get(c.name);
              const link = value ? linkFor(c.name, value) : null;
              const long = LONG.test(c.name) || value.length > 90;
              return (
                <div key={c.index} className="adm-field">
                  <dt>{c.name}</dt>
                  <dd>
                    {editing ? (
                      long ? (
                        <textarea rows={Math.min(8, Math.max(3, Math.ceil(value.length / 60)))} value={value} onChange={(e) => set(c.name, e.target.value)} maxLength={5000} aria-label={c.name} />
                      ) : (
                        <input value={value} onChange={(e) => set(c.name, e.target.value)} maxLength={5000} aria-label={c.name} />
                      )
                    ) : value ? (
                      link ? (
                        <a href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                          {value}{link.external && <ExternalLink size={12} aria-hidden="true" />}
                        </a>
                      ) : (
                        <span className="adm-pre">{value}</span>
                      )
                    ) : (
                      <span className="adm-muted">Blank</span>
                    )}
                    {!editing && value && (
                      <button type="button" className="adm-icon-btn adm-copy" onClick={() => copy(value, c.name)} aria-label={`Copy ${c.name}`}><Copy size={14} /></button>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <footer className="adm-drawer-foot">
          <button type="button" className="adm-btn adm-btn-danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
          <button type="button" className="adm-btn" onClick={() => copy(allText, "Row")}><Copy size={15} /> Copy all</button>
          <span className="adm-spacer" />
          {dirty && <button type="button" className="adm-btn" onClick={() => { setDraft({}); setEditing(false); }} disabled={saving}>Discard</button>}
          <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={!dirty || saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
