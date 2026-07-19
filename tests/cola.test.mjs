import { test } from "node:test";
import assert from "node:assert/strict";
import {
  quarterAverage, roundColaFraction, colaFromQuarterAverages,
  ssaRoundBenefit, projectBenefit, usd, usdCents, signedUsd,
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
