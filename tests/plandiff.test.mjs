import { test } from "node:test";
import assert from "node:assert/strict";
import {
  indexPlans, indexCrosswalk, buildDiff, diffMetric, METRICS,
  listStates, listCounties, plansInCounty, statusInfo,
} from "../src/assets/js/lib/plandiff-core.js";

function plan(over) {
  return {
    contractId: "H1234", planId: "001", segmentId: "0",
    planName: "Test Plan (HMO)", orgName: "TestCare", planType: "MAPD",
    state: "FL", county: "Broward", fips: "12011",
    premium: 20, drugDeductible: 400, moop: 5500, starRating: 4.0,
    hasDrugCoverage: true, hasDental: true, hasVision: true, hasHearing: true,
    ...over,
  };
}

test("indexes and geography helpers", () => {
  const plans = [plan(), plan({ contractId: "H9", planId: "002", county: "Miami-Dade", fips: "12086" }), plan({ state: "TX", county: "Harris" })];
  const idx = indexPlans(plans);
  assert.deepEqual(listStates(idx), ["FL", "TX"]);
  assert.deepEqual(listCounties(idx, "FL"), ["Broward", "Miami-Dade"]);
  assert.equal(plansInCounty(idx, "FL", "Broward").length, 1);
});

test("renewal with premium increase is flagged bad (red)", () => {
  const cur = indexPlans([plan({ premium: 20 })]);
  const next = indexPlans([plan({ premium: 45, year: 2027 })]);
  const xw = indexCrosswalk([{ fromContractId: "H1234", fromPlanId: "001", toContractId: "H1234", toPlanId: "001", status: "renewal" }]);
  const d = buildDiff({ currentIndex: cur, nextIndex: next, crosswalk: xw, contractId: "H1234", planId: "001", state: "FL", county: "Broward" });
  assert.equal(d.ok, true);
  const prem = d.metrics.find((m) => m.field === "premium");
  assert.equal(prem.direction, "up");
  assert.equal(prem.tone, "bad");
  assert.match(prem.deltaText, /\+\$25/);
  assert.match(d.headline, /premium is going up/i);
});

test("higher star rating is good (green)", () => {
  const m = diffMetric(METRICS.find((x) => x.field === "starRating"), { starRating: 3.5 }, { starRating: 4.5 });
  assert.equal(m.direction, "up");
  assert.equal(m.tone, "good");
});

test("dropping a dental benefit is bad", () => {
  const m = diffMetric(METRICS.find((x) => x.field === "hasDental"), { hasDental: true }, { hasDental: false });
  assert.equal(m.direction, "removed");
  assert.equal(m.tone, "bad");
  assert.match(m.deltaText, /Dropped/);
});

test("termination yields no successor and a clear headline", () => {
  const cur = indexPlans([plan()]);
  const next = indexPlans([]);
  const xw = indexCrosswalk([{ fromContractId: "H1234", fromPlanId: "001", toContractId: null, toPlanId: null, status: "termination" }]);
  const d = buildDiff({ currentIndex: cur, nextIndex: next, crosswalk: xw, contractId: "H1234", planId: "001", state: "FL", county: "Broward" });
  assert.equal(d.ok, true);
  assert.equal(d.status, "termination");
  assert.equal(d.next, null);
  assert.match(d.headline, /ending/i);
});

test("consolidation follows the crosswalk to the successor plan id", () => {
  const cur = indexPlans([plan({ planId: "001", premium: 30 })]);
  const next = indexPlans([plan({ planId: "004", premium: 0, year: 2027 })]);
  const xw = indexCrosswalk([{ fromContractId: "H1234", fromPlanId: "001", toContractId: "H1234", toPlanId: "004", status: "consolidation" }]);
  const d = buildDiff({ currentIndex: cur, nextIndex: next, crosswalk: xw, contractId: "H1234", planId: "001", state: "FL", county: "Broward" });
  assert.equal(d.ok, true);
  assert.equal(d.status, "consolidation");
  assert.equal(d.next.planId, "004");
  const prem = d.metrics.find((m) => m.field === "premium");
  assert.equal(prem.direction, "down");
  assert.equal(prem.tone, "good");
});

test("unknown plan returns ok:false", () => {
  const cur = indexPlans([plan()]);
  const next = indexPlans([plan({ year: 2027 })]);
  const xw = indexCrosswalk([]);
  const d = buildDiff({ currentIndex: cur, nextIndex: next, crosswalk: xw, contractId: "H0000", planId: "999", state: "FL", county: "Broward" });
  assert.equal(d.ok, false);
  assert.equal(d.reason, "not-found");
});

test("statusInfo covers all codes", () => {
  for (const s of ["renewal", "consolidation", "service-area-reduction", "termination", "new", "???"]) {
    const info = statusInfo(s);
    assert.ok(info.label && info.note && info.tone);
  }
});

test("a missing numeric metric is non-comparable, not a fabricated $0 movement", () => {
  const moop = METRICS.find((x) => x.field === "moop");
  const d = diffMetric(moop, { moop: 6700 }, { moop: null });
  assert.equal(d.direction, "flat");
  assert.equal(d.tone, "flat");
  assert.equal(d.deltaText, "No change");
  assert.equal(d.priorText, "$6,700");
  assert.equal(d.nextText, "—");
  // and the reverse (missing -> present) is also non-comparable
  const d2 = diffMetric(moop, { moop: null }, { moop: 5000 });
  assert.equal(d2.direction, "flat");
  assert.equal(d2.deltaText, "No change");
});

test("zero is a real value, not treated as missing", () => {
  const prem = METRICS.find((x) => x.field === "premium");
  const d = diffMetric(prem, { premium: 0 }, { premium: 20 });
  assert.equal(d.direction, "up");
  assert.equal(d.tone, "bad");
  assert.match(d.deltaText, /\+\$20/);
  // premium dropping to $0 is a real, good change
  const d2 = diffMetric(prem, { premium: 20 }, { premium: 0 });
  assert.equal(d2.direction, "down");
  assert.equal(d2.tone, "good");
  assert.equal(d2.nextText, "$0");
});
