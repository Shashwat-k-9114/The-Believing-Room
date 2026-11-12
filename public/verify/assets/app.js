/* The Believing Room — certificate verification.
 * Everything runs in the browser. The secret token lives in the URL fragment (#...), which
 * browsers never send to a server. No analytics, no third-party requests. */
(function () {
  "use strict";

  var script = document.currentScript;
  // data/ sits next to assets/, wherever the site is hosted (/verify/ or a subdomain root).
  var DATA = new URL("../data/", script ? script.src : location.href);
  var SUPPORT = "connect@thebelievingroom.com";
  var resultEl = document.getElementById("result");

  /* ---------- tiny DOM helpers (textContent only: never inject data as HTML) ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function show(nodes) {
    resultEl.replaceChildren.apply(resultEl, nodes);
    resultEl.classList.remove("fade");
    void resultEl.offsetWidth; // restart the fade-in
    resultEl.classList.add("fade");
    resultEl.setAttribute("aria-busy", "false");
  }
  function tickSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "tick");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("aria-hidden", "true");
    var disc = document.createElementNS(svg.namespaceURI, "circle");
    disc.setAttribute("class", "disc"); disc.setAttribute("cx", "16"); disc.setAttribute("cy", "16"); disc.setAttribute("r", "15");
    var mark = document.createElementNS(svg.namespaceURI, "path");
    mark.setAttribute("class", "mark"); mark.setAttribute("d", "M9 16.5l4.8 4.8L23 11.5");
    svg.appendChild(disc); svg.appendChild(mark);
    return svg;
  }
  function supportLink() {
    var a = el("a", null, SUPPORT);
    a.href = "mailto:" + SUPPORT;
    return a;
  }

  /* ---------- crypto ---------- */
  function b64ToBytes(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function decryptRecord(blob, token) {
    var keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    var key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(blob.iv) }, key, b64ToBytes(blob.ct));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function getJSON(path) {
    var res = await fetch(new URL(path, DATA), { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  /* ---------- result screens ---------- */
  function renderVerified(rec) {
    var bar = el("div", "bar ok");
    bar.appendChild(tickSvg());
    bar.appendChild(el("span", null, "Certificate verified"));

    var dl = el("dl", "details");
    // Records without `type` are candidates (all certificates issued before audience certificates existed).
    var audience = rec.type === "audience";
    var rowsData = [["Programme", rec.programme]];
    if (audience) rowsData.push(["Role", "Audience"]);
    rowsData.push(["Event date", rec.event_date], ["Venue", rec.venue], ["Issued on", rec.issued_on], ["Certificate no.", rec.cert_no]);
    rowsData.forEach(function (p) {
      var row = el("div");
      row.appendChild(el("dt", null, p[0]));
      row.appendChild(el("dd", null, p[1]));
      dl.appendChild(row);
    });

    var by = el("p", "by", "Issued by The Believing Room · ");
    var site = el("a", null, "thebelievingroom.com");
    site.href = "https://thebelievingroom.com";
    by.appendChild(site);

    show([bar, el("p", "issued", "This certificate was issued to"), el("h1", "name", rec.name),
          el("p", "kind", audience ? "Certificate of Appreciation" : "Certificate of participation"), dl, by]);
  }

  function renderWarn(title, bodyNodes, hint) {
    var bar = el("div", "bar warn", "Please note");
    var nodes = [bar, el("h1", "warn-title", title)];
    var body = el("p", "warn-body");
    bodyNodes.forEach(function (n) { body.append(n); });
    nodes.push(body);
    if (hint) nodes.push(el("p", "hint", hint));
    show(nodes);
  }
  function renderWithdrawn() {
    renderWarn("This certificate has been withdrawn.", ["Contact ", supportLink(), "."]);
  }
  function renderNotVerified() {
    renderWarn(
      "We couldn’t verify this certificate",
      ["The link is incomplete, has been changed, or doesn’t match any certificate we issued. " +
       "This does not always mean the certificate is fake — a QR code that was copied or shortened by another app often loses part of its link."],
      "Please scan the QR code printed on the original certificate again. If it still fails, contact " + SUPPORT + "."
    );
  }
  function renderIntro() {
    show([el("h1", "warn-title", "Verify a certificate"),
          el("p", "warn-body", "Scan the QR code printed on your certificate with your phone camera to confirm it is genuine. " +
             "You can also check a certificate number below.")]);
  }

  /* ---------- main flow ---------- */
  async function verify() {
    var params = new URLSearchParams(location.search);
    var slug = (params.get("c") || "").trim().toLowerCase();
    var token = decodeURIComponent(location.hash.replace(/^#/, "")).trim();

    if (!slug && !token) return renderIntro();
    if (!/^[a-z0-9-]{1,64}$/.test(slug) || !token) return renderNotVerified();

    try {
      var results = await Promise.all([getJSON("c/" + slug + ".json"), getJSON("index.json")]);
      var rec = await decryptRecord(results[0], token); // throws if token wrong or data altered
      var entry = results[1].filter(function (r) { return r.slug === slug; })[0];
      if (!entry || entry.cert_no !== rec.cert_no) return renderNotVerified();
      if (entry.status === "withdrawn") return renderWithdrawn();
      renderVerified(rec);
    } catch (e) {
      renderNotVerified();
    }
  }

  /* ---------- manual lookup: never shows a name ---------- */
  var indexPromise = null;
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ""); }

  document.getElementById("lookup-form").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var out = document.getElementById("lookup-result");
    var q = norm(document.getElementById("cert-no").value);
    out.className = "lookup-result";
    if (!q) { out.textContent = "Please type a certificate number."; out.classList.add("warn"); return; }
    try {
      indexPromise = indexPromise || getJSON("index.json");
      var list = await indexPromise;
      var hit = list.filter(function (r) { return norm(r.cert_no) === q; })[0];
      if (!hit) { out.textContent = "No certificate with this number."; out.classList.add("warn"); }
      else if (hit.status === "withdrawn") { out.textContent = "This certificate has been withdrawn."; out.classList.add("warn"); }
      else { out.textContent = "Certificate number " + hit.cert_no + " was issued on " + hit.issued_on + "."; out.classList.add("ok"); }
    } catch (e) {
      indexPromise = null;
      out.textContent = "Couldn’t check right now. Please try again."; out.classList.add("warn");
    }
  });

  /* ---------- logo fallback ---------- */
  var logo = document.getElementById("logo"), fb = document.getElementById("logo-fallback");
  function useFallback() { logo.hidden = true; fb.hidden = false; }
  logo.addEventListener("error", useFallback);
  if (logo.complete && logo.naturalWidth === 0) useFallback();

  if (!window.crypto || !crypto.subtle) {
    // WebCrypto needs a secure context (https). Show a clear message rather than a blank page.
    renderWarn("This browser can’t check certificates", ["Please open this page over a secure (https) connection in an up-to-date browser."]);
  } else {
    verify();
  }
})();
