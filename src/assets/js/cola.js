/* ==========================================================================
   cola.js — wires the COLA calculator UI to cola-core.js
   Progressive enhancement: the page is readable without JS; this makes the
   calculator live. No network calls, no tracking, nothing leaves the browser.
   ========================================================================== */
import { projectBenefit, usd, usdCents, signedUsd } from "./lib/cola-core.js";

const $ = (id) => document.getElementById(id);

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

// "Where your raise goes" — two horizontal bars (now vs after the raise), each
// split into what you keep (green) and what Part B withholds (amber). Decorative
// reinforcement of the stat tiles, so the container is aria-hidden.
function flowChart(r) {
  const xmax = Math.max(r.newGross, r.priorGross, 1);
  const W = 720, H = 172, plotX = 92, plotRight = 632;
  const plotW = plotRight - plotX;
  const scale = plotW / xmax;
  const barH = 42;
  const rows = [
    { y: 26, label: "Now", gross: r.priorGross, net: r.priorNet, partb: r.priorPartB, prev: true },
    { y: 98, label: "After raise", gross: r.newGross, net: r.newNet, partb: r.newPartB, prev: false },
  ];
  let svg = "";
  for (const row of rows) {
    const keepW = Math.max(0, row.net * scale);
    const partBW = Math.max(0, row.partb * scale);
    const cy = row.y + barH / 2 + 5;
    const op = row.prev ? ' opacity="0.55"' : "";
    svg += `<g${op}>`;
    svg += `<rect class="bc-flow-track" x="${plotX}" y="${row.y}" width="${plotW}" height="${barH}" rx="6"/>`;
    svg += `<rect class="bc-flow-seg--keep" x="${plotX}" y="${row.y}" width="${keepW.toFixed(1)}" height="${barH}" rx="6"/>`;
    if (partBW > 1) svg += `<rect class="bc-flow-seg--partb" x="${(plotX + keepW).toFixed(1)}" y="${row.y}" width="${partBW.toFixed(1)}" height="${barH}" rx="6"/>`;
    svg += `<text class="bc-flow-rowlabel" x="6" y="${cy}">${row.label}</text>`;
    if (keepW > 74) svg += `<text class="bc-flow-value" x="${(plotX + keepW / 2).toFixed(1)}" y="${cy}" text-anchor="middle">${usd(row.net)}</text>`;
    if (partBW > 48) svg += `<text class="bc-flow-value" x="${(plotX + keepW + partBW / 2).toFixed(1)}" y="${cy}" text-anchor="middle">${usd(row.partb)}</text>`;
    svg += `<text class="bc-bar-value" x="${(plotX + row.gross * scale + 8).toFixed(1)}" y="${cy}" font-size="15">${usd(row.gross)}</text>`;
    svg += `</g>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar comparison of your benefit now versus after the raise, split into the amount deposited and the amount withheld for Medicare Part B." preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
}

ready(() => {
  const form = $("cola-form");
  if (!form) return;

  const els = {
    benefit: $("f-benefit"),
    preset: $("f-cola-preset"),
    customWrap: $("cola-custom-wrap"),
    custom: $("f-cola-custom"),
    partb: $("f-partb"),
    partbNext: $("f-partb-next"),
    benefitError: $("f-benefit-error"),
    results: $("cola-results"),
    headline: $("r-headline"),
    newGross: $("r-new-gross"),
    grossInc: $("r-gross-increase"),
    newNet: $("r-new-net"),
    netInc: $("r-net-increase"),
    kept: $("r-kept"),
    colaEcho: $("r-cola-echo"),
    chart: $("cola-chart"),
    print: $("r-print"),
    live: $("cola-live"),
  };

  function effectiveCola() {
    const preset = els.preset ? els.preset.value : "2.8";
    if (preset === "custom") {
      const v = parseFloat(els.custom && els.custom.value);
      return Number.isFinite(v) ? v : 0;
    }
    return parseFloat(preset) || 0;
  }

  function syncCustomVisibility() {
    if (!els.customWrap || !els.preset) return;
    const isCustom = els.preset.value === "custom";
    els.customWrap.hidden = !isCustom;
    if (isCustom && els.custom) els.custom.focus();
  }

  function num(el) {
    if (!el) return 0;
    const v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(v) ? v : 0;
  }

  function render() {
    const priorGross = num(els.benefit);

    // Validation: benefit must be a positive number.
    const valid = priorGross > 0;
    if (els.benefit) els.benefit.setAttribute("aria-invalid", valid ? "false" : "true");
    if (els.benefitError) els.benefitError.hidden = valid || String(els.benefit.value).trim() === "";

    if (!valid) {
      if (els.results) els.results.setAttribute("data-state", "empty");
      return;
    }

    const colaPercent = effectiveCola();
    const r = projectBenefit({
      priorGross,
      colaPercent,
      priorPartB: num(els.partb),
      newPartB: els.partbNext && String(els.partbNext.value).trim() !== "" ? num(els.partbNext) : num(els.partb),
    });

    if (els.results) els.results.setAttribute("data-state", "ready");
    if (els.colaEcho) els.colaEcho.textContent = `${colaPercent.toFixed(1)}%`;

    if (els.newGross) els.newGross.textContent = usd(r.newGross);
    if (els.grossInc) els.grossInc.textContent = signedUsd(r.grossIncrease);
    if (els.newNet) els.newNet.textContent = usdCents(r.newNet);
    if (els.netInc) {
      els.netInc.textContent = signedUsd(r.netIncrease, true);
      els.netInc.classList.toggle("figure__value--good", r.netIncrease > 0);
      els.netInc.classList.toggle("figure__value--bad", r.netIncrease < 0);
    }
    if (els.kept) {
      if (r.partBIncrease > 0 && r.grossIncrease > 0) {
        els.kept.textContent = `Your Part B premium rose ${usdCents(r.partBIncrease)}, so you keep about ${Math.round(r.keptPercentOfRaise)}% of the raise.`;
      } else if (r.partBIncrease > 0) {
        els.kept.textContent = `Your Part B premium rose ${usdCents(r.partBIncrease)} a month.`;
      } else if (r.partBIncrease < 0) {
        els.kept.textContent = `Your Part B premium fell ${usdCents(Math.abs(r.partBIncrease))} a month, so your deposit rises by more than the raise.`;
      } else {
        els.kept.textContent = `Your Part B premium is unchanged in this estimate, so the full raise reaches your deposit.`;
      }
    }

    if (els.headline) {
      const keep = Math.round(r.netIncrease);
      const lead = keep > 0
        ? `You'll keep about ${usd(keep)} more each month after Part B.`
        : keep < 0
          ? `Your monthly deposit falls about ${usd(-keep)} after Part B.`
          : `Your monthly deposit stays about the same after Part B.`;
      els.headline.textContent = `${lead} A ${colaPercent.toFixed(1)}% COLA lifts a ${usd(priorGross)} benefit to about ${usd(r.newGross)} before Part B.`;
    }
    if (els.live) {
      els.live.textContent = `Estimated new gross benefit ${usd(r.newGross)} per month; net deposit ${usdCents(r.newNet)} after the Part B premium.`;
    }
    if (els.chart) els.chart.innerHTML = flowChart(r);
  }

  // Wire events — live updates on any change.
  form.addEventListener("input", render);
  form.addEventListener("change", (e) => {
    if (e.target === els.preset) syncCustomVisibility();
    render();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render();
    if (els.results) els.results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  if (els.print) els.print.addEventListener("click", () => window.print());

  syncCustomVisibility();
  render();
});
