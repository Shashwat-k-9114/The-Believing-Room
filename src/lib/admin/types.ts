/** Shapes shared by the admin API and the admin UI. No server-only imports here. */

export const STATUSES = ["New", "In review", "Contacted", "Shortlisted", "Confirmed", "Waitlisted", "Declined", "Archived"] as const;
export type Status = (typeof STATUSES)[number];

/** Columns the portal adds to every tab. A blank Status means "New". */
export const STATUS_COL = "Status";
export const NOTES_COL = "Notes";
/** Never editable: they identify and date a submission. */
export const READ_ONLY_COLS: readonly string[] = ["Submitted at", "Reference"];

export type AdminRow = {
  /** 1-based row number in the sheet. Changes when rows above it are deleted, so always refetch after a delete. */
  r: number;
  /** Fingerprint of the row's content, sent back with edits so a stale write is refused. */
  f: string;
  v: string[];
};

export type AdminTab = {
  /** Form key for the site's own forms, otherwise the tab name. */
  key: string;
  /** Exact sheet tab name. */
  name: string;
  label: string;
  singular: string;
  description: string;
  /** Headers shown by default; the rest are one click away in "Columns". */
  defaultColumns: string[];
  headers: string[];
  rows: AdminRow[];
};

export type AdminData = {
  spreadsheetUrl: string | null;
  fetchedAt: string;
  tabs: AdminTab[];
};

export type RowOp =
  | { type: "update"; row: number; fp: string; set: Record<string, string> }
  | { type: "delete"; row: number; fp: string };

export type OpResult = {
  row: number;
  type: "update" | "delete";
  ok: boolean;
  error?: string;
  v?: string[];
  f?: string;
  headers?: string[];
};
