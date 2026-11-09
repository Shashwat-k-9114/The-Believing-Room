import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, passwordMatches, readCookie, verifySessionToken } from "@/lib/admin/session";
import {
  compareValues, csvCell, emptyFilters, facetColumns, filterRows, groupRows, orderedColumns, sortRows, statusOf, toCsv, toJson, toTsv,
} from "@/lib/admin/table";
import type { AdminRow } from "@/lib/admin/types";

const headers = ["Submitted at", "Reference", "Full name", "Email", "College", "Graduation year", "Status", "Notes"];
const rows: AdminRow[] = [
  { r: 2, f: "a", v: ["2026-11-01T10:00:00.000Z", "TBR-C-AAAAAA", "Asha Rao", "asha@x.com", "BIT Noida", "2027", "", ""] },
  { r: 3, f: "b", v: ["2026-11-03T10:00:00.000Z", "TBR-C-BBBBBB", "Ben Iyer", "ben@x.com", "BIT Noida", "2026", "Shortlisted", "strong"] },
  { r: 4, f: "c", v: ["2026-11-05T10:00:00.000Z", "TBR-C-CCCCCC", "Chitra Nair", "chitra@x.com", "IIT Delhi", "2027", "Declined", ""] },
  { r: 5, f: "d", v: ["2026-11-06T10:00:00.000Z", "TBR-C-DDDDDD", "Dev Shah", "dev@x.com", "IIT Delhi", "10", "New", ""] },
];

describe("admin session", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery");
    vi.stubEnv("ADMIN_SESSION_SECRET", "s3cret");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("accepts a token it just issued", async () => expect(await verifySessionToken(await createSessionToken())).toBe(true));
  it("rejects a tampered signature, payload, or garbage", async () => {
    const t = await createSessionToken();
    const [exp, nonce, sig] = t.split(".");
    expect(await verifySessionToken(`${exp}.${nonce}.${sig.replace(/.$/, sig.endsWith("0") ? "1" : "0")}`)).toBe(false);
    expect(await verifySessionToken(`${Number(exp) + 999}.${nonce}.${sig}`)).toBe(false);
    expect(await verifySessionToken("nope")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });
  it("expires after its lifetime", async () => {
    const t = await createSessionToken(Date.now());
    expect(await verifySessionToken(t, Date.now() + 9 * 3600 * 1000)).toBe(false);
  });
  it("is invalidated when the password changes", async () => {
    const t = await createSessionToken();
    vi.stubEnv("ADMIN_PASSWORD", "a different password");
    expect(await verifySessionToken(t)).toBe(false);
  });
  it("checks the password", async () => {
    expect(await passwordMatches("correct horse battery")).toBe(true);
    expect(await passwordMatches("correct horse batter")).toBe(false);
    expect(await passwordMatches("")).toBe(false);
  });
  it("refuses everything when the password is too short or missing", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "short");
    expect(await passwordMatches("short")).toBe(false);
    expect(await verifySessionToken(await createSessionToken())).toBe(false);
  });
  it("reads a cookie from a header", () => {
    expect(readCookie("a=1; tbr_admin=xyz; b=2", "tbr_admin")).toBe("xyz");
    expect(readCookie(null, "tbr_admin")).toBeUndefined();
  });
});

describe("table helpers", () => {
  it("orders columns: identity, status, fields, notes", () => {
    expect(orderedColumns(["Email", "Notes", "Status", "Reference", "Submitted at", ""]).map((c) => c.name)).toEqual([
      "Submitted at", "Reference", "Status", "Email", "Column 6", "Notes",
    ]);
  });
  it("treats a blank status as New", () => expect(statusOf(rows[0], headers)).toBe("New"));

  it("compares dates, numbers and text sensibly", () => {
    expect(compareValues("2026-01-02T00:00:00Z", "2026-01-10T00:00:00Z")).toBeLessThan(0);
    expect(compareValues("9", "10")).toBeLessThan(0); // numeric, not lexical
    expect(compareValues("apple", "Banana")).toBeLessThan(0);
    expect(compareValues("", "a")).toBeGreaterThan(0);
  });
  it("sorts both ways and keeps blanks last", () => {
    const asc = sortRows(rows, headers, { column: "Graduation year", dir: "asc" }).map((r) => r.r);
    expect(asc).toEqual([5, 3, 2, 4]);
    const desc = sortRows(rows, headers, { column: "Graduation year", dir: "desc" }).map((r) => r.r);
    expect(desc).toEqual([2, 4, 3, 5]);
    const blankLast = sortRows(rows, headers, { column: "Notes", dir: "desc" }).map((r) => r.r);
    expect(blankLast[0]).toBe(3);
  });

  it("filters by text, status, date and facet together", () => {
    const tab = { headers };
    expect(filterRows(tab, rows, { ...emptyFilters(), query: "iit asha" })).toHaveLength(0);
    expect(filterRows(tab, rows, { ...emptyFilters(), query: "IIT" }).map((r) => r.r)).toEqual([4, 5]);
    expect(filterRows(tab, rows, { ...emptyFilters(), statuses: ["New"] }).map((r) => r.r)).toEqual([2, 5]); // blank counts as New
    expect(filterRows(tab, rows, { ...emptyFilters(), facets: { College: ["BIT Noida"] } }).map((r) => r.r)).toEqual([2, 3]);
    const d = (s: string) => new Date(s);
    const day = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    const f = filterRows(tab, rows, { ...emptyFilters(), from: day(d(rows[1].v[0])), to: day(d(rows[2].v[0])) });
    expect(f.map((r) => r.r)).toEqual([3, 4]);
  });

  it("offers category filters only for columns that are categories", () => {
    const names = facetColumns({ headers, rows }).map((c) => c.name);
    expect(names).toContain("College");
    expect(names).not.toContain("Email");
    expect(names).not.toContain("Reference");
  });
  it("groups by a column, biggest first", () => {
    const g = groupRows(rows, headers, "College");
    expect(g.map((x) => [x.key, x.rows.length])).toEqual([["BIT Noida", 2], ["IIT Delhi", 2]]);
  });
});

describe("export formats", () => {
  it("quotes CSV cells and escapes quotes", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
  it("neutralises spreadsheet formulas but leaves numbers and phone prefixes alone", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell("+91 98765 43210")).toBe("+91 98765 43210");
    expect(csvCell("-12")).toBe("-12");
  });
  it("writes CSV with CRLF and an optional BOM for Excel", () => {
    expect(toCsv(["a", "b"], [["1", "x,y"]])).toBe('a,b\r\n1,"x,y"\r\n');
    expect(toCsv(["a"], [["1"]], { bom: true }).startsWith("﻿")).toBe(true);
  });
  it("writes TSV that pastes into a sheet, quoting tabs and newlines", () => {
    expect(toTsv(["a", "b"], [["1", "x\ty"]])).toBe('a\tb\n1\t"x\ty"');
  });
  it("writes JSON objects keyed by column", () => {
    expect(JSON.parse(toJson(["a", "b"], [["1"]]))).toEqual([{ a: "1", b: "" }]);
  });
});
