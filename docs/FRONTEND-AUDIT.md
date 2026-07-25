# BenefitDial — Front-End Audit

**Date:** 2026-07-25 · **Commit audited:** `main` @ `732818a` · **Scope:** all 13 routes, source + built output + live browser

Ten dimension audits were run against both the source and the running site, then the
highest-stakes claims were re-derived by independent verifiers instructed to **refute**
them. Findings below are post-verification: several were downgraded, one was partly
refuted, and two were escalated. Severities here are the corrected ones.

**Baseline health:** build is clean, 21/21 unit tests pass, 13 pages emit, zero console
errors on any route, zero third-party requests on any route, measured CLS 0.0000, and
light-mode contrast passes across 540 measured pairs. The defects below sit on top of a
codebase that is, structurally, in good shape.

---

## Summary

| Severity | Count | Theme |
| --- | --- | --- |
| Critical | 3 | Fabricated or stale money figures shown as authoritative |
| High | 12 | Wrong/undefended numbers, dark-mode and small-viewport breakage, latent CLS |
| Medium | 18 | Semantics, structured data, degraded states |
| Low | 14 | Polish, dead code, icon/meta gaps |

The three criticals share one root cause: **the site displays a number it cannot vouch
for, with UI that says it can.** For a 65+ audience making enrolment and budget
decisions, that is the failure mode that matters most.

---

## Critical

### C1 · Sample plan data is presented as verified CMS data
`src/assets/js/plan-diff.js:66-69` · `dist/data/manifest.json`

`manifest.json` sets `sample: true`, and **every individual plan record carries its own
`"sample": true`**. Neither is ever read — `grep sample src/assets/js/ dist/assets/js/`
returns zero hits. The tool renders PRNG-generated dollar figures for real carriers and
real CMS contract IDs under the badge:

> `Source: CMS Landscape & Crosswalk files | Public CMS plan data | Figures verified July 25, 2026`

The word "sample" is absent from `document.body.innerText` entirely — the one disclosure
lives in a collapsed `<details>` (`dist/medicare-plan-changes.html:344`), which `innerText`
skips, making it invisible to Ctrl-F and to linear screen-reader reading. A
"Print or save these numbers" button sits beside the results.

The contract IDs are not obviously fake: `build-plan-data.mjs:89-93` offsets IDs by state
index, and Florida is index 0, so FL emits the hardcoded base IDs verbatim — H5253, H1610,
S5601 are recognisable real CMS contract numbers on real carriers and counties.

`/how-it-works` does carry an honest, visible callout about the sample dataset. It just
never reaches the user standing at the tool.

**Fix:** read `manifest.sample` in `plan-diff.js` and render a persistent, uncollapsed
banner above the results table; suppress or relabel the "Figures verified" badge while
`sample` is true. This single change also defuses C3 and M-series provenance findings.

### C2 · Build silently substitutes a hardcoded COLA figure into money copy
`scripts/build.mjs:115-118`

`cola.projectedCola != null ? … : "3.6"` is a silent data substitution, not a default.
Running the README's own documented annual-update procedure (promote 2027 to
`official,2.9` in `src/data/cola-history.csv`, rebuild) makes `cola.json` correctly emit
`projectedCola: null` — after which the built site ships:

- `2027 projected COLA — 3.6%`
- `A 3.6% COLA on a $2,000 benefit adds about $72 a month` (correct: ~$58)
- `the 3.6% figure is an early projection` — a claim about a number no longer in the data

41 stale `3.6` instances across 7 pages. `key-dates.html` contradicts itself inside one
document: "confirmed 2027 COLA was 2.9%" adjacent to "Is the 2.9% COLA for 2027 final?"
while the calculator offers 3.6%. **Build exits 0, `node --test` passes, and both
workflows' sanity blocks pass against the poisoned output.** Nothing in CI catches it.

**Fix:** fail the build when `projectedCola` is null but projected copy is still emitted;
never inline a numeric literal as a data fallback.

### C3 · Stale hardcoded statutory figures in money-facing copy
`src/pages/cola-calculator.html:66` · `src/pages/guide-medicare-changes.html` (11× in source, 13× built)

Two indexed federal figures are hardcoded in markup while every COLA figure on the same
site is already tokenised:

| Figure | Site says | Current (2026) | Effect |
| --- | --- | --- | --- |
| Part B standard premium (calculator prefill) | `$185.00` | `$202.90` | Default result overstates the deposit by $17.90/mo · $214.80/yr |
| Part D out-of-pocket cap | `$2,000` | `$2,100` | Asserted 13× on a page framed "for 2027"; page never says it is indexed |

> **Verification caveat:** the 2026 figures were confirmed via web search across multiple
> independent secondary sources. Direct fetches to cms.gov, medicare.gov, rrb.gov and
> federalregister.gov all returned 403 from the sandbox proxy, so **one human
> primary-source check is recommended before publishing corrections.** The *structural*
> defect — indexed statutory values hardcoded in markup with no build-time or CI signal —
> holds regardless of today's exact numbers.

Note the inconsistency: `guide-partb.html:81` explicitly disclaims its `$185` as an
illustration. `cola-calculator.html:66` presents the same figure as the standard amount.

**Fix:** move both into the data layer alongside the COLA figures; add a build assertion
that fails when a statutory figure's effective year is older than the page's target year.

---

## High

| # | Finding | Location |
| --- | --- | --- |
| H1 | **Dollar amounts truncate at 320px + large text.** `+$15` renders where the true value is `+$158.50` — a 10× error where the partial digit reads as complete. 135.1px clipped, `text-overflow:clip`, no ellipsis. Material corruption starts at 24px browser font; 320px-only (360–390px loses cents, 414px+ clean). | `site.css:435-440`, `.figure__value` |
| H2 | **COLA calculator answers a field the user cleared.** Empty benefit + submit → no error, full confident answer for the unentered `$2,000` default, narrated by the aria-live region. `"abc"` *does* error — empty is uniquely silent. | `cola.js:100` |
| H3 | **`data-state="empty"` matches zero CSS rules sitewide**, so invalid input leaves the previous figures fully painted. Computed styles identical between `ready` and `empty`. | `cola.js:99-105` |
| H4 | **Part B inputs have no validation.** `185,00` → `-$16,428.00` while the copy still reads "the full raise reaches your deposit". Negative Part B (`-500`) → "You'll keep about $757 more each month." | `cola.js:88-92`, `cola-calculator.html:66,75` |
| H5 | **`.nav-toggle` is 1.50:1 in dark mode at mobile widths** (11.94:1 in light) — the dark block overrides every sibling control's token but misses `--bc-teal-900`. Below 832px this is the primary nav control. Navigation is *not* blocked (footer carries all 8 routes at 10.29:1), so it degrades rather than breaks. | `site.css:295`, dark block `718-790` |
| H6 | **Text-size A/A/A control doesn't scale the rem system.** Sets `body` 19→23px while `html` stays 16px, freezing all rem sizing: **51.1%** of characters on `/` and 49.4% on `/cola-calculator` never change. At XL the scale inverts — body 23px, `h3` 21.6px, `.lead` 20.48px. `h4` is below body even at default. | `site.css:79-81` |
| H7 | **Ad slots reserve placeholder-derived heights** (104–181px, matching no IAB unit). Simulating a real creative fill: CLS **0.0497–0.1193**, two cases over threshold; on mobile `/cola-calculator` all four FAQ toggles shift down 132px. Latent until the ad loader is uncommented, then live on 12 routes at once. | `site.css:504-513` |
| H8 | **8-day stale-asset window.** Unhashed assets get `max-age=86400` + `stale-while-revalidate=604800`. Reconstructing new-HTML-with-old-CSS from the last commit: the footer legal disclaimer renders at **2.19:1** instead of 7.62:1. Invisible to CI and to the repo's own audit script, because a cold cache always sees new CSS. Cannot produce wrong money figures (all numbers are build-time HTML tokens). | `_headers:15-17` |
| H9 | **JSON-LD hardcodes COLA figures that diverge from visible copy.** With the estimate at 2.9%, the page renders "Is the 2.9% COLA for 2027 final?" while its JSON-LD says 3.6%. Tokens already work inside `ld+json` (`guides.html:115`), so the fix is mechanical. | 7 FAQPage blocks |
| H10 | **FAQ summary focus ring 100% clipped** by `details.faq{overflow:hidden}` — A/B pixel proof: 0 vs 4376 blue pixels. 47 tab stops across 11 pages with no visible focus indicator. | `site.css:551` |
| H11 | **Preset `<select>` steals focus** to `#f-cola-custom` on the 2nd ArrowDown — WCAG 3.2.2, keyboard users cannot return to the list. | `cola.js:81-86` |
| H12 | **Plan-comparison table: 0 of 32 cells visible at 320px** (clientW 183 vs scrollW 539), no scroll affordance, no `tabindex`, no keyboard access. Same pattern on 4 other routes. | `/medicare-plan-changes` |

Also high: control borders at **1.38:1** on all inputs, nav toggle and text-size buttons
(WCAG 1.4.11); only **10 states / 24 counties** selectable with no explanation or fallback;
`statusInfo()`/`diffMetric()` hardcode `"2027"` while headers use manifest years, so the
panel self-contradicts once data rolls.

---

## Medium (selected)

- **Page-level horizontal scroll** on `/privacy` (+115px), `/key-dates` (+64px), `/` (+40px)
  at 320px — unbreakable email token, a long `<h2>` word flooring a grid track to 354px,
  and a `flex-wrap:nowrap` chip at 291px in a 181px box. No `overflow-wrap` anywhere.
- **Mobile menu partly off-screen** at 360×640/24px — panel is absolutely positioned in a
  sticky header with no `max-height`; rects byte-identical at scrollY 1200/4000. Guides and
  About render off-screen, though both remain reachable (footer, keyboard Enter). While
  open, header+panel cover the full viewport and intercept all pointer events.
- **Star-rating changes coloured by numeric direction, not semantics** — a 3.0★→2.5★ drop
  renders green, a 2.5★→3.0★ rise renders red, contradicting the page's own legend.
  `plandiff-core.js:154` already computes the correct `tone`; the renderer never reads it.
  Only `starRating` is affected; arrows and before/after columns stay correct.
- **34 colliding `contract|plan|county` keys** + last-write-wins `Map.set` → 68/558 (12.2%)
  of plans diffed against the wrong successor (8× headline error on the named case).
  `segmentId` is `"0"` on both records, so the generator emitting two plans under one
  identity is the first failure; last-write-wins is the second. Sample-data-only today.
- **`/privacy` discloses analytics that do not exist** — "we use standard analytics",
  unhedged present tense, with zero analytics in the codebase and zero third-party requests
  measured. The ad-network prose *is* properly hedged and is fine. Dishonesty against the
  site's own interest. The same page's "there's no form on this site" is likely why nobody
  added submit guards — the root cause of the next item.
- **No-JS submit leaks typed figures into the URL** — `?benefit=2412.55&cola=3.6&partb=185.00`,
  and `?planid=H1610-001` on the plan tool. Zero `<noscript>` across 13 routes. The site
  promises "the numbers you type never reach us" and "no server that receives your benefit
  amount"; a GET puts them in history and access logs. COLA form controls are live-but-dead
  without JS; the plan tool correctly ships its selects `disabled`.
- **"Figures verified {date}" is `new Date()` at build time** — any rebuild re-"verifies"
  untouched data. No data-provenance date exists, and no verification step stands behind
  the word. Currently vouching for the sample dataset.
- **Printing from a dark-mode browser washes out headings.** Cascade claim confirmed
  (computed 1.07:1), but real PDFs disprove the severity — Blink darkens very light print
  text, giving **2.48:1** for `h1`/`thead th`/`.pd-planname`, while the dollar figures print
  at 5.74:1 and row labels at 21:1. The printed *numbers* are fine. Chromium-specific.
  Separately, `.result__headline` prints at 2.30:1 in **both** modes — a light-mode bug.
- **Heading skips on 13/13 pages** — footer `h2→h4` (11 routes), `h1→h3` on `/` and `/guides`
  (the homepage's two main tools, and all four guide links).
- **`aria-live` fires a full dollar sentence per keystroke** — 4 announcements for "1847".
- **Structured data**: `BreadcrumbList` items relative on 3 pages; all 7 FAQPage blocks
  paraphrase rather than mirror the visible Q&A; all 6 `Article` nodes lack
  `datePublished`/`dateModified`/`author`/`image` on a site built entirely on time-sensitive
  figures; `/privacy` mis-declared `og:type=article`.
- **CI does not gate deploy.** `ci.yml` and `deploy.yml` are separate workflows with no
  `needs`/`workflow_run`, so they run in parallel and a red CI does not block a deploy.
  Deploy's own gate omits CI's page-existence checks and the unresolved-`{{`-token grep.
  Node 20 in CI vs 22 via `.nvmrc` in deploy.
- **`SITE_URL` accepts a protocol-less value** — `SITE_URL=benefitdial.com` emits a relative
  canonical, relative `og:image`, non-absolute sitemap `<loc>` and broken JSON-LD `@id`,
  exiting 0 with all sanity checks passing.
- Also: `cache:"no-store"` makes the purpose-written `/data/*` cache header dead code
  (429 KB re-downloaded per visit); plan type / network change never compared, so a PPO→HMO
  consolidation is invisible; runtime jargon (AEP, MAPD, MOOP) unexpanded; custom-COLA field
  has no visible label and accepts 360%, blank and −5%; PDP plans show MOOP and dental rows
  as "No change" for benefits they never had.

---

## Low (selected)

Dead CSS (9 rule groups, 6 unused tokens verified across all 13 routes plus JS-injected
markup); `.result__headline` dead so the calculator's plain-language answer renders in the
panel's title bar; `/favicon.ico` 404s with no raster icon; `mask-icon` points at a
full-bleed multicolour SVG that Safari renders as a solid teal square; `og-default.png` is
246 KB with 33% losslessly recoverable and is never requested by any page; sitemap `lastmod`
stamped with build date on every rebuild; `ca-pub-XXXXXXXX` placeholder ships in a comment on
all 13 pages; `browsing-topics` permitted while the retired `interest-cohort` is blocked;
`<main>` lacks `tabindex="-1"` so the skip link leaves focus on BODY; two `aside`s both named
"Advertisement"; hero pill reads "+2.7% · +$61/mo", matching neither 2.8% nor 3.6%;
`localStorage['bc-textsize']` not covered by the privacy page; five titles 62–65 chars.

---

## Verified clean

Worth recording so these aren't re-audited: **privacy claims hold** — zero third-party
requests, cookies, storage writes on load, analytics, fonts or pixels on any of the 13
routes, verified by instrumenting `fetch`/`XHR`/`sendBeacon`/`cookie`/`localStorage`; CSP
produces zero violations and `Permissions-Policy` is genuinely not voided (measured via
`allowsFeature()`); HTML is structurally clean (no unclosed/misnested tags, no duplicate IDs,
no unreplaced `{{TOKEN}}` or `{{> partial }}` in any output); all 39 `var()` refs resolve;
`prefers-reduced-motion` genuinely honoured; every image/SVG correctly named or hidden; every
form control labelled; tables carry `scope` and captions; charts ship a `visually-hidden`
data-table fallback; mobile nav fully keyboard-operable (Enter/Space/Escape/focus return);
WCAG 2.2 target size passes including the spacing exception; readability 4.6–7.7 grade across
all 13 routes (tool pages easiest); all 21 internal link/asset targets 200; `/404` correctly
`noindex` and excluded from the sitemap; manifest valid including the `maskable` claim;
`_redirects` clean (7 rules, no loops or shadowing); pure math layer correct with 21/21 tests
passing; no global leaks, duplicate bindings or listener leaks; plan-data loader correctly
handles 404/500/malformed/aborted responses. No minification, bundling or critical-CSS work
is warranted at this size.

---

## Recommended order

1. **C1** — one `manifest.sample` read plus a persistent banner; highest harm-reduction per line changed.
2. **C3** then **C2** — both are "a number in the markup that the data layer should own".
3. **H2/H3/H4** — one validation pass on the COLA form closes three highs.
4. **H1** — `overflow-wrap`/`min-width:0` on `.figure__value`; prevents a 10× misread.
5. **H5/H6** — dark-mode token remap and rem-based text scaling.
6. **H7** before enabling ads — reserve real IAB dimensions.
7. **CI gating** — make deploy depend on CI, or the above can regress silently.

---

## Method & limits

Ten parallel dimension audits (accessibility, markup, CSS, responsive, JS behaviour,
performance, SEO, trust/accuracy, tool UX, infra) against source and a live Chromium
session, followed by four adversarial verification passes instructed to default to REFUTED.
Verification changed the picture materially: the plan-ID "silent no-op" was reduced from 3
failing paths to 1; the privacy page's ad-network disclosure was refuted outright; the
print-contrast critical was downgraded after generating real PDFs showed 2.48:1 rather than
the computed 1.07:1; the wrong-successor and star-colour findings were downgraded on
sample-data and redundant-signal grounds; and the sample-data finding was escalated.

An apparent contradiction between the accessibility and CSS audits was resolved: the a11y
sweep reported zero dark-mode failures because `.nav-toggle` is `display:none` above 832px
and the sweep ran at desktop width — scope-limited, not wrong. Its 1.38:1 border figure
belongs to the inputs and text-size buttons, not the toggle.

**Limits.** The 2026 Part B and Part D figures in C3 rest on web-search corroboration;
direct government-source fetches returned 403 — recommend one primary-source check.
The 7 outbound external links were unreachable from the sandbox and are unassessed.
`_headers`/`_redirects` behaviour is inferred from config, since the local preview server
does not implement them. The W3C validator was unreachable; markup conclusions rest on a
self-tested parser plus Chromium's own. The 474→367 stand-alone PDP counts
(`build.mjs:137`) are internally consistent but could not be reconciled against a reachable
primary source.
