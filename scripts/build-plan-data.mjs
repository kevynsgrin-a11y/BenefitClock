/* ==========================================================================
   build-plan-data.mjs — produces the JSON the "What Changed" tool loads:
     src/data/plans-current.json   (prior plan year, e.g. 2026)
     src/data/plans-next.json      (upcoming plan year, e.g. 2027)
     src/data/crosswalk.json       (prior -> upcoming plan mapping + status)
     src/data/manifest.json        (years + provenance)

   Data source of record (public domain, no licensing):
     Landscape files:  https://www.cms.gov/medicare/coverage/prescription-drug-coverage
     Crosswalk files:  released alongside Landscape each late Sep / early Oct
     Plan Benefit Pkg: released shortly after

   Ingestion mode: if real CMS CSVs are present in src/data/ (landscape-current.csv,
   landscape-next.csv, crosswalk.csv) they are parsed and used verbatim. Otherwise
   a DETERMINISTIC, structurally-faithful sample dataset is generated so the tool
   works before the official 2027 files drop. Sample rows are clearly flagged in
   the manifest (sample:true) and every plan carries sample:true.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "src", "data");

const CURRENT_YEAR = 2026;
const NEXT_YEAR = 2027;

/* ---- deterministic PRNG (so builds are reproducible) ------------------- */
function cyrb32(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFor = (key) => mulberry32(cyrb32(key));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const round = (n, step) => Math.round(n / step) * step;

/* ---- geography (state, counties, fips) --------------------------------- */
const GEO = [
  { state: "FL", counties: [["Broward", "12011"], ["Miami-Dade", "12086"], ["Palm Beach", "12099"]] },
  { state: "TX", counties: [["Harris", "48201"], ["Dallas", "48113"], ["Bexar", "48029"]] },
  { state: "CA", counties: [["Los Angeles", "06037"], ["San Diego", "06073"], ["Orange", "06059"]] },
  { state: "NY", counties: [["Kings", "36047"], ["Queens", "36081"], ["Erie", "36029"]] },
  { state: "PA", counties: [["Philadelphia", "42101"], ["Allegheny", "42003"]] },
  { state: "AZ", counties: [["Maricopa", "04013"], ["Pima", "04019"]] },
  { state: "OH", counties: [["Cuyahoga", "39035"], ["Franklin", "39049"]] },
  { state: "NC", counties: [["Mecklenburg", "37119"], ["Wake", "37183"]] },
  { state: "GA", counties: [["Fulton", "13121"], ["DeKalb", "13089"]] },
  { state: "IL", counties: [["Cook", "17031"], ["DuPage", "17043"]] },
];

/* ---- carriers ---------------------------------------------------------- */
const MA_CARRIERS = [
  { org: "UnitedHealthcare", prefix: "H", base: 5253, tiers: ["Complete", "Patriot", "Giveback"] },
  { org: "Humana", prefix: "H", base: 1036, tiers: ["Gold Plus", "Value", "Honor"] },
  { org: "Aetna Medicare", prefix: "H", base: 1610, tiers: ["Eagle", "Premier", "Value"] },
  { org: "Cigna Healthcare", prefix: "H", base: 4513, tiers: ["Preferred", "Achieve", "Essential"] },
  { org: "Wellcare by Centene", prefix: "H", base: 1416, tiers: ["Giveback", "Assist", "No Premium"] },
  { org: "Devoted Health", prefix: "H", base: 8173, tiers: ["Core", "Choice"] },
  { org: "Blue Cross Blue Shield", prefix: "H", base: 3312, tiers: ["Vantage", "Select"] },
];
const KAISER = { org: "Kaiser Permanente", prefix: "H", base: 524, tiers: ["Senior Advantage", "Medicare Plus"], onlyStates: ["CA"] };
const PDP_CARRIERS = [
  { org: "SilverScript (Aetna)", prefix: "S", base: 5601, tiers: ["SmartSaver", "Choice"] },
  { org: "Wellcare", prefix: "S", base: 4802, tiers: ["Value Script", "Classic"] },
  { org: "UnitedHealthcare", prefix: "S", base: 5820, tiers: ["Part D Saver", "Preferred"] },
];

const PREMIUMS_MA = [0, 0, 0, 9, 18, 26, 39, 54, 78];
const PREMIUMS_PDP = [0, 2.4, 8.9, 15.5, 22.7, 36.4, 48.8];
const DEDUCTIBLES_CUR = [0, 0, 250, 400, 545];      // 2026: Part D max deductible $545
const DEDUCTIBLES_NEXT = [0, 0, 300, 470, 615];     // 2027: higher max
const MOOP_CUR = [3450, 4500, 5500, 6700, 7550, 8850];
const STARS = [2.5, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0, 4.5, 5.0];

function contractId(carrier, state) {
  const stateIdx = GEO.findIndex((g) => g.state === state);
  const n = (carrier.base + stateIdx * 7) % 10000;
  return carrier.prefix + String(n).padStart(4, "0");
}

/* ---- build the current-year product catalog per carrier+state ---------- */
function makeProducts(carrier, state, type) {
  const rng = rngFor(`${carrier.org}|${state}|${type}|products`);
  const nProducts = type === "PDP" ? 2 : Math.max(2, Math.round(carrier.tiers.length * (0.7 + rng() * 0.4)));
  const products = [];
  for (let i = 0; i < nProducts && i < carrier.tiers.length; i++) {
    const tier = carrier.tiers[i];
    const planId = String(1 + i).padStart(3, "0");
    const network = type === "PDP" ? "PDP" : pick(rng, ["HMO", "HMO", "PPO"]);
    const isGiveback = /giveback|no premium|value|saver/i.test(tier);
    const premium =
      type === "PDP" ? pick(rng, PREMIUMS_PDP) : isGiveback ? pick(rng, [0, 0, 0, 9]) : pick(rng, PREMIUMS_MA);
    const stars = pick(rng, STARS);
    products.push({
      contractId: contractId(carrier, state),
      planId,
      segmentId: "0",
      orgName: carrier.org,
      planType: type,
      network,
      planName:
        type === "PDP"
          ? `${carrier.org} ${tier} (PDP)`
          : `${carrier.org} ${tier} (${network})`,
      premium: Number(premium),
      drugDeductible: type === "MA" ? null : pick(rng, DEDUCTIBLES_CUR),
      moop: type === "PDP" ? null : pick(rng, MOOP_CUR),
      starRating: stars,
      hasDrugCoverage: type !== "MA",
      hasDental: type === "PDP" ? false : rng() > 0.15,
      hasVision: type === "PDP" ? false : rng() > 0.2,
      hasHearing: type === "PDP" ? false : rng() > 0.3,
    });
  }
  return products;
}

/* ---- expand a product across a state's counties ------------------------ */
function expandToCounties(product, geo) {
  const rows = [];
  for (const [county, fips] of geo.counties) {
    const rng = rngFor(`${product.contractId}|${product.planId}|${county}|cur`);
    // Small county-level premium variation for MA (PDP is regional/flat).
    const premium =
      product.planType === "PDP" ? product.premium : Math.max(0, round(product.premium + (rng() - 0.5) * 12, 1));
    rows.push({
      ...product,
      state: geo.state,
      county,
      fips,
      premium: Number(premium.toFixed ? premium.toFixed(2) : premium),
      year: CURRENT_YEAR,
      sample: true,
    });
  }
  return rows;
}

/* ---- decide next-year status + build successor ------------------------- */
function nextYearFor(product, currentRowsByCounty) {
  const rng = rngFor(`${product.contractId}|${product.planId}|status`);
  const roll = rng();
  let status;
  if (roll < 0.72) status = "renewal";
  else if (roll < 0.84) status = "consolidation";
  else if (roll < 0.92) status = "service-area-reduction";
  else status = "termination";

  if (status === "termination") {
    return { status, toContractId: null, toPlanId: null, rows: [] };
  }

  // Consolidation redirects to planId+1 within the same contract (successor).
  let toPlanId = product.planId;
  if (status === "consolidation") {
    const n = (Number(product.planId) % 9) + 1;
    toPlanId = String(n).padStart(3, "0");
  }

  const rows = [];
  for (const cur of currentRowsByCounty) {
    const rng2 = rngFor(`${product.contractId}|${toPlanId}|${cur.county}|next`);
    // Premiums drift up more often than down (benefit-cost pressure).
    const premDelta = product.planType === "PDP" ? round((rng2() - 0.35) * 18, 1) : round((rng2() - 0.35) * 22, 1);
    const premium = Math.max(0, (Number(cur.premium) + premDelta));
    const moop =
      cur.moop == null ? null : Math.min(9250, round(cur.moop + Math.round((rng2() - 0.25) * 900), 50));
    const dedPool = cur.drugDeductible == null ? [null] : DEDUCTIBLES_NEXT;
    const drugDeductible = cur.drugDeductible == null ? null : (rng2() > 0.4 ? pick(rng2, dedPool) : cur.drugDeductible);
    // Occasionally trim a supplemental benefit (the 2027 contraction thesis).
    const dropDental = cur.hasDental && rng2() > 0.85;
    const dropVision = cur.hasVision && rng2() > 0.88;
    const dropHearing = cur.hasHearing && rng2() > 0.82;
    const starDelta = pick(rng2, [-0.5, 0, 0, 0, 0.5]);

    rows.push({
      ...cur,
      planId: toPlanId,
      planName: cur.planName.replace(/\((HMO|PPO|PDP)\)/, `($1)`),
      premium: Number(premium.toFixed(2)),
      moop,
      drugDeductible,
      hasDental: dropDental ? false : cur.hasDental,
      hasVision: dropVision ? false : cur.hasVision,
      hasHearing: dropHearing ? false : cur.hasHearing,
      starRating: Math.max(2.0, Math.min(5.0, cur.starRating + starDelta)),
      year: NEXT_YEAR,
      sample: true,
    });
  }
  return { status, toContractId: product.contractId, toPlanId, rows };
}

/* ---- generate the whole sample dataset --------------------------------- */
function generate() {
  const current = [];
  const next = [];
  const crosswalk = [];

  for (const geo of GEO) {
    const carriers = [
      ...MA_CARRIERS.map((c) => ({ c, type: "MA/MAPD" })),
      ...(KAISER.onlyStates.includes(geo.state) ? [{ c: KAISER, type: "MA/MAPD" }] : []),
      ...PDP_CARRIERS.map((c) => ({ c, type: "PDP" })),
    ];

    for (const { c, type } of carriers) {
      const kind = type === "PDP" ? "PDP" : "MAPD";
      const products = makeProducts(c, geo.state, kind === "PDP" ? "PDP" : "MAPD");
      for (const product of products) {
        const curRows = expandToCounties(product, geo);
        current.push(...curRows);

        const ny = nextYearFor(product, curRows);
        crosswalk.push({
          fromContractId: product.contractId,
          fromPlanId: product.planId,
          toContractId: ny.toContractId,
          toPlanId: ny.toPlanId,
          status: ny.status,
        });
        next.push(...ny.rows);
      }
    }
  }

  // A few brand-new 2027 plans (status: new) so the tool shows fresh options.
  const rngNew = rngFor("brand-new-2027");
  for (const geo of GEO.slice(0, 4)) {
    const c = pick(rngNew, MA_CARRIERS);
    const cid = contractId(c, geo.state);
    const planId = "090";
    for (const [county, fips] of geo.counties) {
      next.push({
        contractId: cid, planId, segmentId: "0", orgName: c.org, planType: "MAPD",
        network: "PPO", planName: `${c.org} ${pick(rngNew, ["Horizon", "Summit", "Freedom"])} (PPO)`,
        premium: pick(rngNew, [0, 0, 12, 29]), drugDeductible: pick(rngNew, DEDUCTIBLES_NEXT),
        moop: pick(rngNew, MOOP_CUR), starRating: pick(rngNew, [3.5, 4.0, 4.5]),
        hasDrugCoverage: true, hasDental: true, hasVision: true, hasHearing: true,
        state: geo.state, county, fips, year: NEXT_YEAR, sample: true,
      });
    }
    crosswalk.push({ fromContractId: null, fromPlanId: null, toContractId: cid, toPlanId: planId, status: "new" });
  }

  return { current, next, crosswalk, sample: true };
}

/* ---- optional real CSV ingestion --------------------------------------- */
function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(",").map((c) => c.trim());
  return lines.filter(Boolean).map((line) => {
    // minimal CSV: handles quoted commas
    const cells = [];
    let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    const row = {};
    cols.forEach((c, i) => (row[c] = (cells[i] ?? "").trim()));
    return row;
  });
}

function main() {
  let data;
  let sample = true;
  const haveReal =
    existsSync(join(DATA, "landscape-current.csv")) &&
    existsSync(join(DATA, "landscape-next.csv")) &&
    existsSync(join(DATA, "crosswalk.csv"));

  if (haveReal) {
    sample = false;
    const mapPlan = (r, year) => ({
      contractId: r.contract_id || r.contractId,
      planId: String(r.plan_id || r.planId).padStart(3, "0"),
      segmentId: r.segment_id || "0",
      orgName: r.organization_name || r.orgName || "",
      planType: r.plan_type || r.planType || "",
      network: r.network || "",
      planName: r.plan_name || r.planName || "",
      premium: r.premium === "" ? null : Number(r.premium),
      drugDeductible: r.drug_deductible === "" || r.drug_deductible == null ? null : Number(r.drug_deductible),
      moop: r.moop === "" || r.moop == null ? null : Number(r.moop),
      starRating: r.star_rating ? Number(r.star_rating) : null,
      hasDrugCoverage: /^(1|true|y|yes)$/i.test(r.has_drug || ""),
      hasDental: /^(1|true|y|yes)$/i.test(r.has_dental || ""),
      hasVision: /^(1|true|y|yes)$/i.test(r.has_vision || ""),
      hasHearing: /^(1|true|y|yes)$/i.test(r.has_hearing || ""),
      state: r.state, county: r.county, fips: r.fips || "",
      year, sample: false,
    });
    const current = parseCsv(readFileSync(join(DATA, "landscape-current.csv"), "utf8")).map((r) => mapPlan(r, CURRENT_YEAR));
    const next = parseCsv(readFileSync(join(DATA, "landscape-next.csv"), "utf8")).map((r) => mapPlan(r, NEXT_YEAR));
    const crosswalk = parseCsv(readFileSync(join(DATA, "crosswalk.csv"), "utf8")).map((r) => ({
      fromContractId: r.previous_contract_id || r.fromContractId || null,
      fromPlanId: r.previous_plan_id ? String(r.previous_plan_id).padStart(3, "0") : null,
      toContractId: r.contract_id || r.toContractId || null,
      toPlanId: r.plan_id ? String(r.plan_id).padStart(3, "0") : null,
      status: (r.status || r.crosswalk_type || "renewal").toLowerCase(),
    }));
    data = { current, next, crosswalk, sample: false };
  } else {
    data = generate();
  }

  writeFileSync(join(DATA, "plans-current.json"), JSON.stringify(data.current));
  writeFileSync(join(DATA, "plans-next.json"), JSON.stringify(data.next));
  writeFileSync(join(DATA, "crosswalk.json"), JSON.stringify(data.crosswalk));
  writeFileSync(
    join(DATA, "manifest.json"),
    JSON.stringify(
      {
        currentYear: CURRENT_YEAR,
        nextYear: NEXT_YEAR,
        sample,
        source: "CMS Landscape + Crosswalk files (public domain).",
        counts: { current: data.current.length, next: data.next.length, crosswalk: data.crosswalk.length },
        states: GEO.map((g) => g.state),
        note: sample
          ? "SAMPLE DATA — structurally faithful placeholder used until the official 2027 CMS files are published. Replace src/data/landscape-*.csv + crosswalk.csv with the real files and rebuild."
          : "Built from real CMS CSV files present in src/data/.",
      },
      null,
      2
    ) + "\n"
  );

  console.log(
    `  plans: ${data.current.length} current + ${data.next.length} next · crosswalk ${data.crosswalk.length} rows · ${sample ? "SAMPLE" : "REAL CMS"} data`
  );
}

main();
