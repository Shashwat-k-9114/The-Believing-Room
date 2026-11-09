/** Pure helpers for the admin table: ordering, filtering, sorting, grouping and export formats. */
import { NOTES_COL, STATUS_COL, STATUSES, type AdminRow, type AdminTab } from "./types";

/** Display order: identity first, then Status, then the form's own fields, Notes last. Unnamed columns get a name. */
export function orderedColumns(headers: string[]): { name: string; index: number }[] {
  const cols = headers.map((h, index) => ({ name: h.trim() || `Column ${index + 1}`, index }));
  const lead = ["Submitted at", "Reference"];
  const pick = (names: string[]) => names.flatMap((n) => cols.filter((c) => c.name === n));
  const rest = cols.filter((c) => ![...lead, STATUS_COL, NOTES_COL].includes(c.name));
  return [...pick(lead), ...pick([STATUS_COL]), ...rest, ...pick([NOTES_COL])];
}

/** The tab's columns including Status / Notes even if the sheet has not got them yet (the first edit creates them). */
export function withManaged(headers: string[]): string[] {
  const out = [...headers];
  for (const h of [STATUS_COL, NOTES_COL]) if (!out.includes(h)) out.push(h);
  return out;
}

export const statusOf = (row: AdminRow, headers: string[]): string => {
  const i = headers.indexOf(STATUS_COL);
  const s = i === -1 ? "" : (row.v[i] ?? "").trim();
  return s || "New";
};

export const cellAt = (row: AdminRow, headers: string[], name: string): string => {
  const i = headers.indexOf(name);
  return i === -1 ? "" : (row.v[i] ?? "");
};

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
export const isIsoDate = (s: string) => ISO.test(s) && !Number.isNaN(Date.parse(s));

/** Natural ordering: dates by instant, numbers numerically, everything else case-insensitively with numeric runs. */
export function compareValues(a: string, b: string): number {
  if (a === b) return 0;
  if (a === "") return 1; // blanks sink to the bottom either way
  if (b === "") return -1;
  if (isIsoDate(a) && isIsoDate(b)) return Date.parse(a) - Date.parse(b);
  const na = Number(a), nb = Number(b);
  if (a.trim() !== "" && b.trim() !== "" && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
}

export type Sort = { column: string; dir: "asc" | "desc" } | null;

export function sortRows(rows: AdminRow[], headers: string[], sort: Sort): AdminRow[] {
  if (!sort) return rows;
  const i = headers.indexOf(sort.column);
  if (i === -1) return rows;
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((x, y) => {
    const a = x.v[i] ?? "", b = y.v[i] ?? "";
    if (a === "" || b === "") return compareValues(a, b); // blanks last in both directions
    return sign * compareValues(a, b) || x.r - y.r;
  });
}

export type Filters = {
  query: string;
  statuses: string[];
  /** Inclusive yyyy-mm-dd bounds on "Submitted at", in the viewer's local time. */
  from: string;
  to: string;
  /** Column -> accepted values. */
  facets: Record<string, string[]>;
};

export const emptyFilters = (): Filters => ({ query: "", statuses: [], from: "", to: "", facets: {} });

export const activeFilterCount = (f: Filters) =>
  (f.query.trim() ? 1 : 0) + (f.statuses.length ? 1 : 0) + (f.from || f.to ? 1 : 0) + Object.values(f.facets).filter((v) => v.length).length;

const localDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function filterRows(tab: Pick<AdminTab, "headers">, rows: AdminRow[], f: Filters): AdminRow[] {
  const h = tab.headers;
  const q = f.query.trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const submittedAt = h.indexOf("Submitted at");
  const facetCols = Object.entries(f.facets).filter(([, v]) => v.length).map(([c, v]) => [h.indexOf(c), new Set(v)] as const);

  return rows.filter((row) => {
    if (f.statuses.length && !f.statuses.includes(statusOf(row, h))) return false;
    if (f.from || f.to) {
      const at = submittedAt === -1 ? "" : row.v[submittedAt] ?? "";
      if (!isIsoDate(at)) return false;
      const day = localDay(at);
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
    }
    for (const [i, allowed] of facetCols) if (i === -1 || !allowed.has(row.v[i] ?? "")) return false;
    if (terms.length) {
      const hay = row.v.join(" \u0001 ").toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
}

/** Columns that make good dropdown filters: few distinct values, and not one-per-row. */
export function facetColumns(tab: Pick<AdminTab, "headers" | "rows">, max = 14): { name: string; values: { value: string; count: number }[] }[] {
  const skip = new Set(["Submitted at", "Reference", NOTES_COL, STATUS_COL, "Email", "Phone", "Name", "Full name"]);
  const out: { name: string; values: { value: string; count: number }[] }[] = [];
  const n = tab.rows.length;
  if (n < 2) return out;
  tab.headers.forEach((name, i) => {
    if (!name || skip.has(name)) return;
    const counts = new Map<string, number>();
    for (const r of tab.rows) {
      const v = (r.v[i] ?? "").trim();
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    if (counts.size < 2 || counts.size > max) return;
    // Mostly-unique columns (names, free text) are not categories.
    if (counts.size > Math.max(3, n * 0.6) && n > 5) return;
    if ([...counts.keys()].some((v) => v.length > 60)) return;
    out.push({ name, values: [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)) });
  });
  return out;
}

export function statusCounts(rows: AdminRow[], headers: string[]): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const r of rows) {
    const s = statusOf(r, headers);
    out[s] = (out[s] ?? 0) + 1;
  }
  return out;
}

export function groupRows(rows: AdminRow[], headers: string[], column: string): { key: string; rows: AdminRow[] }[] {
  const i = headers.indexOf(column);
  const map = new Map<string, AdminRow[]>();
  for (const r of rows) {
    const k = (i === -1 ? "" : r.v[i] ?? "").trim() || "(blank)";
    map.set(k, [...(map.get(k) ?? []), r]);
  }
  return [...map].map(([key, rs]) => ({ key, rows: rs })).sort((a, b) => b.rows.length - a.rows.length || a.key.localeCompare(b.key));
}

/* ------------------------------------------------------------------------------------------ export */

/** Spreadsheet apps run text starting with = + - @ as a formula; a leading apostrophe keeps it as text. */
const guard = (s: string) => (/^[=+\-@\t\r]/.test(s) && !/^[+-]?\d[\d.,\s-]*$/.test(s) ? `'${s}` : s);

export function csvCell(s: string): string {
  const v = guard(s);
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(columns: string[], rows: string[][], opts: { bom?: boolean } = {}): string {
  const lines = [columns, ...rows].map((r) => r.map(csvCell).join(","));
  return (opts.bom ? "﻿" : "") + lines.join("\r\n") + "\r\n";
}

/** Tab-separated, for pasting straight into Google Sheets / Excel. Cells with tabs or newlines are quoted. */
export function toTsv(columns: string[], rows: string[][]): string {
  const q = (s: string) => (/[\t\r\n"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return [columns, ...rows].map((r) => r.map(q).join("\t")).join("\n");
}

export function toJson(columns: string[], rows: string[][]): string {
  return JSON.stringify(rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i] ?? ""]))), null, 2);
}

export const fileStamp = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
