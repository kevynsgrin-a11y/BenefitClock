export const meta = {
  name: 'benefitclock-qa-visual',
  description: 'Adversarial QA of the visual-enhancement pass (a11y, regression, coherence) with verification',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
};

const CTX = `
BenefitClock just received a visual-elevation pass (static, zero-dependency). Review the NEW work for
real, actionable defects only. Files most affected:
  • src/assets/css/site.css — new tokens (:root ~55-81, dark ~628-640), text-size overrides, and a big
    "Visual enhancements" section (icons, hero mesh/art, provenance, card depth, steps, reveal, text-size)
    plus dark-mode overrides for those components.
  • src/partials/: icons.html (symbol sprite), hero-art.html (hero SVG), provenance-band.html,
    provenance-strip.html, provenance-strip-cola.html, ripple.html, section-divider.html, header.html
    (text-size control + gold mark).
  • src/assets/js/enhance.js (scroll-reveal + count-up + text-size), cola.js (keep-first headline + print),
    plan-diff.js (print).
  • src/layout.html (icon sprite + enhance.js), src/pages/index.html (2-col hero, icons, provenance band,
    numbered steps, data-reveal), cola-calculator.html + medicare-plan-changes.html (provenance strip,
    icon swaps, print button).
  • dist/*.html (built output), src/static/_headers (CSP MUST stay 'self'-only; ad loader still commented).

Known-good invariants (don't re-flag): tools compute correctly; build emits 13 pages; 21 unit tests pass;
text-size control scales --bc-fs-base and persists; reveal/count-up are reduced-motion + no-IO gated and
never hide content for JS-off users; console-error sweep is clean in light+dark across pages.

Constraints the work must honor: zero external deps; CSP script/style/font 'self' (no unsafe-inline JS,
no inline event handlers, no eval); WCAG 2.1 AA in BOTH light and dark (target ~7:1 for large text on
teal grounds); accent TEXT must be --bc-amber-600 or darker (never amber-500/gold as text); every new
color used as text/stroke needs a dark-mode value; decorative SVG aria-hidden + focusable=false; motion
gated on prefers-reduced-motion; senior-first (large targets, visible focus).

Report concrete file+line defects with a concrete fix. Empty findings is a valid answer for a clean area.
`;

const FIND = {
  type: 'object', additionalProperties: false,
  properties: { findings: { type: 'array', items: { type: 'object', additionalProperties: false,
    properties: {
      severity: { type: 'string', enum: ['blocker', 'high', 'medium', 'low'] },
      area: { type: 'string' }, file: { type: 'string' }, line: { type: 'integer' },
      issue: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'area', 'file', 'issue', 'fix'] } } },
  required: ['findings'],
};
const VERDICT = {
  type: 'object', additionalProperties: false,
  properties: { verdict: { type: 'string', enum: ['confirmed', 'rejected', 'uncertain'] },
    severity: { type: 'string', enum: ['blocker', 'high', 'medium', 'low'] },
    reason: { type: 'string' }, correctedFix: { type: 'string' } },
  required: ['verdict', 'reason'],
};

const DIMS = [
  { key: 'a11y-contrast', prompt: `DIMENSION: Accessibility of the new components in BOTH themes. Check contrast (light + dark) for: provenance chips/monograms/note, step numbers + titles, text-size buttons (default + pressed), cta-reassure, hero copy over the mesh gradient, datasource strip text, chart labels, and the hero-art "EXAMPLE"/pill labels. Verify reduced-motion gating for scroll-reveal, count-up, and the card hover accent bar (nothing hidden or moving under reduce). Verify text-size at "xl" + 200% zoom doesn't clip/overlap header or break layout. Verify decorative SVG (icons, ripple, divider, hero-art) are aria-hidden/role-img correctly and never a link's only accessible name. Verify focus-visible rings remain visible over the new teal/mesh backgrounds. Flag any pair under 4.5:1 (or 3:1 large) with the measured ratio.` },
  { key: 'regression-correctness', prompt: `DIMENSION: Regressions & correctness from the visual pass. Confirm: no hardcoded hex leaked into new CSS/SVG that lacks a dark-mode value (grep new rules); the CSP in src/static/_headers is unchanged and still forbids off-origin + inline scripts, and NOTHING new violates it (no inline on* handlers, no new external URL, no eval — print buttons must be JS-wired); enhance.js cannot leave content permanently hidden (base .reveal visible; only armed off-screen; count-up always ends exact) and does not touch the live COLA/plan tiles; the icon <use href="#..."> sprite ids all exist in icons.html and every referenced icon resolves; the hero mesh token and all new tokens have dark values; build still emits all pages with no unresolved {{TOKENS}}. Flag concrete breakages.` },
  { key: 'coherence-consistency', prompt: `DIMENSION: Visual/system coherence. Confirm every emoji icon was replaced by an <svg class="icon"> (no leftover emoji as UI icons in index/cola/medicare card slots); new components use design-system tokens/classes (not stray inline hex); the provenance strip content is accurate per tool (COLA page → SSA/BLS; Medicare page → CMS); the two-column hero collapses correctly and the art is hidden on small screens; internal links still resolve; heading order preserved (one h1); tone stays on-brand (no sales pressure, no impersonation in hero-art). Flag inconsistencies.` },
];

phase('Review');
const reviewed = await pipeline(
  DIMS,
  (d) => agent(`${CTX}\n\n${d.prompt}`, { label: `review:${d.key}`, phase: 'Review', schema: FIND, agentType: 'general-purpose', effort: 'high' })
    .then((r) => ({ key: d.key, findings: (r && r.findings) || [] })).catch(() => ({ key: d.key, findings: [] })),
  (rev) => parallel(rev.findings.map((f) => () =>
    agent(`${CTX}\n\nIndependently verify this finding by reading the actual file(s). Confirm only if it is a real, reproducible defect; reject if wrong/already-handled/style-nitpick. Improve the fix if needed.\n\nFINDING (${rev.key}):\n${JSON.stringify(f, null, 2)}`,
      { label: `verify:${rev.key}`, phase: 'Verify', schema: VERDICT, agentType: 'general-purpose', effort: 'high' })
      .then((v) => ({ ...f, dimension: rev.key, verdict: v.verdict, verifyReason: v.reason, correctedFix: v.correctedFix || f.fix, verifiedSeverity: v.severity || f.severity }))
      .catch(() => ({ ...f, dimension: rev.key, verdict: 'uncertain', verifyReason: 'verify error', correctedFix: f.fix }))
  ))
);
const all = reviewed.flat().filter(Boolean);
const confirmed = all.filter((f) => f.verdict === 'confirmed');
const order = { blocker: 0, high: 1, medium: 2, low: 3 };
confirmed.sort((a, b) => (order[a.verifiedSeverity] ?? 4) - (order[b.verifiedSeverity] ?? 4));
log(`Visual QA: ${confirmed.length} confirmed of ${all.length} raised`);
return { confirmed, uncertain: all.filter((f) => f.verdict === 'uncertain') };
