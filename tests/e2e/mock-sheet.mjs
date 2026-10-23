// Stands in for the Google Apps Script web app so e2e runs never touch a real sheet.
import http from "node:http";
http
  .createServer((req, res) => {
    let b = "";
    req.on("data", (d) => (b += d));
    req.on("end", () => {
      const ok = (() => { try { return JSON.parse(b).secret === "e2e-secret"; } catch { return false; } })();
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok }));
    });
  })
  .listen(3218);
