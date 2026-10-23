/**
 * Receives form submissions from the website and appends them to this spreadsheet, one tab per form.
 * Setup: see SETUP.md. Deploy as a Web app (Execute as: Me, Who has access: Anyone) and set the script
 * property SECRET to the same value as GOOGLE_SHEET_SECRET on the website.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || data.secret !== secret) return reply({ ok: false, error: "unauthorized" });
    if (!data.tab || !Array.isArray(data.columns) || !data.row) return reply({ ok: false, error: "bad request" });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(data.tab) || ss.insertSheet(data.tab);

      // Header row: created on first use; any column added to the site later is appended on the right.
      // Existing columns never move, so older rows stay aligned.
      var headers = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].filter(String);
      var added = data.columns.filter(function (c) { return headers.indexOf(c) === -1; });
      if (added.length) {
        headers = headers.concat(added);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
        sheet.setFrozenRows(1);
      }

      var values = headers.map(function (h) { return data.row[h] === undefined ? "" : data.row[h]; });
      sheet.appendRow(values);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
