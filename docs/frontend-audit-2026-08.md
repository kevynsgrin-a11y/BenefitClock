# BenefitDial — Front-End Audit, August 2026

Audited commit: `543e459` (origin/main). All 13 deployed routes, at 320–1920px,
light and dark, three text sizes, with and without JavaScript.

This is the **third** audit of this codebase. `docs/FRONTEND-AUDIT.md` and
`docs/FRONTEND-AUDIT-REMEDIATION.md` record the first two. Their fixes are merged and
this pass does not re-report them; where a prior fix is incomplete or overshot, that is
said explicitly and re-measured. The bar here is what two audits missed.

---

## Evidence coverage

| Capability | Status |
| --- | --- |
| Build and serve the site locally | **Yes** — `npm run build`, `scripts/serve.mjs` on :4321 |
| Drive a real browser | **Yes** — Playwright 1.56.1 + Chromium, all measurements below |
| Fetch the live public URL | **No** — every outbound host is refused at the proxy |

The live-URL failure is total, not selective: `benefitdial.com` and `example.com` both
return `EGRESS_BLOCKED`. **Two lenses are degraded as a result:**

- **Performance/SEO** — no production response header was observed. `_headers` is read
  from source and every cache, CSP and security-header finding here is graded OBSERVED,
  never MEASURED. `scripts/serve.mjs` sends `cache-control: no-store` for everything and
  applies neither `_headers` nor `_redirects`, so local measurement cannot stand in.
- **Responsive/architecture** — the seven `_redirects` aliases and Cloudflare's
  trailing-slash normalisation are unverified. No claim is made about them.

Also unverified: no screen reader was driven. Live-region findings count **writes to the
region**, not captured speech. This is stated inline wherever it matters.

The prior pass's open item — primary-source confirmation of the 2026 Part B premium and
Part D cap — **remains open and cannot be closed from this environment.** It needs a
networked machine or a person.

### Grades and discards

80 findings survived the adversarial verification pass. Deduping repeats where several
lenses reached the same defect from different directions leaves **58 distinct findings**.

| Grade | Count |
| --- | --- |
| MEASURED — code executed, browser driven, or value computed | 55 |
| OBSERVED — read directly in source | 3 |
| INFERRED — reasoned but not executed | 0 |

**Discarded: 5** by the verification pass, plus **1 corrected** by me on re-verification —
the stale scroll-affordance finding claimed 2 dead tab stops; I measured 1, and report 1.
Nothing at high or above rests on INFERRED reasoning, so no finding carries that word in
its heading.

I re-verified every critical and every high I acted on, by mutation in throwaway repo
copies and by driving Chromium myself, before writing any of it down. Where my number
differed from the reporting agent's, mine is used and the difference noted.

---

## Verdict

### What is genuinely good here — in specifics

This is a careful codebase, and two prior passes show. Concretely:

- **The sample-data disclosure is built the right way round.** The banner ships *visible*
  in the markup and is only ever hidden by script (`plan-diff.js:106-120`), so a JS
  failure cannot silently restore the misleading state. The dataset itself was
  regenerated with invented carriers, so no real CMS contract ID appears even if someone
  misses the banner. That is defence in depth on the finding that mattered most.
- **The data-layer discipline is real where it reaches.** `build-aep-data.mjs` refuses to
  build on zero current seasons, on two current seasons, on a coverage year that is not
  season+1, on window dates outside the season year, and on an inverted window. It fails
  rather than guesses. Very little code does this.
- **`requireFigure()` works.** Delete a value the pages quote and the build stops with a
  sentence naming the CSV row to fix. I tried it.
- **The colour work is done properly.** Sweeping every text node on all 13 routes in both
  schemes turned up exactly two AA failures, and both are single hardcoded values that
  escaped the token layer rather than anything systemic. The token architecture itself
  holds.
- **Tone is separated from direction in the plan diff.** A falling star rating is red even
  though the number went down (`plandiff-core.js`, and a test pins it). That is a
  genuinely subtle correctness property, and it is deliberate.
- **The data files are clean.** I ran referential integrity across all seven: 0 duplicate
  plan keys, 0 crosswalk rows pointing at a missing successor, county sets identical
  between years, manifest counts exact (561/472/237), every record flagged `sample: true`.
- **Zero third-party requests, zero cookies, zero localStorage on load.** The privacy
  claim is true, and structurally true rather than promised.
- **66 tests that assert real behaviour**, several of which encode statutory rules.

### What a visitor actually meets on arrival

A fast, calm, legible page that loads no trackers and asks for nothing. On a phone the
answer to the question the homepage asks is **3.6 screens below the fold** — 4.9 at the
site's own largest text setting — with an empty box labelled ADVERTISEMENT and a
provenance strip between the question and the first input.

If they reach the plan tool and choose a plan with the keyboard, one ArrowDown runs a
full comparison and throws the control they are holding 234px above the viewport.

And the number they came for is a **projection with 68 days to live.** On 2026-10-15 this
site starts telling visitors that a COLA announcement expected on a date already in the
past is still ahead of them, in 31 places across 8 pages, and nothing in the architecture
can correct it: no shipped code reads the clock, and no scheduled rebuild exists.

---

## Severity counts

| Severity | Count | Fixed here | Flagged, not fixed |
| --- | --- | --- | --- |
| Critical | 2 | 2 | 0 |
| High | 14 | 6 | 8 |
| Medium | 26 | 3 | 23 |
| Low | 16 | 3 | 13 |
| **Total** | **58** | **14** | **44** |

---

## Every critical, in full

### C1 · The gate never checks the value of any published figure — and the build already knows

**Evidence (MEASURED, reproduced by me).** I copied the repo to a scratch directory and
changed one field of `src/data/cola-history.csv`: the 2026 row's `cola_pct`, 2.8 → 9.9.
The CPI-W columns were left untouched, so the file now contradicts itself.

```
$ node scripts/build.mjs
  cola.json: confirmed 2026=9.9% · projected 2027=3.6% · worked check 2.8% (official 9.9%)
$ echo $?
0
$ node --test        # 66 pass, 0 fail
$ # ci.yml sanity block: file checks pass, 13 pages, no unresolved tokens
$ grep -ro '9\.9%' dist --include='*.html' | wc -l
23
```

23 occurrences across 5 pages — `guides/2027-social-security-cola` (9),
`how-it-works` (7), `cola-calculator` (4), `key-dates` (2), `index` (1) — including the
calculator's own default dropdown option, rendered verbatim as
`2026 confirmed COLA — 9.9%`.

Look at the build log again. `worked check 2.8% (official 9.9%)`. The build computed the
contradiction, printed it to stdout, and shipped anyway. `build-cola-data.mjs:46-62` built
the reconciliation for the worked example on `/how-it-works`, wrote it into `cola.json`,
and never asserted on it. There were **zero `throw` statements in the file.**

**Consequence.** Every guard the two prior passes built — `requireFigure`, the
unresolved-token check, the CI-gated deploy, 66 unit tests — is a guard against a figure
being *absent* or *unresolved*. Not one is a guard against it being *wrong*. On a site
whose entire value proposition is correct government figures for people planning a fixed
income, the class of defect the gate cannot see is the only class that matters.

**Fix.** Shipped, commit `C1`. `reconcileCola()` added to `cola-core.js` as a pure
function — so the rule is unit-tested even though the build scripts are not importable —
and called from `build-cola-data.mjs` where both numbers were already in hand. The build
now exits 1 with:

> `cola-history.csv: the published 2026 COLA (9.9%) does not match the 2.8% the statutory
> formula gives for the Q3 CPI-W averages on the same rows (2024: 308.729 → 2025:
> 317.373). One of the three is wrong. Refusing to build: this figure is quoted as a
> confirmed benefit increase on five pages and is the calculator's default.`

Zero pages emitted. No rendered byte changes on real data — the current CSV reconciles
exactly. Five tests cover both real cycles, a one-tenth slip and missing input.

Equality is exact at one decimal place on purpose: 42 U.S.C. 415(i) defines the COLA as
the Q3-over-Q3 increase rounded to the nearest tenth, and `roundColaFraction` already
applies exactly that. A disagreement means the averages and the percentage describe
different years, not a rounding difference.

**Effort.** Small — shipped. **Needs human review:** this can block a legitimate annual
refresh if a real CPI-W average is entered imprecisely. That trade is deliberate — a
blocked build is recoverable, a published benefit figure the build knew was wrong is not —
but it is a judgement call for whoever owns the data.

**Still open, and larger:** plausibility bands and year-monotonicity for the Part B
premium and the Part D cap, mirroring the discipline `build-aep-data.mjs` already has. Do
not invent the band edges. They are numbers about benefits and a person should set them.

---

### C2 · The chart guard is anchored on presentation, fails open, and misreports its own cause

This is the finding the brief predicted: **if the gate locates things by presentational
selector, every future redesign failure will misreport its own cause.** It does, and here
is the exact mapping.

**Evidence (MEASURED, reproduced by me).** `tests/charts.test.mjs` located chart bars with

```js
/<rect class="bc-bar[^"]*" x="([\d.]+)"[^>]*width="([\d.]+)"/g
```

which pins two things nobody agreed to: the **CSS class name** and the **order the
attributes happen to be written in**. I renamed `.bc-bar` to `.bc-column` in
`svgcharts.mjs` in a scratch copy — the single most likely edit in any restyle — and ran
the suite:

| Rename `.bc-bar` → | the gate says | what it actually means |
| --- | --- | --- |
| `.bc-column` | *"bars stay inside the plot area at every count"* — **PASSES** | `matchAll` returned nothing, the loop body never ran, the assertion never fired. The guard silently switched off. |
| `.bc-column` | *"bar density is the same whatever the bar count"* — **`TypeError: Cannot read properties of null (reading '1')`** | `.exec(...)[1]` on no match. The output blames bar density for a CSS rename. |

A redesigner reading that goes looking at chart geometry. The actual cause is a class
name, and the other guard has quietly stopped protecting anything at all.

**Consequence.** Two of the eight chart guards are decorative under exactly the condition
they exist for. A restyle that breaks real chart geometry *and* renames the class ships
green.

**Fix.** Shipped, commit `C2`. Attributes matched by lookahead so their order stops
deciding whether the guard runs; the match **count** asserted before the matches are used.
The same rename now produces:

> `expected 1 bar rects, matched 0 — the chart markup contract moved (class="bc-bar", x
> and width on a <rect>); fix the selector here rather than reading this as a geometry
> failure`

Tests only. `svgcharts.mjs` untouched, build output byte-identical.

**Effort.** Small — shipped. **Still open:** moving the contract onto `data-*` attributes
so CSS classes are free to change, and replacing the hardcoded `250 < w < 340` band and
the literal `720` with assertions against `SLOT * n`.

---

## High findings

Fixed in this branch:

| # | Finding | file:line |
| --- | --- | --- |
| H1 | **The hardcoded-year guard fails open on one added attribute.** `/data-year-[a-z]+>\s*\d{4}/` needs `>` to follow the attribute name. A/B measured: `<span data-year-next>2027</span>` fires the guard; `<span data-year-next class="yr">2027</span>` passes. Also pinned the AEP guide by filename — a rename failed the deploy with a bare `ENOENT`. | `tests/aep.test.mjs:113,127` |
| H2 | **Select chevron 2.31:1 in dark mode** (1.4.11 needs 3:1). Drawn inside a `data:` URI, so its stroke is a hex literal no token remap can reach. With `appearance:none` it is the only thing distinguishing a dropdown from a text input. Light 7.25:1. Fixed to 9.71:1. | `site.css:578` |
| H3 | **The empty state dims its own labels to 1.88:1 light / 2.29:1 dark** (1.4.3). `opacity:0.45` on `.figure-row` lands on live text. Fires on every cleared or invalid benefit entry. Fixed to 5.19:1 / 5.91:1. | `site.css:597-599` |
| H4 | **Homepage CTA 1.15:1 on hover in dark mode.** `--bc-teal-050` flips dark, `--bc-teal-900` does not — the stylesheet's own header (`site.css:7`) says raw ramps never flip. "Calculate my COLA raise" all but vanishes under the pointer. Fixed to 11.01:1. | `site.css:314, 967` |
| H5 | **Back-navigation leaves the panel disagreeing with the control.** Browsers restore form state *after* scripts run; the calculator rendered once on DOMContentLoaded. Measured: select reads 2.8%, panel reads 3.6% / $2,072. | `cola.js:272-273` |
| H6 | **One ArrowDown on the plan select scrolls the control 234px off-screen** while keeping focus (2.4.11). The form has no submit button, so `change` is the only commit path. Measured: scrollY 1983 → 2677, `#f-plan` top 460 → −234. | `plan-diff.js:369` |

Reported, not fixed — every one changes what a beneficiary reads about a deadline or a
benefit figure:

| # | Finding | file:line |
| --- | --- | --- |
| H7 | **Enrolment dates sit outside the data layer on the two pages that matter most.** All 42 AEP tokens are on one page. 10 year-bearing literals remain — `key-dates.html` 8, `index.html` 2. Executing the README's documented season roll left both files **byte-identical** to the pre-roll build, still advertising the closed 2026 window. | `key-dates.html:28,44,56,60,71,77,81,117,185`, `index.html:106,110` |
| H8 | **Medicare plan-year copy is bound to the Social Security COLA token.** 87 occurrences of `{{COLA_PROJECTED_YEAR}}` across 12 pages; the Medicare-semantic subset retitles the Medicare guide and `/key-dates` to a year no Medicare data source uses. `PLAN_YEAR_NEXT` and `AEP_COVERAGE_YEAR` already exist and render identically today. | `guide-medicare-changes.html:2,3,14,15,25,78,138,146,147`, `key-dates.html:2,14,152`, `build.mjs:232-239` |
| H9 | **`nextAnnouncementDate` is the one field in `cola.json` not derived from data.** A string literal in a build script that no documented procedure touches. Running the README's own COLA roll ships a two-year-past "expected on" date in **31 places across 8 pages**, including three FAQPage JSON-LD blocks, build green. | `build-cola-data.mjs:73`, `README.md:70,102-107` |
| H10 | **Nothing on the site reads the clock, and no scheduled rebuild exists.** 13 routes × 5 simulated dates from 2026-08-08 to 2029-01-01: **0 routes changed a single character.** `deploy.yml` fires only on push to main and `workflow_dispatch` — no `schedule:` key. Earliest date the site states something unconditionally false: **2026-10-15**. | `build.mjs:52-53`, `deploy.yml:26-29`, `cola-calculator.html:174`, `how-it-works.html:161-162` |
| H11 | **The gate resolves references inside HTML only, and only double-quoted `href`/`src`.** The four JSON files the plan tool fetches at runtime and the seven 301 targets in `_redirects` ship unchecked. | `ci.yml:80-109,93`, `plan-diff.js:135-138`, `_redirects:3-9` |
| H12 | **Zero test coverage on the four build scripts and the 852 lines of browser JS.** No test loads a DOM, reads `dist/`, or drives a browser. The C1 sample-data disclosure and the empty-benefit guard each regress on a one-line edit with the suite green. This is the pattern underneath, below. | `tests/`, `scripts/build*.mjs`, `src/assets/js/` |
| H13 | **The COLA worked-example tables mix build tokens with markup literals.** After one cycle they publish arithmetic that yields 2.80% and then state it rounds to 2.9%, and the history table silently drops a confirmed year the chart beside it still shows. | `guide-cola.html:44-76,82-120`, `how-it-works.html:31-59` |
| H14 | **"Figures verified <date>" cannot move when the projected COLA is refreshed** — the site's most-quoted number carries a provenance date that predates it. | `plan-diff.js:111-119`, provenance partials |

---

## The pattern underneath

Three root causes account for 34 of the 58 findings.

**1 · Guards assert shape, never value — and nothing tests the code that produces values.**
C1, C2, H1, H11, H12 and eight mediums are one defect wearing different clothes. Every
check in this repo answers *"is something there, and does it look right?"* Not one answers
*"is it true?"* `requireFigure` rejects null. The token check rejects `{{`. The link check
resolves paths. The chart tests measure geometry. Meanwhile the four scripts that compute
every number on the site have no tests at all and cannot be imported without executing, so
the layer where a wrong figure is born is the one layer with no coverage. C1 is what that
costs: the build printed the contradiction and shipped it.

**2 · The data layer exists, is good, and reaches one page.**
H7, H8, H9, H13, H14 and six mediums. `aep.csv` is genuinely well-built — five distinct
build-failing invariants. All 42 of its tokens are on `guide-aep.html`. `/key-dates`,
whose entire purpose is dates, and `/`, which is where everyone arrives, use literals. The
same shape repeats with the COLA announcement date, the plan-count statistics and the
worked examples. **The tokens already exist and already render byte-identical strings.**
The tokenising is not the hard part; the guard that stops it recurring is, and the one
guard that exists is scoped to the single page that never needed it.

**3 · Colour that escaped the token layer, in exactly two ways.**
H2, H4 and four lows. The stylesheet declares its layering contract at `site.css:7` —
*"Raw ramps … fixed hues, never flip."* `--bc-teal-050` flips. And a colour baked into a
`data:` URI cannot be remapped by any token at all. Both dark-mode AA failures are one or
the other. This is not a systemic colour problem; it is two known escape hatches, and both
are worth closing before a redesign multiplies them.

---

## Redesign blocker list

Resolve before any visual work begins.

1. **C2 must ship** (it has). Until the chart guards fail loudly, a restyle gets a
   `TypeError` about bar density when it renames a class, and a silently disabled guard
   for free.
2. **Move the chart contract onto `data-*` attributes.** `charts.test.mjs` still asserts
   `<table class="visually-hidden">` and a `250 < w < 340` width band. CSS class names are
   not a contract a designer should have to know about.
3. **Close the two colour escape hatches** — the `data:` URI chevron and the flipping
   `--bc-teal-050` — or a redesign inherits both and multiplies them across a new palette.
4. **The palette cannot be changed in one place today.** Repointing every teal token and
   `--bc-bg` leaves the sticky header and all reversed-out text at hardcoded values. An
   entire undeclared "on-dark" palette lives past the token layer: 88 distinct colour
   values, 47 hex occurrences outside the `:root` blocks.
5. **106 inline `style` attributes across 13 page sources** bypass the spacing scale and
   the type ladder, and are the sole reason the CSP must allow `style-src 'unsafe-inline'`.
   Every one is a place the design system does not actually govern.
6. **The type ladder is an accumulation, not a scale** — 17 steps, six of them inside a
   2.4px band, three colliding inside a single component row.
7. **397 lines of JSON-LD are hand-duplicated into page sources**, including 47 FAQ
   answers written out twice per file. No test touches the built markup, so visible copy
   and its structured-data twin drift silently. One already has.

---

## Undocumented constraints a redesigner must be told

Every one of these fails the build or the suite. **None appears in any document.** They
are harvested from the test suite and the build scripts, not from the docs.

**Markup contracts — rename these and the gate fires, or worse, stops firing:**

- A chart bar must be a `<rect>` in class `bc-bar` carrying `x` and `width`.
  *(Before C2, renaming the class disabled one guard and made another throw.)*
- The screen-reader data table must be `<table class="visually-hidden">` with one
  `<tr><th scope="row">` per series point, and the chart must keep `role="img"`.
- A two-bar chart's viewBox must land between 250 and 340 units; the five-bar COLA chart
  must be exactly 720. Each chart must declare `--bc-chart-w` equal to its own viewBox.
- A `data-year-*` span may not contain a literal year, and may only appear on a page whose
  front-matter loads `plan-diff.js`. *(Both guards; the first was defeatable by adding any
  attribute until H1.)*
- The AEP guide may contain no enrolment date in markup — no `October \d+`, `December \d+`,
  `March 31` or `January 1` outside the data layer. **This guard is scoped to that one
  page**; the same literals on `/key-dates` and `/` are unguarded, which is H7.
- No built HTML may contain `{{`, and the build must emit ≥13 pages.
- Every internal `href`/`src` must resolve — but only in HTML, and only double-quoted.

**Data invariants that fail the build:**

- Exactly one `aep.csv` row may be `status=current`. Zero fails; two fail rather than
  guess. `coverage_year` must be `season_year + 1`. Window dates must fall in the season
  year, MA OEP dates in the coverage year, and the window may not be inverted.
- Dates must be ISO `YYYY-MM-DD` **and real calendar dates** — `2026-11-31` is now
  rejected (L1); it used to render as "November 31".
- Every figure the pages quote must be present, or `requireFigure` stops the build naming
  the CSV row.
- **New:** the published COLA must equal the one the statutory formula gives for the Q3
  CPI-W averages on the same rows (C1).

**Behavioural rules encoded only in tests:**

- Colour comes from a change's *meaning*, never its direction — a falling star rating is
  red though the number fell.
- A missing numeric metric is non-comparable, never a fabricated `$0` movement. Zero is a
  real value and must not be treated as missing.
- Every formatter uses U+2212, never an ASCII hyphen.
- An empty benefit field is an error, never a silent `$2,000`.
- Two plans sharing a `contract|plan|county` identity must be flagged as duplicates, and a
  colliding successor must yield no comparison rather than the wrong one.

---

## If you do only five things

| # | Do this | Why | Effort |
| --- | --- | --- | --- |
| 1 | **Decide what happens on 2026-10-15** (H9, H10) | 68 days out, and the earliest date the site says something false. Nothing self-corrects. A `schedule:` trigger on `deploy.yml` is one line and turns a silent falsehood into a stale-but-rebuilt page; the durable fix is an `announce_expected` column driving the date from data. | Small |
| 2 | **Tokenise the 10 enrolment literals on `/key-dates` and `/`, then widen the AEP guard to every page** (H7) | The tokens exist and render byte-identical strings today. The guard is the half that stops it recurring — without it this is the third pass to find the same class of defect. | Small |
| 3 | **Put one test on the built output** (H12) | The single highest-leverage gap. Build `dist/`, assert the COLA figure in `cola.json` appears in the calculator's dropdown, and that the sample banner is present and visible. That one test would have caught C1 *and* guards the two prior passes' criticals from silent regression. | Medium |
| 4 | **Separate Medicare years from Social Security years** (H8) | `PLAN_YEAR_NEXT` and `AEP_COVERAGE_YEAR` already exist and render 2027 exactly where `COLA_PROJECTED_YEAR` does. Output is unchanged today; a COLA announcement stops retitling Medicare pages. | Small |
| 5 | **Close the two colour escape hatches** (H2 shipped, H4 shipped; the structural fix is not) | Both dark-mode AA failures came through them. Fixing the values is done; making `--bc-teal-050` stop flipping, and drawing the chevron from a token, is what stops a redesign reintroducing them. | Small |

---

## What to defend — things that look like flaws and are decisions

A redesign must not "fix" these.

- **The sample-data banner ships visible and is only hidden by script.** This looks
  backwards. It is the correct direction: a JS failure degrades toward honesty. Do not
  invert it to "hidden by default, shown when sample".
- **The site refuses to build on missing figures rather than falling back.** `requireFigure`
  looks hostile to iteration. It exists because a hardcoded fallback once shipped 41 stale
  money figures across 7 pages with everything green.
- **19px base text, 3.25rem minimum control height, huge tap targets.** This is not
  timidity about density; the audience is 65+ and the stylesheet says so at line 3.
- **The empty ad slots reserve space.** They look like unfinished work. They are CLS
  insurance — measured at 0.0000 across the site because of them.
- **`plandiff-core.js` renders a missing metric as "—" and refuses to compute a delta.**
  Looks like a gap. It is a deliberate guard against fabricating a `$0` movement, and a
  test pins it.
- **The zero-dependency, no-framework constraint.** It is why this site has no supply
  chain, no third-party requests and no cookies — the privacy claim is structural, not
  promised.
- **Charts ship as inline SVG with a visually-hidden data table.** The table is the
  primary path on small screens, not a fallback.
- **`nav.js`, `enhance.js` and both tools are progressive enhancements.** Every page is
  readable with JavaScript off. Do not make the content depend on a framework.

---

## What was shipped, what was flagged, what was not done

**14 commits, one finding each, each independently revertible.** `node --test`: 78 passing
(was 66), 0 failing. Build clean, 13 pages, no unresolved tokens.

**Fixed with a test that fails before and passes after:**

| Commit | Finding |
| --- | --- |
| `C1` | Build refuses a COLA the CPI-W averages do not support — 5 tests |
| `C2` | Chart guards fail loudly instead of failing open — 1 test |
| `H1` | `data-year` guard survives an added attribute; AEP guide resolved by binding — 3 tests |
| `L1` | Impossible calendar dates rejected — 2 tests |
| `L2` | `<figcaption>` escaped like every other interpolation — 2 tests |

**Fixed and flagged for human review — visible consequence, verified by browser
measurement rather than a committed test, because nothing in this repo loads a DOM:**

| Commit | Finding | Before → after |
| --- | --- | --- |
| `H2` | Select chevron, dark | 2.31:1 → 9.71:1 |
| `H3` | Empty-state labels | 1.88 / 2.29:1 → 5.19 / 5.91:1 |
| `H4` | CTA hover, dark | 1.15:1 → 11.01:1 |
| `H5` | Back-navigation | panel 3.6% vs select 2.8% → agree |
| `H6` | Plan select, keyboard | control −234px off-screen → stays put |
| `M1` | Reduced motion | 42 scroll positions → 1 (and 42 preserved without the preference) |
| `M2` | Stale scroll affordance | 1 dead tab stop → 0 |
| `M3` | Plan-ID error | echoed an invented ID → echoes what was typed |
| `L3` | `build:data` | regenerated 2 of 4 data sets → all 4 |

**Deliberately not done — reported with the exact mapping instead.** Everything in this
group changes a date or a figure a beneficiary acts on, or is publisher identity:

- **H7, H8, H9, H10, H13, H14** — every enrolment-date and plan-year tokenisation. The
  token names, the target files and the line numbers are in the tables above and each
  renders byte-identically today, so these are mechanical edits — but each one changes
  which Medicare plan year or which enrolment deadline a sentence tells a beneficiary it
  describes. That confirmation belongs to a person.
- **The COLA announcement date value itself** (`2026-10-14`). The mechanical guard is
  specified in H9; supplying the real next date is not mine to do.
- **`LICENSE` still names the pre-rebrand entity "BenefitClock" as copyright holder**, and
  has not been touched since the initial commit. Publisher identity — reported only.
- **The `$615` Part D maximum deductible is assigned to two different years** in the repo —
  CY2026 in the data file's provenance note, 2027 in the plan generator. A number a user
  might act on; someone with the primary source must resolve which is right.
- **The ad-slot copy.** Four places state in the present tense that ads are being served
  and paying the bills, while 22 boxes labelled ADVERTISEMENT ship empty on 12 of 13
  routes. That is a business-model statement, not a bug.
- **The "what's deposited" labelling.** The calculator withholds Part B only and never
  mentions the Medicare plan premium the site's own other tool shows, which is also
  withheld from the same check. Fixing it is financial guidance copy — a person writes it.
- **The 2026 Part B premium and Part D cap primary-source check**, still open from the
  prior pass. Blocked by the egress policy, as it was then.

**Not weakened, skipped or deleted:** no existing test. One pre-existing test does encode
a debatable behaviour — `plandiff.test.mjs` asserts `deltaText === "No change"` for a
metric that is genuinely *non-comparable* rather than unchanged. That is a finding, not a
fix, and it is left alone.

**In scope and not finished:** the seven `_redirects` aliases and Cloudflare's
trailing-slash normalisation were not verified, because the environment permits no
outbound request and the local server applies neither `_headers` nor `_redirects`. No
claim is made about production header or redirect behaviour anywhere in this document.
