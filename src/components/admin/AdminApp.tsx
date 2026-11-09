"use client";

import { ExternalLink, FileSpreadsheet, LayoutDashboard, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { statusOf } from "@/lib/admin/table";
import type { AdminData, AdminRow, AdminTab, OpResult, RowOp } from "@/lib/admin/types";
import { CollectionView } from "./CollectionView";
import { Overview } from "./Overview";
import { Toasts, type ToastMsg } from "./ui";

class ApiError extends Error {}

/** Set by AdminApp: where to go when the server says the session has ended. */
let onSessionLost: () => void = () => {};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...init?.headers } });
  if (res.status === 401) {
    onSessionLost();
    throw new ApiError("Your session ended. Signing you back in…");
  }
  const body = (await res.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!res.ok || !body) throw new ApiError(body?.message ?? `Request failed (${res.status})`);
  return body;
}

const fetchData = () => api<AdminData>("/api/admin/data");
const postOps = async (tab: string, ops: RowOp[]) => (await api<{ results: OpResult[] }>("/api/admin/rows", { method: "POST", body: JSON.stringify({ tab, ops }) })).results;

/** Folds the sheet's replies for edited rows back into local state, so the table updates without a full reload. */
function applyUpdates(tab: AdminTab, results: OpResult[]): AdminTab {
  const done = new Map(results.filter((r) => r.ok && r.type === "update" && r.v && r.f).map((r) => [r.row, r]));
  const headers = [...results].reverse().find((r) => r.ok && r.headers)?.headers ?? tab.headers;
  return { ...tab, headers, rows: tab.rows.map((row) => (done.has(row.r) ? { r: row.r, f: done.get(row.r)!.f!, v: done.get(row.r)!.v! } : row)) };
}

/** After rows are deleted, every row below them moves up by one per deleted row above it. */
function applyDeletes(tab: AdminTab, deleted: number[]): AdminTab {
  const gone = new Set(deleted);
  return {
    ...tab,
    rows: tab.rows.filter((r) => !gone.has(r.r)).map((r) => ({ ...r, r: r.r - deleted.filter((d) => d < r.r).length })),
  };
}

export function AdminApp() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [view, setView] = useState("overview");
  const [focusRow, setFocusRow] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const lastLoad = useRef(0);
  useEffect(() => {
    onSessionLost = () => router.replace("/admin/login");
    return () => {
      onSessionLost = () => {};
    };
  }, [router]);
  const toastId = useRef(0);

  const notify = useCallback((text: string, kind: "ok" | "error" = "ok") => {
    setToasts((t) => [...t.slice(-3), { id: ++toastId.current, text, kind }]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const reload = useCallback(async (quiet = false) => {
    setRefreshing(true);
    try {
      const next = await fetchData();
      lastLoad.current = Date.now();
      setData(next);
      setNow(Date.now());
      setError(null);
      if (!quiet) notify("Up to date with your Google Sheet.");
    } catch (e) {
      setError((e as Error).message);
    }
    setRefreshing(false);
  }, [notify]);

  useEffect(() => {
    let live = true;
    fetchData()
      .then((d) => {
        if (!live) return;
        lastLoad.current = Date.now();
        setData(d);
        setNow(Date.now());
        setRefreshing(false);
      })
      .catch((e: Error) => {
        if (!live) return;
        setError(e.message);
        setRefreshing(false);
      });
    return () => {
      live = false;
    };
  }, []);

  // Coming back to the tab after a while: pull fresh data so nobody works from a stale view.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastLoad.current > 120_000) void reload(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  const patchTab = (key: string, fn: (t: AdminTab) => AdminTab) =>
    setData((d) => (d ? { ...d, tabs: d.tabs.map((t) => (t.key === key ? fn(t) : t)) } : d));

  const onUpdate = useCallback(async (tab: AdminTab, items: { row: AdminRow; set: Record<string, string> }[]) => {
    try {
      const results = await postOps(tab.name, items.map(({ row, set }) => ({ type: "update", row: row.r, fp: row.f, set })));
      patchTab(tab.key, (t) => applyUpdates(t, results));
      const failed = results.filter((r) => !r.ok);
      if (failed.length) {
        notify(`${failed.length} of ${results.length} not saved. ${failed[0].error ?? ""}`, "error");
        void reload(true); // show what the sheet really holds
        return false;
      }
      notify(results.length === 1 ? "Saved to your Google Sheet." : `Updated ${results.length} rows.`);
      return true;
    } catch (e) {
      notify((e as Error).message, "error");
      return false;
    }
  }, [notify, reload]);

  const onDelete = useCallback(async (tab: AdminTab, rows: AdminRow[]) => {
    try {
      const results = await postOps(tab.name, rows.map((row) => ({ type: "delete", row: row.r, fp: row.f })));
      const deleted = results.filter((r) => r.ok).map((r) => r.row);
      if (deleted.length) patchTab(tab.key, (t) => applyDeletes(t, deleted));
      const failed = results.length - deleted.length;
      if (failed) {
        notify(`${failed} not deleted. ${results.find((r) => !r.ok)?.error ?? ""}`, "error");
        void reload(true);
        return false;
      }
      notify(deleted.length === 1 ? "Row deleted." : `${deleted.length} rows deleted.`);
      return true;
    } catch (e) {
      notify((e as Error).message, "error");
      return false;
    }
  }, [notify, reload]);

  const onAdd = useCallback(async (tab: AdminTab, values: Record<string, string>) => {
    try {
      await api("/api/admin/rows", { method: "PUT", body: JSON.stringify({ tab: tab.name, row: values }) });
      notify("Entry added to your Google Sheet.");
      await reload(true);
      return true;
    } catch (e) {
      notify((e as Error).message, "error");
      return false;
    }
  }, [notify, reload]);

  async function signOut() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const open = (key: string, row?: number) => {
    setView(key);
    setFocusRow(row ?? null);
    window.scrollTo({ top: 0 });
  };

  const tab = data?.tabs.find((t) => t.key === view);
  const unread = (t: AdminTab) => t.rows.filter((r) => statusOf(r, t.headers) === "New").length;

  return (
    <div className="adm-shell">
      <header className="adm-top">
        <div className="adm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size emblem; no optimiser needed */}
          <img src="/brand/show-emblem-640.webp" alt="" width={32} height={32} />
          <div>
            <strong>The Believing Room</strong>
            <span>Admin</span>
          </div>
        </div>
        <div className="adm-top-actions">
          {data && <span className="adm-muted adm-updated">Updated {new Date(data.fetchedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>}
          <button type="button" className="adm-btn" onClick={() => reload()} disabled={refreshing} aria-label="Refresh from Google Sheet">
            <RefreshCw size={15} className={refreshing ? "adm-spin" : undefined} /> <span className="adm-hide-sm">Refresh</span>
          </button>
          {data?.spreadsheetUrl && (
            <a className="adm-btn" href={data.spreadsheetUrl} target="_blank" rel="noopener noreferrer">
              <FileSpreadsheet size={15} /> <span className="adm-hide-sm">Open Google Sheet</span> <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
          <button type="button" className="adm-btn" onClick={signOut}><LogOut size={15} /> <span className="adm-hide-sm">Sign out</span></button>
        </div>
      </header>

      <div className="adm-body">
        <nav className="adm-side" aria-label="Sections">
          <button type="button" className={`adm-nav${view === "overview" ? " is-on" : ""}`} aria-current={view === "overview" ? "page" : undefined} onClick={() => open("overview")}>
            <LayoutDashboard size={16} /> <span>Overview</span>
          </button>
          {data?.tabs.map((t) => (
            <button key={t.key} type="button" className={`adm-nav${view === t.key ? " is-on" : ""}`} aria-current={view === t.key ? "page" : undefined} onClick={() => open(t.key)}>
              <span>{t.label}</span>
              <span className="adm-nav-count">
                {unread(t) > 0 && <b title={`${unread(t)} new`}>{unread(t)}</b>}
                {t.rows.length}
              </span>
            </button>
          ))}
        </nav>

        <div className="adm-main">
          {error && (
            <div className="adm-banner" role="alert">
              <div><strong>{data ? "Couldn't refresh." : "Couldn't load your Google Sheet."}</strong> {error}</div>
              <button type="button" className="adm-btn adm-btn-small" onClick={() => reload(true)} disabled={refreshing}>Try again</button>
            </div>
          )}
          {!data && !error && (
            <div className="adm-loading" role="status"><RefreshCw className="adm-spin" size={20} /> Loading from Google Sheets…</div>
          )}
          {data && view === "overview" && <Overview data={data} now={now} onOpen={open} />}
          {data && tab && (
            <CollectionView
              key={`${tab.key}:${focusRow ?? ""}`}
              tab={tab} openRowId={focusRow}
              canAdd={!tab.key.startsWith("tab:")}
              onUpdate={onUpdate} onDelete={onDelete} onAdd={onAdd} notify={notify}
            />
          )}
        </div>
      </div>

      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
