"use client";

import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { isIsoDate, statusOf } from "@/lib/admin/table";
import type { AdminData, AdminRow, AdminTab } from "@/lib/admin/types";
import { fmtDay, StatusPill, timeAgo, titleOf } from "./ui";

const DAY = 86_400_000;

/** Submission counts for the last `days` days, oldest first, by the viewer's local calendar day. */
function perDay(tabs: AdminTab[], days: number, now: number): { date: Date; n: number }[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, i) => ({ date: new Date(start.getTime() - (days - 1 - i) * DAY), n: 0 }));
  for (const t of tabs) {
    const col = t.headers.indexOf("Submitted at");
    if (col === -1) continue;
    for (const r of t.rows) {
      const at = r.v[col] ?? "";
      if (!isIsoDate(at)) continue;
      const d = new Date(at);
      d.setHours(0, 0, 0, 0);
      const i = Math.round((d.getTime() - buckets[0].date.getTime()) / DAY);
      if (i >= 0 && i < days) buckets[i].n++;
    }
  }
  return buckets;
}

function Bars({ data, label, small }: { data: { date: Date; n: number }[]; label: string; small?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  const total = data.reduce((a, d) => a + d.n, 0);
  return (
    <div className={`adm-bars${small ? " adm-bars-small" : ""}`} role="img" aria-label={`${label}: ${total} in total, busiest day ${max === 1 && total === 0 ? 0 : max}`}>
      {data.map((d, i) => (
        <span key={i} className="adm-bar" title={`${fmtDay(d.date)}: ${d.n}`}>
          <i style={{ height: `${d.n === 0 ? 3 : Math.max(8, (d.n / max) * 100)}%` }} data-zero={d.n === 0 || undefined} />
        </span>
      ))}
    </div>
  );
}

export function Overview({ data, now, onOpen }: { data: AdminData; now: number; onOpen: (tabKey: string, row?: number) => void }) {
  const siteTabs = useMemo(() => data.tabs.filter((t) => !t.key.startsWith("tab:")), [data.tabs]);

  const stats = useMemo(() => {
    let total = 0, today = 0, week = 0, fresh = 0, seats = 0;
    const startOfToday = new Date(now).setHours(0, 0, 0, 0);
    for (const t of siteTabs) {
      const at = t.headers.indexOf("Submitted at");
      const seatCol = t.key === "audience" ? t.headers.indexOf("Tickets") : -1;
      for (const r of t.rows) {
        total++;
        if (statusOf(r, t.headers) === "New") fresh++;
        const when = Date.parse(r.v[at] ?? "");
        if (!Number.isNaN(when)) {
          if (when >= startOfToday) today++;
          if (when >= now - 7 * DAY) week++;
        }
        if (seatCol !== -1) seats += Number(r.v[seatCol]) || 0;
      }
    }
    return { total, today, week, fresh, seats };
  }, [siteTabs, now]);

  const recent = useMemo(() => {
    const all: { tab: AdminTab; row: AdminRow; at: number }[] = [];
    for (const t of siteTabs) {
      const col = t.headers.indexOf("Submitted at");
      for (const row of t.rows) {
        const at = Date.parse(row.v[col] ?? "");
        if (!Number.isNaN(at)) all.push({ tab: t, row, at });
      }
    }
    return all.sort((a, b) => b.at - a.at).slice(0, 8);
  }, [siteTabs]);

  const month = useMemo(() => perDay(siteTabs, 30, now), [siteTabs, now]);

  return (
    <div className="adm-overview">
      <div className="adm-page-head">
        <div>
          <h1>Overview</h1>
          <p className="adm-muted">Everything people have sent through the website, live from your Google Sheet.</p>
        </div>
      </div>

      <div className="adm-stats">
        <Stat label="All submissions" value={stats.total} />
        <Stat label="Today" value={stats.today} />
        <Stat label="Last 7 days" value={stats.week} />
        <Stat label="Waiting for review" value={stats.fresh} accent={stats.fresh > 0} />
        <Stat label="Audience seats booked" value={stats.seats} />
      </div>

      <section className="adm-card" aria-labelledby="adm-30">
        <div className="adm-card-head">
          <h2 id="adm-30">Last 30 days</h2>
          <span className="adm-muted">{month.reduce((a, d) => a + d.n, 0)} submissions</span>
        </div>
        <Bars data={month} label="Submissions per day over the last 30 days" />
        <div className="adm-bars-axis" aria-hidden="true"><span>{fmtDay(month[0].date)}</span><span>Today</span></div>
      </section>

      <div className="adm-tabgrid">
        {siteTabs.map((t) => {
          const fresh = t.rows.filter((r) => statusOf(r, t.headers) === "New").length;
          const at = t.headers.indexOf("Submitted at");
          const latest = t.rows.reduce((m, r) => Math.max(m, Date.parse(r.v[at] ?? "") || 0), 0);
          return (
            <button key={t.key} type="button" className="adm-card adm-tabcard" onClick={() => onOpen(t.key)}>
              <span className="adm-tabcard-top">
                <span className="adm-tabcard-name">{t.label}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </span>
              <span className="adm-tabcard-count">{t.rows.length}</span>
              <Bars data={perDay([t], 14, now)} label={`${t.label} over the last 14 days`} small />
              <span className="adm-muted adm-tabcard-foot">
                {fresh > 0 ? <b>{fresh} new</b> : "Nothing new"} · {latest ? `last ${timeAgo(new Date(latest).toISOString(), now)}` : "no entries yet"}
              </span>
            </button>
          );
        })}
      </div>

      <section className="adm-card" aria-labelledby="adm-recent">
        <div className="adm-card-head"><h2 id="adm-recent">Latest activity</h2></div>
        {recent.length === 0 ? (
          <p className="adm-muted">No submissions yet.</p>
        ) : (
          <ul className="adm-recent">
            {recent.map(({ tab, row, at }) => (
              <li key={`${tab.key}:${row.r}`}>
                <button type="button" onClick={() => onOpen(tab.key, row.r)}>
                  <span className="adm-recent-tab">{tab.label}</span>
                  <span className="adm-recent-title">{titleOf(tab, row)}</span>
                  <StatusPill status={statusOf(row, tab.headers)} />
                  <span className="adm-muted adm-recent-time">{timeAgo(new Date(at).toISOString(), now)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`adm-card adm-stat${accent ? " is-accent" : ""}`}>
      <span className="adm-stat-value">{value.toLocaleString("en-IN")}</span>
      <span className="adm-stat-label">{label}</span>
    </div>
  );
}
