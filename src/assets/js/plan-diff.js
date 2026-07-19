/* ==========================================================================
   plan-diff.js — wires the Medicare "What Changed" tool to plandiff-core.js
   Loads the public-data-derived JSON, guides the user State -> County -> Plan,
   and renders a year-over-year diff. No PII, no accounts, nothing is sent out.
   ========================================================================== */
import {
  indexPlans, indexCrosswalk, listStates, listCounties, plansInCounty,
  contractPlanKey, buildDiff, formatMetric,
} from "./lib/plandiff-core.js";

const $ = (id) => document.getElementById(id);
const DATA_BASE = "/data";

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json();
}

ready(async () => {
  const form = $("plandiff-form");
  if (!form) return;

  const els = {
    state: $("f-state"),
    county: $("f-county"),
    plan: $("f-plan"),
    planId: $("f-planid"),
    status: $("plandiff-status"),
    results: $("plandiff-results"),
    empty: $("plandiff-empty"),
    error: $("plandiff-error"),
    headline: $("pd-headline"),
    statusBadge: $("pd-status"),
    planName: $("pd-plan-name"),
    nextName: $("pd-next-name"),
    note: $("pd-note"),
    tbody: $("pd-tbody"),
    meta: $("pd-meta"),
    live: $("pd-live"),
  };

  function setStatus(msg) { if (els.status) els.status.textContent = msg; }
  function showError(msg) {
    if (els.error) { els.error.textContent = msg; els.error.hidden = false; }
    if (els.results) els.results.hidden = true;
    if (els.empty) els.empty.hidden = true;
  }

  let meta = { currentIndex: null, nextIndex: null, crosswalk: null, currentYear: 2026, nextYear: 2027 };

  // ---- Load data -------------------------------------------------------
  setStatus("Loading the latest public Medicare plan data…");
  try {
    const [manifest, plansCur, plansNext, xwalk] = await Promise.all([
      loadJSON(`${DATA_BASE}/manifest.json`).catch(() => null),
      loadJSON(`${DATA_BASE}/plans-current.json`),
      loadJSON(`${DATA_BASE}/plans-next.json`),
      loadJSON(`${DATA_BASE}/crosswalk.json`),
    ]);
    if (manifest) {
      meta.currentYear = manifest.currentYear || meta.currentYear;
      meta.nextYear = manifest.nextYear || meta.nextYear;
    }
    meta.currentIndex = indexPlans(plansCur);
    meta.nextIndex = indexPlans(plansNext);
    meta.crosswalk = indexCrosswalk(xwalk);
    setStatus("");
  } catch (err) {
    showError(
      "We could not load the plan data right now. This tool needs the CMS Landscape and Crosswalk files, which are published each fall. Please try again shortly."
    );
    return;
  }

  // ---- Populate state dropdown ----------------------------------------
  const states = listStates(meta.currentIndex);
  if (els.state) {
    els.state.innerHTML =
      `<option value="">Select your state…</option>` +
      states.map((s) => `<option value="${s}">${s}</option>`).join("");
  }

  function resetSelect(sel, placeholder) {
    if (!sel) return;
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    sel.disabled = true;
  }

  function onState() {
    resetSelect(els.county, "Select your county…");
    resetSelect(els.plan, "Select your plan…");
    hideResult();
    const s = els.state.value;
    if (!s) return;
    const counties = listCounties(meta.currentIndex, s);
    els.county.innerHTML =
      `<option value="">Select your county…</option>` +
      counties.map((c) => `<option value="${c}">${c}</option>`).join("");
    els.county.disabled = false;
  }

  function onCounty() {
    resetSelect(els.plan, "Select your plan…");
    hideResult();
    const s = els.state.value, c = els.county.value;
    if (!s || !c) return;
    const plans = plansInCounty(meta.currentIndex, s, c);
    els.plan.innerHTML =
      `<option value="">Select your plan…</option>` +
      plans
        .map((p) => {
          const id = `${p.contractId}-${p.planId}`;
          return `<option value="${p.contractId}|${p.planId}">${escapeHtml(p.planName)} — ${id}</option>`;
        })
        .join("");
    els.plan.disabled = false;
  }

  function onPlan() {
    if (!els.plan.value) { hideResult(); return; }
    runDiff();
  }

  // Optional: direct plan-ID entry like "H1234-001" selects the option.
  function onPlanIdEntry() {
    const raw = String(els.planId.value || "").trim().toUpperCase().replace(/\s+/g, "");
    const m = raw.match(/([HRS]\d{3,4})[-\s]?(\d{1,3})/i);
    if (!m || !els.plan || els.plan.disabled) return;
    const target = `${m[1].toUpperCase()}|${m[2].padStart(3, "0")}`;
    for (const opt of els.plan.options) {
      if (opt.value.toUpperCase() === target) {
        els.plan.value = opt.value;
        runDiff();
        return;
      }
    }
  }

  function hideResult() {
    if (els.results) els.results.hidden = true;
    if (els.empty) els.empty.hidden = false;
    if (els.error) els.error.hidden = true;
  }

  function runDiff() {
    if (els.error) els.error.hidden = true;
    const [contractId, planId] = String(els.plan.value).split("|");
    const state = els.state.value;
    const county = els.county.value;
    if (!contractId || !planId) return;

    const diff = buildDiff({
      currentIndex: meta.currentIndex,
      nextIndex: meta.nextIndex,
      crosswalk: meta.crosswalk,
      contractId, planId, state, county,
    });

    if (!diff.ok) {
      showError("We couldn't find that plan in this county's file. Double-check your plan ID against your member card or Annual Notice of Change.");
      return;
    }
    renderDiff(diff);
  }

  function renderDiff(diff) {
    if (els.empty) els.empty.hidden = true;
    if (els.results) els.results.hidden = false;

    if (els.headline) els.headline.textContent = diff.headline;

    if (els.statusBadge) {
      const toneClass = { good: "badge--good", warn: "badge--warn", bad: "badge--bad", info: "badge--info", flat: "badge--neutral" }[diff.statusInfo.tone] || "badge--neutral";
      els.statusBadge.className = `badge ${toneClass}`;
      els.statusBadge.textContent = diff.statusInfo.label;
    }
    if (els.note) els.note.textContent = diff.statusInfo.note;

    if (els.planName) els.planName.textContent = `${diff.prior.planName} (${diff.prior.contractId}-${diff.prior.planId})`;
    if (els.nextName) {
      els.nextName.textContent = diff.next
        ? `${diff.next.planName} (${diff.next.contractId}-${diff.next.planId})`
        : "No 2027 successor plan";
    }
    if (els.meta) {
      els.meta.textContent = `${diff.prior.orgName} · ${diff.prior.planType} · ${diff.prior.county}, ${diff.prior.state}`;
    }

    if (els.tbody) {
      if (!diff.next) {
        els.tbody.innerHTML = `<tr><td colspan="4">This plan is not offered in ${meta.nextYear}. Use Medicare Plan Finder or your county's plan list to choose a replacement during Open Enrollment.</td></tr>`;
      } else {
        els.tbody.innerHTML = diff.metrics
          .map((m) => {
            const dirClass = { up: "cell-change--up", down: "cell-change--down", flat: "cell-change--flat", added: "cell-change--down", removed: "cell-change--up" }[m.direction] || "cell-change--flat";
            const arrow = { up: "▲", down: "▼", added: "＋", removed: "✕", flat: "—" }[m.direction] || "";
            return `<tr>
              <th scope="row">${escapeHtml(m.label)}</th>
              <td class="num">${escapeHtml(m.priorText)}</td>
              <td class="num">${escapeHtml(m.nextText)}</td>
              <td class="num cell-change ${dirClass}">${arrow} ${escapeHtml(m.deltaText)}</td>
            </tr>`;
          })
          .join("");
      }
    }

    if (els.live) {
      els.live.textContent = `${diff.prior.planName}: ${diff.headline}`;
    }
    if (els.results) els.results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  els.state && els.state.addEventListener("change", onState);
  els.county && els.county.addEventListener("change", onCounty);
  els.plan && els.plan.addEventListener("change", onPlan);
  els.planId && els.planId.addEventListener("change", onPlanIdEntry);
  els.planId && els.planId.addEventListener("blur", onPlanIdEntry);
  form.addEventListener("submit", (e) => { e.preventDefault(); onPlan(); });

  // Column headers reflect the actual data years.
  const yh = document.querySelectorAll("[data-year-current]");
  yh.forEach((n) => (n.textContent = String(meta.currentYear)));
  const yn = document.querySelectorAll("[data-year-next]");
  yn.forEach((n) => (n.textContent = String(meta.nextYear)));
});
