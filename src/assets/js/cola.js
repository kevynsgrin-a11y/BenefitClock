/* ==========================================================================
   cola.js — wires the COLA calculator UI to cola-core.js
   Progressive enhancement: the page is readable without JS; this makes the
   calculator live. No network calls, no tracking, nothing leaves the browser.
   ========================================================================== */
import {
  projectBenefit, usd, usdCents, signedUsd,
  validateBenefit, validatePartB, validateColaPercent, roundColaPercent,
} from "./lib/cola-core.js";

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
    customError: $("f-cola-custom-error"),
    partbError: $("f-partb-error"),
    partbNextError: $("f-partb-next-error"),
    results: $("cola-results"),
    headline: $("r-headline"),
    newGross: $("r-new-gross"),
    grossInc: $("r-gross-increase"),
    newNet: $("r-new-net"),
    netInc: $("r-net-increase"),
    kept: $("r-kept"),
    colaEcho: $("r-cola-echo"),
    chart: $("cola-chart"),
    legend: $("r-legend"),
    printWrap: $("r-print-wrap"),
    note: $("r-note"),
    print: $("r-print"),
    live: $("cola-live"),
  };

  // Several of these elements carry a `display` rule in the stylesheet, which
  // beats the browser's default [hidden] styling. Setting the inline style too
  // keeps hiding reliable without depending on a CSS rule existing.
  function setHidden(el, hide) {
    if (!el) return;
    el.hidden = !!hide;
    el.style.display = hide ? "none" : "";
  }

  /* ---- Validation -------------------------------------------------------
     Every field is checked before anything is drawn. A field we cannot read
     is an error the person can see and a screen reader can hear — never a
     silent fallback, because a confident wrong dollar figure is the worst
     thing this page could show. */

  function applyCheck(input, errorEl, check) {
    if (input) input.setAttribute("aria-invalid", check.ok ? "false" : "true");
    if (errorEl) {
      if (!check.ok) errorEl.textContent = check.error;
      setHidden(errorEl, check.ok);
    }
    return check;
  }

  function readForm() {
    const benefit = applyCheck(els.benefit, els.benefitError, validateBenefit(els.benefit && els.benefit.value));
    const partB = applyCheck(els.partb, els.partbError, validatePartB(els.partb && els.partb.value));
    const partBNext = applyCheck(
      els.partbNext, els.partbNextError,
      validatePartB(els.partbNext && els.partbNext.value, { required: false })
    );

    const isCustom = !!els.preset && els.preset.value === "custom";
    const cola = isCustom
      ? validateColaPercent(els.custom && els.custom.value)
      : { ok: true, value: roundColaPercent(parseFloat(els.preset ? els.preset.value : "0") || 0), error: null };
    applyCheck(els.custom, els.customError, isCustom ? cola : { ok: true, value: cola.value, error: null });

    return {
      ok: benefit.ok && partB.ok && partBNext.ok && cola.ok,
      firstInvalid: [
        benefit.ok ? null : els.benefit,
        isCustom && !cola.ok ? els.custom : null,
        partB.ok ? null : els.partb,
        partBNext.ok ? null : els.partbNext,
      ].filter(Boolean)[0] || null,
      priorGross: benefit.value,
      colaPercent: cola.value,
      priorPartB: partB.value,
      newPartB: partBNext.value === null ? partB.value : partBNext.value,
    };
  }

  function syncCustomVisibility(userInitiated) {
    if (!els.customWrap || !els.preset) return;
    const isCustom = els.preset.value === "custom";
    setHidden(els.customWrap, !isCustom);
    /* WCAG 3.2.2: arrowing through the list must not yank focus out of it.
       Only a pointer commit (clicking an option) moves focus; a keyboard user
       reaches the field with Tab, which is the very next stop anyway. */
    if (userInitiated && isCustom && presetIntent === "pointer" && els.custom) els.custom.focus();
  }

  /* The live region used to speak a full dollar sentence on every keystroke —
     four announcements for "1847". Typing now settles first; a submit or a
     menu choice is already a settled action, so those speak straight away. */
  let liveTimer = null;
  function announce(text, immediate) {
    if (!els.live) return;
    if (liveTimer) { clearTimeout(liveTimer); liveTimer = null; }
    if (immediate) { els.live.textContent = text; return; }
    liveTimer = setTimeout(() => { els.live.textContent = text; liveTimer = null; }, 900);
  }

  /* No CSS rule keys off data-state, so an invalid entry has to blank the
     figures itself. Leaving the last good numbers painted under a fresh error
     is how someone ends up reading a dollar amount that answers nothing they
     typed. */
  function clearResults() {
    if (els.results) els.results.setAttribute("data-state", "empty");
    for (const el of [els.newGross, els.grossInc, els.newNet, els.netInc]) {
      if (!el) continue;
      el.textContent = "—";
      el.classList.remove("figure__value--good", "figure__value--bad");
    }
    if (els.headline) els.headline.textContent = "Your estimated raise";
    if (els.kept) els.kept.textContent = "Check the amounts above and we'll show your estimate here.";
    if (els.chart) els.chart.innerHTML = "";
    setHidden(els.legend, true);
    setHidden(els.printWrap, true);
    setHidden(els.note, true);
    announce("", true);
  }

  function render(opts) {
    const immediate = !!(opts && opts.immediate);
    const silent = !!(opts && opts.silent);
    const f = readForm();

    if (!f.ok) {
      clearResults();
      return f;
    }

    const colaPercent = f.colaPercent;
    const r = projectBenefit({
      priorGross: f.priorGross,
      colaPercent,
      priorPartB: f.priorPartB,
      newPartB: f.newPartB,
    });

    if (els.results) els.results.setAttribute("data-state", "ready");
    setHidden(els.legend, false);
    setHidden(els.printWrap, false);
    setHidden(els.note, false);
    if (els.colaEcho) els.colaEcho.textContent = `${colaPercent.toFixed(1)}%`;

    if (els.newGross) els.newGross.textContent = usd(r.newGross);
    if (els.grossInc) {
      els.grossInc.textContent = signedUsd(r.grossIncrease);
      // Colour follows the sign, so a fall never renders in the "good" green.
      els.grossInc.classList.toggle("figure__value--good", r.grossIncrease > 0);
      els.grossInc.classList.toggle("figure__value--bad", r.grossIncrease < 0);
    }
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
      els.headline.textContent = `${lead} A ${colaPercent.toFixed(1)}% COLA lifts a ${usd(f.priorGross)} benefit to about ${usd(r.newGross)} before Part B.`;
    }
    if (!silent) {
      announce(
        `Estimated new gross benefit ${usd(r.newGross)} per month; net deposit ${usdCents(r.newNet)} after the Part B premium.`,
        immediate
      );
    }
    if (els.chart) els.chart.innerHTML = flowChart(r);
    return f;
  }

  // How the last change to the preset menu arrived, so focus is only moved on
  // a deliberate pick — never while someone is arrowing down the list.
  let presetIntent = "keyboard";
  if (els.preset) {
    els.preset.addEventListener("pointerdown", () => { presetIntent = "pointer"; });
    els.preset.addEventListener("keydown", () => { presetIntent = "keyboard"; });
  }

  // Wire events — live updates on any change.
  form.addEventListener("input", () => render());
  form.addEventListener("change", (e) => {
    if (e.target === els.preset) syncCustomVisibility(true);
    render({ immediate: true });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = render({ immediate: true });
    if (!f.ok) {
      if (f.firstInvalid) f.firstInvalid.focus();
      return;
    }
    if (els.results) els.results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  if (els.print) els.print.addEventListener("click", () => window.print());

  // First paint: fill the panel, but say nothing — nobody asked a question yet.
  syncCustomVisibility(false);
  render({ immediate: true, silent: true });
});
