/* ==========================================================================
   cola-core.js — Social Security COLA math (pure, dependency-free)
   Single source of truth: imported by the browser calculator AND Node tests.

   Statutory basis (42 U.S.C. 415(i)):
   The COLA equals the percentage increase in the average CPI-W for the third
   calendar quarter (Jul/Aug/Sep) of the current year over the average CPI-W
   for the third quarter of the most recent year in which a COLA took effect,
   rounded to the nearest one-tenth of one percent.
   ========================================================================== */

/**
 * Average of the three third-quarter CPI-W readings.
 * @param {number} jul @param {number} aug @param {number} sep
 * @returns {number}
 */
export function quarterAverage(jul, aug, sep) {
  return (jul + aug + sep) / 3;
}

/**
 * Round a raw COLA fraction to the nearest 0.1 percent, per SSA rounding.
 * @param {number} rawFraction e.g. 0.0281 -> 0.028
 * @returns {number} fraction rounded to nearest 0.001 (0.1%)
 */
export function roundColaFraction(rawFraction) {
  return Math.round(rawFraction * 1000) / 1000;
}

/**
 * Compute a COLA percentage from two third-quarter CPI-W averages.
 * If the current average is not higher, the COLA is 0 (COLAs never go negative).
 * @param {number} priorQ3Avg
 * @param {number} currentQ3Avg
 * @returns {{ rawFraction:number, colaFraction:number, colaPercent:number }}
 */
export function colaFromQuarterAverages(priorQ3Avg, currentQ3Avg) {
  if (!(priorQ3Avg > 0)) throw new Error("priorQ3Avg must be positive");
  const raw = (currentQ3Avg - priorQ3Avg) / priorQ3Avg;
  const rawFraction = raw > 0 ? raw : 0;
  const colaFraction = roundColaFraction(rawFraction);
  return {
    rawFraction,
    colaFraction,
    colaPercent: colaFraction * 100,
  };
}

/**
 * SSA rounds an individual monthly benefit DOWN to the next lower whole dollar
 * after applying the COLA.
 * @param {number} amount
 * @returns {number}
 */
export function ssaRoundBenefit(amount) {
  return Math.floor(amount + 1e-9);
}

/**
 * Project a monthly Social Security benefit forward one COLA cycle, and show
 * how the Medicare Part B premium affects the amount actually deposited.
 *
 * @param {object} p
 * @param {number} p.priorGross     Current gross monthly benefit (before Part B).
 * @param {number} p.colaPercent    COLA to apply, in percent (e.g. 2.8).
 * @param {number} [p.priorPartB=0] Current Medicare Part B premium withheld.
 * @param {number} [p.newPartB]     Next year's Part B premium (defaults to prior).
 * @returns {object} projection with gross/net figures and deltas.
 */
export function projectBenefit(p) {
  const priorGross = Number(p.priorGross) || 0;
  const colaPercent = Number(p.colaPercent) || 0;
  const priorPartB = Number(p.priorPartB) || 0;
  const newPartB = p.newPartB === undefined || p.newPartB === null || p.newPartB === ""
    ? priorPartB
    : Number(p.newPartB) || 0;

  const colaFraction = colaPercent / 100;

  // Gross benefit after COLA (SSA truncates the monthly benefit to the dollar).
  const newGrossExact = priorGross * (1 + colaFraction);
  const newGross = ssaRoundBenefit(newGrossExact);
  const grossIncrease = newGross - priorGross;

  // Net = what actually lands in the bank after Part B is withheld.
  const priorNet = priorGross - priorPartB;
  const newNet = newGross - newPartB;
  const netIncrease = newNet - priorNet;

  // How much of the raise Part B ate up.
  const partBIncrease = newPartB - priorPartB;
  const keptPercentOfRaise = grossIncrease > 0
    ? Math.max(0, (netIncrease / grossIncrease) * 100)
    : 0;

  return {
    colaPercent,
    priorGross,
    newGross,
    newGrossExact,
    grossIncrease,
    priorPartB,
    newPartB,
    partBIncrease,
    priorNet,
    newNet,
    netIncrease,
    keptPercentOfRaise,
  };
}

/**
 * Format a number as whole-dollar USD (no cents) — the friendliest form for
 * monthly benefit figures.
 * @param {number} n
 * @returns {string}
 */
export function usd(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * Format with cents — used for Part B premiums and precise deltas.
 * @param {number} n
 * @returns {string}
 */
export function usdCents(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Signed dollar string, e.g. "+$56" or "-$3".
 * @param {number} n @param {boolean} [cents=false]
 * @returns {string}
 */
export function signedUsd(n, cents = false) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const body = cents ? usdCents(Math.abs(n)) : usd(Math.abs(n));
  return `${sign}${body}`;
}
