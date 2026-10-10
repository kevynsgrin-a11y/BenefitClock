/* ==========================================================================
   dry-run-flip.mjs — rehearse announcement day without touching the repo.

   What it does
     1. Copies the working tree to a temp directory (never edits this one).
     2. Promotes the projected COLA row to official with placeholder numbers,
        exactly as docs/COLA-ANNOUNCEMENT-RUNBOOK.md tells you to on the day.
     3. Builds the copy, runs the unit tests and verify-build-output.mjs there.
     4. Scans every built page for wording that is only true BEFORE the
        announcement ("expected on", "early estimate", "Awaiting", a leftover
        old percentage, a link to the projection source ...). Any hit fails.
     5. Optionally writes every sentence that only exists in the official state
        to a Markdown file, so the copy owner can read it before the day.

   It runs two variants by default:
     one-row   only the cycle row is promoted (no next-year projection yet —
               the site must simply stop mentioning a projection)
     two-row   the cycle row is promoted AND the next year's projection row is
               appended (the 2028 bar appears in the chart as an estimate)

   Usage
     node scripts/dry-run-flip.mjs [--variant one|two|both] [--cola 3.4]
                                   [--date YYYY-MM-DD] [--copy-list out.md]
                                   [--keep] [--force]

   It only means something inside the determination window (Sept 1 until the
   flip), when the cycle row is the projected row. Outside it the script prints
   why and exits 0, so CI can run it on every commit; --force runs it anyway.
   ========================================================================== */
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { determinationCycleYear } from "../src/assets/js/lib/cola-core.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---- args ------------------------------------------------------------- */
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const variantArg = opt("variant", "both");
const colaArg = Number(opt("cola", "3.4"));
const copyListPath = opt("copy-list", null);
const keep = args.includes("--keep");
const force = args.includes("--force");
if (!["one", "two", "both"].includes(variantArg)) fail(`--variant must be one, two or both (got ${variantArg})`);
if (!Number.isFinite(colaArg) || colaArg <= 0 || colaArg > 20) fail(`--cola must be a plausible percentage (got ${opt("cola")})`);

function fail(msg) {
  console.error(`dry-run-flip: ${msg}`);
  process.exit(2);
}

/* ---- the CSV edit ------------------------------------------------------- */
const csvPath = "src/data/cola-history.csv";

function splitRows(text) {
  const lines = text.split("\n");
  const headerIdx = lines.findIndex((l) => l.trim() && !l.startsWith("#"));
  const cols = lines[headerIdx].split(",").map((c) => c.trim());
  return { lines, headerIdx, cols };
}

function flipCsv(text, { cola, date, withNext }) {
  const { lines, headerIdx, cols } = splitRows(text);
  const at = (name) => cols.indexOf(name);
  for (const need of ["year", "cola_pct", "effective", "announced", "q3_cpiw_avg", "status", "source", "announce_expected"]) {
    if (at(need) === -1) fail(`${csvPath} has no "${need}" column — has the format changed?`);
  }
  const rowIdx = lines.findIndex((l, i) => i > headerIdx && l.split(",")[at("status")]?.trim() === "projected");
  if (rowIdx === -1) fail(`${csvPath} has no status=projected row — nothing to flip. (Already flipped?)`);
  const cells = lines[rowIdx].split(",");
  const year = Number(cells[at("year")]);

  // The official row's Q3 average must reconcile with its percentage or the
  // build refuses (that guard is the point), so derive one that does from the
  // previous official row.
  const prev = lines
    .map((l, i) => (i > headerIdx && l.trim() ? l.split(",") : null))
    .filter((c) => c && c[at("status")]?.trim() === "official" && Number(c[at("year")]) === year - 1)[0];
  if (!prev || !prev[at("q3_cpiw_avg")]) fail(`${csvPath} needs an official ${year - 1} row with q3_cpiw_avg to derive a placeholder.`);
  const q3 = (Number(prev[at("q3_cpiw_avg")]) * (1 + cola / 100)).toFixed(3);

  const announcedDate = date || cells[at("announce_expected")] || null;
  if (!announcedDate) fail(`the projected row has no announce_expected and no --date was given.`);

  cells[at("cola_pct")] = String(cola);
  cells[at("announced")] = announcedDate;
  cells[at("q3_cpiw_avg")] = q3;
  cells[at("status")] = "official";
  cells[at("source")] = "Social Security Administration";
  cells[at("announce_expected")] = "";
  lines[rowIdx] = cells.join(",");

  if (withNext) {
    const next = new Array(cols.length).fill("");
    next[at("year")] = String(year + 1);
    next[at("cola_pct")] = "3.1";
    next[at("effective")] = `${year + 1}-01-01`;
    next[at("status")] = "projected";
    next[at("source")] = "DRYRUN PLACEHOLDER SOURCE";
    const d = new Date(`${announcedDate}T00:00:00Z`);
    d.setUTCFullYear(d.getUTCFullYear() + 1);
    d.setUTCDate(d.getUTCDate() - 1);
    next[at("announce_expected")] = d.toISOString().slice(0, 10);
    lines.splice(rowIdx + 1, 0, next.join(","));
  }
  return { text: lines.join("\n"), year };
}

/* ---- stale-wording scan -------------------------------------------------
   Each pattern is wording that is true only while the COLA is a projection.
   They are deliberately a little greedy: a false alarm costs a minute, a
   missed "expected on October 14" on announcement day costs the site's
   credibility with the exact audience it exists for. */
function stalePatterns({ oldPct, year, withNext }) {
  const near = (a, b, n = 90) => new RegExp(`(?:${a})[^.<>]{0,${n}}(?:${b})|(?:${b})[^.<>]{0,${n}}(?:${a})`, "i");
  const patterns = [
    ["early COLA estimate / projection", near("COLA|cost-of-living|raise", "early (estimate|projection)")],
    ["'Estimate only' badge", /Estimate only/i],
    ["'Awaiting … announcement'", /Awaiting (the )?(official )?(COLA )?announcement/i],
    ["COLA described as expected / to be announced", near("COLA|cost-of-living", "(is|are|was) expected|expected (on|to)|will be announced|to be announced")],
    // "Estimate your raise" is the calculator's call to action, so only the noun
    // forms count ("is an estimate", "the estimate", "estimated COLA").
    ["COLA described as a projection or estimate", near("COLA|cost-of-living", "projection|projected|\\b(?:an?|the|is|are|still|only|early) estimate\\b|estimated")],
    ["'until … announces'", /until (the )?(SSA|Social Security Administration) announces/i],
    ["'becomes / will become official'", /(becomes|will become|will be) official/i],
    ["'Expected Increase / COLA / raise' label (e.g. a page title)", /\bExpected (Increase|COLA|raise)\b/i],
    ["'date can move' / 'date can slip' for this cycle", /the date can (move|slip)/i],
    ["link to the projection source (tscl.org)", /tscl\.org/i],
    [`the old projected value (${oldPct}%) is still on a page`, new RegExp(`(?<![\\d.])${String(oldPct).replace(".", "\\.")}\\s?(%|percent)`, "i")],
    ["AARP", /AARP/],
  ];
  /* After the flip no sentence should be about the NEXT cycle's COLA. The only
     place that year may appear is the history chart (stripped in readableText),
     where a two-row flip draws it as a labelled estimate. */
  patterns.push([`${year + 1} mentioned in the copy (the page should still be about ${year})`, new RegExp(`\\b${year + 1}\\b`)]);
  return patterns;
}

/* Past-tense history that is true before AND after the announcement. Keep this
   list short and specific; every entry is a sentence someone decided is fine. */
const ALLOWED = [/Early \d{4} COLA projections began/];

/* Text the reader sees: drop scripts/styles/svg but KEEP JSON-LD, because the
   FAQPage blocks are quoted by search engines and must not go stale either. */
function readableText(html) {
  return html
    // Comments first: the layout's head comment mentions a literal "<script>",
    // which a naive script-stripper would swallow along with the page body.
    .replace(/<!--[\s\S]*?-->/g, " ")
    // <meta content="…"> is what search results and social cards show (description,
    // og:title, twitter:*), so it counts as reader-visible text. <title> already does.
    .replace(/<meta\b[^>]*?\bcontent="([^"]*)"[^>]*>/gi, " $1 ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/gi, " ")
    .replace(/<figure class="bc-chart"[\s\S]*?<\/figure>/gi, " ") // data chart: checked via cola.json, may carry the next year's estimate bar
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<(?!\/?a[\s>])[^>]+>/g, " ") // keep <a …> so tscl.org links stay visible
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function listHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listHtml(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/* ---- run one variant ---------------------------------------------------- */
function run(label, withNext) {
  console.log(`\n=== Variant: ${label} ===`);
  const tmp = mkdtempSync(join(tmpdir(), `dryrun-flip-${withNext ? "two" : "one"}-`));
  cpSync(ROOT, tmp, {
    recursive: true,
    filter: (src) => {
      const rel = relative(ROOT, src);
      return !(rel === ".git" || rel.startsWith(".git/") || rel === "dist" || rel.startsWith("dist/") || rel === "node_modules" || rel.startsWith("node_modules/"));
    },
  });

  const csv = join(tmp, csvPath);
  const before = readFileSync(csv, "utf8");
  const projectedBefore = (() => {
    const { lines, headerIdx, cols } = splitRows(before);
    const row = lines.find((l, i) => i > headerIdx && l.split(",")[cols.indexOf("status")]?.trim() === "projected");
    return row ? Number(row.split(",")[cols.indexOf("cola_pct")]) : NaN;
  })();
  const flipped = flipCsv(before, { cola: colaArg, date: opt("date", null), withNext });
  writeFileSync(csv, flipped.text.endsWith("\n") ? flipped.text : flipped.text + "\n");
  console.log(`  flipped ${flipped.year} projected ${projectedBefore}% → official ${colaArg}%${withNext ? `, appended ${flipped.year + 1} projection` : ""}`);

  const sh = (cmd, cmdArgs) => spawnSync(cmd, cmdArgs, { cwd: tmp, encoding: "utf8" });
  const results = [];
  const step = (name, r) => {
    const okRun = r.status === 0;
    console.log(`  ${okRun ? "✓" : "✗"} ${name}`);
    if (!okRun) console.log((r.stdout + r.stderr).split("\n").slice(-25).map((l) => `      ${l}`).join("\n"));
    results.push(okRun);
    return okRun;
  };

  const built = step("build", sh(process.execPath, ["scripts/build.mjs"]));
  if (built) {
    step("unit tests", sh(process.execPath, ["--test"]));
    step("verify-build-output", sh(process.execPath, ["scripts/verify-build-output.mjs"]));

    const cola = JSON.parse(readFileSync(join(tmp, "src/data/cola.json"), "utf8"));
    const cycleOk = cola.cycle.status === "official" && Number(cola.cycle.cola) === colaArg;
    console.log(`  ${cycleOk ? "✓" : "✗"} cola.json cycle is ${cola.cycle.year} ${cola.cycle.status} ${cola.cycle.cola}%` +
      (cycleOk ? "" : ` (expected official ${colaArg}% — the site only treats the flipped row as the cycle from Sept 1; is today before that?)`));
    results.push(cycleOk);

    const patterns = stalePatterns({ oldPct: projectedBefore, year: flipped.year, withNext });
    const dist = join(tmp, "dist");
    let hits = 0;
    for (const file of listHtml(dist).sort()) {
      const text = readableText(readFileSync(file, "utf8"));
      for (const [name, rx] of patterns) {
        const g = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
        for (const m of text.matchAll(g)) {
          if (ALLOWED.some((a) => a.test(text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60)))) continue;
          hits++;
          const start = Math.max(0, m.index - 70);
          console.log(`  ✗ ${relative(dist, file)}: ${name}\n      …${text.slice(start, m.index + m[0].length + 70).trim()}…`);
        }
      }
    }
    if (!hits) console.log(`  ✓ no wording that is only true before the announcement (${patterns.length} patterns, ${listHtml(dist).length} pages)`);
    results.push(hits === 0);
  }

  if (!keep) rmSync(tmp, { recursive: true, force: true });
  else console.log(`  kept ${tmp}`);
  return results.every(Boolean);
}

/* ---- the copy list ------------------------------------------------------
   The sentences a reader sees change on the flip. Rather than dumping template
   source (tokens and all), build the site twice — as it is, and flipped — and
   diff the RENDERED text per page, so the list reads exactly like the pages. */
function paragraphs(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ") // incl. FAQPage JSON-LD, which mirrors the visible FAQ and flips with it
    .replace(/\s+/g, " ") // source line-wrapping is not a paragraph break
    .replace(/<(p|li|h[1-6]|div|section|tr|td|th|summary|figcaption|caption)([\s>])/gi, "\n<$1$2")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/* Minimal LCS diff over line arrays -> [{a: [...], b: [...]}] change hunks. */
function hunks(a, b) {
  const n = a.length, m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const out = [];
  let i = 0, j = 0, cur = null;
  const flush = () => { if (cur) out.push(cur); cur = null; };
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { flush(); i++; j++; }
    else {
      cur ||= { a: [], b: [] };
      if (j >= m || (i < n && t[i + 1][j] >= t[i][j + 1])) cur.a.push(a[i++]);
      else cur.b.push(b[j++]);
    }
  }
  flush();
  return out;
}

function buildCopy(withNext) {
  const tmp = mkdtempSync(join(tmpdir(), "dryrun-copy-"));
  cpSync(ROOT, tmp, {
    recursive: true,
    filter: (src) => { const rel = relative(ROOT, src); return !(rel === ".git" || rel.startsWith(".git/") || rel === "dist" || rel.startsWith("dist/") || rel === "node_modules" || rel.startsWith("node_modules/")); },
  });
  return tmp;
}

function writeCopyList(path) {
  const before = buildCopy();
  const after = buildCopy();
  const csv = join(after, csvPath);
  writeFileSync(csv, flipCsv(readFileSync(csv, "utf8"), { cola: colaArg, date: opt("date", null), withNext: false }).text.replace(/\n*$/, "\n"));
  for (const dir of [before, after]) {
    const r = spawnSync(process.execPath, ["scripts/build.mjs"], { cwd: dir, encoding: "utf8" });
    if (r.status !== 0) fail(`copy-list build failed in ${dir}:\n${(r.stdout + r.stderr).split("\n").slice(-15).join("\n")}`);
  }
  const lines = [
    "# Wording that changes when the COLA is announced",
    "",
    `Rendered text of every page today vs. after the cycle row is promoted to official (placeholder ${colaArg}%, ` +
      "one-row flip). Dollar figures, dates and percentages are placeholders; what you are reviewing is the sentences. " +
      "To change one, edit the `{{#official}}…{{/official}}` text in the page file under `src/pages/`. Nothing here is live until the flip.",
    "",
  ];
  let n = 0, priced = 0;
  const distB = join(before, "dist"), distA = join(after, "dist");
  for (const file of listHtml(distB).sort()) {
    const rel = relative(distB, file);
    const out = [];
    for (const h of hunks(paragraphs(readFileSync(file, "utf8")), paragraphs(readFileSync(join(distA, rel), "utf8")))) {
      const onlyFigures = (arr) => arr.every((l) => /^[+\-−$\d,.% ]+$/.test(l));
      if (onlyFigures(h.a) && onlyFigures(h.b)) { priced += h.a.length; continue; } // re-priced table cells
      n++;
      out.push(`- **Today:** ${h.a.join(" ") || "(nothing)"}`, `  **After:** ${h.b.join(" ") || "(removed)"}`, "");
    }
    if (out.length) lines.push(`## ${rel}`, "", ...out);
  }
  lines.push(`_${n} changed passages. The FAQ structured data (JSON-LD) repeats the FAQ wording above and switches with it; ${priced} dollar-figure cells are re-priced by the new percentage._`, "");
  writeFileSync(path, lines.join("\n"));
  console.log(`Wrote ${n} before/after passages to ${path}`);
  rmSync(before, { recursive: true, force: true });
  rmSync(after, { recursive: true, force: true });
}

/* ---- main --------------------------------------------------------------- */
if (copyListPath) writeCopyList(copyListPath);

/* Only rehearse when there is something to rehearse: a projected row exists AND
   it is the cycle the site is currently telling the story of (Sept 1 until the
   flip). Any other time the flipped row would not be the site's cycle, so the
   rehearsal would be meaningless — skip cleanly so CI can run this on every
   commit without ever going red for the calendar. --force overrides. */
{
  const { lines, headerIdx, cols } = splitRows(readFileSync(join(ROOT, csvPath), "utf8"));
  const row = lines.find((l, i) => i > headerIdx && l.split(",")[cols.indexOf("status")]?.trim() === "projected");
  const todayET = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  if (!row && !force) {
    console.log("dry-run-flip: no status=projected row in the COLA data — nothing to rehearse (already flipped, or no projection published).");
    process.exit(0);
  }
  if (row && !force) {
    const projectedYear = Number(row.split(",")[cols.indexOf("year")]);
    const cycleYear = determinationCycleYear(todayET);
    if (projectedYear !== cycleYear) {
      console.log(`dry-run-flip: the projected row is ${projectedYear} but the site's COLA cycle on ${todayET} is ${cycleYear} (it starts Sept 1), so there is no announcement to rehearse yet. Use --force to run it anyway.`);
      process.exit(0);
    }
  }
}

let allOk = true;
if (variantArg !== "two") allOk = run("one-row flip (promote the cycle row only)", false) && allOk;
if (variantArg !== "one") allOk = run("two-row flip (promote + append next year's projection)", true) && allOk;
console.log(allOk ? "\nDry run clean: announcement day is a data-only edit." : "\nDry run FAILED — see ✗ lines above.");
process.exit(allOk ? 0 : 1);
