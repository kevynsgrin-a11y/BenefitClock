import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, toRows, deriveAep } from "../scripts/build-aep-data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = join(ROOT, "src", "pages");

const HEAD = "season_year,coverage_year,window_start,window_end,ma_oep_start,ma_oep_end,status,source_updated,source";
const row = (o = {}) => {
  const d = {
    season_year: 2026, coverage_year: 2027,
    window_start: "2026-10-15", window_end: "2026-12-07",
    ma_oep_start: "2027-01-01", ma_oep_end: "2027-03-31",
    status: "current", source_updated: "2026-10-15", source: "CMS",
    ...o,
  };
  return [d.season_year, d.coverage_year, d.window_start, d.window_end,
    d.ma_oep_start, d.ma_oep_end, d.status, d.source_updated, d.source].join(",");
};
const csv = (...rows) => [HEAD, ...rows].join("\n");
const derive = (...rows) => deriveAep(toRows(csv(...rows)));

test("parseCsv skips comment lines so a written-in caveat is never a data row", () => {
  const rows = parseCsv(`# a caveat about the figures\n${HEAD}\n${row()}`);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].season_year, "2026");
});

test("derives the season, coverage year and every phrasing the pages quote", () => {
  const a = derive(row());
  assert.equal(a.seasonYear, 2026);
  assert.equal(a.coverageYear, 2027);
  assert.equal(a.windowStartLabel, "October 15");
  assert.equal(a.windowEndLabel, "December 7");
  assert.equal(a.windowEndLong, "December 7, 2026");
  assert.equal(a.windowRange, "October 15 – December 7");
  assert.equal(a.windowRangeLong, "October 15 – December 7, 2026");
  assert.equal(a.coverageStartLabel, "January 1");
  assert.equal(a.coverageStartLong, "January 1, 2027");
  assert.equal(a.maOepRangeLong, "January 1 – March 31, 2027");
});

test("the season rolls purely from the data", () => {
  const a = derive(row({ season_year: 2027, coverage_year: 2028,
    window_start: "2027-10-15", window_end: "2027-12-07",
    ma_oep_start: "2028-01-01", ma_oep_end: "2028-03-31" }));
  assert.equal(a.seasonYear, 2027);
  assert.equal(a.windowRangeLong, "October 15 – December 7, 2027");
  assert.equal(a.maOepRangeLong, "January 1 – March 31, 2028");
});

test("a statutory date change flows through without touching markup", () => {
  const a = derive(row({ window_start: "2026-10-01", window_end: "2026-12-15" }));
  assert.equal(a.windowRangeLong, "October 1 – December 15, 2026");
});

test("no current season is a build failure, not a stale window left on the page", () => {
  assert.throws(() => derive(row({ status: "past" })), /exactly one row with status=current/);
});

test("two current seasons are rejected rather than silently picking one", () => {
  assert.throws(
    () => derive(row(), row({ season_year: 2027, coverage_year: 2028,
      window_start: "2027-10-15", window_end: "2027-12-07",
      ma_oep_start: "2028-01-01", ma_oep_end: "2028-03-31" })),
    /found 2/
  );
});

test("adding next season early does not roll the site onto an unopened window", () => {
  const a = derive(
    row(),
    row({ season_year: 2027, coverage_year: 2028, window_start: "2027-10-15",
      window_end: "2027-12-07", ma_oep_start: "2028-01-01", ma_oep_end: "2028-03-31",
      status: "future" })
  );
  assert.equal(a.seasonYear, 2026);
});

test("coverage year must be the season year plus one", () => {
  assert.throws(() => derive(row({ coverage_year: 2029 })), /must be season_year \+ 1/);
});

test("window dates must fall inside the season year", () => {
  assert.throws(() => derive(row({ window_start: "2025-10-15" })), /window dates must fall in 2026/);
});

test("MA OEP dates must fall inside the coverage year", () => {
  assert.throws(() => derive(row({ ma_oep_end: "2028-03-31" })), /MA OEP dates must fall in the coverage year/);
});

test("an inverted window is rejected", () => {
  assert.throws(() => derive(row({ window_end: "2026-10-01" })), /window_end must come after window_start/);
});

test("a malformed date is rejected rather than rendered as-is", () => {
  assert.throws(() => derive(row({ window_start: "15-10-2026" })), /must be an ISO date/);
  assert.throws(() => derive(row({ window_start: "" })), /must be an ISO date/);
  assert.throws(() => derive(row({ window_start: "2026-13-01" })), /not a real date/);
});

/* A day-of-month bound of 1-31 accepts dates that do not exist. These are
   enrolment deadlines: an accepted "2026-11-31" renders as "November 31" in
   body copy, meta description and FAQPage structured data, build green. */
test("a day past the end of its month is rejected, not rendered", () => {
  assert.throws(() => derive(row({ window_end: "2026-11-31" })), /not a real date/);
  assert.throws(() => derive(row({ window_start: "2026-09-31" })), /not a real date/);
  assert.throws(() => derive(row({ ma_oep_end: "2027-02-30" })), /not a real date/);
});

test("the last real day of a month is still accepted", () => {
  // Guards the fix from over-correcting: a 31-day month, a 30-day month and a
  // leap-year February must all still parse.
  assert.equal(derive(row({ window_end: "2026-12-31" })).windowEndLong, "December 31, 2026");
  assert.equal(derive(row({ window_start: "2026-09-30" })).windowStartLabel, "September 30");
  const leap = row({ season_year: 2027, coverage_year: 2028,
    window_start: "2027-10-15", window_end: "2027-12-07",
    ma_oep_start: "2028-01-01", ma_oep_end: "2028-02-29", source_updated: "2027-10-15" });
  assert.equal(derive(leap).maOepEnd, "2028-02-29");
  assert.match(derive(leap).maOepRangeLong, /February 29, 2028$/);
});

/* The defect these guard against: markup that looks data-bound but is not.
   `data-year-*` spans are only rewritten by plan-diff.js, which loads on the
   plan tool page alone — so on every other page the fallback text was the
   number people actually read, frozen at whatever year it was typed in. */
const pageFiles = readdirSync(PAGES).filter((f) => f.endsWith(".html"));

test("no page hardcodes a year inside a data-year span", () => {
  const offenders = pageFiles.filter((f) =>
    /data-year-[a-z]+>\s*\d{4}/.test(readFileSync(join(PAGES, f), "utf8"))
  );
  assert.deepEqual(offenders, [], `hardcoded year in a data-year span: ${offenders.join(", ")}`);
});

test("data-year spans only appear on pages that actually load plan-diff.js", () => {
  const offenders = pageFiles.filter((f) => {
    const src = readFileSync(join(PAGES, f), "utf8");
    return src.includes("data-year-") && !/^scripts:.*plan-diff\.js/m.test(src);
  });
  assert.deepEqual(offenders, [], `data-year span with no script to fill it: ${offenders.join(", ")}`);
});

test("the AEP guide states no enrolment date except through the data layer", () => {
  const src = readFileSync(join(PAGES, "guide-aep.html"), "utf8");
  const body = src.split("\n").filter((l) => !l.includes("/guides/medicare-aep-2026")).join("\n");
  const literals = body.match(/October \d+|December \d+|March 31|January 1(?!\d)/g) || [];
  assert.deepEqual(literals, [], `enrolment date written into markup: ${literals.join(", ")}`);
});
