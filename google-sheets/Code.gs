/**
 * The Believing Room: Google Sheet as the database.
 *
 * One web app, used by two callers over POST (JSON body, always carrying the shared SECRET):
 *   - the public site forms      -> action "append" (the default, so the original site keeps working)
 *   - the admin portal (/admin)  -> action "list" (read everything), "batch" (edit / delete rows)
 *
 * Setup: see SETUP.md. Deploy as a Web app (Execute as: Me, Who has access: Anyone) and set the script
 * property SECRET to the same value as GOOGLE_SHEET_SECRET on the website.
 *
 * Safety rules enforced here, not just in the website:
 *   - every call needs the secret;
 *   - an edit or delete names the row AND the fingerprint it was read with. If the row moved or changed
 *     (someone sorted the sheet, or edited the row by hand) the write is refused instead of hitting the wrong row;
 *   - "Submitted at" and "Reference" are never rewritten;
 *   - text starting with = + - @ is stored as text, never as a formula.
 */

// Columns the admin portal manages. They are created on the first edit and ignored by the fingerprint,
// so changing a status or note never makes a row look "changed by someone else".
var MANAGED = ["Status", "Notes"];
var READ_ONLY = ["Submitted at", "Reference"];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || !safeEqual(String(data.secret || ""), secret)) return reply({ ok: false, error: "unauthorized" });

    var action = data.action || "append";
    if (action === "list") return reply(listAll());
    if (action === "append") return reply(withLock(function () { return append(data); }));
    if (action === "batch") return reply(withLock(function () { return batch(data); }));
    return reply({ ok: false, error: "unknown action" });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/* ------------------------------------------------------------------ append (public forms) */

function append(data) {
  if (!data.tab || !Array.isArray(data.columns) || !data.row) return { ok: false, error: "bad request" };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(data.tab) || ss.insertSheet(data.tab);

  // Header row: created on first use; any column added to the site later is appended on the right.
  // Existing columns never move, so older rows stay aligned.
  var headers = readHeaders(sheet);
  var added = data.columns.filter(function (c) { return headers.indexOf(c) === -1; });
  if (added.length) {
    headers = headers.concat(added);
    writeHeaders(sheet, headers);
  }

  var values = headers.map(function (h) { return data.row[h] === undefined ? "" : data.row[h]; });
  sheet.appendRow(values);
  return { ok: true };
}

/* ------------------------------------------------------------------ list (admin portal) */

function listAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = ss.getSheets().map(function (sh) {
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return { name: sh.getName(), headers: [], rows: [] };
    var grid = sh.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = grid[0].map(str);
    var rows = [];
    for (var i = 1; i < grid.length; i++) {
      var v = grid[i].map(str);
      if (v.every(function (x) { return x === ""; })) continue; // skip blank spacer rows
      rows.push({ r: i + 1, f: fingerprint(headers, v), v: v });
    }
    return { name: sh.getName(), headers: headers, rows: rows };
  });
  return { ok: true, spreadsheetUrl: ss.getUrl(), tabs: tabs };
}

/* ------------------------------------------------------------------ batch (admin edits / deletes) */

/**
 * data.tab  : sheet tab name
 * data.ops  : [{ type: "update", row, fp, set: {Header: value} } | { type: "delete", row, fp }]
 * Updates run first (row numbers are still valid), deletes then run bottom-up so earlier rows do not shift.
 * Each op is reported separately: one stale row never blocks the rest.
 */
function batch(data) {
  if (!data.tab || !Array.isArray(data.ops)) return { ok: false, error: "bad request" };
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.tab);
  if (!sheet) return { ok: false, error: "tab not found" };

  var headers = readHeaders(sheet);
  var updates = data.ops.filter(function (o) { return o.type === "update"; });
  var deletes = data.ops.filter(function (o) { return o.type === "delete"; }).sort(function (a, b) { return b.row - a.row; });
  var results = [];

  updates.forEach(function (op) {
    var res = { row: op.row, type: "update", ok: false };
    results.push(res);
    var current = currentRow(sheet, headers, op);
    if (current.error) { res.error = current.error; return; }

    var set = op.set || {};
    var keys = Object.keys(set);
    for (var k = 0; k < keys.length; k++) {
      if (READ_ONLY.indexOf(keys[k]) !== -1) { res.error = keys[k] + " cannot be edited"; return; }
      if (headers.indexOf(keys[k]) === -1 && MANAGED.indexOf(keys[k]) === -1) { res.error = "unknown column: " + keys[k]; return; }
    }
    keys.forEach(function (key) {
      var idx = headers.indexOf(key);
      if (idx === -1) { // a managed column used for the first time
        headers.push(key);
        writeHeaders(sheet, headers);
        idx = headers.length - 1;
      }
      var cell = sheet.getRange(op.row, idx + 1);
      cell.setNumberFormat("@"); // plain text: no date / number / formula coercion of edited values
      cell.setValue(String(set[key]));
    });
    var fresh = sheet.getRange(op.row, 1, 1, headers.length).getValues()[0].map(str);
    res.ok = true;
    res.v = fresh;
    res.f = fingerprint(headers, fresh);
    res.headers = headers;
  });

  deletes.forEach(function (op) {
    var res = { row: op.row, type: "delete", ok: false };
    results.push(res);
    var current = currentRow(sheet, headers, op);
    if (current.error) { res.error = current.error; return; }
    sheet.deleteRow(op.row);
    res.ok = true;
  });

  return { ok: true, results: results };
}

/** Reads the row the caller means and checks it is still the same row. */
function currentRow(sheet, headers, op) {
  var row = Number(op.row);
  if (!(row >= 2) || row > sheet.getLastRow()) return { error: "Row no longer exists. Refresh and try again." };
  var width = Math.max(headers.length, 1);
  var v = sheet.getRange(row, 1, 1, width).getValues()[0].map(str);
  if (fingerprint(headers, v) !== op.fp) return { error: "This row changed or moved in the sheet. Refresh and try again." };
  return { values: v };
}

/* ------------------------------------------------------------------ helpers */

function readHeaders(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(str);
}

function writeHeaders(sheet, headers) {
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/** Every cell as a string. Dates become ISO instants so the portal can sort and filter them. */
function str(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** Cheap content hash of a row, ignoring the portal-managed columns. Not a secret; it only detects drift. */
function fingerprint(headers, values) {
  var s = "";
  for (var i = 0; i < values.length; i++) {
    if (MANAGED.indexOf(headers[i]) !== -1) continue;
    s += values[i] + "\u0001";
  }
  var h = 5381;
  for (var j = 0; j < s.length; j++) h = ((h << 5) + h + s.charCodeAt(j)) | 0;
  return (h >>> 0).toString(36) + ":" + s.length;
}

function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
