export const meta = {
  name: 'benefitdial-qa',
  description: 'Adversarial multi-dimension QA of the built BenefitDial site, with verification',
  phases: [
    { title: 'Review', detail: 'parallel reviewers, one per dimension' },
    { title: 'Verify', detail: 'independently confirm each finding' },
  ],
};

const CONTEXT = `
BenefitDial is a static, zero-dependency site (built by scripts/build.mjs) for U.S. seniors.
Two interactive tools: a Social Security COLA calculator and a Medicare "What Changed" plan
diff. It monetizes ONLY via display ads and is deliberately NOT a broker/TPMO: no PII capture,
no lead sales, no carrier commissions, never recommends a plan for pay.

Files to inspect (read what's relevant to your dimension):
  • Pages (source):  src/pages/*.html  (front-matter comment + body sections)
  • Layout/partials: src/layout.html, src/partials/*.html
  • Styles:          src/assets/css/site.css
  • Tool logic:      src/assets/js/cola.js, src/assets/js/plan-diff.js,
                     src/assets/js/lib/cola-core.js, src/assets/js/lib/plandiff-core.js, src/assets/js/nav.js
  • Built output:    dist/*.html, dist/**/*.html, dist/sitemap.xml, dist/_headers, dist/robots.txt
  • Data:            src/data/cola.json, src/data/manifest.json

GOLDEN FACTS (authoritative — flag any contradiction):
  2026 COLA = 2.8% (announced Oct 24, 2025). Avg retiree check ~$1,976 -> ~$2,032. COLA uses CPI-W (not CPI-U):
  % rise in avg CPI-W for Jul-Aug-Sep vs same quarter of last COLA year, rounded to 0.1%. Worked: 308.729 -> 317.373 = 2.8%.
  2027 COLA = 3.6% ESTIMATE (official Oct 14, 2026, 8:30am ET). AEP = Oct 15 - Dec 7. MA OEP = Jan 1 - Mar 31, 2027.
  CMS Landscape/Crosswalk/PBP files release late Sep/early Oct. 2026: avg 32 MA-PD plans (was 34 in 2025);
  PDPs 474 (2025) -> 367 (2026). IRA $2,000 Part D OOP cap began 2025; CY2027 Final Rule published April 2026.
  Canonical site domain is https://benefitdial.com (build injects {{SITE_URL}}). Any other domain (e.g. .com, www) in
  hardcoded page JSON-LD is a CONSISTENCY BUG — the fix is to use the {{SITE_URL}} token so it matches the canonical.

Be a demanding senior reviewer at a top web studio. Report ONLY real, actionable defects — not style
opinions. For each finding give the file, a 1-based line if you can, the concrete problem, and a concrete fix.
Empty findings array is a valid, good answer for a clean dimension.
`;

const FIND_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['blocker', 'high', 'medium', 'low'] },
          area: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'integer' },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'area', 'file', 'issue', 'fix'],
      },
    },
  },
  required: ['findings'],
};

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    verdict: { type: 'string', enum: ['confirmed', 'rejected', 'uncertain'] },
    severity: { type: 'string', enum: ['blocker', 'high', 'medium', 'low'] },
    reason: { type: 'string' },
    correctedFix: { type: 'string' },
  },
  required: ['verdict', 'reason'],
};

const DIMENSIONS = [
  { key: 'calc-correctness', effort: 'high', prompt: `DIMENSION: Correctness of the two calculators. Re-derive the COLA math (cola-core.js: rounding to 0.1%, ssaRoundBenefit truncation, projectBenefit net = (gross*(1+cola)) - Part B, keptPercentOfRaise) and the plan diff (plandiff-core.js: metric direction/tone — premium/deductible/MOOP up = bad, stars up = good, benefit dropped = bad; crosswalk resolution for renewal/consolidation/termination/service-area-reduction/new; headline logic). Check cola.js and plan-diff.js wire the DOM correctly, validate input, and handle empty/NaN/negative/huge inputs and missing data. Flag any math error, wrong sign, off-by-one, unescaped user-influenced HTML, or crash path.` },
  { key: 'a11y-senior-ux', effort: 'high', prompt: `DIMENSION: Accessibility (WCAG 2.1 AA) and senior usability. Check: exactly one <h1> per page and correct heading order; every form control has an associated <label>; color contrast of text/badges/buttons on their backgrounds; visible focus states; tap-target sizes; aria-live on dynamic results; the mobile nav toggle's aria-expanded; skip link; reduced-motion; that the page is usable at 200% zoom; that emoji icons are aria-hidden and not sole carriers of meaning; that the ad label is present. Report concrete WCAG issues only.` },
  { key: 'tpmo-compliance', effort: 'high', prompt: `DIMENSION: Regulatory safe-harbor / TPMO. The site must NOT read as marketing on behalf of a specific carrier, must NOT capture PII (name/email/phone), must NOT contain lead forms or CPA/affiliate links to brokers, and must clearly present itself as independent and not government-affiliated. Verify the independence disclaimer is present site-wide (footer partial) and accurate, that no page recommends a specific named plan as "best", and that enrollment is always routed to the official Medicare Plan Finder / 1-800-MEDICARE. Flag any language or link that could pull the site into the CMS "chain of enrollment".` },
  { key: 'factual-accuracy', effort: 'high', prompt: `DIMENSION: Factual accuracy & internal consistency. Grep every page for numbers, percentages, dates, and dollar amounts. Flag anything that contradicts the GOLDEN FACTS, any future-year figure not labeled an estimate, any inconsistent domain in JSON-LD (must be benefitdial.com / {{SITE_URL}}), any leftover {{TOKEN}} that didn't resolve in dist/, and any internally inconsistent statistic between pages.` },
  { key: 'seo-metadata', effort: 'medium', prompt: `DIMENSION: SEO & metadata. In dist/*.html check: unique <title> (~50-65 chars) and meta description (~150-160) per page; one canonical per page pointing at the right URL; valid Open Graph/Twitter tags; JSON-LD blocks are valid JSON and reference the correct domain; sitemap.xml lists all pages with correct clean URLs; robots.txt allows crawl and references the sitemap; headings form a sensible outline. Flag missing/duplicate/oversized metadata and invalid structured data.` },
  { key: 'consistency-links', effort: 'medium', prompt: `DIMENSION: Cross-page consistency & links. Verify every internal href in src/pages/*.html and partials resolves to a real page slug that the build emits (/, /cola-calculator, /medicare-plan-changes, /key-dates, /guides, /guides/2027-social-security-cola, /guides/medicare-aep-2026, /guides/what-changed-medicare-2027, /guides/part-b-premium-and-your-cola, /about, /how-it-works, /privacy). Flag any dead internal link, any nav/footer inconsistency, any page using off-system inline styles/classes not in site.css, and any tone/voice outlier.` },
  { key: 'security-privacy', effort: 'medium', prompt: `DIMENSION: Security & privacy. Confirm the calculators never transmit user input anywhere (no fetch/XHR/beacon of typed values; the only fetches are static /data/*.json). Check for XSS via innerHTML with data-derived strings (plan names) — confirm escaping. Check _headers for sane security headers. Confirm no third-party script is actually loaded yet (ad loader is commented), no inline event handlers, no eval/new Function. Flag real vulnerabilities or privacy leaks only.` },
];

phase('Review');

const reviewed = await pipeline(
  DIMENSIONS,
  (d) => agent(`${CONTEXT}\n\n${d.prompt}`, { label: `review:${d.key}`, phase: 'Review', schema: FIND_SCHEMA, agentType: 'general-purpose', effort: d.effort })
           .then((r) => ({ key: d.key, findings: (r && r.findings) || [] }))
           .catch(() => ({ key: d.key, findings: [] })),
  (rev) => parallel(
    rev.findings.map((f) => () =>
      agent(
        `${CONTEXT}\n\nAnother reviewer filed this finding. Independently verify it by reading the actual file(s). Confirm ONLY if it is a real, reproducible defect; reject if wrong, already handled, or a style nitpick. If the fix is imperfect, provide a better correctedFix.\n\nFINDING (${rev.key}):\n${JSON.stringify(f, null, 2)}`,
        { label: `verify:${rev.key}`, phase: 'Verify', schema: VERDICT_SCHEMA, agentType: 'general-purpose', effort: 'high' }
      ).then((v) => ({ ...f, dimension: rev.key, verdict: v.verdict, verifyReason: v.reason, correctedFix: v.correctedFix || f.fix, verifiedSeverity: v.severity || f.severity }))
       .catch(() => ({ ...f, dimension: rev.key, verdict: 'uncertain', verifyReason: 'verification error', correctedFix: f.fix }))
    )
  )
);

const all = reviewed.flat().filter(Boolean);
const confirmed = all.filter((f) => f.verdict === 'confirmed');
const uncertain = all.filter((f) => f.verdict === 'uncertain');

log(`QA: ${confirmed.length} confirmed, ${uncertain.length} uncertain, ${all.length - confirmed.length - uncertain.length} rejected`);

const order = { blocker: 0, high: 1, medium: 2, low: 3 };
confirmed.sort((a, b) => (order[a.verifiedSeverity] ?? 4) - (order[b.verifiedSeverity] ?? 4));

return { confirmed, uncertain };
