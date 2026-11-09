"use client";

import {
  ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Columns3, Copy, Download, Filter, Mail, Plus, Search, Trash2,
} from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import {
  activeFilterCount, cellAt, emptyFilters, facetColumns, fileStamp, filterRows, groupRows, orderedColumns, sortRows, statusCounts, statusOf,
  toCsv, toJson, toTsv, withManaged, type Filters, type Sort,
} from "@/lib/admin/table";
import { NOTES_COL, READ_ONLY_COLS, STATUS_COL, STATUSES, type AdminRow, type AdminTab } from "@/lib/admin/types";
import { RowDrawer } from "./RowDrawer";
import { copyText, downloadFile, fmtDate, Modal, StatusPill, titleOf, usePopover } from "./ui";

type Props = {
  tab: AdminTab;
  openRowId: number | null;
  canAdd: boolean;
  onUpdate: (tab: AdminTab, items: { row: AdminRow; set: Record<string, string> }[]) => Promise<boolean>;
  onDelete: (tab: AdminTab, rows: AdminRow[]) => Promise<boolean>;
  onAdd: (tab: AdminTab, values: Record<string, string>) => Promise<boolean>;
  notify: (text: string, kind?: "ok" | "error") => void;
};

const PAGE_SIZES = [25, 50, 100, 0] as const;
const LONG_HEADER = /message|summary|experience|notes|attendee/i;

export function CollectionView({ tab, openRowId, canAdd, onUpdate, onDelete, onAdd, notify }: Props) {
  const headers = useMemo(() => withManaged(tab.headers), [tab.headers]);
  const cols = useMemo(() => orderedColumns(headers), [headers]);

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<Sort>({ column: "Submitted at", dir: "desc" });
  const [groupBy, setGroupBy] = useState("");
  const [visible, setVisible] = useState<Set<string>>(() => new Set(["Submitted at", "Reference", STATUS_COL, ...tab.defaultColumns]));
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openId, setOpenId] = useState<number | null>(openRowId);
  const [confirm, setConfirm] = useState<AdminRow[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [colsOpen, setColsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportAll, setExportAll] = useState(true);

  const closeCols = useCallback(() => setColsOpen(false), []);
  const closeExport = useCallback(() => setExportOpen(false), []);
  const colsRef = usePopover(colsOpen, closeCols);
  const exportRef = usePopover(exportOpen, closeExport);

  const filtered = useMemo(() => filterRows({ headers }, tab.rows, filters), [headers, tab.rows, filters]);
  const sorted = useMemo(() => sortRows(filtered, headers, sort), [filtered, headers, sort]);
  const groups = useMemo(() => (groupBy ? groupRows(sorted, headers, groupBy) : null), [sorted, headers, groupBy]);
  const flat = useMemo(() => (groups ? groups.flatMap((g) => g.rows) : sorted), [groups, sorted]);
  const facets = useMemo(() => facetColumns({ headers, rows: tab.rows }), [headers, tab.rows]);
  const counts = useMemo(() => statusCounts(tab.rows, headers), [tab.rows, headers]);

  const groupIndex = groupBy ? headers.indexOf(groupBy) : -1;
  const groupKey = (r: AdminRow) => (groupIndex === -1 ? "" : (r.v[groupIndex] ?? "").trim() || "(blank)");
  const groupSize = new Map((groups ?? []).map((g) => [g.key, g.rows.length]));

  const pages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(flat.length / pageSize));
  const current = Math.min(page, pages - 1);
  const pageRows = pageSize === 0 ? flat : flat.slice(current * pageSize, (current + 1) * pageSize);

  const selectedRows = useMemo(() => flat.filter((r) => selected.has(r.r)), [flat, selected]);
  const pageAllSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.r));
  const shownCols = cols.filter((c) => visible.has(c.name));
  const nFilters = activeFilterCount(filters);

  const openRow = openId === null ? undefined : tab.rows.find((r) => r.r === openId);
  const openIdx = openRow ? flat.indexOf(openRow) : -1;

  const applyFilters = (next: Filters) => {
    setFilters(next);
    setPage(0);
  };

  function toggleSort(column: string) {
    setSort((s) => {
      if (!s || s.column !== column) return { column, dir: column === "Submitted at" ? "desc" : "asc" };
      if (s.dir === (column === "Submitted at" ? "desc" : "asc")) return { column, dir: column === "Submitted at" ? "asc" : "desc" };
      return null;
    });
    setPage(0);
  }

  function toggleRow(r: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(r)) n.delete(r);
      else n.add(r);
      return n;
    });
  }

  function togglePage() {
    setSelected((s) => {
      const n = new Set(s);
      if (pageAllSelected) pageRows.forEach((r) => n.delete(r.r));
      else pageRows.forEach((r) => n.add(r.r));
      return n;
    });
  }

  /* ---------------------------------------------------------------- export / copy */

  const scopeRows = selectedRows.length ? selectedRows : flat;
  const scopeLabel = selectedRows.length ? `${selectedRows.length} selected` : `${flat.length} ${nFilters ? "filtered" : "total"}`;
  const exportCols = (exportAll ? cols : shownCols).map((c) => c.name);
  const matrix = () => scopeRows.map((r) => exportCols.map((c) => (c === STATUS_COL ? statusOf(r, headers) : cellAt(r, headers, c))));
  const baseName = `believing-room-${tab.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fileStamp()}`;
  const emailCol = headers.find((h) => /^e-?mail$/i.test(h));
  const emails = emailCol ? [...new Set(scopeRows.map((r) => cellAt(r, headers, emailCol).trim()).filter(Boolean))] : [];

  function doExport(kind: "csv" | "json" | "copy") {
    if (!scopeRows.length) return notify("Nothing to export.", "error");
    if (kind === "csv") downloadFile(`${baseName}.csv`, "text/csv", toCsv(exportCols, matrix(), { bom: true }));
    else if (kind === "json") downloadFile(`${baseName}.json`, "application/json", toJson(exportCols, matrix()));
    else void copyText(toTsv(exportCols, matrix())).then((ok) => notify(ok ? `Copied ${scopeRows.length} rows. Paste into Sheets or Excel.` : "Couldn't copy. Use CSV instead.", ok ? "ok" : "error"));
    if (kind !== "copy") notify(`Exported ${scopeRows.length} rows.`);
    setExportOpen(false);
  }

  async function copyEmails() {
    const ok = await copyText(emails.join("; "));
    notify(ok ? `Copied ${emails.length} email${emails.length === 1 ? "" : "s"}.` : "Couldn't copy.", ok ? "ok" : "error");
    setExportOpen(false);
  }

  /* ---------------------------------------------------------------- edits */

  async function setStatus(rows: AdminRow[], status: string) {
    const value = status === "New" ? "" : status;
    const items = rows.filter((r) => statusOf(r, headers) !== status).map((row) => ({ row, set: { [STATUS_COL]: value } }));
    if (!items.length) return;
    setBusy(true);
    await onUpdate(tab, items);
    setBusy(false);
  }

  async function confirmDelete() {
    if (!confirm) return;
    setBusy(true);
    const ok = await onDelete(tab, confirm);
    setBusy(false);
    if (ok) {
      setConfirm(null);
      setSelected(new Set());
      setOpenId(null);
    }
  }

  /* ---------------------------------------------------------------- render */

  const total = tab.rows.length;
  const activeStatuses = STATUSES.filter((s) => counts[s] > 0 || filters.statuses.includes(s));

  return (
    <div className="adm-collection">
      <div className="adm-page-head">
        <div>
          <h1>{tab.label}</h1>
          <p className="adm-muted">{tab.description} <strong>{total}</strong> in the sheet.</p>
        </div>
        {canAdd && (
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add entry</button>
        )}
      </div>

      <div className="adm-toolbar" role="search">
        <div className="adm-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search" value={filters.query} onChange={(e) => applyFilters({ ...filters, query: e.target.value })}
            placeholder={`Search ${tab.label.toLowerCase()} by name, email, college, anything…`} aria-label={`Search ${tab.label}`}
          />
        </div>
        <button type="button" className={`adm-btn${showFilters || nFilters ? " is-on" : ""}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          <Filter size={15} /> Filters{nFilters ? ` (${nFilters})` : ""}
        </button>
        <label className="adm-select-inline">
          <span>Group by</span>
          <select value={groupBy} onChange={(e) => { setGroupBy(e.target.value); setPage(0); }}>
            <option value="">None</option>
            {cols.filter((c) => !["Submitted at", "Reference", NOTES_COL].includes(c.name) && (c.name === STATUS_COL || facets.some((f) => f.name === c.name))).map((c) => (
              <option key={c.index} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="adm-popover-wrap" ref={colsRef}>
          <button type="button" className="adm-btn" onClick={() => setColsOpen((o) => !o)} aria-expanded={colsOpen}><Columns3 size={15} /> Columns</button>
          {colsOpen && (
            <div className="adm-popover" role="group" aria-label="Visible columns">
              <div className="adm-popover-actions">
                <button type="button" onClick={() => setVisible(new Set(cols.map((c) => c.name)))}>All</button>
                <button type="button" onClick={() => setVisible(new Set(["Submitted at", "Reference", STATUS_COL, ...tab.defaultColumns]))}>Default</button>
              </div>
              {cols.map((c) => (
                <label key={c.index} className="adm-check">
                  <input type="checkbox" checked={visible.has(c.name)} onChange={() => setVisible((v) => {
                    const n = new Set(v);
                    if (n.has(c.name)) n.delete(c.name);
                    else n.add(c.name);
                    return n;
                  })} />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="adm-popover-wrap" ref={exportRef}>
          <button type="button" className="adm-btn" onClick={() => setExportOpen((o) => !o)} aria-expanded={exportOpen}><Download size={15} /> Export</button>
          {exportOpen && (
            <div className="adm-popover adm-popover-right" role="menu" aria-label="Export and copy">
              <p className="adm-popover-note">{scopeLabel} rows</p>
              <div className="adm-seg" role="group" aria-label="Columns to include">
                <button type="button" className={exportAll ? "is-on" : ""} onClick={() => setExportAll(true)} aria-pressed={exportAll}>All columns</button>
                <button type="button" className={!exportAll ? "is-on" : ""} onClick={() => setExportAll(false)} aria-pressed={!exportAll}>Visible only</button>
              </div>
              <button type="button" role="menuitem" onClick={() => doExport("csv")}><Download size={15} /> Download CSV <small>opens in Excel</small></button>
              <button type="button" role="menuitem" onClick={() => doExport("json")}><Download size={15} /> Download JSON</button>
              <button type="button" role="menuitem" onClick={() => doExport("copy")}><Copy size={15} /> Copy as table <small>paste into Sheets</small></button>
              {emailCol && <button type="button" role="menuitem" onClick={copyEmails} disabled={!emails.length}><Mail size={15} /> Copy {emails.length} email{emails.length === 1 ? "" : "s"}</button>}
            </div>
          )}
        </div>
      </div>

      <div className="adm-chips" role="group" aria-label="Filter by status">
        <button type="button" className={`adm-chip${filters.statuses.length === 0 ? " is-on" : ""}`} onClick={() => applyFilters({ ...filters, statuses: [] })} aria-pressed={filters.statuses.length === 0}>
          All <b>{total}</b>
        </button>
        {activeStatuses.map((s) => {
          const on = filters.statuses.includes(s);
          return (
            <button key={s} type="button" className={`adm-chip${on ? " is-on" : ""}`} aria-pressed={on}
              onClick={() => applyFilters({ ...filters, statuses: on ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s] })}>
              {s} <b>{counts[s] ?? 0}</b>
            </button>
          );
        })}
      </div>

      {showFilters && (
        <section className="adm-filters" aria-label="Filters">
          <div className="adm-filter-block">
            <h3>Submitted</h3>
            <div className="adm-dates">
              <label>From <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => applyFilters({ ...filters, from: e.target.value })} /></label>
              <label>To <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => applyFilters({ ...filters, to: e.target.value })} /></label>
            </div>
          </div>
          {facets.map((f) => (
            <div key={f.name} className="adm-filter-block">
              <h3>{f.name}</h3>
              <div className="adm-facet" role="group" aria-label={f.name}>
                {f.values.map((v) => {
                  const on = (filters.facets[f.name] ?? []).includes(v.value);
                  return (
                    <button key={v.value} type="button" className={`adm-chip adm-chip-small${on ? " is-on" : ""}`} aria-pressed={on}
                      onClick={() => {
                        const cur = filters.facets[f.name] ?? [];
                        applyFilters({ ...filters, facets: { ...filters.facets, [f.name]: on ? cur.filter((x) => x !== v.value) : [...cur, v.value] } });
                      }}>
                      {v.value} <b>{v.count}</b>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {nFilters > 0 && (
        <p className="adm-filter-summary" aria-live="polite">
          Showing <strong>{flat.length}</strong> of {total}.{" "}
          <button type="button" className="adm-link" onClick={() => applyFilters(emptyFilters())}>Clear all filters</button>
        </p>
      )}

      {selectedRows.length > 0 && (
        <div className="adm-bulk" role="region" aria-label="Bulk actions">
          <strong>{selectedRows.length} selected</strong>
          <label className="adm-select-inline">
            <span>Set status</span>
            <select value="" disabled={busy} onChange={(e) => e.target.value && setStatus(selectedRows, e.target.value)}>
              <option value="">Choose…</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="button" className="adm-btn adm-btn-small" onClick={() => doExport("copy")}><Copy size={14} /> Copy</button>
          <button type="button" className="adm-btn adm-btn-small" onClick={() => doExport("csv")}><Download size={14} /> CSV</button>
          {emailCol && <button type="button" className="adm-btn adm-btn-small" onClick={copyEmails} disabled={!emails.length}><Mail size={14} /> Emails</button>}
          <button type="button" className="adm-btn adm-btn-small adm-btn-danger" onClick={() => setConfirm(selectedRows)} disabled={busy}><Trash2 size={14} /> Delete</button>
          <span className="adm-spacer" />
          <button type="button" className="adm-link" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      {total === 0 ? (
        <div className="adm-empty"><h2>No {tab.label.toLowerCase()} yet</h2><p className="adm-muted">New submissions from the website will appear here as soon as they arrive.</p></div>
      ) : flat.length === 0 ? (
        <div className="adm-empty"><h2>Nothing matches</h2><p className="adm-muted">Try a different search or clear the filters.</p>
          <button type="button" className="adm-btn" onClick={() => applyFilters(emptyFilters())}>Clear filters</button></div>
      ) : (
        <>
          <div className="adm-table-wrap" tabIndex={0} role="region" aria-label={`${tab.label} table`}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="adm-th-check">
                    <input type="checkbox" checked={pageAllSelected} onChange={togglePage} aria-label="Select all rows on this page" />
                  </th>
                  {shownCols.map((c) => {
                    const dir = sort?.column === c.name ? sort.dir : null;
                    return (
                      <th key={c.index} scope="col" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}>
                        <button type="button" onClick={() => toggleSort(c.name)}>
                          {c.name}
                          {dir === "asc" ? <ArrowUp size={13} /> : dir === "desc" ? <ArrowDown size={13} /> : <ChevronsUpDown size={13} className="adm-faint" />}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => {
                  const showGroup = groups && (i === 0 || groupKey(pageRows[i - 1]) !== groupKey(r));
                  const st = statusOf(r, headers);
                  return (
                    <Fragment key={r.r}>
                      {showGroup && (
                        <tr className="adm-group-row">
                          <th colSpan={shownCols.length + 1} scope="colgroup">{groupBy}: {groupKey(r)} <span>{groupSize.get(groupKey(r))}</span></th>
                        </tr>
                      )}
                      <tr
                        className={`${selected.has(r.r) ? "is-selected " : ""}adm-row`} tabIndex={0} aria-label={`Open ${titleOf({ headers }, r)}`}
                        onClick={() => setOpenId(r.r)}
                        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpenId(r.r); } }}
                      >
                        <td className="adm-td-check" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(r.r)} onChange={() => toggleRow(r.r)} aria-label={`Select ${titleOf({ headers }, r)}`} />
                        </td>
                        {shownCols.map((c) => {
                          const v = cellAt(r, headers, c.name);
                          if (c.name === STATUS_COL) {
                            return (
                              <td key={c.index} onClick={(e) => e.stopPropagation()}>
                                <span className="adm-status-select">
                                  <StatusPill status={st} />
                                  <select value={STATUSES.includes(st as (typeof STATUSES)[number]) ? st : ""} disabled={busy} aria-label={`Status for ${titleOf({ headers }, r)}`}
                                    onChange={(e) => e.target.value && setStatus([r], e.target.value)}>
                                    {!STATUSES.includes(st as (typeof STATUSES)[number]) && <option value="">{st}</option>}
                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </span>
                              </td>
                            );
                          }
                          if (c.name === "Submitted at") return <td key={c.index} className="adm-nowrap" title={v}>{fmtDate(v)}</td>;
                          return (
                            <td key={c.index} className={LONG_HEADER.test(c.name) ? "adm-td-long" : undefined}>
                              <span className="adm-cell" title={v.length > 40 ? v : undefined}>{v || <span className="adm-faint">&ndash;</span>}</span>
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageAllSelected && flat.length > pageRows.length && selectedRows.length < flat.length && (
            <p className="adm-select-all">
              All {pageRows.length} on this page are selected.{" "}
              <button type="button" className="adm-link" onClick={() => setSelected(new Set(flat.map((r) => r.r)))}>Select all {flat.length}</button>
            </p>
          )}

          <nav className="adm-pager" aria-label="Pagination">
            <span className="adm-muted">
              {pageSize === 0 ? `All ${flat.length}` : `${current * pageSize + 1}–${Math.min(flat.length, (current + 1) * pageSize)} of ${flat.length}`}
            </span>
            <label className="adm-select-inline">
              <span>Rows</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n === 0 ? "All" : n}</option>)}
              </select>
            </label>
            <button type="button" className="adm-icon-btn" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Previous page"><ChevronLeft size={18} /></button>
            <span className="adm-muted">Page {current + 1} of {pages}</span>
            <button type="button" className="adm-icon-btn" onClick={() => setPage(current + 1)} disabled={current >= pages - 1} aria-label="Next page"><ChevronRight size={18} /></button>
          </nav>
        </>
      )}

      {openRow && (
        <RowDrawer
          key={`${openRow.r}:${openRow.f}`}
          tab={tab} headers={headers} row={openRow}
          position={openIdx + 1} total={flat.length}
          onClose={() => setOpenId(null)}
          onPrev={openIdx > 0 ? () => setOpenId(flat[openIdx - 1].r) : null}
          onNext={openIdx !== -1 && openIdx < flat.length - 1 ? () => setOpenId(flat[openIdx + 1].r) : null}
          onSave={(set) => onUpdate(tab, [{ row: openRow, set }])}
          onDelete={() => setConfirm([openRow])}
          onCopied={(what) => notify(`${what} copied.`)}
        />
      )}

      {confirm && (
        <Modal
          title={confirm.length === 1 ? "Delete this row?" : `Delete ${confirm.length} rows?`}
          onClose={() => !busy && setConfirm(null)}
          footer={
            <>
              <button type="button" className="adm-btn" onClick={() => setConfirm(null)} disabled={busy}>Cancel</button>
              <button type="button" className="adm-btn adm-btn-danger-solid" onClick={confirmDelete} disabled={busy}>{busy ? "Deleting…" : "Delete from sheet"}</button>
            </>
          }
        >
          <p>
            {confirm.length === 1 ? <><strong>{titleOf({ headers }, confirm[0])}</strong> will be</> : <>These {confirm.length} rows will be</>} removed from the
            {" "}<strong>{tab.name}</strong> tab of your Google Sheet. To undo it you would need Google Sheets&rsquo; version history.
          </p>
          <p className="adm-muted">If you only want it out of the way, set its status to Archived instead.</p>
        </Modal>
      )}

      {adding && (
        <AddEntry
          tab={tab} headers={headers}
          onClose={() => setAdding(false)}
          onSubmit={async (values) => {
            const ok = await onAdd(tab, values);
            if (ok) setAdding(false);
            return ok;
          }}
        />
      )}
    </div>
  );
}

function AddEntry({ tab, headers, onClose, onSubmit }: { tab: AdminTab; headers: string[]; onClose: () => void; onSubmit: (v: Record<string, string>) => Promise<boolean> }) {
  const fields = headers.filter((h) => h && !READ_ONLY_COLS.includes(h));
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const filled = Object.values(values).some((v) => v.trim());

  return (
    <Modal
      title={`Add ${tab.singular}`} wide onClose={() => !saving && onClose()}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="adm-btn adm-btn-primary" disabled={!filled || saving}
            onClick={async () => { setSaving(true); const ok = await onSubmit(values); if (!ok) setSaving(false); }}>
            {saving ? "Adding…" : "Add to sheet"}
          </button>
        </>
      }
    >
      <p className="adm-muted">For walk-ins or anything that arrived by phone or email. The date and reference are filled in for you. Nothing is checked, so make sure it&rsquo;s right.</p>
      <div className="adm-form-grid">
        {fields.map((h) => (
          <div key={h} className={`adm-form-field${LONG_HEADER.test(h) ? " adm-wide" : ""}`}>
            <label htmlFor={`add-${h}`}>{h}</label>
            {h === STATUS_COL ? (
              <select id={`add-${h}`} value={values[h] ?? "New"} onChange={(e) => setValues((v) => ({ ...v, [h]: e.target.value === "New" ? "" : e.target.value }))}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : LONG_HEADER.test(h) ? (
              <textarea id={`add-${h}`} rows={3} maxLength={5000} value={values[h] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [h]: e.target.value }))} />
            ) : (
              <input id={`add-${h}`} maxLength={5000} value={values[h] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [h]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
