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
      } else {
        els.kept.textContent = `Your Part B premium is unchanged in this estimate, so the full raise reaches your deposit.`;
      }
    }

    if (els.headline) {
      els.headline.textContent = `A ${colaPercent.toFixed(1)}% COLA raises a ${usd(priorGross)} benefit to about ${usd(r.newGross)} a month before Part B.`;
    }
    if (els.live) {
      els.live.textContent = `Estimated new gross benefit ${usd(r.newGross)} per month; net deposit ${usdCents(r.newNet)} after the Part B premium.`;
    }
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

  syncCustomVisibility();
  render();
});
