/* ==========================================================================
   build-cola-data.mjs — turns src/data/cola-history.csv into src/data/cola.json
   consumed by the COLA calculator, the Key Dates page, and the methodology page.

   Refreshing from the source (optional, requires network to BLS/SSA):
     - Official COLAs:  https://www.ssa.gov/cola/
     - CPI-W (CWUR0000SA0) series: https://www.bls.gov/cpi/  (BLS API v2)
   The bundled CSV keeps builds reproducible offline; update it each October
   after the SSA announcement.
   ========================================================================== */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { colaFromQuarterAverages } from "../src/assets/js/lib/cola-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "src", "data");

function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(",");
  return lines.filter(Boolean).map((line) => {
    const cells = line.split(",");
    const row = {};
    cols.forEach((c, i) => (row[c.trim()] = (cells[i] ?? "").trim()));
    return row;
  });
}

const rows = parseCsv(readFileSync(join(DATA, "cola-history.csv"), "utf8")).map((r) => ({
  year: Number(r.year),
  colaPct: Number(r.cola_pct),
  effective: r.effective || null,
  announced: r.announced || null,
  q3CpiwAvg: r.q3_cpiw_avg ? Number(r.q3_cpiw_avg) : null,
  status: r.status || "official",
  source: r.source || "",
}));

const official = rows.filter((r) => r.status === "official").sort((a, b) => a.year - b.year);
const projectedRow = rows.find((r) => r.status === "projected");
const latestOfficial = official[official.length - 1];

// Worked example: recompute the most recent official COLA from CPI-W to prove
// the formula (prior year's Q3 average vs the year before that).
let worked = null;
if (official.length >= 2) {
  const cur = official[official.length - 1];
  const prev = official[official.length - 2];
  if (cur.q3CpiwAvg && prev.q3CpiwAvg) {
    const c = colaFromQuarterAverages(prev.q3CpiwAvg, cur.q3CpiwAvg);
    worked = {
      priorDeterminationYear: prev.year - 1,
      priorQ3Avg: prev.q3CpiwAvg,
      currentDeterminationYear: cur.year - 1,
      currentQ3Avg: cur.q3CpiwAvg,
      computedColaPercent: Number(c.colaPercent.toFixed(1)),
      officialColaPercent: cur.colaPct,
      colaEffectiveYear: cur.year,
    };
  }
}

const out = {
  generatedFrom: "src/data/cola-history.csv",
  confirmedYear: latestOfficial.year,
  confirmedCola: latestOfficial.colaPct,
  confirmedAnnounced: latestOfficial.announced,
  projectedYear: projectedRow ? projectedRow.year : null,
  projectedCola: projectedRow ? projectedRow.colaPct : null,
  projectedSource: projectedRow ? projectedRow.source : null,
  // The official CPI-W release + SSA COLA announcement for the projected cycle.
  nextAnnouncementDate: "2026-10-14",
  nextAnnouncementNote: "BLS releases September CPI-W at 8:30 a.m. ET; SSA typically announces the official COLA the same day.",
  history: rows,
  worked,
};

writeFileSync(join(DATA, "cola.json"), JSON.stringify(out, null, 2) + "\n");
console.log(
  `  cola.json: confirmed ${out.confirmedYear}=${out.confirmedCola}% · projected ${out.projectedYear}=${out.projectedCola}%` +
    (worked ? ` · worked check ${worked.computedColaPercent}% (official ${worked.officialColaPercent}%)` : "")
);
