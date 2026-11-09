// Stands in for the Google Apps Script web app (google-sheets/Code.gs) so e2e runs never touch a real sheet.
// It keeps an in-memory spreadsheet and mirrors the script's actions: append (default), list, batch.
// The extra "__reset" action exists only here, so tests can start from a known state.
import http from "node:http";

const SECRET = "e2e-secret";
const MANAGED = ["Status", "Notes"];
const READ_ONLY = ["Submitted at", "Reference"];

/** tab name -> { headers: string[], rows: string[][] }  (rows[0] is sheet row 2) */
let sheets = new Map();

const str = (v) => (v === null || v === undefined ? "" : String(v));

function fingerprint(headers, values) {
  let s = "";
  for (let i = 0; i < values.length; i++) {
    if (MANAGED.includes(headers[i])) continue;
    s += values[i] + "\u0001";
  }
  let h = 5381;
  for (let j = 0; j < s.length; j++) h = ((h << 5) + h + s.charCodeAt(j)) | 0;
  return (h >>> 0).toString(36) + ":" + s.length;
}

function append(data) {
  if (!data.tab || !Array.isArray(data.columns) || !data.row) return { ok: false, error: "bad request" };
  const sheet = sheets.get(data.tab) ?? { headers: [], rows: [] };
  sheets.set(data.tab, sheet);
  for (const c of data.columns) if (!sheet.headers.includes(c)) sheet.headers.push(c);
  sheet.rows.push(sheet.headers.map((h) => (data.row[h] === undefined ? "" : str(data.row[h]))));
  return { ok: true };
}

function list() {
  const tabs = [...sheets].map(([name, sh]) => ({
    name,
    headers: sh.headers,
    rows: sh.rows
      .map((v, i) => ({ r: i + 2, v: sh.headers.map((_, c) => str(v[c])) }))
      .filter((x) => x.v.some((c) => c !== ""))
      .map((x) => ({ ...x, f: fingerprint(sh.headers, x.v) })),
  }));
  return { ok: true, spreadsheetUrl: "https://docs.google.com/spreadsheets/d/e2e-fake/edit", tabs };
}

function current(sh, op) {
  const row = Number(op.row);
  if (!(row >= 2) || row > sh.rows.length + 1) return { error: "Row no longer exists. Refresh and try again." };
  const v = sh.headers.map((_, c) => str(sh.rows[row - 2][c]));
  if (fingerprint(sh.headers, v) !== op.fp) return { error: "This row changed or moved in the sheet. Refresh and try again." };
  return { ok: true };
}

function batch(data) {
  const sh = sheets.get(data.tab);
  if (!sh) return { ok: false, error: "tab not found" };
  const results = [];
  for (const op of data.ops.filter((o) => o.type === "update")) {
    const res = { row: op.row, type: "update", ok: false };
    results.push(res);
    const cur = current(sh, op);
    if (cur.error) { res.error = cur.error; continue; }
    const keys = Object.keys(op.set || {});
    const bad = keys.find((k) => READ_ONLY.includes(k) || (!sh.headers.includes(k) && !MANAGED.includes(k)));
    if (bad) { res.error = READ_ONLY.includes(bad) ? `${bad} cannot be edited` : `unknown column: ${bad}`; continue; }
    for (const k of keys) {
      if (!sh.headers.includes(k)) sh.headers.push(k);
      sh.rows[op.row - 2][sh.headers.indexOf(k)] = str(op.set[k]);
    }
    const v = sh.headers.map((_, c) => str(sh.rows[op.row - 2][c]));
    Object.assign(res, { ok: true, v, f: fingerprint(sh.headers, v), headers: [...sh.headers] });
  }
  for (const op of data.ops.filter((o) => o.type === "delete").sort((a, b) => b.row - a.row)) {
    const res = { row: op.row, type: "delete", ok: false };
    results.push(res);
    const cur = current(sh, op);
    if (cur.error) { res.error = cur.error; continue; }
    sh.rows.splice(op.row - 2, 1);
    res.ok = true;
  }
  return { ok: true, results };
}

http
  .createServer((req, res) => {
    let b = "";
    req.on("data", (d) => (b += d));
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      let data;
      try { data = JSON.parse(b); } catch { return res.end(JSON.stringify({ ok: false, error: "bad json" })); }
      if (data.secret !== SECRET) return res.end(JSON.stringify({ ok: false, error: "unauthorized" }));
      const action = data.action ?? "append";
      let out;
      if (action === "append") out = append(data);
      else if (action === "list") out = list();
      else if (action === "batch") out = batch(data);
      else if (action === "__reset") { sheets = new Map(); out = { ok: true }; }
      else out = { ok: false, error: "unknown action" };
      res.end(JSON.stringify(out));
    });
  })
  .listen(3218);
