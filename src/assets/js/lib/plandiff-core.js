/* ==========================================================================
   plandiff-core.js — Medicare "What Changed" plan-year diff (pure, no deps)
   Single source of truth: imported by the browser tool AND Node tests.

   Data model (see scripts/build-plan-data.mjs for the CMS ingestion that
   produces these shapes from the public Landscape + Crosswalk files):

     Plan   { contractId, planId, segmentId, planName, orgName, planType,
              state, county, fips, premium, drugDeductible, moop, starRating,
              hasDental, hasVision, hasHearing, hasDrugCoverage }
     Xwalk  { fromContractId, fromPlanId, toContractId, toPlanId, status }
   ========================================================================== */

/** Canonical key for a plan within a county. */
export function planKey(contractId, planId, county) {
  return `${String(contractId).toUpperCase()}|${String(planId).padStart(3, "0")}|${normCounty(county)}`;
}

/** Contract+plan key ignoring county (crosswalk granularity). */
export function contractPlanKey(contractId, planId) {
  return `${String(contractId).toUpperCase()}|${String(planId).padStart(3, "0")}`;
}

function normCounty(county) {
  return String(county || "").trim().toLowerCase();
}

/**
 * Build lookup indexes over a flat list of plan records for a single year.
 * @param {Array<object>} plans
 */
export function indexPlans(plans) {
  const byKey = new Map();          // contract|plan|county -> plan
  const byContractPlan = new Map(); // contract|plan -> [plans across counties]
  const byCounty = new Map();       // state|county -> [plans]
  for (const p of plans) {
    byKey.set(planKey(p.contractId, p.planId, p.county), p);
    const cp = contractPlanKey(p.contractId, p.planId);
    if (!byContractPlan.has(cp)) byContractPlan.set(cp, []);
    byContractPlan.get(cp).push(p);
    const ck = `${String(p.state).toUpperCase()}|${normCounty(p.county)}`;
    if (!byCounty.has(ck)) byCounty.set(ck, []);
    byCounty.get(ck).push(p);
  }
  return { byKey, byContractPlan, byCounty, all: plans };
}

/** Index a crosswalk list by the prior-year contract|plan key. */
export function indexCrosswalk(rows) {
  const map = new Map();
  for (const r of rows) {
    map.set(contractPlanKey(r.fromContractId, r.fromPlanId), r);
  }
  return map;
}

/** List distinct states present in a plan index, sorted. */
export function listStates(index) {
  const set = new Set(index.all.map((p) => String(p.state).toUpperCase()));
  return [...set].sort();
}

/** List counties for a state, sorted. */
export function listCounties(index, state) {
  const s = String(state).toUpperCase();
  const set = new Set(
    index.all.filter((p) => String(p.state).toUpperCase() === s).map((p) => p.county)
  );
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** All plans available in a state+county, sorted by org then name. */
export function plansInCounty(index, state, county) {
  const ck = `${String(state).toUpperCase()}|${normCounty(county)}`;
  const list = index.byCounty.get(ck) || [];
  return [...list].sort(
    (a, b) => a.orgName.localeCompare(b.orgName) || a.planName.localeCompare(b.planName)
  );
}

/**
 * The comparable metrics, in display order. `higherIsBetter` drives red/green.
 * `kind` selects the formatter and comparison behaviour.
 */
export const METRICS = [
  { field: "premium",       label: "Monthly plan premium",     kind: "money",  higherIsBetter: false },
  { field: "drugDeductible",label: "Drug (Part D) deductible", kind: "money",  higherIsBetter: false },
  { field: "moop",          label: "Max out-of-pocket (MOOP)", kind: "money",  higherIsBetter: false },
  { field: "starRating",    label: "CMS Star Rating",          kind: "stars",  higherIsBetter: true  },
  { field: "hasDental",     label: "Dental benefit",           kind: "bool",   higherIsBetter: true  },
  { field: "hasVision",     label: "Vision benefit",           kind: "bool",   higherIsBetter: true  },
  { field: "hasHearing",    label: "Hearing benefit",          kind: "bool",   higherIsBetter: true  },
];

function fmtMoney(n) {
  if (n === null || n === undefined || n === "") return "—";
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtStars(n) {
  if (n === null || n === undefined || n === "") return "Not rated";
  const v = Number(n);
  if (!Number.isFinite(v)) return "Not rated";
  return `${v.toFixed(1)} ★`;
}
function fmtBool(b) {
  return b ? "Included" : "Not included";
}

/** Format a raw metric value for display. */
export function formatMetric(kind, value) {
  if (kind === "money") return fmtMoney(value);
  if (kind === "stars") return fmtStars(value);
  if (kind === "bool") return fmtBool(value);
  return String(value ?? "—");
}

/**
 * Compare one metric between prior and next plan.
 * direction: 'up' | 'down' | 'flat' | 'added' | 'removed'
 * tone:      'good' | 'bad' | 'flat'  (for colour)
 */
export function diffMetric(metric, prior, next) {
  const a = prior ? prior[metric.field] : undefined;
  const b = next ? next[metric.field] : undefined;

  let direction = "flat";
  let tone = "flat";
  let deltaText = "No change";

  if (metric.kind === "bool") {
    const av = !!a, bv = !!b;
    if (av === bv) {
      direction = "flat"; tone = "flat"; deltaText = "No change";
    } else if (bv && !av) {
      direction = "added"; tone = "good"; deltaText = "Newly added";
    } else {
      direction = "removed"; tone = "bad"; deltaText = "Dropped for 2027";
    }
  } else {
    const av = Number(a), bv = Number(b);
    const bothNum = Number.isFinite(av) && Number.isFinite(bv);
    if (!bothNum || av === bv) {
      direction = "flat"; tone = "flat"; deltaText = "No change";
    } else {
      const up = bv > av;
      direction = up ? "up" : "down";
      const better = up ? metric.higherIsBetter : !metric.higherIsBetter;
      tone = better ? "good" : "bad";
      if (metric.kind === "money") {
        const delta = bv - av;
        deltaText = `${delta > 0 ? "+" : "−"}${fmtMoney(Math.abs(delta))}`;
      } else if (metric.kind === "stars") {
        const delta = bv - av;
        deltaText = `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} ★`;
      }
    }
  }

  return {
    field: metric.field,
    label: metric.label,
    kind: metric.kind,
    priorText: formatMetric(metric.kind, a),
    nextText: formatMetric(metric.kind, b),
    priorRaw: a,
    nextRaw: b,
    direction,
    tone,
    deltaText,
  };
}

/** Human-readable label + tone for a crosswalk status code. */
export function statusInfo(status) {
  switch (status) {
    case "renewal":
      return { label: "Renewing for 2027", tone: "good", note: "Your plan continues into 2027. Review the changes below." };
    case "consolidation":
      return { label: "Consolidated into another plan", tone: "warn", note: "CMS is merging your plan into the successor plan shown. Your benefits map to the new plan ID." };
    case "service-area-reduction":
      return { label: "Service-area reduction", tone: "warn", note: "This plan is shrinking its service area. Confirm it is still offered in your county." };
    case "termination":
      return { label: "Terminating — not offered in 2027", tone: "bad", note: "This plan will not be offered in 2027. You must choose a new plan during AEP or you may be moved to Original Medicare." };
    case "new":
      return { label: "New plan for 2027", tone: "info", note: "This is a newly offered plan for 2027." };
    default:
      return { label: "Status unavailable", tone: "flat", note: "We could not determine this plan's 2027 status from the Crosswalk file." };
  }
}

/**
 * Produce the full diff for a beneficiary's plan.
 * @param {object} args
 * @param {object} args.currentIndex   indexPlans() of prior year
 * @param {object} args.nextIndex      indexPlans() of upcoming year
 * @param {Map}    args.crosswalk      indexCrosswalk()
 * @param {string} args.contractId
 * @param {string} args.planId
 * @param {string} args.county
 * @param {string} args.state
 * @returns {object} { ok, reason?, prior, next, status, statusInfo, metrics: [diffMetric...], headline }
 */
export function buildDiff(args) {
  const { currentIndex, nextIndex, crosswalk, contractId, planId, county, state } = args;

  const prior =
    currentIndex.byKey.get(planKey(contractId, planId, county)) ||
    (currentIndex.byContractPlan.get(contractPlanKey(contractId, planId)) || [])[0];

  if (!prior) {
    return { ok: false, reason: "not-found" };
  }

  const xw = crosswalk.get(contractPlanKey(contractId, planId));
  const status = xw ? xw.status : "renewal";
  const info = statusInfo(status);

  let next = null;
  if (status !== "termination" && xw) {
    next =
      nextIndex.byKey.get(planKey(xw.toContractId, xw.toPlanId, county)) ||
      (nextIndex.byContractPlan.get(contractPlanKey(xw.toContractId, xw.toPlanId)) || [])[0] ||
      null;
  } else if (status !== "termination") {
    // No crosswalk row: assume same ID renews if present next year.
    next =
      nextIndex.byKey.get(planKey(contractId, planId, county)) ||
      (nextIndex.byContractPlan.get(contractPlanKey(contractId, planId)) || [])[0] ||
      null;
  }

  const metrics = next ? METRICS.map((m) => diffMetric(m, prior, next)) : [];

  // Headline: premium movement is what people feel first.
  let headline = info.label;
  const premiumDiff = metrics.find((m) => m.field === "premium");
  if (status === "termination") {
    headline = "This plan is ending. You will need to pick a new plan for 2027.";
  } else if (premiumDiff && premiumDiff.direction === "up") {
    headline = `Your premium is going up by ${premiumDiff.deltaText.replace("+", "")} a month.`;
  } else if (premiumDiff && premiumDiff.direction === "down") {
    headline = `Your premium is going down by ${premiumDiff.deltaText.replace("−", "")} a month.`;
  } else if (next) {
    headline = "Your premium is unchanged — but other details may have moved. See below.";
  }

  const bad = metrics.filter((m) => m.tone === "bad").length;
  const good = metrics.filter((m) => m.tone === "good").length;

  return {
    ok: true,
    prior,
    next,
    status,
    statusInfo: info,
    metrics,
    headline,
    counts: { good, bad },
  };
}
