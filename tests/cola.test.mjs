import { test } from "node:test";
import assert from "node:assert/strict";
import {
  quarterAverage, roundColaFraction, colaFromQuarterAverages,
  ssaRoundBenefit, projectBenefit, usd, usdCents, signedUsd,
  parseAmount, roundColaPercent, LIMITS, determinationCycleYear,
  validateBenefit, validatePartB, validateColaPercent, reconcileCola,
} from "../src/assets/js/lib/cola-core.js";

test("quarterAverage averages three months", () => {
  assert.equal(quarterAverage(300, 303, 306), 303);
});

test("roundColaFraction rounds to the nearest 0.1%", () => {
  assert.equal(roundColaFraction(0.02799), 0.028);
  assert.equal(roundColaFraction(0.02488), 0.025);
  assert.equal(roundColaFraction(0.0), 0);
});

test("colaFromQuarterAverages reproduces the official 2.8% (2026 COLA)", () => {
  const r = colaFromQuarterAverages(308.729, 317.373);
  assert.equal(Number(r.colaPercent.toFixed(1)), 2.8);
});

test("colaFromQuarterAverages reproduces the official 2.5% (2025 COLA)", () => {
  const r = colaFromQuarterAverages(301.236, 308.729);
  assert.equal(Number(r.colaPercent.toFixed(1)), 2.5);
});

test("COLA never goes negative", () => {
  const r = colaFromQuarterAverages(320, 310);
  assert.equal(r.colaFraction, 0);
  assert.equal(r.colaPercent, 0);
});

test("ssaRoundBenefit truncates down to the whole dollar", () => {
  assert.equal(ssaRoundBenefit(2056.99), 2056);
  assert.equal(ssaRoundBenefit(2031.328), 2031);
  assert.equal(ssaRoundBenefit(2000), 2000);
});

test("projectBenefit applies COLA then Part B (the raise you actually keep)", () => {
  const r = projectBenefit({ priorGross: 2000, colaPercent: 2.8, priorPartB: 185, newPartB: 206.5 });
  assert.equal(r.newGross, 2056);          // floor(2056.0)
  assert.equal(r.grossIncrease, 56);
  assert.equal(r.priorNet, 1815);
  assert.equal(r.newNet, 1849.5);
  assert.equal(r.netIncrease, 34.5);
  assert.ok(r.keptPercentOfRaise > 61 && r.keptPercentOfRaise < 62);
});

test("projectBenefit defaults newPartB to priorPartB when omitted", () => {
  const r = projectBenefit({ priorGross: 1500, colaPercent: 3.6, priorPartB: 185 });
  assert.equal(r.newPartB, 185);
  assert.equal(r.partBIncrease, 0);
  // full raise reaches the deposit when Part B is flat
  assert.equal(r.netIncrease, r.grossIncrease);
});

test("projectBenefit handles zero Part B", () => {
  const r = projectBenefit({ priorGross: 1000, colaPercent: 2.8 });
  assert.equal(r.newGross, 1028);
  assert.equal(r.priorNet, 1000);
  assert.equal(r.newNet, 1028);
});

test("projectBenefit: a Part B decrease grows the deposit by more than the raise", () => {
  const r = projectBenefit({ priorGross: 2000, colaPercent: 2.8, priorPartB: 185, newPartB: 174 });
  assert.ok(r.partBIncrease < 0, "partBIncrease should be negative");
  assert.equal(r.grossIncrease, 56);
  assert.equal(r.netIncrease, 67);            // (2056-174) - (2000-185)
  assert.ok(r.netIncrease > r.grossIncrease, "net should exceed gross when Part B falls");
});

test("currency formatters", () => {
  assert.equal(usd(2056), "$2,056");
  assert.equal(usdCents(1849.5), "$1,849.50");
  assert.equal(signedUsd(56), "+$56");
  assert.equal(signedUsd(-3), "−$3");
  assert.equal(signedUsd(0), "$0");
});

test("every formatter uses the same minus sign (U+2212), never an ASCII hyphen", () => {
  assert.equal(usd(-100), "−$100");
  assert.equal(usdCents(-16428), "−$16,428.00");
  assert.equal(signedUsd(-100), "−$100");
  for (const s of [usd(-100), usdCents(-16428), signedUsd(-100), signedUsd(-2.5, true)]) {
    assert.ok(!s.includes("-"), `${s} still contains an ASCII hyphen`);
  }
});

/* ---- Reading what a person typed --------------------------------------- */

test("parseAmount accepts the ways people really write money", () => {
  assert.equal(parseAmount("2000"), 2000);
  assert.equal(parseAmount("2,000"), 2000);
  assert.equal(parseAmount("$2,000.50"), 2000.5);
  assert.equal(parseAmount(" 202.90 "), 202.9);
  assert.equal(parseAmount("3.6%"), 3.6);
  assert.equal(parseAmount("0"), 0);
  assert.equal(parseAmount(".5"), 0.5);
  assert.equal(parseAmount("2000."), 2000);
  assert.equal(parseAmount("12,345,678"), 12345678);
  assert.equal(parseAmount("-500"), -500);
  assert.equal(parseAmount("−500"), -500);
});

test("parseAmount rejects rather than salvages digits", () => {
  // The comma typo used to become 18500 and render −$16,428.00.
  assert.equal(parseAmount("185,00"), null);
  // "1e12" used to be stripped down to "112" and render $112.
  assert.equal(parseAmount("1e12"), null);
  assert.equal(parseAmount("abc"), null);
  assert.equal(parseAmount("12 34"), null);
  assert.equal(parseAmount("2,00"), null);
  assert.equal(parseAmount("1,2345"), null);
  assert.equal(parseAmount("$"), null);
  assert.equal(parseAmount("."), null);
  assert.equal(parseAmount(""), null);
  assert.equal(parseAmount("   "), null);
  assert.equal(parseAmount(null), null);
  assert.equal(parseAmount(undefined), null);
  assert.equal(parseAmount("Infinity"), null);
  assert.equal(parseAmount("0x10"), null);
});

test("validateBenefit: an empty field is an error, not a silent $2,000", () => {
  const empty = validateBenefit("");
  assert.equal(empty.ok, false);
  assert.match(empty.error, /enter your current monthly benefit/i);
  assert.equal(validateBenefit("   ").ok, false);
  assert.equal(validateBenefit(null).ok, false);
});

test("validateBenefit rejects zero, negative, unreadable and implausible amounts", () => {
  assert.equal(validateBenefit("0").ok, false);
  assert.equal(validateBenefit("-2000").ok, false);
  assert.equal(validateBenefit("abc").ok, false);
  assert.equal(validateBenefit("1e12").ok, false);
  assert.equal(validateBenefit(String(LIMITS.benefitMax + 1)).ok, false);
  for (const v of ["0", "-2000", "abc", "1e12", "999999"]) {
    assert.equal(validateBenefit(v).value, null, `${v} must not yield a usable number`);
  }
});

test("validateBenefit accepts real benefit amounts", () => {
  assert.deepEqual(validateBenefit("2000"), { ok: true, value: 2000, error: null });
  assert.equal(validateBenefit("$2,412.55").value, 2412.55);
  assert.equal(validateBenefit(String(LIMITS.benefitMax)).ok, true);
});

test("validatePartB rejects the comma typo, negatives and implausible premiums", () => {
  assert.equal(validatePartB("185,00").ok, false);
  assert.equal(validatePartB("-500").ok, false);
  assert.match(validatePartB("-500").error, /never a negative amount/i);
  assert.equal(validatePartB(String(LIMITS.partBMax + 1)).ok, false);
  assert.equal(validatePartB("abc").ok, false);
});

test("validatePartB: current premium is required, next year's is optional", () => {
  assert.equal(validatePartB("").ok, false);
  assert.match(validatePartB("").error, /or 0 if nothing is withheld/i);
  assert.deepEqual(validatePartB("", { required: false }), { ok: true, value: null, error: null });
  assert.deepEqual(validatePartB("202.90"), { ok: true, value: 202.9, error: null });
  assert.equal(validatePartB("0").ok, true, "0 is a real answer — some people pay nothing");
});

test("validateColaPercent rejects blank, negative and impossible COLAs", () => {
  assert.equal(validateColaPercent("").ok, false, "blank must not quietly become 0.0%");
  assert.equal(validateColaPercent("-5").ok, false);
  assert.match(validateColaPercent("-5").error, /never lowers your benefit/i);
  assert.equal(validateColaPercent("360").ok, false);
  assert.match(validateColaPercent("360").error, /20% or less/i);
  assert.equal(validateColaPercent("abc").ok, false);
});

test("validateColaPercent rounds to a tenth, so the echo matches the math", () => {
  assert.equal(roundColaPercent(2.86), 2.9);
  assert.equal(roundColaPercent(2.8), 2.8);
  assert.equal(validateColaPercent("2.86").value, 2.9);
  assert.equal(validateColaPercent("2.9%").value, 2.9);
  assert.equal(validateColaPercent("0").ok, true);

  // The bug: echoing 2.9% while computing 2.86% showed $2,057 under a caption
  // that says 2.9%. Rounding first makes the two agree.
  const shown = validateColaPercent("2.86").value;
  const r = projectBenefit({ priorGross: 2000, colaPercent: shown });
  assert.equal(shown.toFixed(1), "2.9");
  assert.equal(r.newGross, 2058);
});

/* The build computed this reconciliation, printed "worked check X% (official
   Y%)" and shipped Y regardless. Measured before the guard: setting the 2026
   row to 9.9% put a false confirmed COLA on 5 pages (23 occurrences, including
   the calculator's own dropdown) with 66/66 tests and every CI check green. */
test("reconcileCola agrees when the published figure matches the CPI-W averages", () => {
  // The two real cycles in src/data/cola-history.csv.
  const r2026 = reconcileCola(308.729, 317.373, 2.8);
  assert.equal(r2026.computedColaPercent, 2.8);
  assert.equal(r2026.agrees, true);
  const r2025 = reconcileCola(301.236, 308.729, 2.5);
  assert.equal(r2025.computedColaPercent, 2.5);
  assert.equal(r2025.agrees, true);
});

test("reconcileCola refuses a published figure the averages do not support", () => {
  const r = reconcileCola(308.729, 317.373, 9.9);
  assert.equal(r.computedColaPercent, 2.8);
  assert.equal(r.publishedColaPercent, 9.9);
  assert.equal(r.agrees, false);
});

test("reconcileCola catches a one-tenth slip, the realistic typo", () => {
  assert.equal(reconcileCola(308.729, 317.373, 2.9).agrees, false);
  assert.equal(reconcileCola(308.729, 317.373, 2.7).agrees, false);
});

test("reconcileCola treats a missing or unparseable published figure as disagreement", () => {
  assert.equal(reconcileCola(308.729, 317.373, NaN).agrees, false);
  assert.equal(reconcileCola(308.729, 317.373, undefined).agrees, false);
  assert.equal(reconcileCola(308.729, 317.373, "").agrees, false);
});

/* ---- The determination cycle (announcement-day keying) ------------------- */

test("determinationCycleYear: Sept-Dec aims at next January's raise, Jan-Aug at the raise now paid", () => {
  // Determination window: the raise about to be announced.
  assert.equal(determinationCycleYear("2026-09-01"), 2027);
  assert.equal(determinationCycleYear("2026-10-07"), 2027);
  assert.equal(determinationCycleYear("2026-10-14"), 2027);
  assert.equal(determinationCycleYear("2026-12-31"), 2027);
  // The rest of the year: the most recently announced figure is the story.
  assert.equal(determinationCycleYear("2027-01-01"), 2027);
  assert.equal(determinationCycleYear("2027-08-31"), 2027);
  assert.equal(determinationCycleYear("2027-09-01"), 2028);
});

test("determinationCycleYear refuses an unreadable date", () => {
  assert.throws(() => determinationCycleYear(""));
  assert.throws(() => determinationCycleYear("not-a-date"));
  assert.throws(() => determinationCycleYear("2026-13-01"));
});

/* The dollar-impact worked examples the COLA guide ships (from the 2026 SSA
   fact sheet base amounts). Pure math on cola-core, so it stays green when the
   cycle figure changes on announcement day — the data layer re-prices the
   table, and this pins the arithmetic. */
test("worked examples: 3.5% on the 2026 base amounts", () => {
  const avg = projectBenefit({ priorGross: 2071, colaPercent: 3.5, priorPartB: 202.9 });
  assert.equal(avg.newGross, 2143);
  assert.equal(avg.grossIncrease, 72);
  const max = projectBenefit({ priorGross: 4152, colaPercent: 3.5, priorPartB: 202.9 });
  assert.equal(max.newGross, 4297);
  assert.equal(max.grossIncrease, 145);
  const ssiInd = projectBenefit({ priorGross: 994, colaPercent: 3.5 });
  assert.equal(ssiInd.newGross, 1028);
  assert.equal(ssiInd.grossIncrease, 34);
  const ssiCouple = projectBenefit({ priorGross: 1491, colaPercent: 3.5 });
  assert.equal(ssiCouple.newGross, 1543);
  assert.equal(ssiCouple.grossIncrease, 52);
  const couple = projectBenefit({ priorGross: 4142, colaPercent: 3.5, priorPartB: 405.8 });
  assert.equal(couple.newGross, 4286);
  assert.equal(couple.grossIncrease, 144);
});

test("worked examples re-price by formula for whatever the confirmed figure turns out to be", () => {
  // Announcement day changes the percentage, never the arithmetic: COLA
  // applied, monthly benefit truncated down to the whole dollar.
  for (const cola of [2.1, 2.9, 3.5, 4.2]) {
    const r = projectBenefit({ priorGross: 2071, colaPercent: cola });
    assert.equal(r.newGross, Math.floor(2071 * (1 + cola / 100)));
    assert.equal(r.grossIncrease, r.newGross - 2071);
  }
});
