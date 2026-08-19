# BenefitDial — Image & Content Production Brief

**Date:** 2026-08-16 · **Audited commit:** `0d2caac` (`main`, post front-end-audit remediation)
**Scope:** what this site should *show* and *say* — not what is broken. Three prior audits
covered correctness. Nothing has ever covered the media and content layer.

This is a **production brief, not a report**. Every item below carries an exact insertion
point, exact dimensions, exact alt text, dark-mode behaviour, a compliance check, and —
where an asset must be created — a complete, copy-pasteable generation prompt or the
finished draft copy. It is written to be executed without asking a follow-up question.

---

## The finding that frames everything

The site ships **six image files in total**, and four of them are favicons.

| File | Bytes | Purpose |
| --- | --- | --- |
| `src/assets/img/og-default.png` | 110,685 | social preview — **shared by all 13 routes** |
| `src/assets/img/og-default.svg` | 1,673 | source for the above |
| `src/static/favicon.ico` | 5,430 | browser tab |
| `src/static/favicon.svg` | 423 | browser tab |
| `src/static/mask-icon.svg` | 271 | Safari pinned tab |
| `src/static/apple-touch-icon.png` | 6,888 | iOS home screen |

Across all 13 built pages there are **zero `<img>` tags and zero `<picture>` elements**.
Every visual is inline SVG, and most of those are the 10-symbol icon sprite. The site's
one real illustration — the payment-slip-and-plan-card hero — is `display: none` below
56rem (`site.css:491`), so **no phone visitor has ever seen it**.

That is not automatically a fault. A restrained, text-first site for a 65+ audience is a
defensible position, and this one executes it well. But it means the entire burden of
explanation falls on prose, on pages that run to 3,000 words about genuinely hard
mechanics — the Q3-over-Q3 CPI-W formula, the Part B offset, four crosswalk outcomes. The
opportunity here is not decoration. It is the four or five pictures that replace two
hundred words each.

---

## Three standing decisions

These are rules, not preferences. They are what keeps 55 items looking like one site.

**1 · No photography, and no human figures in any medium.** Not stock photos, not
illustrated people, not abstracted silhouettes. The site's own copy promises "no one will
call you" and describes itself as "the opposite of a robocall"; a warm attentive face is a
picture of the thing the page says does not exist. One person reads as a testimonial, two
read as an agent, and a faceless silhouette is the signature motif of the lead-gen
advertising this site defines itself against. Enforced as a bright line: **if it cannot be
expressed as inline SVG using the `--bc-ill-*` colour tokens, it does not ship.** Full
statement in `VS-2`.

**2 · Inline SVG is the only illustration medium.** Not a taste call — a consequence of
four constraints that already exist. CSP is `img-src 'self' data:`. `package.json` promises
zero dependencies, so there is no `sharp`/`imagemin` optimisation path. `/assets/*` is
`max-age=0, must-revalidate` with no content hashing, so every raster costs a conditional
round-trip on **every page view, forever**. And a raster cannot be recoloured by the theme
tokens, so each one doubles into a `<picture>` for dark mode. Inline SVG has none of those
costs, prints, and keeps CLS at the measured 0.0000. The repo already contains the right
pipeline — `scripts/lib/svgcharts.mjs` — with `role="img"`, an `aria-label`, a
visually-hidden data table, a `figcaption`, and a `--bc-chart-w` custom property that caps
scaling at 1:1. Build on it.

**3 · One accent colour per illustration.** In dark mode `--bc-ill-accent` resolves to
`#f5c451`, byte-identical to `--bc-gold`. Any piece that distinguishes those two — the
current hero art does, at `hero-art.html:20` and `:38` — silently loses the distinction for
every dark-mode visitor. A two-accent design is a design that only exists for half the
audience. Fix for the existing art is `IC-8`.

The **reusable prompt preamble** that must be prepended to every generation prompt in this
brief is `VS-3`. It is written for a code-generating model, because the output is SVG
source, not pixels.

---

## Build order

Nothing in Groups C–I should start before Group A exists, or the assets will not cohere.

| Wave | Items | Why this order |
| --- | --- | --- |
| **1 — Foundations** | `VS-1` `VS-2` `VS-3` `VS-4` | The style spec, the standing rules, the prompt preamble, and the asset pipeline. Everything downstream is authored against these. ~1 day. |
| **2 — Cheap credibility** | `IC-1` `IC-2` `SO-2` `SO-7` `SO-8` `TR-9` `CG-7` `SC-1` | All trivial, all independent. The warning glyph, the printer icon, the OG plumbing, honest icon metadata, the `.answer` component. Clears the deck. |
| **3 — The accountability layer** | `TR-1` `TR-2` `TR-3` `TR-4` `TR-5` | The single biggest gap in the site. A YMYL site publishing benefit figures with no named author, no corrections channel and no citation pattern will not pass any serious review. **Requires a human to supply real names and a real address** — see the placeholders. |
| **4 — The pictures that explain** | `DG-1` `DG-2` `DG-3` `DG-5` `IM-1` | The four diagrams that replace prose, plus the mobile hero. Highest comprehension return in the brief. |
| **5 — Long-form usability** | `SC-2`…`SC-6`, `CG-2` `CG-5` | Short answers, jump lists, and the missing next step after a result. |
| **6 — Social** | `SO-1` `SO-3` `SO-4` `SO-5` `SO-6` | Per-route cards. Do after the style spec so they share a template. |
| **7 — Everything else** | remaining `CG-*` `SC-*` `IC-*` `DG-4` `PR-1` | Glossary, print pass, remaining icons and formatting. |

**Smallest set that delivers most of the value:** `VS-1`–`VS-3`, `TR-1`–`TR-3`, `DG-1`,
`DG-2`, `IM-1`, `SC-1`–`SC-5`, `SO-2`. Thirteen items. It gives the site an author, a
correction route, the two diagrams that matter, a hero on mobile, and a short answer at
the top of every guide.

---

## Totals

- **55 items** — 28 P0, 19 P1, 8 P2. By effort: 18 trivial, 24 small, 11 medium, 2 large.
- **By kind:** 17 content components · 15 content sections · 9 icons · 5 diagrams ·
  5 social cards · 2 illustrations · 2 new pages.
- **Byte impact:** every diagram and illustration is inline SVG, so the cost is HTML
  weight, not new requests. `SO-1` alone *removes* ~82KB by re-encoding the OG card
  (110,685 → ~28,000 bytes). Net asset weight after the whole brief is roughly neutral.
- **Zero new HTTP requests, zero new dependencies, CLS stays 0.0000.**

---

## Asset & content register

55 items, after merging 8 duplicates, cutting 3 and deferring 2 (see *What was cut*, at the end).

| ID | Item | Kind | Route | Priority | Effort |
| --- | --- | --- | --- | --- | --- |
| `VS-1` | BenefitDial illustration style specification (docs/visual-system.md) | content-component | sitewide | **P0** | small |
| `VS-2` | Standing rule: no photography of people, and no raster art beyond social cards | content-component | sitewide | **P0** | trivial |
| `VS-3` | Reusable generation-prompt preamble for all BenefitDial art | content-component | sitewide | **P0** | trivial |
| `VS-4` | Asset pipeline: how generated art reaches production, and the gen-images.mjs repair | content-component | sitewide | **P0** | small |
| `IC-1` | ic-alert-triangle — the warning glyph for all seven callout--warn blocks | icon | sitewide (guide-aep, guide-cola, guide-medicare-changes, gui | **P0** | trivial |
| `IC-2` | ic-printer — replace the misused ic-doc-gov on both print buttons | icon | /cola-calculator, /medicare-plan-changes | **P0** | trivial |
| `IC-3` | ic-envelope-open — the ANOC / 'read your mail' glyph | icon | /key-dates, /guides/medicare-aep-2026, /guides/what-changed- | P1 | trivial |
| `IC-4` | ic-pill — Part D, formularies and the yearly drug cap | icon | /guides/what-changed-medicare-2027, /guides/medicare-aep-202 | P1 | trivial |
| `IC-5` | ic-list-check — the 'what to actually do' checklist glyph | icon | /guides/medicare-aep-2026, /key-dates | P1 | trivial |
| `IC-6` | ic-star — star ratings | icon | /medicare-plan-changes, /guides/what-changed-medicare-2027 | P2 | trivial |
| `IC-7` | ic-browser-lock — 'runs entirely in your browser', the site's core privacy claim | icon | /privacy, /cola-calculator, /medicare-plan-changes | P2 | trivial |
| `IC-8` | hero-art conformance fix: one accent, because dark mode collapses the two | inline-svg-illustration | / (the only page including the hero-art partial) | P2 | trivial |
| `DG-1` | One deposit, two changes — the Part B offset as a vertical flow | inline-svg-diagram | /guides/part-b-premium-and-your-cola (primary) + /guides/202 | **P0** | medium |
| `DG-2` | Four futures for one plan — what the CMS Crosswalk actually says | inline-svg-diagram | /medicare-plan-changes (primary) + /how-it-works (reuse) | **P0** | medium |
| `DG-3` | Which three months count — the CPI-W third-quarter window | inline-svg-diagram | /how-it-works (primary) + /guides/2027-social-security-cola  | P1 | medium |
| `DG-4` | The enrolment year as one strip — AEP, the closed gap, and MA OEP | inline-svg-diagram | /key-dates (primary) + /guides/medicare-aep-2026 (reuse) | P2 | large |
| `DG-5` | "Your numbers never leave your device" data-flow diagram | inline-svg-diagram | /privacy | **P0** | medium |
| `IM-1` | Compact mobile hero illustration for the homepage | inline-svg-illustration | / | **P0** | small |
| `SO-1` | Rebuild og-default as a slotted template card, de-dithered and re-encoded to PNG-8 (110,685 → ~28,000 bytes) | og-social-image | sitewide (fallback for all 13 routes; primary card for /) | **P0** | medium |
| `SO-2` | Tokenise og:image:alt and add per-page ogimage/ogalt front matter (the plumbing OG-02..05 need) | content-component | sitewide | **P0** | trivial |
| `SO-3` | og-cola-calculator-2027.png — dedicated card for the COLA tool | og-social-image | /cola-calculator | **P0** | small |
| `SO-4` | og-plan-changes-2027.png — dedicated card for the Medicare plan-diff tool | og-social-image | /medicare-plan-changes | **P0** | small |
| `SO-5` | og-guide-cola-2027.png — card for the COLA explainer, the page that gets linked on announcement day | og-social-image | /guides/2027-social-security-cola | P1 | small |
| `SO-6` | og-key-dates-2027.png — card for the fall calendar page | og-social-image | /key-dates | P1 | small |
| `SO-7` | Rebuild apple-touch-icon.png from a dedicated full-bleed source — it currently ships baked-in white corners | icon | sitewide (src/layout.html:42, and the JSON-LD Organization l | **P0** | trivial |
| `SO-8` | Make site.webmanifest truthful — the single icon entry claims "maskable" and it is not | icon | sitewide (src/static/site.webmanifest, linked at src/layout. | P1 | small |
| `TR-1` | /editorial-standards — the accountability page the site has never had | content-page | new route: /editorial-standards | **P0** | medium |
| `TR-2` | A corrections channel — the site's first mailto, and a per-page way to use it | content-component | sitewide (footer) + the six article routes + /privacy | **P0** | small |
| `TR-3` | Byline + last-reviewed block — one partial, six article routes | content-component | /how-it-works · /key-dates · /guides/medicare-aep-2026 · /gu | **P0** | small |
| `TR-4` | Sample-data forewarning on the seven routes that funnel into the plan tool | content-component | / · /guides · /key-dates · /guides/medicare-aep-2026 · /guid | **P0** | small |
| `TR-5` | A real citation pattern — every statutory figure names its governing document | content-component | /guides/part-b-premium-and-your-cola · /cola-calculator · /g | **P0** | medium |
| `TR-6` | Structured data for credibility — Person author, Organization contact, publishing principles | content-component | sitewide (layout.html Organization/@graph) + the six Article | P1 | small |
| `TR-7` | /about — "Who is behind BenefitDial": the ownership and funding section | content-section | /about | P1 | small |
| `TR-8` | Surface the "not read first-hand" caveat that currently hides in a CSV comment | content-component | /guides/part-b-premium-and-your-cola · /cola-calculator · /g | P1 | medium |
| `TR-9` | Independence disclosure — a short version above the fold on the two tool pages | content-component | /medicare-plan-changes · /cola-calculator | P2 | trivial |
| `CG-1` | /glossary — a plain-language dictionary of the 39 terms the site already uses without defining | content-page | new route: /glossary | **P0** | large |
| `CG-2` | "What to do next, by result" — the missing step after the plan tool tells you your plan is terminating | content-section | /medicare-plan-changes | **P0** | medium |
| `CG-3` | "Free help that is not us" — a shared block naming SHIP, 1-800-MEDICARE and the Plan Finder | content-component | sitewide (partial, used on /about and /guides/medicare-aep-2 | P1 | small |
| `CG-4` | "Don't see your plan in the list?" — closing the dead end for readers on Original Medicare or Medigap | content-section | /medicare-plan-changes | P1 | small |
| `CG-5` | "Where to find the two numbers this asks for" — on the COLA calculator | content-section | /cola-calculator | P1 | small |
| `CG-6` | An "All four guides" block — repairing a guide link graph where one guide links to no sibling at all | content-component | /guides/medicare-aep-2026, /guides/2027-social-security-cola | P2 | small |
| `CG-7` | Give the privacy policy a real last-updated date instead of a bare year | content-section | /privacy | P2 | trivial |
| `SC-1` | `.answer` component — the reusable "short answer" box | content-component | sitewide (CSS), consumed by the 4 guides | **P0** | trivial |
| `SC-2` | "The short answer" for the What Changed Across Medicare guide | content-section | /guides/what-changed-medicare-2027 | **P0** | small |
| `SC-3` | "The short answer" for the Part B and your COLA guide | content-section | /guides/part-b-premium-and-your-cola | **P0** | small |
| `SC-4` | "The short answer" for the Medicare Open Enrollment guide | content-section | /guides/medicare-aep-2026 | **P0** | small |
| `SC-5` | "The short answer" for the 2027 Social Security COLA guide | content-section | /guides/2027-social-security-cola | **P0** | small |
| `SC-6` | In-page contents (jump links) for the six routes over 10,000px | content-component | /guides/what-changed-medicare-2027 · /guides/2027-social-sec | **P0** | medium |
| `SC-7` | IRMAA: break the site's longest single-paragraph block into a scannable list | content-section | /guides/part-b-premium-and-your-cola | P1 | trivial |
| `SC-8` | "What this means if you're renewing" — a 110-word paragraph that should be three bullets | content-section | /guides/what-changed-medicare-2027 | P1 | trivial |
| `SC-9` | The Part D redesign: 928px of machinery prose becomes a two-column what-changed table | content-section | /guides/what-changed-medicare-2027 | P1 | small |
| `SC-10` | Rewrite twelve section headings as the questions people actually ask | content-section | /guides/part-b-premium-and-your-cola · /guides/what-changed- | P1 | small |
| `SC-11` | Reading level: fix the five sentences that push three pages past grade 9 | content-section | /how-it-works · /key-dates · /privacy · /guides/part-b-premi | P1 | small |
| `SC-12` | Break the COLA guide's 884px opening run by demoting the 1975 history to an aside | content-section | /guides/2027-social-security-cola | P2 | trivial |
| `PR-1` | Make the printed page a keepable document: identity band, and result-first tool printing | content-component | sitewide print stylesheet, with tool-specific rules for /col | P1 | medium |

---

# Group A — Standing decisions and the house style (do these first; everything else depends on them)

---

## VS-1 · BenefitDial illustration style specification (docs/visual-system.md)

> **P0** · effort: small · kind: `content-component` · route: sitewide
> Source lens: Visual system

**Why it earns its place.** Right now there is exactly one illustration on the site (src/partials/hero-art.html) and one icon set, and the rules that make them cohere are unwritten — they exist only as habits inside those two files. The proof that this is already costing something: hero-art uses BOTH accent tokens, and in dark mode --bc-ill-accent is redefined to #f5c451 (site.css:1003) which is identical to --bc-ill-gold, so the amber 'Plan' chip and the gold COLA pill render as the same colour. I confirmed this in a dark-mode screenshot. A light-mode design decision is silently destroyed in dark mode because nobody wrote the rule down. Without this spec, the ~12 new assets this brief proposes will each re-invent line weight, corner radius and accent policy, and the site will look assembled rather than designed. After this exists, any contributor or model can produce a piece that drops into the site with no review round-trip.

**Insertion point.** docs/visual-system.md:1 — new file, alongside docs/FRONTEND-AUDIT.md and docs/frontend-audit-2026-08.md. Add a one-line pointer in README.md:52, immediately after the `css/site.css  # the entire design system (senior-first, WCAG-minded)` line of the source tree, reading `  (art rules: docs/visual-system.md)`. It sits between the CSS design system (which owns colour tokens) and the icon sprite (which consumes them).

**Specification** — Markdown, ~1,400–1,800 words, no images inside it (it describes art, it does not contain any). Zero bytes shipped to production — docs/ is not copied to dist/ (build.mjs copies only src/assets, src/data/*.json and src/static). Byte budget: n/a for the wire; ~12 KB on disk.

**Draft copy / markup — ready to insert**

```html
# BenefitDial visual system — illustration & icon rules

This document is normative. Art that does not satisfy it does not ship.

## 0. The one-sentence rule

**BenefitDial draws documents, numbers, dates and files. It never draws people, phones, or government marks.**

## 1. Where art lives

There are exactly four sanctioned paths. Nothing else is permitted.

| Path | For | Mechanism |
| --- | --- | --- |
| A — Icon | A 24×24 symbol beside a text label | `<symbol>` in `src/partials/icons.html`, used via `<use href="#ic-…">` |
| B — Static illustration/diagram | A fixed drawing on one or more pages | New `src/partials/<name>.html`, included with `{{> name }}` |
| C — Data-driven figure | A drawing whose shape depends on `src/data/*.json` | New function in `scripts/lib/svgcharts.mjs`, emitted as a `{{TOKEN}}` from `build.mjs` |
| D — Raster brand asset | `og-default.png`, `apple-touch-icon.png` only | `scripts/gen-images.mjs`, output committed |

Paths A–C produce **inline SVG only**. Path D is closed: no new raster assets are added to this site except a per-route social card, which is not fetched by any browser on any route.

## 2. Line weight

Icons are `stroke-width="2"` on a `0 0 24 24` viewBox. They render at `1.05rem`–`1.75rem` (site.css:906–908), so the stroke lands at 1.4–2.3 CSS px.

Illustrations use the same **rendered** weight, not the same fraction. The rule:

> **Author an illustration's viewBox width in user units equal to the maximum CSS pixel width it will ever render at.** Then `stroke-width="2"` is two device-independent pixels — optically identical to an icon stroke.

`hero-art.html` already obeys this by accident: `viewBox="0 0 480 380"` against `max-width: 30rem` (= 480px) at site.css:494. Keep it deliberate. If a piece is capped at 640px, author it at 640 wide. Never author at 1200 and let CSS shrink it — that halves every stroke and turns a 2px line into a 1px hairline that disappears for a 65+ reader.

All strokes: `stroke-linecap="round"`, `stroke-linejoin="round"`. No exceptions, no dashes, no variable width.

## 3. Fill vs stroke

- **Icons: stroke only.** `fill="none" stroke="currentColor"`. Never fill an icon.
- **Illustrations: one stroke level — the silhouette.** An object's outermost outline gets a 2px stroke; everything inside it is a *filled* shape with no stroke at all.

This is the single most important rule for legibility at small sizes. A line drawing with stroked interior detail turns to grey mush; a filled interior inside one stroked silhouette stays readable. `hero-art.html` follows it: the paper and card rects are stroked, the placeholder bars and pills are pure fills.

## 4. Corner treatment

| Element | Radius |
| --- | --- |
| Object-scale rectangles (cards, sheets, panels) | `rx="16"`–`rx="18"` — matches `--bc-radius-lg: 18px` |
| Chips, pills, badges | `rx` = half the height (fully round ends) |
| Placeholder text bars | `rx` = half the height |
| Medallions, dials, clock faces | `<circle>` |

No square corners anywhere. No superellipses, no chamfers.

## 5. Colour — how many, and which

One accent per piece. This is not taste; it is a measured requirement. In light mode `--bc-ill-gold` is `#f5c451` and `--bc-ill-accent` is `#d97706` (site.css:132–133). In dark mode `--bc-ill-accent` is redefined to `#f5c451` (site.css:1003) — **identical to gold**. Any piece that encodes a distinction between the two accents renders that distinction only in light mode and silently loses it in dark. `hero-art.html` does exactly this today; see the conformance fix.

Budget per piece:

- **Line:** `--bc-ill-line`. Exactly one, mandatory.
- **Surfaces:** `--bc-ill-paper`, plus at most two of `--bc-ill-fill`, `--bc-ill-fill-2`, `--bc-teal-050`.
- **Chrome bands:** at most two of `--bc-teal-600`, `--bc-teal-700`, `--bc-teal-800`.
- **Accent:** exactly one of `--bc-ill-gold` *or* `--bc-ill-accent`. Never both.
- **Label-on-accent:** `--bc-teal-900` is permitted purely as text sitting on an accent fill and does not count against the ceiling.

**Ceiling: eight distinct colour tokens.** Most pieces should use four or five. Literal hex values are forbidden — they cannot flip for dark mode.

No gradients inside illustrations. The only two gradients on the site are `--bc-hero-mesh` (a CSS background) and the `og-default.svg` backdrop (a raster source that never renders in a themed context). Neither is a precedent.

## 6. Figures and people — the standing rule

**No human figures appear in BenefitDial art. Ever. In any medium, at any level of abstraction.** No faces, no bodies, no silhouettes, no hands, no couples, no families, no carers, no crowds, no stick figures, no head-and-shoulders avatars.

Three independent reasons, any one of which is sufficient:

1. **Compliance.** A drawn person next to a plan card is functionally a testimonial or an implied endorsement, and a drawn person *helping* another is agent imagery — the exact thing the site's own copy rules out. `/about` promises "we will never ask you to 'speak with a licensed agent'"; `/privacy` says "There is no 'talk to a licensed agent,' no callback request." Art that depicts a helper contradicts the page it sits on.
2. **Positioning.** `/about` describes the transaction as "You look up a number and leave." `/privacy` says "You are a reader, not a lead." That is an explicitly *anti-relationship* promise. Human figures signal relationship, warmth, and a person on the other end. The visual language must match the contract: this is a reference table, not a service.
3. **The 65+ audience specifically.** Drawing older adults is a trap with no good exit. Draw them frail and the site is condescending to the people paying its bills. Draw them vigorous and grinning and it becomes indistinguishable from the lead-gen advertising the site exists to be the alternative to — that visual convention is *owned* by the funnels. And every choice of gender, skin tone, body and pairing turns into a statement about who the site is "for," on a site whose whole argument is that it is for whoever shows up with a number.

**Abstraction does not rescue it.** A featureless rounded-head silhouette is still a person, still reads as "an advisor," and is the single most common motif in Medicare lead-gen creative. Representation and abstraction fail for the same reason.

The subject of a BenefitDial illustration is always an **object of record**: a statement, a notice, a plan card, a calendar, a file, a clock, a number. Meaning is carried by the *relationship between objects* — a slip next to a card, a before-bar next to an after-bar, a date on a spine — not by a character reacting to them.

## 7. Photography

**BenefitDial ships no photographs of people. This is a standing rule, not a per-asset judgement.** The stronger form, which is the one to enforce because it has no grey area: *if it cannot be expressed as inline SVG using the colour tokens, it does not ship.*

Beyond the three reasons in §6, which all apply:

- **Performance.** Every raster is a separate HTTP request against `Cache-Control: max-age=0, must-revalidate` (`src/static/_headers`:42–43), because assets are not content-hashed. That is a conditional round-trip on **every page view, forever**, for decoration. The site currently ships zero `<img>` tags across all 13 routes; that is a competitive asset for readers on slow rural connections, not an oversight.
- **Dark mode.** A photograph cannot flip. Supporting the shipped dark theme means `<picture>` with two encodings — double the bytes for one decoration.
- **CLS.** Measured 0.0000 sitewide today. Every raster is a regression risk that has to be defended with explicit `width`/`height` on every insertion.
- **CSP.** `img-src 'self' data:` means self-hosting only; there is no stock-photo CDN escape hatch.

Stock photography of seniors is the visual signature of the lead funnel. Not having it is the point.

## 8. Depth and shadow

One technique only: a **duplicate of the object's silhouette in `--bc-ill-line` at `opacity=".18"`, offset `+6` on x and `+8` on y, drawn behind the object**. That is what `hero-art.html` does at lines 4 and 27, and it is the whole depth vocabulary.

No blurs. No `<filter>` inside an SVG. No gradients used as shading. No drop-shadow on interior elements.

A CSS `filter: drop-shadow()` applied to the *container* is permitted (site.css:494 does this on the hero art) because it renders outside the SVG and does not need theming.

## 9. Behaviour from 320px to 1280px

Three tiers. Every piece declares which it is.

**Tier A — decorative, wide viewports only.** Hero art, the ripple. `display: none` below `56rem` (site.css:491–493). This is a legitimate choice, but it must be *chosen*: today the site's only illustration is invisible on every phone, and nothing records that as intentional. Rule: a Tier A piece may never be the only place a fact appears, and its `aria-label` must duplicate adjacent copy.

**Tier B — explanatory, all viewports.** Diagrams that carry meaning. Must be legible at 320px, where the content box is ~288px. Pick one of three, in this order of preference:

1. Author the viewBox at width ≤ 320, so it renders at or near 1:1 on a phone.
2. Reflow: a wide horizontal composition becomes a vertical stack below `34rem`, via a second `<svg>` swapped with a CSS media query, or a `viewBox` the CSS overrides.
3. Reuse the escape hatch that already exists for charts: `overflow-x: auto` on the figure with `min-width: min(30rem, calc(var(--bc-chart-w) * 0.85))` on the svg (site.css:882–887). Do not invent a fourth mechanism.

Floor: **no text inside a Tier B piece may render below 14 CSS px at 320px.** For a viewBox of width W rendering into 288px, a 15-unit label renders at `15 × 288 / W` px — so W ≤ 308 keeps a 15-unit label above the floor.

**Tier C — icons.** 24×24, rendered between `1.05rem` and `1.75rem`. Never smaller than `1.05rem`. Always paired with a visible text label; never the sole carrier of meaning.

## 10. Text inside art

Text baked into an image is a WCAG 1.4.5 problem. Inline SVG text is *real text* and scales with the A/A/A control, so it is far safer than a raster — but it still does not reflow and cannot wrap.

Permitted: a number, a year, a percentage, or a one-word label (`SAMPLE`, `Plan`) **that also appears in the surrounding page copy**. Set `font-family="system-ui,-apple-system,Segoe UI,sans-serif"`, `font-weight` 700 or 800, minimum 13 user units at 1:1.

Forbidden: sentences, headings, or any string that is the only place a fact appears.

## 11. Accessibility contract

- Meaningful piece → `role="img"` + a full-sentence `aria-label` on the root `<svg>`. No `alt` (SVG has no `alt`).
- Decorative piece → `aria-hidden="true" focusable="false"`, no label. `focusable="false"` is not optional: legacy IE/Edge put unlabelled SVGs in the tab order.
- Data-bearing piece → also emit a `<table class="visually-hidden">`, exactly as `scripts/lib/svgcharts.mjs:76` does. The table, not the drawing, is the accessible path.
- Icons inside a `.card__icon` or a button → the wrapper carries `aria-hidden="true"`, matching every existing usage.

## 12. Sample-data rule

Any drawing of a document, statement, card, or table must be *visibly generic*: body copy is rounded placeholder bars, never legible words. No carrier names, no plan IDs, no real dollar figures, no logos.

Any mock-up that could be mistaken for a real record carries the SAMPLE pill: a `rx`-half-height rect filled `--bc-teal-800` with a 1.5px `--bc-ill-gold` border and a 13-unit, weight-700, `+0.5` letter-spaced `--bc-ill-gold` uppercase label, tucked **against the object it describes** — not stranded in a corner. See `hero-art.html:51–56`.

## 13. Prohibitions (hard reject list)

No human figures or body parts. No telephones, handsets, headsets, call-centre desks, speech bubbles, or chat windows. No eagles, seals, shields-with-stars, stars-and-stripes, Capitol domes, columns, classical government architecture, embossed 'official' stamps, or red/white/blue flag palettes. No insurance-carrier logos or brand marks. No real plan names, plan IDs, or dollar figures. No stethoscopes, syringes, hospitals, ambulances, wheelchairs, or clinical settings (a plain capsule outline is the only permitted medical form). No 3-D, isometric, photographic, hand-drawn, watercolour, or textured rendering. No literal hex colours. No external references of any kind — `img-src 'self' data:`.
```

**Alt text** — n/a — documentation file, contains no images.

**Dark mode** — n/a for the file itself. The spec's central dark-mode rule: art is coloured exclusively with --bc-ill-* / --bc-teal-* custom properties, which site.css redefines under `@media screen and (prefers-color-scheme: dark)` at lines 960–1004, so a conforming piece themes itself with zero extra markup. A literal hex anywhere in art is an automatic reject.

**Compliance check** — The spec's Subject and Prohibitions sections are the enforcement mechanism for the compliance constraint: they ban human figures, telephones/headsets/call-centre motifs, government seals/eagles/Capitol domes/flag palettes, carrier logos, real plan names or IDs, and anything readable as a genuine benefit statement. By writing these as a standing rule rather than per-asset guidance, a future contributor cannot reintroduce agent imagery by accident. The sample-data rule (placeholder bars never legible words, plus the SAMPLE pill construction) is codified here too, carried over from the existing hero-art badge at hero-art.html:51–56.

---

## VS-2 · Standing rule: no photography of people, and no raster art beyond social cards

> **P0** · effort: trivial · kind: `content-component` · route: sitewide
> Source lens: Visual system

**Why it earns its place.** This is called out as its own item because it is the decision most likely to be relitigated by someone who has not read the whole spec — 'shouldn't a site for seniors feel warmer?' — and because it is the decision that determines whether the other ~11 items in this brief are inline SVG or a raster pipeline. Answering it once, in writing, with the measured reasons, is what stops the site acquiring a stock-photo hero in six months. A visitor's experience after this rule holds: the page still loads with zero image requests, still flips cleanly to dark mode, and still does not look like the lead-gen advertising it competes with — which is the site's entire differentiation.

**Insertion point.** docs/visual-system.md:§7 (the 'Photography' section of SYS-01). Cross-reference it from README.md at line 52, in the same pointer added for SYS-01, so the rule is discoverable from the repo root and not only from inside the docs folder. It sits between the figures-and-people rule (§6, which establishes the subject matter ban) and the depth/shadow rule (§8).

**Specification** — ~350 words inside docs/visual-system.md. Zero production bytes. The rule's operative form: 'if it cannot be expressed as inline SVG using the --bc-ill-* / --bc-teal-* tokens, it does not ship' — which admits no grey-area exception and needs no case-by-case judgement.

**Draft copy / markup — ready to insert**

```html
**Decision: BenefitDial uses no photographs of people. Anywhere. This is a standing rule.**

The enforceable form is broader and has no grey area: *if it cannot be expressed as inline SVG using the site's colour tokens, it does not ship.* Adopt that form, because 'tasteful photography of people' is a line nobody can hold.

Why, in descending order of how hard the argument is to overturn:

1. **It contradicts published copy.** `/about` promises "we will never ask you to 'speak with a licensed agent.'" `/privacy` promises "There is no 'talk to a licensed agent,' no callback request, and no one will call you because you visited this site." A photograph of a warm, attentive person is a picture of exactly the thing the page says does not exist here. Two people in frame is agent imagery; one person is a testimonial. There is no third reading available in this market.

2. **It is the competitor's visual signature.** The site's positioning is stated in its own words at `/about`: "the opposite of a robocall," "A public utility, not a lead funnel." Stock photography of seniors is the single most recognisable convention of Medicare lead-gen creative. Adopting it costs the site its most legible differentiator — the fact that it *does not look like that* — in exchange for warmth it does not need, because the warmth is already in the writing.

3. **It is measurably expensive here, unlike on most sites.** `src/static/_headers` sets `/assets/*` to `max-age=0, must-revalidate` because assets are not content-hashed. Every raster is therefore a conditional HTTP round-trip on **every page view, forever**. The site currently ships zero `<img>` tags across all 13 routes and measures CLS 0.0000. A hero photograph would be the first blocking image request the site has ever made, on behalf of readers who are disproportionately on slow connections.

4. **Dark mode doubles it.** A photo cannot be re-tinted by a token remap, so a `<picture>` with two encodings is required — twice the bytes for one decoration.

5. **CSP forecloses the easy path.** `img-src 'self' data:` means every photo is self-hosted and self-optimised, with no npm image pipeline available under the zero-dependency promise.

**Permitted raster, exhaustively:** `src/assets/img/og-default.png` (and any future per-route social card), `src/static/apple-touch-icon.png`, `src/static/favicon.ico`. These are consumed by crawlers and operating systems, never fetched by a browser rendering a route. Nothing else.

**If a page feels visually cold, the fix is a diagram, not a face.** The site's readers are trying to answer two numeric questions. Warmth that helps them looks like a clearer picture of the numbers.
```

**Alt text** — n/a — a policy statement, not an image.

**Dark mode** — The rule exists partly because of dark mode: a photograph cannot be re-tinted by a token remap, so supporting the shipped dark theme would require <picture> with two encodings per photo. Inline SVG built on --bc-ill-* tokens flips for free.

**Compliance check** — This is the compliance keystone. Photographs of people in a Medicare context are the visual convention of the lead funnel — a smiling senior beside a plan card reads as a testimonial (implied endorsement), and any second person reads as an agent (call-centre imagery). Both are explicitly ruled out, and both directly contradict copy the site already publishes at /about ('we will never ask you to speak with a licensed agent') and /privacy ('You are a reader, not a lead'). Banning the whole category removes the judgement call rather than trusting future reviewers to make it correctly each time.

---

## VS-3 · Reusable generation-prompt preamble for all BenefitDial art

> **P0** · effort: trivial · kind: `content-component` · route: sitewide
> Source lens: Visual system

**Why it earns its place.** Twelve assets specified by twelve independently-written prompts produce twelve looks. This paragraph is the thing that makes them one set. It is also the compliance chokepoint: the prohibitions are restated inside the preamble, so a model that is handed only a single asset prompt still cannot produce agent imagery or a government seal. Practically, it converts the style spec from a document someone has to have read into a string someone has to paste — which is the difference between a rule that holds and a rule that doesn't. Note it targets an SVG-authoring model, not an image-generation model: there is no raster path on this site (SYS-02), so 'generate an image' is the wrong instruction and would produce an unusable, un-themeable, CSP-hostile asset.

**Insertion point.** docs/visual-system.md:§14 — appended as the final section, headed 'Appendix: prompt preamble', immediately after §13 (Prohibitions), so a contributor reads the rules and then finds the machine-readable restatement of them. Every `generationPrompt` field in this brief is written to be pasted *after* this block.

**Specification** — ~470 words of plain text, stored in docs/visual-system.md. Zero production bytes. Written for a code-generating model (output: an SVG fragment), NOT for a diffusion image model — that distinction is stated in the first sentence so it cannot be misapplied.

**Generation prompt — copy this verbatim**

```text
BENEFITDIAL HOUSE STYLE — prepend verbatim to every art prompt. This is a request for hand-authored SVG source code, not for a generated raster image; there is no raster pipeline on this site.

You are producing a single self-contained inline SVG fragment for BenefitDial, an independent, ad-supported reference site about the Social Security cost-of-living adjustment and Medicare plan changes, read mainly by people aged 65 and over. Output ONLY the <svg> element and its children — no <?xml?> declaration, no <!DOCTYPE>, no xmlns attribute (the fragment is inlined into HTML, never loaded as a standalone file), no width or height attributes, no <style> block, no <script>, no <filter>, no external references, no <image>, no embedded raster or base64 data. Use a viewBox only, plus preserveAspectRatio="xMidYMid meet".

COLOUR. Use ONLY these CSS custom properties as presentation-attribute values, never a literal hex: var(--bc-ill-paper) for object surfaces; var(--bc-ill-line) for every outline and for dark placeholder bars; var(--bc-ill-fill) and var(--bc-ill-fill-2) for quiet interior tints; var(--bc-teal-700), var(--bc-teal-600) and var(--bc-teal-800) for solid header bands and dark pills; var(--bc-teal-050) for medallion backgrounds; var(--bc-teal-900) only as label text sitting on an accent fill; and exactly ONE accent per piece — either var(--bc-ill-gold) or var(--bc-ill-accent), never both in the same drawing. Ceiling: eight distinct colour tokens per piece; four or five is typical. These tokens are redefined under prefers-color-scheme: dark in src/assets/css/site.css, so a piece built from them themes itself. A literal hex will glow or vanish in dark mode and is an automatic reject. In dark mode --bc-ill-accent and --bc-ill-gold resolve to the same value, which is why only one accent is allowed.

FORM. Flat vector drawn straight-on. No gradients, no blurs, no filters, no textures, no photographic realism, no isometric or three-dimensional perspective, no hand-drawn or watercolour rendering. The only opacity permitted is a single depth silhouette. Outlines are stroke-width="2" with stroke-linecap="round" and stroke-linejoin="round", applied ONLY to an object's outermost silhouette; all interior detail is filled shapes with no stroke whatsoever. Rounded corners everywhere: object-scale rectangles rx="16" to rx="18"; chips, pills and badges rx equal to half their height; small placeholder bars rx equal to half their height; dials and medallions are circles. No square corners. Depth, where used, is exactly one duplicate of the silhouette filled var(--bc-ill-line) at opacity=".18", offset +6 on x and +8 on y, drawn behind the object — never a blur, never a gradient.

SUBJECT. BenefitDial illustrates documents, numbers, dates and files. It never illustrates people. Do NOT draw human figures, faces, heads, hands, silhouettes, stick figures, avatars, couples, families, carers or crowds, in any degree of abstraction — an abstracted rounded-head silhouette is still a person and is rejected. Do NOT draw telephones, handsets, headsets, call-centre desks, speech bubbles, chat windows, or any "someone will help you" motif; the site's central promise is that no one will ever call the reader. Do NOT draw anything that could read as a United States government mark or endorsement: no eagles, seals, shields-with-stars, stars-and-stripes, Capitol domes, columns, classical government architecture, embossed "official" stamps, or red/white/blue flag palettes. Do NOT draw insurance-carrier logos or brand marks, real plan names, real plan IDs, real dollar amounts, or anything that reads as a genuine plan document, benefit statement, Medicare card or explanation of benefits. Do NOT draw clinical imagery — no stethoscopes, syringes, hospitals, ambulances, wheelchairs or medical settings; a plain capsule outline is the only permitted pharmaceutical form.

SAMPLE-DATA RULE. Any element resembling a document, statement, card or table must be visibly generic: body copy is represented by rounded placeholder bars, never by legible words. Any mock-up that could be mistaken for a real record must carry a SAMPLE pill — a rect filled var(--bc-teal-800) with rx equal to half its height, a 1.5-unit var(--bc-ill-gold) border, and an uppercase var(--bc-ill-gold) label at 13 units, font-weight 700, letter-spacing 0.5 — tucked against the object it describes rather than stranded in a corner.

ACCESSIBILITY. If the piece carries meaning, put role="img" and a complete-sentence aria-label on the root <svg>. If it is purely decorative, put aria-hidden="true" focusable="false" and no label. Any text rendered inside the SVG must use font-family="system-ui,-apple-system,Segoe UI,sans-serif", font-weight 700 or 800, and be at least 13 user units at the piece's 1:1 authoring size; restrict it to a number, a year, a percentage or a single word that also appears in the surrounding page copy.

SCALE. Author the viewBox so its width in user units equals the maximum CSS pixel width the piece will ever render at, so stroke-width="2" is always two device-independent pixels — the same optical weight as the site's 24×24 icons. If the piece must remain legible on a 320px-wide phone, author it at a viewBox width of 320 or less.
```

**Draft copy / markup — ready to insert**

```html
Paste this block verbatim at the top of every art prompt in this brief. Every asset-specific prompt below is written assuming it is present.
```

**Alt text** — n/a — a prompt fragment, not an image.

**Dark mode** — The preamble's colour paragraph is the entire dark-mode strategy: it permits only --bc-ill-* / --bc-teal-* custom properties as presentation-attribute values and makes any literal hex an automatic reject, so every conforming asset themes itself via the remap at site.css:960–1004 with no per-asset dark-mode work.

**Compliance check** — The preamble restates every prohibition inline — no human figures at any level of abstraction, no telephones/headsets/call-centre/speech-bubble motifs, no eagles/seals/Capitol domes/flag palettes/official stamps, no carrier logos or real plan names/IDs/dollar figures, no clinical imagery — so compliance travels with the prompt rather than depending on the operator having read the spec. It also carries the sample-data rule (placeholder bars never legible words, plus the SAMPLE pill construction) into every generation.

---

## VS-4 · Asset pipeline: how generated art reaches production, and the gen-images.mjs repair

> **P0** · effort: small · kind: `content-component` · route: sitewide
> Source lens: Visual system

**Why it earns its place.** Two concrete problems block execution of this brief. First, nobody has written down how a new drawing actually becomes a page — a contributor's default instinct is to add a PNG to src/assets/img and an <img> tag, which costs a permanent conditional round-trip under the max-age=0 header, breaks dark mode, and risks the 0.0000 CLS. Second, scripts/gen-images.mjs — the one script that could regenerate the brand rasters — is broken on a clean checkout: it imports 'playwright-core', which appears in neither dependencies nor devDependencies (both are empty), and it hardcodes /opt/pw-browsers/chromium-1194/chrome-linux/chrome, a container-specific path with a pinned build number. I verified this environment has 'playwright' globally but not 'playwright-core', so the script fails here too. After this item, a contributor knows exactly which of four paths their asset takes, and the OG image can actually be regenerated when the tagline or COLA figure changes.

**Insertion point.** Two edits. (1) docs/visual-system.md:§1 — the four-path table in SYS-01, expanded into a full section with the build mechanics below. (2) scripts/gen-images.mjs:5 — replace the bare `import { chromium } from "playwright-core";` and the hardcoded `EXEC` constant at line 12 with the resolver below. The file currently sits between build.mjs (which never calls it) and shoot.mjs; nothing in package.json, CI, or the README references it.

**Specification** — Docs: ~500 words. Code: ~14 changed lines in scripts/gen-images.mjs, zero new files, zero new dependencies, zero production bytes. The script stays dev-only tooling, invoked manually with output committed — it must never be wired into `npm run build` or CI, because that would convert a zero-dependency build into one requiring a browser binary.

**Draft copy / markup — ready to insert**

```html
## How art reaches production

### Path A — a new icon

Add a `<symbol>` to `src/partials/icons.html`, immediately before `</defs></svg>` at line 32. The build inlines that partial into every page via `{{> icons }}` (`src/layout.html:96`). Use it with:

```html
<svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-name" xlink:href="#ic-name"/></svg>
```

Both `href` and `xlink:href` — that is the existing pattern in all 20 call sites and it is what keeps older Safari working.

**Cost:** the sprite is inlined into all 13 pages whether a symbol is used on that page or not. Measured today: 2,718 bytes raw, 668 bytes gzipped, for 10 symbols (~272 raw / ~67 gzipped each). The seven symbols this brief adds take it to roughly 4,740 raw / ~1,050 gzipped per page. Acceptable. **Cap the sprite at 20 symbols.** Beyond that, subset it per page in `build.mjs`; below that, per-page subsetting costs more complexity than the ~2 KB it saves.

### Path B — a static illustration or diagram

Create `src/partials/<name>.html` containing a bare `<svg>` element (no wrapper, no doctype). Include it from a page with `{{> name }}`. `build.mjs` resolves partials before token substitution, so `{{TOKENS}}` inside the partial still interpolate — `hero-art.html` relies on this for `{{COLA_CONFIRMED}}`.

Colour it with `--bc-ill-*` / `--bc-teal-*` custom properties. Zero new HTTP requests, zero cache-revalidation cost, dark mode free, no CLS risk (inline SVG with a viewBox reserves its box during layout). **This is the default path. Prefer it.**

### Path C — a data-driven figure

Add a function to `scripts/lib/svgcharts.mjs`, following `verticalBars()` — accessible by construction: `role="img"` + `aria-label` on the svg, a `<table class="visually-hidden">` for screen readers, a visible `<figcaption>`, and a `--bc-chart-w` custom property so CSS can stop the piece scaling past 1:1. Register the output in the token map in `scripts/build.mjs` around line 260 and reference it from a page as `{{CHART_NAME}}`.

Use this when the drawing's geometry depends on `src/data/*.json`, so a data refresh redraws it. Use Path B otherwise.

### Path D — raster brand assets

**Closed except for social cards and OS icons.** `src/assets/img/og-default.png` (1200×630, 110,685 bytes) and `src/static/apple-touch-icon.png` (180×180) are the entire raster surface. Neither is fetched by a browser rendering a route — one is read by social crawlers, the other by iOS — so neither pays the `max-age=0, must-revalidate` round-trip that a page image would.

Source of truth is the SVG (`og-default.svg`, `favicon.svg`); the PNG is rendered from it and committed.

### Optimisation, without dependencies

There is no npm image pipeline and there will not be one: `package.json` has empty `dependencies` and `devDependencies`, and the README makes that a promise. For SVG that means hand-optimisation, which for this codebase is a real technique rather than a compromise: round path coordinates to one decimal (`svgcharts.mjs` already does, via `.toFixed(1)`), drop `xmlns` from inlined fragments, hoist repeated presentation attributes onto a parent `<g>`, and never emit `<defs>` for something used once. A conforming BenefitDial illustration is 1.5–4 KB of markup that gzips to a few hundred bytes — smaller than any raster equivalent and independently theme-able.

For the two PNGs, Chromium's own encoder (via `gen-images.mjs`) is the whole toolchain. It is not the smallest possible encoder; at 110 KB for a file no browser requests during a page view, it does not need to be.

### `scripts/gen-images.mjs` — assessment

**Fit for its two current jobs, but broken on a clean checkout.** Three defects:

1. **Undeclared dependency.** Line 5 imports `playwright-core`, which is in neither `dependencies` nor `devDependencies` — both are `{}`. On a fresh clone `node scripts/gen-images.mjs` throws `ERR_MODULE_NOT_FOUND`. It only ran wherever Playwright happened to be installed globally, and it will not run in an environment that has `playwright` rather than `playwright-core` under that exact name.
2. **Hardcoded browser path.** Line 12 pins `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — a specific container image and a specific Chromium build number. It breaks on any other machine, and on this one the next time the image is updated.
3. **Orphaned.** Nothing references it — not `package.json` scripts, not CI, not the README. There is no signal that regenerating the OG image is even possible, so the SVG and PNG can silently diverge (they carry a hard-coded tagline and three promise ticks that would need to change together).

**Does it break the zero-dependency promise?** No, and it must stay that way. It is dev-only tooling, run by hand, with output committed; `npm run build` and CI never touch a browser. The fix is *not* to add Playwright to `devDependencies` — that would put a ~300 MB browser download in front of every contributor for a script run perhaps twice a year.

**Minimal repair** — resolve the module and the binary at runtime, fail with an instruction instead of a stack trace:

```js
/* Dev-only tooling. Deliberately NOT in package.json dependencies: the site's
   build has zero deps and CI never launches a browser. Run by hand when a brand
   SVG changes, then commit the PNGs.
   Prerequisite: `npm i -g playwright && npx playwright install chromium`,
   then `NODE_PATH=$(npm root -g) node scripts/gen-images.mjs`.
   Override the binary with PW_CHROMIUM=/path/to/chrome if autodetection fails. */
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.error(
      "gen-images: Playwright not found. This is dev-only tooling and is\n" +
      "intentionally absent from package.json. Install it globally:\n" +
      "  npm i -g playwright && npx playwright install chromium\n" +
      "  NODE_PATH=$(npm root -g) node scripts/gen-images.mjs"
    );
    process.exit(1);
  }
}

// Prefer an explicit override, then Playwright's own resolution, then the
// container path this script used to hardcode.
const EXEC =
  process.env.PW_CHROMIUM ||
  (() => { try { return chromium.executablePath(); } catch { return undefined; } })() ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
```

Also add to `package.json` scripts — a name, not a dependency, so the capability is discoverable:

```json
"gen:images": "node scripts/gen-images.mjs"
```

**If per-route social cards are adopted** (a separate lens's call), this script is the right vehicle: extend the `JOBS` array, one entry per route, each pointing at a generated SVG. Nothing structural changes. Keep it out of CI regardless — committed PNGs are the contract.
```

**Alt text** — n/a — build tooling and documentation.

**Dark mode** — The pipeline section is what makes dark mode automatic: paths A, B and C all produce inline SVG coloured by --bc-ill-* / --bc-teal-* tokens, which flip at site.css:960–1004 with no per-asset work. Path D (raster) is explicitly restricted to assets no browser fetches while rendering a route — social cards and OS icons — precisely because a raster cannot flip.

**Compliance check** — The pipeline forecloses the highest-risk failure mode: an external image URL. All four paths are self-hosted or inlined, satisfying `img-src 'self' data:` by construction rather than by review. It also keeps the raster surface at exactly two files, so there is no growing library of images that someone would have to re-audit for agent imagery or government motifs later.

# Group B — Icon set

---

## IC-1 · ic-alert-triangle — the warning glyph for all seven callout--warn blocks

> **P0** · effort: trivial · kind: `icon` · route: sitewide (guide-aep, guide-cola, guide-medicare-changes, guide-partb, how-it-works, medicare-plan-changes ×2)
> Source lens: Visual system

**Why it earns its place.** There are seven `callout--warn` blocks on the site and not one of them has a glyph. Today the only thing distinguishing a warning from an informational callout is a 4px amber left border and a background tint — a distinction that a reader with reduced colour discrimination (a substantial share of a 65+ audience) may not perceive at all, and that disappears entirely in the print stylesheet, which strips backgrounds. Two of those seven are compliance-critical: medicare-plan-changes.html:33 is the 'These are sample numbers — real plan data' banner, and how-it-works.html:144 is the 'honest note about 2027'. A reader who does not register those as warnings can act on sample figures. A glyph makes the warning non-colour-dependent, which is WCAG 1.4.1 (Use of Colour) in substance as well as in letter. Highest impact-per-byte item in this brief: one 235-byte symbol, seven one-line insertions.

**Insertion point.** Symbol: src/partials/icons.html:32, immediately before `</defs></svg>` (after the ic-heart-pulse closing tag at line 31). Call sites — inside the existing `<p class="callout__title">` at: guide-aep.html:60, guide-cola.html:133, guide-medicare-changes.html:61, guide-partb.html:91, how-it-works.html:144, medicare-plan-changes.html:33, medicare-plan-changes.html:111. Supporting CSS: src/assets/css/site.css:729, extending the existing `.callout__title` rule.

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 240 bytes raw (~60 gzipped), once per page across 13 pages. Rendered at `1.05rem` inside a callout title — add `.callout__title .icon { width: var(--bc-fs-ml); height: var(--bc-fs-ml); vertical-align: -0.18em; margin-right: 0.4rem; }` and `.callout--warn .callout__title .icon { color: var(--bc-warn); }` extending site.css:729. No CLS risk: inline SVG with explicit CSS width/height reserves its box at layout. Markup at each call site: `<p class="callout__title"><svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-alert-triangle" xlink:href="#ic-alert-triangle"/></svg> …existing title text…</p>`

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-alert-triangle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 4.2 21.2 20H2.8L12 4.2Z"/><path d="M12 10v4.2"/><path d="M12 17.4h.01"/>
</symbol>

Geometry notes. The triangle is an isosceles with apex at (12, 4.2) and a base from (2.8, 20) to (21.2, 20) — 18.4 units wide, 15.8 tall, inset ~2.8 units from the box edge, matching the optical mass of ic-shield-lock. Corners are left as hard vertices and softened by the symbol's inherited stroke-linejoin="round", exactly as ic-doc-gov does; do not hand-round them with arc commands, which would break grammar with the rest of the set. The bang is a 4.2-unit vertical from y=10 to y=14.2, and the dot is the zero-length path `M12 17.4h.01` rendered as a disc by the inherited stroke-linecap="round" — the same trick keeps it stroke-only so it inherits currentColor with no fill override. Gap between bang and dot is 3.2 units, which holds a visible separation down to 1.05rem (17px) rendered.

Do NOT add: a circle around the triangle, a fill of any kind, a shield outline, stars, or a second colour.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"` on the `<svg>`, no label. Justified: the glyph sits immediately before a text title that already states the warning in words (e.g. 'These are sample numbers — not real plan data'), so a label would be a duplicate announcement. This matches the pattern at every one of the 20 existing icon call sites.

**Dark mode** — Free. `stroke="currentColor"` inherits from `color: var(--bc-warn)`, which remaps in the dark block. The `--bc-callout-warn-bg` surface behind it also remaps, so contrast is maintained without a second asset. Verify once at site.css:1060, where the print/forced-colours block already special-cases `.callout__title`.

**Compliance check** — A triangle-and-bang is a universal hazard glyph with no government, medical, or insurance connotation — it carries no seal, star, shield, or eagle geometry that could read as an official mark. Deliberately not a shield (the site already has ic-shield-lock for privacy, and a shield-with-anything is the closest thing in this icon vocabulary to a government-agency motif). Its principal use is to strengthen the sample-data disclosure, which is the site's core compliance obligation.

---

## IC-2 · ic-printer — replace the misused ic-doc-gov on both print buttons

> **P0** · effort: trivial · kind: `icon` · route: /cola-calculator, /medicare-plan-changes
> Source lens: Visual system

**Why it earns its place.** ic-doc-gov is currently carrying three unrelated meanings across the site: 'a public government data file' (index.html:83, guide-partb.html:112, medicare-plan-changes.html:144), 'the What Changed Across Medicare guide' (guides.html:37), and 'print this' (the two buttons above). A document-with-a-checkmark next to the words 'Print or save these numbers' is a small comprehension tax on exactly the reader least likely to absorb it — someone in their seventies scanning for the way to get a paper copy to take to a family member. A printer is the one glyph in this problem space that is unambiguous to everyone over 50. Two-line change, and it frees ic-doc-gov to mean one thing.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call sites — swap the `#ic-doc-gov` reference for `#ic-printer` at src/pages/cola-calculator.html:124 (the `#r-print` button, 'Print or save these numbers') and src/pages/medicare-plan-changes.html:128 (the `#pd-print` button, same label).

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 340 bytes raw (~70 gzipped), once per page across 13 pages. Renders at `var(--bc-fs-lg)` (1.2rem ≈ 19px) via the existing `.btn .icon` rule at site.css:908 — no new CSS needed. No layout change: identical box to the glyph it replaces, so zero CLS impact.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-printer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 9V3h10v6"/>
  <path d="M7 18.5H5a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2h-2"/>
  <rect x="7" y="15" width="10" height="6" rx="1.5"/>
</symbol>

Geometry notes. Three elements, matching the density of ic-calendar-check. Top: the sheet feeding in, an open-topped path from (7,9) up to (7,3), across to (17,3), down to (17,9) — deliberately open at the top so it reads as paper continuing beyond the frame. Middle: the printer body, 18 units wide (x=3 to x=21), 8.5 tall, with 2-unit rounded corners drawn as arc commands in the same grammar as ic-coins-up's `rx="2"` rects; it is open at the front where the output tray overlaps. Bottom: the output tray, a 10×6 rect at rx="1.5", overlapping the body from y=15 so the two silhouettes read as one object.

Do NOT add: a status LED dot (it vanishes below 20px rendered), a paper-feed slot line, a fill of any kind, or a second colour.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label, exactly as the existing markup does. The button's own text ('Print or save these numbers') is the accessible name; adding a label would make a screen reader announce 'printer, Print or save these numbers'.

**Dark mode** — Free. `stroke="currentColor"` inherits the `.btn--ghost` colour, which is `var(--bc-teal-800)` in light and remapped in the dark block (site.css:1030–1035 already handles the ghost/on-teal button colours explicitly).

**Compliance check** — A printer is a neutral office object with no government, medical or insurance association. It also quietly reinforces the site's positioning: the sanctioned next step after using a tool is to take the numbers away on paper — to the official Medicare Plan Finder or 1-800-MEDICARE, per the copy at index.html:146 — rather than to hand anything over. Nothing about the glyph suggests submitting, sending, or being contacted.

---

## IC-3 · ic-envelope-open — the ANOC / 'read your mail' glyph

> P1 · effort: trivial · kind: `icon` · route: /key-dates, /guides/medicare-aep-2026, /guides/what-changed-medicare-2027, /medicare-plan-changes
> Source lens: Visual system

**Why it earns its place.** 'ANOC' / 'Annual Notice of Change' / mailed notice appears 12 times across five pages and is the single most *actionable* physical instruction on the whole site — the one thing a reader is asked to go and do away from the screen ('Read it, don't file it away', key-dates.html:37). It is also, per guide-medicare-changes.html:62, 'easy to set aside unopened' — the site is explicitly fighting the reader's instinct to bin it. That instruction currently has no visual anchor anywhere, so it reads as more prose in a page that is already 2,400–3,000 words. An opened-envelope glyph gives it a repeated, recognisable mark across the four places it appears, so a reader who skims one page and lands on another recognises the same call. The 'open' state, not a sealed envelope, is doing deliberate work: it depicts the desired action, not the object.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call sites: src/pages/guide-medicare-changes.html:61, inside `<p class="callout__title">Read the ANOC your plan mailed you</p>`; src/pages/key-dates.html:37, prefixed to the September timeline item that begins 'CMS releases the Medicare Landscape and Crosswalk files, and your plan mails you its Annual Notice of Change (ANOC)'; src/pages/guide-aep.html:67, on the 'Read your ANOC (about 5 minutes)' list item; src/pages/medicare-plan-changes.html:26, on the muted line 'Your plan ID (like H1234-001) is on your member card and on the Annual Notice of Change (ANOC) your plan mailed you.'

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 330 bytes raw (~70 gzipped), once per page across 13 pages. Rendered at `1.05rem` in a callout title (see the `.callout__title .icon` rule added by ICON-01) and at `var(--bc-fs-ml)` in the timeline/list contexts. In the key-dates timeline it sits inline before the text — do not float it, the `.timeline` rule at site.css uses a pseudo-element bullet that a floated icon would collide with. Zero CLS: inline SVG, box reserved at layout.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-envelope-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 10.6 12 4.2l9 6.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.4Z"/>
  <path d="M7.6 13.6V8.4h8.8v5.2"/>
  <path d="m3 10.6 7.9 5.2a2 2 0 0 0 2.2 0L21 10.6"/>
</symbol>

Geometry notes. Three sub-paths, matching the density of ic-shield-lock. Path 1 is the envelope body: an 18-unit-wide box (x=3 to x=21) whose top edge is a shallow inverted V peaking at (12, 4.2) — the opened flap — with 2-unit rounded bottom corners drawn as arcs, same grammar as ic-calendar-check. Path 2 is the letter emerging from inside: an open-topped rectangle from (7.6,13.6) up to (7.6,8.4), across to (16.4,8.4), down to (16.4,13.6) — open at the bottom so it reads as continuing behind the envelope front, and rising ABOVE the front edge so the letter is visibly coming out, not going in. Path 3 is the envelope's front V-fold, running from the left edge down to a rounded vertex under the letter and back up to the right edge; the 2-unit arc at the bottom of the V keeps it from reading as a hard crease.

Do NOT add: a stamp rectangle, a postmark, a seal, a wax blob, address lines, an @ symbol, a send arrow, a badge, or a fill of any kind.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label. At every one of the four call sites the adjacent text already names the object ('Annual Notice of Change', 'mails you', 'Read your ANOC'), so a label would duplicate.

**Dark mode** — Free. `stroke="currentColor"`. In the callout at guide-medicare-changes.html:61 it inherits the warn colour; in the key-dates timeline it inherits `--bc-accent-2`; both remap in the dark block (site.css:960–1004).

**Compliance check** — An envelope is the highest-risk glyph in this set and must be drawn carefully. It must NOT carry a seal, crest, stamp, postmark, eagle, or 'OFFICIAL BUSINESS' band — /about:24 explicitly criticises mail 'stamped to look official', so any hint of officialdom would have the site imitating the thing it names as the problem. It must also not read as a form to fill in or return: the flap is open and the letter is being taken out, never inserted, and there is no reply arrow, no send motif, no @ symbol. Drawn as specified it is a plain letter being read, which is precisely the instruction.

---

## IC-4 · ic-pill — Part D, formularies and the yearly drug cap

> P1 · effort: trivial · kind: `icon` · route: /guides/what-changed-medicare-2027, /guides/medicare-aep-2026, /medicare-plan-changes
> Source lens: Visual system

**Why it earns its place.** Prescription-drug coverage is a whole guide's subject — 'formulary' and 'drug' appear 35 times across the pages, the Part D out-of-pocket cap has its own H2 (guide-medicare-changes.html:37), and stand-alone Part D plan counts get a dedicated chart — yet the concept has no glyph. Today the guides index at guides.html:37 marks that guide with ic-doc-gov (a government document), which describes the *source* of the information rather than its *subject*, and duplicates the meaning ic-doc-gov carries three other places. On a card grid where a 65+ reader is choosing which of four guides to read, the glyph is doing real wayfinding work: a capsule says 'this one is about my prescriptions' in a way a document outline cannot.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call sites: src/pages/guide-medicare-changes.html:41, inside the `<p class="callout__title">` of the callout that explains what the $-cap covers (the callout opening at line 40, whose body at line 42 begins 'The cap applies to your out-of-pocket costs for covered Part D prescription drugs'); and src/pages/guides.html:37, replacing the `#ic-doc-gov` reference on the 'What changed across Medicare for 2027' guide card, whose own summary text is 'Fewer plans on the shelf, formulary shifts, and the yearly Part D drug-cost cap'.

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 250 bytes raw (~60 gzipped), once per page across 13 pages. Renders at `1.75rem` (28px) inside `.card__icon` (site.css:907) and at `1.05rem` inside a callout title. The diagonal composition is chosen so both counter-shapes stay open at 17px rendered. Zero CLS.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-pill" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m10.4 20.4 10-10a5 5 0 0 0-7.07-7.07l-10 10a5 5 0 0 0 7.07 7.07Z"/>
  <path d="m8.5 8.5 7.07 7.07"/>
</symbol>

Geometry notes. Two sub-paths — the sparsest icon in the set, which is correct because it must survive rendering at 17px. The capsule is a 10-unit-diameter stadium running on a 45° diagonal from lower-left (3.4, 20.4-ish) to upper-right (20.4, 3.4-ish), with 5-unit semicircular caps drawn as arc commands; the diagonal is what keeps both halves visibly equal inside a square box. The join line is a straight 10-unit segment perpendicular to the capsule's long axis, crossing at the exact midpoint (12, 12) — measure it, because an off-centre join reads as a drawing error rather than a capsule seam.

Do NOT add: a fill on either half, a highlight, dosage markings, a bottle, a cap, a count, a cross, or a second colour.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label. On the guides card the wrapper `<div class="card__icon" aria-hidden="true">` already hides it and the card's own H3 supplies the name.

**Dark mode** — Free. `stroke="currentColor"` inherits `--bc-accent` in `.card__icon` and the warn colour in the callout; both remap in the dark block.

**Compliance check** — A plain two-tone capsule outline is the only pharmaceutical form the visual system permits (docs/visual-system.md §13). Explicitly avoided: a specific tablet shape, a scored tablet, a branded capsule colourway, a pill bottle with a label (which would be a prescription record and therefore a document that could imply a real patient), a mortar and pestle (pharmacy-business imagery, which edges toward a commercial endorsement), a syringe, or a caduceus/rod-of-Asclepius (which reads as a clinical or official health-agency mark). The capsule as drawn is generic to the point of being a shape, and names a benefit category rather than a product.

---

## IC-5 · ic-list-check — the 'what to actually do' checklist glyph

> P1 · effort: trivial · kind: `icon` · route: /guides/medicare-aep-2026, /key-dates
> Source lens: Visual system

**Why it earns its place.** The site is overwhelmingly explanatory — twelve of thirteen routes tell the reader what is true. Exactly two sections tell them what to *do*: guide-aep.html:64 ('How to prepare in about 20 minutes') and key-dates.html:70 ('What you can change during AEP'). Those are the highest-value blocks on their pages and they are visually identical to every surrounding paragraph, in documents of 2,518 and 2,440 words respectively. A checklist glyph on the heading gives a skimming reader a landmark for the actionable section — which, on a page a 68-year-old is scanning in October with a deadline approaching, is the difference between reading the part that helps and bouncing. Two insertions, one symbol.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call sites: src/pages/guide-aep.html:64, prefixed inside the `<h2>How to prepare in about 20 minutes</h2>`; and src/pages/key-dates.html:70, inside `<h2>What you can change during AEP</h2>`. Both are H2s that introduce the only two action-list sections on the site.

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 280 bytes raw (~65 gzipped), once per page across 13 pages. In an H2 context add `h2 > .icon { width: 1.5rem; height: 1.5rem; color: var(--bc-accent-2); margin-right: 0.45rem; vertical-align: -0.16em; }` near site.css:906. Rendered ~24px, i.e. 1:1 with the viewBox — the densest this glyph ever needs to survive. Zero CLS.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-list-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.5 6.4h10.5M10.5 12h10.5M10.5 17.6h10.5"/>
  <path d="m3 6.4 1.7 1.7L8.2 4.6"/>
  <path d="m3 17.6 1.7 1.7L8.2 15.8"/>
</symbol>

Geometry notes. Three list rules of equal 10.5-unit length at y=6.4, 12 and 17.6 — an even 5.6-unit rhythm, which at 24px rendered leaves 3.6px of clear space between strokes, above the point where adjacent 2px lines start to merge optically. Two ticks only, on the first and last rows: the middle row is deliberately left unticked so the mark reads as 'a list in progress' rather than 'everything already done', and dropping the third tick is also what keeps the left column legible at 24px. Each tick is the same construction the existing set already uses — compare ic-calendar-check's `M9 15l2 2 4-4` and ic-doc-gov's `M8.5 16l2 2 3.5-4` — a short down-stroke into a longer up-stroke, softened by the inherited round linejoin.

Do NOT add: a clipboard, a clip, a page border, checkboxes (empty squares read as an interactive form), a pen, a third tick, or a fill of any kind.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label. Critically, the icon must sit INSIDE the `<h2>` but hidden from the accessibility tree, so the heading's accessible name remains exactly 'How to prepare in about 20 minutes' — an unhidden icon inside a heading pollutes the document outline that screen-reader users navigate by.

**Dark mode** — Free. `stroke="currentColor"` inheriting `--bc-accent-2`, which remaps at site.css:960–1004. Verify against `--bc-surface-2` on the washed sections, where both these headings sit.

**Compliance check** — A checklist is neutral. It is deliberately NOT a clipboard: a clipboard-with-form is the standard 'fill in your details' motif of the eligibility-check lead funnel the site defines itself against (/about:35, 'A "free comparison" or "check your eligibility" form asks for your phone number first'), and would suggest there is something on this site to submit. There is not. Ticks on plain lines say 'things you can do', not 'a form to complete'.

---

## IC-6 · ic-star — star ratings

> P2 · effort: trivial · kind: `icon` · route: /medicare-plan-changes, /guides/what-changed-medicare-2027
> Source lens: Visual system

**Why it earns its place.** Star rating is one of exactly five things the What Changed tool compares — premium, deductible, maximum out-of-pocket, star rating, extra benefits — and it is the only one of the five that is not a dollar figure. In a table of currency amounts, a rating in the range 1–5 is easy for a reader to misparse as another cost. The star glyph disambiguates the row at a glance. There is a second, structural reason: the hero illustration at hero-art.html:32 already draws a gold five-pointed star on the plan card as the visual shorthand for a rating, so the concept is *already* in the site's visual vocabulary — it simply has no icon-set equivalent, which means the hero and the tool that hero depicts speak different languages. Lower priority than ICON-01–05 because the affected copy is confined to two pages.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call site: src/pages/medicare-plan-changes.html — inline in the results legend/table header where 'star rating' is named as one of the compared fields (the page introduces the field at line 26's surrounding intro and again at line 167's 'How to read your result' section). Also available to src/assets/js/plan-diff.js when it renders the star-rating row of the comparison table, so the row is marked in the same way the copy describes it.

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 260 bytes raw (~60 gzipped), once per page across 13 pages. Rendered at `var(--bc-fs-ml)` (1.05rem ≈ 17px) inline in table cells and legend text — this is the smallest any glyph in the set renders, which is why the star is drawn with a slightly fattened 2.63-unit inner radius rather than the mathematically correct golden-ratio one (the true proportion closes up at 17px with a 2px stroke). Zero CLS.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 3.6 2.63 5.33 5.87.86-4.25 4.14 1.01 5.85L12 17.06l-5.26 2.76 1.01-5.85L3.5 9.79l5.87-.86L12 3.6Z"/>
</symbol>

Geometry notes. One path, ten vertices, closed. Centre (12, 12.2); outer radius 8.6 with the first point at 12 o'clock (12, 3.6); inner radius 3.55. That inner radius is deliberately larger than the golden-ratio value of ~3.28 — at 17px rendered with a 2px stroke, the true proportion closes the five concave notches into blobs. Verify by rendering at 17px before committing. Coordinates carry two decimals to keep the five points visually equal; do not round them to whole units, which visibly skews the lower two points.

Do NOT add: a fill, a half-star clip path, a surrounding circle or shield, a second star, a ribbon, or a laurel.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label. The rating value must be conveyed as text ('3.5 out of 5 stars'), never by repeating the glyph N times — a five-glyph rating is unreadable to a screen reader and unparseable at 17px for a low-vision reader. One glyph as a category marker, the number as text.

**Dark mode** — Free. `stroke="currentColor"`. When used to mark a rating row it inherits `--bc-ink-soft`; if given the gold treatment to echo the hero, use `color: var(--bc-gold)`, which is a raw ramp token and intentionally does not flip — #f5c451 holds 8.9:1 against the dark surface #14201e and 1.9:1 against white, so gold is dark-mode-only and the row must fall back to `--bc-ink-soft` in light. Simpler and recommended: use `--bc-ink-soft` in both themes and let the hero keep gold to itself.

**Compliance check** — Drawn as a single outlined five-pointed star, not as a filled star, not in a circle, not on a shield, and never in a row of five. Those distinctions matter: a filled gold star inside a shield or roundel is a decoration/seal motif and edges toward a government or accreditation mark, and a row of five filled stars beside a plan name reads as a rating BenefitDial has awarded — an endorsement. The site publishes CMS's star rating as a data field it did not compute; the icon must label that field, never evaluate a plan. Pair it only with a numeric value and, where space allows, the words 'CMS star rating'.

---

## IC-7 · ic-browser-lock — 'runs entirely in your browser', the site's core privacy claim

> P2 · effort: trivial · kind: `icon` · route: /privacy, /cola-calculator, /medicare-plan-changes
> Source lens: Visual system

**Why it earns its place.** 'Browser' appears 29 times across the pages and carries the single most load-bearing claim on the site: the calculators never transmit what you type. /privacy leads with it, the FAQ repeats it, both tool pages assert it, and /about stakes the whole business model on it. It is also the claim a sceptical reader is least able to verify. Right now /privacy is the ONLY page on the site with zero card icons — 2,274 words of unbroken prose making the site's most important promise, with no visual anchor at all. A browser-window-with-a-padlock is the one glyph that says 'this happens on your machine' rather than the generic 'we are secure' that ic-shield-lock says; the distinction is exactly the one the copy spends paragraphs making. Ranked P2 rather than P1 only because ic-shield-lock partially covers the ground on the two tool pages.

**Insertion point.** Symbol: src/partials/icons.html:32, before `</defs></svg>`. Call sites: src/pages/privacy.html:31, inside `<p class="callout__title">The calculators run entirely in your browser</p>`; src/pages/cola-calculator.html — on the reassurance line that states the calculator runs locally; src/pages/medicare-plan-changes.html:117, on the results-placeholder copy 'We compare only the public numbers CMS publishes — we never ask who you are.'

**Specification** — 24×24 viewBox, 1:1, inline SVG `<symbol>`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Byte budget ≤ 350 bytes raw (~70 gzipped), once per page across 13 pages. Rendered at `1.05rem` inside a callout title (using the `.callout__title .icon` rule added by ICON-01). This is the densest glyph in the set at four sub-paths, so verify at 17px before committing — if the padlock shackle closes up, widen the shackle arc rather than dropping the chrome bar, since the chrome bar is what makes it read as a browser rather than a picture frame. Zero CLS.

**Generation prompt — copy this verbatim**

```text
Construction spec (hand-author; do not generate). Add to src/partials/icons.html before `</defs></svg>`:

<symbol id="ic-browser-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4.5" width="18" height="15" rx="2"/>
  <path d="M3 9.2h18"/>
  <rect x="9.25" y="13" width="5.5" height="4.4" rx="1.2"/>
  <path d="M10.65 13v-1.35a1.35 1.35 0 0 1 2.7 0V13"/>
</symbol>

Geometry notes. Four sub-paths — the densest glyph in the set, so every element is oversized relative to a typical browser icon. The window is 18×15 at rx="2", matching ic-calendar-check's frame exactly so the two read as siblings. The chrome bar is a single horizontal rule at y=9.2, 4.7 units below the top: deliberately deeper than a realistic browser bar, because at 17px rendered a shallower bar merges with the frame's top edge. The padlock body is 5.5×4.4 at rx="1.2", centred at x=12 and sitting in the lower window area with its bottom edge 2.1 units clear of the frame. The shackle is a 2.7-unit-wide semicircular arc rising 1.35 units above the body — that height is the minimum that survives 17px with a 2px stroke; if it closes up in testing, widen the arc, never shorten the body.

Do NOT add: traffic-light dots or tab shapes in the chrome bar (they disappear below 20px), a URL line, a cursor, a keyhole, a shield behind the lock, a fingerprint, an eye, or a fill of any kind.
```

**Alt text** — alt="" equivalent — decorative. `aria-hidden="true" focusable="false"`, no label. The callout title beside it already states the claim in full words.

**Dark mode** — Free. `stroke="currentColor"` inheriting `--bc-accent-2` inside `.callout--info` (whose background `--bc-teal-050` remaps from #e9f5f5 to #10302f at site.css:971, with `--bc-chip-info-fg` moving to #8fe0e2 — contrast is maintained by the existing role tokens with no per-icon work).

**Compliance check** — A browser window with a padlock is a consumer-software motif with no government, medical, or insurance association, and no institutional-security connotation. Explicitly not a bank vault, not a shield with a star (which would edge toward a seal), not a fingerprint or biometric mark (which would imply identity capture — the precise opposite of the claim), and not a padlock alone (too generic; it would say 'encrypted transmission' when the actual claim is 'no transmission occurs'). The browser frame is the load-bearing part of the meaning: the computation stays inside the reader's own window.

---

## IC-8 · hero-art conformance fix: one accent, because dark mode collapses the two

> P2 · effort: trivial · kind: `inline-svg-illustration` · route: / (the only page including the hero-art partial)
> Source lens: Visual system

**Why it earns its place.** This is a measured defect, not a taste note. In light mode the piece encodes a deliberate two-accent distinction: the Social Security COLA pill is gold (`--bc-ill-gold` = #f5c451, line 20) and the Medicare plan chip is amber (`--bc-ill-accent` = #d97706, line 38) — the same gold/amber split the site uses everywhere to separate 'your raise' from 'your plan'. But site.css:1003 redefines `--bc-ill-accent` to #f5c451 under `prefers-color-scheme: dark`, which is byte-identical to `--bc-gold`. I rendered the homepage at 1280px in both schemes and confirmed it: in dark mode the two chips are the same colour and the distinction silently vanishes. So the piece either means two things or one depending on the reader's OS setting, and nobody chose that. Fixing it to one accent makes the piece consistent across themes and makes it the reference implementation of the visual system's one-accent rule (SYS-01 §5) rather than its first violation. After the fix the piece uses eight distinct tokens, exactly at the spec ceiling — so it also validates that the ceiling is set at a workable level.

**Insertion point.** src/partials/hero-art.html:38 — change `fill="var(--bc-ill-accent)"` to `fill="var(--bc-ill-gold)"` on the 'Plan' chip rect. Line 39, the chip's label, already uses `fill="var(--bc-teal-900)"` and needs no change. This chip sits between the plan card's three placeholder bars (lines 34–36) and the SAMPLE badge group (lines 53–56); the only other accent in the piece is the gold COLA pill at line 20.

**Specification** — One attribute value changed in an existing inline-SVG partial. viewBox stays `0 0 480 380` (1.263:1), rendered at `max-width: 30rem` = 480px, i.e. 1:1 — which is what makes its `stroke-width="2"` two device-independent pixels, per SYS-01 §2. Byte delta: +2 bytes (`accent` → `gold`). No new files, no new requests, no CLS impact (inline SVG, box reserved by viewBox), no CSS change. Contrast after the fix: `--bc-teal-900` #0b3b3f on `--bc-ill-gold` #f5c451 = 8.4:1, comfortably AA at the chip's 13-unit weight-700 label, and identical in both themes because both tokens are raw ramp values that never flip.

**Generation prompt — copy this verbatim**

```text
No generation required — this is a one-attribute edit to an existing file.

src/partials/hero-art.html:38

Before:
    <rect x="302" y="242" width="66" height="24" rx="12" fill="var(--bc-ill-accent)"/>

After:
    <rect x="302" y="242" width="66" height="24" rx="12" fill="var(--bc-ill-gold)"/>

Verification: render http://127.0.0.1:4400/ at 1280px wide under both `prefers-color-scheme: light` and `dark` and confirm the 'Plan' chip and the '{{COLA_CONFIRMED_YEAR}}: +{{COLA_CONFIRMED}}%' pill are the same colour in BOTH themes. Before this change they match only in dark.

If a two-accent distinction is genuinely wanted in this piece, the fix is the opposite direction and is a CSS change, not an art change: give `--bc-ill-accent` a distinct dark-mode value at src/assets/css/site.css:1003 (a lighter amber such as #fbbf24 holds 9.6:1 on the #182524 illustration paper while staying clearly separable from #f5c451). Do NOT leave the two tokens resolving to the same hex while the art depends on them differing.
```

**Alt text** — No change required. The `aria-label` on the root svg (hero-art.html:1) already reads 'Illustration: a sample Social Security payment slip showing the confirmed {{COLA_CONFIRMED_YEAR}} raise of {{COLA_CONFIRMED}} percent, next to a sample Medicare plan card, with a clock' — it describes the objects and their relationship, never the accent colours, so a colour change cannot invalidate it. This is also the correct pattern to copy: never let an aria-label depend on a colour.

**Dark mode** — This IS the dark-mode fix. Before: the gold pill and amber chip are distinct in light and identical in dark. After: both resolve to #f5c451 in both themes, so the piece looks the same way it means in both. Everything else in the partial already themes correctly via --bc-ill-paper (#ffffff → #182524), --bc-ill-line (teal-700 → #8fe0e2), --bc-ill-fill-2 (#d3e9ea → #16403f) and --bc-teal-050 (#e9f5f5 → #10302f); I verified the whole piece renders correctly in the dark screenshot.

**Compliance check** — No compliance change — the piece is already correct on every count and is the model the rest of this brief follows: zero human figures, zero telephones, zero government motifs, generic placeholder bars instead of legible text, no carrier names, no plan IDs, no real dollar amounts, a plain 'Plan' word rather than a plan name, and a SAMPLE pill tucked against the slip at lines 53–56 rather than stranded in a corner. Worth noting the SAMPLE badge is positioned deliberately (per the comment at lines 51–52) so the mock-up can never read as a real statement; preserve that placement in any future edit.

# Group C — Explanatory diagrams

---

## DG-1 · One deposit, two changes — the Part B offset as a vertical flow

> **P0** · effort: medium · kind: `inline-svg-diagram` · route: /guides/part-b-premium-and-your-cola (primary) + /guides/2027-social-security-cola (reuse)
> Source lens: Diagrams
> **Merged:** Per-page imagery DIA-02 (waterfall variant) — same idea, same page; build the vertical flow, drop the waterfall.

**Why it earns its place.** The sentence a reader re-reads twice is guide-partb.html:83 — "Your benefit still rose by the full 3%; your deposit rose by less." Today that idea exists in three places and none of them is a picture: prose, an 8-row table, and a runtime chart on /cola-calculator that only appears AFTER you press Calculate and is `aria-hidden` (cola-calculator.html:118). A reader who arrives on the guide from search — the guide is 2,652 words, the second-longest page on the site — never sees it. The diagram makes the mechanism physical: the premium is subtracted from the ALREADY-RAISED benefit, on one cheque, so +$60 on paper becomes +$45 in the bank. After seeing it a visitor can predict their own outcome without doing the arithmetic, and knows to look for two numbers on their December SSA notice, not one.

**Insertion point.** PRIMARY: src/pages/guide-partb.html:35 — insert `{{> diagram-partb-offset }}` on its own line immediately before `<p>Let's walk through it with round, made-up numbers…`. It sits between the `callout--info` "The one formula that matters" block (lines 31–34) and the lead-in to the worked-example table: the picture of the formula lands directly under the formula, before the arithmetic. REUSE (one-line edit, no new asset): src/pages/guide-cola.html:132 — same include, between the Part-B paragraph at line 131 and the `callout--warn` "The two numbers to keep separate" at line 132. New file: src/partials/diagram-partb-offset.html.

**Specification** — Inline SVG, `viewBox="0 0 376 488"` (portrait, 0.77:1). Rendered natural width 376px via `<figure class="bc-chart" style="--bc-chart-w:376px">`; at ≤34rem the existing rule `.bc-chart svg { min-width: min(30rem, calc(var(--bc-chart-w) * 0.85)) }` resolves to 319.6px, so it FITS a 320px viewport with no horizontal scroll — this is why 376 is the chosen box width. Smallest text is 15 user units → 12.75px at 320px; the two 15u lines are tertiary, all primary labels are 16u (13.6px at 320px, ≥ the 14.5px tolerance the site's own CSS comment at site.css:882 sets for 17u). Markup weight ~2.9 KB raw / ~1.0 KB over the wire per page; the visually-hidden table adds ~0.7 KB raw. ZERO new HTTP requests and zero cache revalidations — `_headers:42-43` puts `/assets/*` on `max-age=0, must-revalidate`, so every raster on this site would cost a conditional request on every page view; inline SVG rides the HTML. No `width`/`height` attributes needed and CLS stays 0.0000 because the SVG's intrinsic ratio comes from the viewBox and `.bc-chart svg { width:100%; height:auto }` (site.css:862) reserves the box before paint. ONE-TIME PREREQUISITE (do this first, ~12 lines, shared by DIA-01…04): add to src/assets/css/site.css after line 894 —
.bc-dg-node { fill: var(--bc-ill-fill); stroke: var(--bc-ill-line); stroke-width: 2; }
.bc-dg-edge { stroke: var(--bc-ink-faint); stroke-width: 2; fill: none; }
.bc-dg-label { fill: var(--bc-ink-soft); font: 700 16px var(--bc-font-sans); }
.bc-dg-note { fill: var(--bc-ink-faint); font: 600 15px var(--bc-font-sans); }
.bc-dg-value { fill: var(--bc-heading); font: 800 22px var(--bc-font-sans); }
.bc-dg-op { fill: var(--bc-ink-soft); font: 800 20px var(--bc-font-sans); }
.bc-dg-good { fill: var(--bc-good); } .bc-dg-warn { fill: var(--bc-warn); }
and extend the print block: add `.bc-dg-label, .bc-dg-note, .bc-dg-op` to the existing `fill:#333` selector at site.css:1066 and `.bc-dg-value` to the `#000` group at 1061-1064.

**Generation prompt — copy this verbatim**

```text
Hand-author this SVG (do NOT generate it with an image model — it must be real markup using CSS custom properties). Create src/partials/diagram-partb-offset.html containing exactly one <figure class="bc-chart" style="--bc-chart-w:376px"> holding an <svg viewBox="0 0 376 488" role="img" aria-label="…" preserveAspectRatio="xMidYMid meet">, then the visually-hidden table, then the figcaption.

COMPOSITION — a single vertical flow of five rounded cards down the page, joined by four operator connectors. Every card is `x=28 width=320 rx=12`. Inside each card: a left-anchored label at x=44 (class bc-dg-label, 16u) and a right-anchored amount at x=360 with text-anchor="end" (class bc-dg-value, 22u), both on the card's vertical centre baseline.

Cards, top to bottom:
1. y=8 h=56, class bc-dg-node. Label "Your benefit now", value "$2,000", baseline y=44.
2. y=100 h=56, class bc-dg-node. Label "Cost-of-living raise, 3%", value "+$60" with class "bc-dg-value bc-dg-good", baseline y=136.
3. y=192 h=56, class bc-dg-node but with fill="var(--bc-ill-fill-2)" and stroke-width="2.5" — this is the milestone card. Label "New benefit, before Part B", value "$2,060", baseline y=228.
4. y=284 h=56, fill="none" stroke="var(--bc-warn)" stroke-width="2.5" rx=12. Label "Medicare Part B withheld", value "−$195" (U+2212 minus, not a hyphen) with class "bc-dg-value bc-dg-warn", baseline y=320.
5. y=376 h=68, fill="var(--bc-ill-fill)" stroke="var(--bc-good)" stroke-width="3" rx=12. Label "What lands in your bank" at baseline y=404; value "$1,865" at 24u with class "bc-dg-value bc-dg-good", baseline y=406; and a second line inside the card, x=44 baseline y=430, class bc-dg-note, reading "raise you keep: +$45".

CONNECTORS — four identical units on the centre line x=188, between consecutive cards, each 36 units of gap:
  • a circle cx=188 r=13 fill="var(--bc-surface)" stroke="var(--bc-line)" stroke-width="1.5", centred 14 units below the card above (cy = 78, 170, 262, 354);
  • the operator glyph centred in it, class bc-dg-op, text-anchor="middle", baseline cy+7: "+" then "=" then "−" (U+2212) then "=";
  • an 8-unit solid triangle arrowhead pointing into the card below: path d="M182 <cardTop−8> L194 <cardTop−8> L188 <cardTop> Z" fill="var(--bc-ink-faint)".

SAMPLE-DATA CHIP — at the very bottom, rect x=28 y=456 width=150 height=22 rx=11 fill="none" stroke="var(--bc-warn)" stroke-width="1.5", with text x=103 y=471 text-anchor="middle" class="bc-dg-note bc-dg-warn" reading "Example figures".

RULES. Use ONLY var(--bc-…) tokens for every fill and stroke — no literal hex. No <style> element inside the SVG (CSP allows inline style attributes but the shared classes belong in site.css). No gradients, no filters, no <marker>, no external references. Do not add a drop shadow. Use the exact dollar figures above — they are the guide's own explicitly-labelled made-up example (guide-partb.html:35-82), so the diagram cannot contradict the page. Do NOT substitute the real {{PART_B_PREMIUM}} token here: mixing a real premium into a made-up example is exactly the confusion the page's muted note at line 82 is written to prevent.
```

**Alt text** — On the `<svg>`: role="img" aria-label="Flow diagram. A $2,000 monthly benefit, plus a 3 percent cost-of-living raise of $60, equals a new gross benefit of $2,060. The $195 Medicare Part B premium is then withheld from that same payment, leaving $1,865 deposited to your bank. So the raise on paper is $60 a month but the raise you keep is $45. Every figure is made up for the example." Then, following the svg inside the same <figure>, a `<table class="visually-hidden">` exactly as scripts/lib/svgcharts.mjs builds one — `<caption>How a 3 percent raise and a $195 Medicare Part B premium land on the same monthly deposit. Example figures.</caption>`, columns "Step" / "Amount", rows: Your benefit now / $2,000.00 · Cost-of-living raise, 3% / +$60.00 · New benefit before Part B / $2,060.00 · Medicare Part B withheld / −$195.00 · What lands in your bank / $1,865.00 · Raise you keep / +$45.00. Then `<figcaption>Example figures only. A raise and a premium increase land on the same monthly deposit, so the raise you keep is smaller than the raise on paper.</figcaption>`.

**Dark mode** — Automatic and free — every fill and stroke is a `var(--bc-*)` role token, and site.css:998-1006 already remaps `--bc-ill-line` → #8fe0e2, `--bc-ill-fill` → #10302f, `--bc-ill-fill-2` → #16403f, `--bc-ill-paper` → #182524, `--bc-good` → #6ee7a8, `--bc-warn` → #f5c451 under `@media screen and (prefers-color-scheme: dark)`. No hard-coded hex anywhere in the SVG. Contrast check in light: --bc-good #15803d on --bc-surface #ffffff = 4.54:1 for the 22u bold value (AA large, passes); --bc-warn #b45309 on white = 5.03:1; --bc-ink-soft #3f4d4a on white = 8.4:1. In dark: #6ee7a8 and #f5c451 on #14201e both exceed 10:1. Because the dark block is scoped `@media screen`, print always gets the light palette — so an OS-dark reader printing the guide gets a legible diagram, which is the failure the print block at site.css:1044 exists to prevent.

**Compliance check** — Steered around the two live risks. (1) Government affiliation: the diagram is pure typography and rounded rectangles — no seal, eagle, dome, flag, shield or anything resembling an SSA/CMS/Medicare mark, and no "official" framing. "Medicare Part B" appears only as the name of a statutory premium, which the page's own prose already uses. (2) Carrier endorsement / advice: no plan, carrier, product or recommendation appears; the diagram describes an arithmetic identity that applies to everyone. Sample-data rule: all five amounts are the page's own declared made-up figures, and the SVG repeats an "Example figures" chip so the warning survives printing, where the surrounding muted paragraph may land on a different page. No people, no headsets, no telephones — nothing that could read as "call an advisor", which is the site's central promise.

---

## DG-2 · Four futures for one plan — what the CMS Crosswalk actually says

> **P0** · effort: medium · kind: `inline-svg-diagram` · route: /medicare-plan-changes (primary) + /how-it-works (reuse)
> Source lens: Diagrams
> **Merged:** Per-page imagery DIA-05 (crosswalk explainer) — same subject; keep the four-outcome construction.

**Why it earns its place.** This lands on the site's highest-priority route (medicare-plan-changes, sitemap priority 1.0). The sentence readers re-read is medicare-plan-changes.html:171 — "Consolidated — CMS is merging your plan into a successor plan. Your coverage maps to the new plan ID shown." Four abstract nouns (renewing, consolidated, service-area reduction, terminating) currently arrive as a flat bulleted list, which implies they are a sequence or a severity ladder. They are neither: they are four mutually exclusive futures for the SAME plan. A fan — one box at top, four branches — encodes that exclusivity in the geometry, which no list can. It also absorbs the site's fifth hard idea, "what happens if you do nothing" (guide-aep.html:118, key-dates.html:117), as one consequence line per branch, so a visitor learns the status word AND its personal cost in one pass. After seeing it, someone who gets "Consolidated" from the tool knows they were auto-moved rather than dropped, and someone who gets "Terminating" knows inaction costs them drug coverage — which is the whole reason the tool exists.

**Insertion point.** PRIMARY: src/pages/medicare-plan-changes.html — REPLACE lines 169–174 (the `<ul>` of four status bullets under "How to read your result") with `{{> diagram-crosswalk-outcomes }}`. This is a replacement, not an addition: the partial's own HTML list carries the identical `<span class="badge badge--good">Renewing</span>` / `badge--warn` / `badge--bad` markup, so the badge-to-meaning mapping the running tool emits is preserved verbatim while the duplication is removed. It sits between the paragraph at line 168 and `{{> ad-inline }}` at line 176. REUSE (one-line edit, purely additive): src/pages/how-it-works.html:82 — same include, between the Crosswalk paragraph at line 81 and `<h3>The Public Use Files and PBP</h3>` at line 83. New file: src/partials/diagram-crosswalk-outcomes.html.

**Specification** — Inline SVG, `viewBox="0 0 376 412"` (portrait, 0.91:1), plus a real HTML `<ul>` inside the same `<figure>` beneath it. `<figure class="bc-chart" style="--bc-chart-w:376px">` — 376 is chosen so the ≤34rem rule resolves to 319.6px and the figure fits a 320px viewport with NO horizontal scroll. Text floors: 18u status words (15.3px at 320px), 16u meaning lines (13.6px). The "if you do nothing" consequences deliberately live OUTSIDE the SVG as an HTML `<ul>` — real reflowing text at the site's 19px body size, fully browser-zoomable, and it keeps the SVG geometric. Markup ~2.7 KB raw SVG + ~1.0 KB HTML list; net change on /medicare-plan-changes is close to zero because it replaces a ~0.9 KB `<ul>`. No new request, no revalidation, CLS unaffected. Depends on the shared `.bc-dg-*` CSS from DIA-01; add nothing further. Uses `{{PLAN_YEAR_CURRENT}}` / `{{PLAN_YEAR_NEXT}}` so the years never go stale (tokens resolve inside partials — build.mjs:328 then :329).

**Generation prompt — copy this verbatim**

```text
Hand-author this as markup. Create src/partials/diagram-crosswalk-outcomes.html: one <figure class="bc-chart" style="--bc-chart-w:376px"> containing <svg viewBox="0 0 376 412" role="img" aria-label="…" preserveAspectRatio="xMidYMid meet">, then the visible <ul> of consequences, then the <figcaption>.

COMPOSITION — a one-to-four fan: a single source box at the top, a vertical spine down the left, four outcome rows branching off it.

SOURCE BOX: rect x=98 y=8 width=180 height=58 rx=12 class="bc-dg-node". Inside, text-anchor="middle" at x=188: "Your plan today" class bc-dg-label 17u baseline y=32, and "{{PLAN_YEAR_CURRENT}}" class bc-dg-note 14u baseline y=52.

SPINE: one path, class bc-dg-edge, d="M188 66 V88 H32 V354" — down from the box, left, then straight down past all four rows. Four horizontal stubs off it, class bc-dg-edge, at the vertical centre of each row: d="M32 <cy> H54" for cy = 119, 209, 299, 385. Each stub ends in a 7-unit arrowhead: path d="M54 <cy−5> L62 <cy> L54 <cy+5> Z" fill="var(--bc-ink-faint)".

FOUR OUTCOME ROWS, each: rect x=62 width=306 height=62 rx=10 class="bc-dg-node", at y = 88, 178, 268, 354 (the last is height 58 so the box ends at 412). Immediately inside the left edge of each, a status accent bar: rect x=62 width=6 height=<row height> rx=3 filled with the row's status colour. Text inside each row is left-anchored at x=80:
  Row 1, y=88 — accent fill="var(--bc-chip-good-fg)"; status "Renewing" 18u font-weight 800 fill="var(--bc-good)" baseline y=114; meaning "Same plan — prices can move." class bc-dg-label 16u baseline y=138.
  Row 2, y=178 — accent fill="var(--bc-chip-warn-fg)"; status "Consolidated" fill="var(--bc-warn)" baseline y=204; meaning "Merged into a successor plan." baseline y=228.
  Row 3, y=268 — accent fill="var(--bc-chip-warn-fg)"; status "Service area cut" fill="var(--bc-warn)" baseline y=294; meaning "Still sold, but not everywhere." baseline y=318.
  Row 4, y=354 — accent fill="var(--bc-chip-bad-fg)"; status "Terminating" fill="var(--bc-bad)" baseline y=380; meaning "Not offered in {{PLAN_YEAR_NEXT}}." baseline y=402.

RULES. Tokens only, no literal hex. No <style> in the SVG, no gradients, no filters, no rotated text. Do NOT put the "if you do nothing" consequences inside the SVG — they belong in the visible HTML <ul> below it, where they reflow and zoom. Do NOT draw plan cards, member ID cards, insurer logos, or anything resembling a real plan document; these are labelled abstract boxes. Do NOT invent plan names or plan IDs — the source box says "Your plan today", never "Sample Plan A" or "H1234-001". Do NOT rank the four outcomes as better-to-worse with size or arrow weight; they are equal-weight alternatives and only the status colour differs.
```

**Alt text** — On the `<svg>`: role="img" aria-label="Branching diagram. One box at the top, labelled your 2026 plan, splits into four separate 2027 outcomes: Renewing — the same plan continues, but its prices and benefits can move. Consolidated — the plan is merged into a successor plan with a different plan ID. Service-area reduction — the plan still exists but is no longer offered everywhere. Terminating — the plan is not offered next year at all. Only one of the four can apply to a given plan." Following the svg, the real HTML list (NOT visually hidden — this is visible content): `<ul class="dg-consequences">` with four items, each opening with the same badge markup the tool emits — `<li><span class="badge badge--good">Renewing</span> If you do nothing, you stay on the plan at its new terms — so read what moved.</li>`, `<li><span class="badge badge--warn">Consolidated</span> If you do nothing, you are moved to the successor plan automatically.</li>`, `<li><span class="badge badge--warn">Service-area reduction</span> If you do nothing, check it is still offered in your county — it may not be.</li>`, `<li><span class="badge badge--bad">Terminating</span> If you do nothing, you can be dropped to Original Medicare and lose drug coverage.</li>`. Because that list is visible text, no visually-hidden table is needed for it; the SVG's aria-label covers the geometry. Then `<figcaption>Every plan gets exactly one of these four outcomes in the CMS Crosswalk file. Which one is what the tool above tells you.</figcaption>`

**Dark mode** — Free via tokens, and the status colours ride the chip tokens the site already flips. Each outcome row carries a 6-unit left accent bar filled with `var(--bc-chip-good-fg)` / `var(--bc-chip-warn-fg)` / `var(--bc-chip-bad-fg)`, which site.css:991-995 remaps in dark to #6ee7a8 / #f5c451 / #fca5a5 — the exact same values the visible badges beneath the diagram use, so colour meaning stays consistent between the picture and the list. Status words use `var(--bc-good)` / `var(--bc-warn)` / `var(--bc-bad)` (all ≥4.5:1 on `--bc-surface` in light, ≥8:1 in dark). Boxes are `class="bc-dg-node"` → `--bc-ill-fill` / `--bc-ill-line`. Critically, the four outcomes are ALSO distinguished by their status word and position, never by colour alone (WCAG 1.4.1). Print: light palette applies (dark block is `@media screen`), and the accent bars print as flat ink.

**Compliance check** — This is the item where carrier-endorsement risk is real, and I steered around it by keeping every box abstract. No carrier name, no plan name, no plan ID, no star rating, no premium figure appears — so nothing in the picture can be mistaken for a real plan document or for a recommendation, which is the trap a "before/after plan card" illustration would walk into on a page that already ships a red sample-data banner (medicare-plan-changes.html:32-39). The four status words are CMS Crosswalk file terminology quoted as vocabulary, presented alongside the page's own repeated "we are not affiliated with Medicare or CMS" FAQ — no seal, no dome, no eagle, no simulated CMS letterhead. "Original Medicare" appears only in the consequence text, as the statutory fallback, not as a suggested destination. Nothing implies a preferred outcome, and no phone, headset or person appears anywhere.

---

## DG-3 · Which three months count — the CPI-W third-quarter window

> P1 · effort: medium · kind: `inline-svg-diagram` · route: /how-it-works (primary) + /guides/2027-social-security-cola (reuse)
> Source lens: Diagrams

**Why it earns its place.** DECISION ON THE BRIEF'S QUESTION: complement the table, do not replace it. The existing 4-row table (how-it-works.html:31-59) is already clear about the ARITHMETIC — two numbers, a division, a rounding rule — and I would not touch it. What no table can show is the SHAPE of the measuring window, and that is precisely the sentence readers re-read: "It averages the CPI-W for those three months, then compares that average to the same three-month average from the last year a COLA took effect" (how-it-works.html:27). Two same-named quarters in different years, one of which is defined by "the last year a COLA took effect" rather than "last year" — that is three referents in one sentence. Twelve month-cells per year with three lit up says it instantly: nine twelfths of the year are irrelevant, and the comparison is Q3-over-Q3. After seeing it, a visitor understands why the October announcement date is fixed (September CPI-W is the last input), and why a hot spring does not raise their benefit.

**Insertion point.** PRIMARY: src/pages/how-it-works.html:29 — insert `{{> diagram-cpiw-window }}` on its own line immediately before `<h3>A worked example: the {{COLA_CONFIRMED_YEAR}} COLA</h3>`. It sits between the paragraph at line 27 that first says "the third quarter: July, August, and September" and the h3 that opens the worked-example table — the picture of the measuring window, then the arithmetic on it. REUSE (one-line edit): src/pages/guide-cola.html:39 — same include, between the "In plain terms" paragraph at line 37 and the `callout--info` "A worked example" at line 39. New file: src/partials/diagram-cpiw-window.html.

**Specification** — Inline SVG, `viewBox="0 0 720 268"` (landscape, 2.69:1). `<figure class="bc-chart" style="--bc-chart-w:720px">`; `.bc-chart` caps at min(42rem, 720px) = 672px, so the SVG renders at 0.933 scale on desktop — 16u month letters land at 14.9px, 18u year labels at 16.8px. At ≤34rem the existing rule gives min-width = min(480px, 612px) = 480px, so on a 320px phone the figure scrolls horizontally by ~160px. That is DELIBERATE and appropriate here: it is a calendar, sideways is the natural gesture, and it is the same behaviour the five-bar COLA history chart already has on this exact page. To keep it operable by keyboard (WCAG 2.1.1 — a scrollable region must be reachable), add `tabindex="0" role="group" aria-label="Calendar of the CPI-W measuring window, scrolls sideways"` to the `<figure>`; the existing charts arguably miss this and it costs one attribute. The visually-hidden table remains the primary non-visual path. Markup weight ~3.4 KB raw / ~1.1 KB over the wire; no new request, no revalidation, CLS unaffected (viewBox supplies the ratio). BUILD-TOKEN PREREQUISITE — the CPI-W averages are already in the data and must not be hardcoded a third time. src/data/cola.json carries `q3CpiwAvg` on every history row, where the row for COLA year Y holds the Q3 average of year Y−1 (2025 → 308.729, 2026 → 317.373 — verified). Add four tokens to the `colaTokens` map in scripts/build.mjs alongside the existing COLA_* entries: CPIW_BASE_YEAR = confirmedYear − 2 (2024), CPIW_NEW_YEAR = confirmedYear − 1 (2025), CPIW_BASE_AVG = history.find(r => r.year === confirmedYear − 1).q3CpiwAvg (308.729), CPIW_NEW_AVG = history.find(r => r.year === confirmedYear).q3CpiwAvg (317.373). Partials are resolved at build.mjs:328 BEFORE tokens are applied at :329, so tokens inside the partial substitute correctly.

**Generation prompt — copy this verbatim**

```text
Hand-author this SVG as markup. Create src/partials/diagram-cpiw-window.html: one <figure class="bc-chart" tabindex="0" role="group" aria-label="Calendar of the CPI-W measuring window, scrolls sideways" style="--bc-chart-w:720px"> containing <svg viewBox="0 0 720 268" role="img" aria-label="…" preserveAspectRatio="xMidYMid meet">, then the visually-hidden table, then the figcaption.

COMPOSITION — two horizontal calendar rows, one per year, with the third quarter lit.

ROW GEOMETRY. Twelve cells per row: cell i (i = 0…11) is rect x = 96 + 50·i, width 44, height 48, rx 6. Row 1 y=64, row 2 y=158. Month letters J F M A M J J A S O N D as <text>, 16u, text-anchor="middle", cx = 118 + 50·i, baseline y=94 (row 1) and y=188 (row 2).
  • Cells i = 0–5 and 9–11: fill="var(--bc-surface-3)", no stroke; letters fill="var(--bc-ink-faint)" font-weight="600".
  • Cells i = 6, 7, 8 (July, August, September — x = 396, 446, 496): fill="var(--bc-ill-fill)" stroke="var(--bc-ill-line)" stroke-width="2"; letters fill="var(--bc-accent-on-tint)" font-weight="800".

YEAR LABELS, left of each row, x=8, text-anchor="start": row 1 — "{{CPIW_BASE_YEAR}}" at 18u class bc-dg-value baseline y=88, and "base quarter" at 14u class bc-dg-note baseline y=108. Row 2 — "{{CPIW_NEW_YEAR}}" baseline y=182 and "new quarter" baseline y=202.

QUARTER BRACKETS, one under each row, spanning the three lit cells: path d="M394 118 v6 h146 v-6" (row 1) and the same shape at y=212 (row 2), fill="none" stroke="var(--bc-ill-line)" stroke-width="2" stroke-linejoin="round". Under each bracket, centred at x=467, class bc-dg-label 16u text-anchor="middle": "average {{CPIW_BASE_AVG}}" at baseline y=144 and "average {{CPIW_NEW_AVG}}" at baseline y=238.

PAYOFF CHIP, bottom right: rect x=560 y=222 width=152 height=34 rx=17 fill="none" stroke="var(--bc-ill-gold)" stroke-width="2.5"; text x=636 y=245 text-anchor="middle" class="bc-dg-value" font-size="18" reading "{{COLA_CONFIRMED}}% COLA". A short connector from the row-2 bracket label to the chip: path d="M545 239 H552" class="bc-dg-edge" plus an arrowhead path d="M552 235 L560 239 L552 243 Z" fill="var(--bc-ink-faint)".

RULES. Tokens only — no literal hex except none at all. No <style> inside the SVG, no gradients, no filters, no rotated text (a 65+ audience should never have to tilt their head). Do not draw arrows between individual month cells; the two brackets carry the comparison. Do not restate the division or the rounding inside the SVG — the adjacent table on both host pages already owns that, and duplicating it is what would make this diagram redundant rather than complementary. Do not add a 2027 or projected row: the diagram explains a completed calculation, and adding an in-progress quarter would imply the estimate is measured the same way.
```

**Alt text** — On the `<svg>`: role="img" aria-label="Calendar diagram. Two rows of twelve month cells, one row for 2024 and one for 2025. In each row only July, August and September are highlighted — those are the only three months that count toward the cost-of-living adjustment. The July-to-September average CPI-W was 308.729 in 2024 and 317.373 in 2025, and the percentage change between the two, rounded to the nearest tenth, is the 2.8 percent 2026 cost-of-living adjustment." Following the svg: `<table class="visually-hidden">` with `<caption>The two third-quarter CPI-W averages that set the 2026 cost-of-living adjustment</caption>`, columns "Measuring window" / "Average CPI-W", two rows — "July to September 2024 (base quarter)" / "308.729" and "July to September 2025 (new quarter)" / "317.373". Keep it to two rows: the full four-step arithmetic already has its own accessible table immediately below on both pages, and repeating it here would make a screen-reader user hear the same sum twice. Then `<figcaption>Only the July–August–September average counts. This year's third quarter is compared with the third quarter of the last year a raise took effect.</figcaption>`

**Dark mode** — Free via tokens. Unhighlighted month cells use `var(--bc-surface-3)` (#eef2f1 light → #1e2d2b dark) with letters in `var(--bc-ink-faint)` (#5c6b67 → #90a29e); highlighted Q3 cells use `var(--bc-ill-fill)` (#e9f5f5 → #10302f) with a `var(--bc-ill-line)` stroke (teal-700 → #8fe0e2) and letters in `var(--bc-accent-on-tint)` (teal-800 → #8fe0e2). That last pairing is the one the site already relies on for `.provenance__mono` (site.css:916), so the tint/text relationship is pre-validated in both themes. The gold payoff chip uses `var(--bc-ill-gold)` (#f5c451 in both themes) as a stroke only, never as a text colour on white — gold text on white would fail AA. Print: the dark block is `@media screen`-scoped, so print gets the light palette; the light Q3 tint (#e9f5f5) survives as pale grey on paper and the 2u teal stroke is what actually carries the highlight, so the diagram still reads if the printer drops light fills.

**Compliance check** — No government-affiliation risk: the diagram shows a calendar and two index numbers — no BLS/SSA logotype, no seal, no simulated official document or letterhead. The index values are cited from public BLS CPI-W and are already published verbatim in the adjacent table on both pages, and the figcaption attributes the rule rather than the authority. Nothing implies BenefitDial computes or publishes the COLA. No plans, carriers or advice appear at all, so carrier-endorsement and plan-recommendation risks do not arise. Sample-data rule is not engaged — these are real published figures, and I deliberately kept the projected 2027 quarter OUT so the diagram can never be read as showing an estimate as if it were measured.

---

## DG-4 · The enrolment year as one strip — AEP, the closed gap, and MA OEP

> P2 · effort: large · kind: `inline-svg-diagram` · route: /key-dates (primary) + /guides/medicare-aep-2026 (reuse)
> Source lens: Diagrams
> **Merged:** Per-page imagery DIA-03 and DIA-04 (fall season ribbon + its reuse on the AEP guide) — one component, two placements.

**Why it earns its place.** DECISION ON THE BRIEF'S QUESTION: yes, a horizontal strip earns its place — but for the SHAPE of the year, not for a baked-in "you are here". The sentence readers re-read is key-dates.html:81 — "AEP (October 15 – December 7) is open to everyone… The Medicare Advantage Open Enrollment Period (January 1 – March 31, 2027) is different." The vertical timeline lists both windows as two of eight equal-looking bullets, so their relative LENGTH, their non-overlap, and — the thing nobody currently sees at all — the three-and-a-half-week dead zone between December 8 and December 31 when nothing can be changed, are all invisible. Laid on a month strip, the reader sees a wide window, a locked gap, then a narrower second window that only some people qualify for. After seeing it a visitor stops treating January as a second chance to shop freely, and understands why "give yourself room before December 7" (guide-aep.html:41) is real advice rather than filler.

**Insertion point.** PRIMARY: src/pages/key-dates.html:23 — insert `{{> diagram-enrolment-year }}` on its own line between `<div class="wrap">` (line 22) and `<div class="grid grid--2" …>` (line 23), so the strip sits full-width ABOVE the two-column block that pairs the intro prose with the vertical timeline. Shape first, detail second: the strip answers "what are the windows", the existing `ul.timeline` (lines 30-63) then answers "what happens on each date". REUSE (one-line edit): src/pages/guide-aep.html:26 — same include, immediately before `<ul class="timeline" style="margin:1.25rem 0 1.5rem;">`, between the paragraph at line 24 and that three-item timeline. New file: src/partials/diagram-enrolment-year.html.

**Specification** — Inline SVG, `viewBox="0 0 720 232"` (landscape, 3.10:1), covering nine months July 2026 → March 2027. `<figure class="bc-chart" tabindex="0" role="group" aria-label="Enrolment year strip, scrolls sideways" style="--bc-chart-w:720px">`. On /key-dates the container is `.wrap` (68rem) but `.bc-chart` caps at min(42rem, 720px) = 672px → 0.933 scale, 17u labels at 15.9px. On /guides/medicare-aep-2026 the container is `.wrap.prose` (44rem) — same 672px cap, identical rendering. At ≤34rem, min-width = min(480px, 612px) = 480px, so a 320px phone scrolls ~160px sideways; that is correct for a calendar and matches the existing charts, and `tabindex="0"` keeps the scroll region keyboard-operable (WCAG 2.1.1). ~3.1 KB raw / ~1.0 KB over the wire, no new request, no revalidation, CLS unaffected. Every date string comes from tokens already derived in scripts/build-aep-data.mjs — `{{AEP_WINDOW_RANGE}}`, `{{AEP_MA_OEP_RANGE_LONG}}`, `{{COLA_ANNOUNCE_DATE_LONG}}` — so the strip cannot drift from the prose. OPTIONAL P2 ENHANCEMENT — the live "you are here" marker: do NOT bake it from `{{BUILD_DATE}}`; a static build plus HTML caching means a wrong today-marker on a benefits calendar, which is worse than none. Instead add ~14 lines to src/assets/js/enhance.js (already loaded sitewide, `defer`, at layout.html:110): read `data-strip-start="2026-07-01"` and `data-strip-end="2027-03-31"` off the figure, compute the fraction elapsed against the CLIENT clock, and if it falls inside the range set the `x` of a pre-drawn `<line id="dg-today">` and unhide it. The strip is complete and correct with JS off; with JS on it gains a marker that is accurate by construction. No CLS — the line is inside the existing viewBox, so nothing reflows.

**Generation prompt — copy this verbatim**

```text
Hand-author this as markup. Create src/partials/diagram-enrolment-year.html: one <figure class="bc-chart" tabindex="0" role="group" aria-label="Enrolment year strip, scrolls sideways" style="--bc-chart-w:720px" data-strip-start="2026-07-01" data-strip-end="2027-03-31"> containing <svg viewBox="0 0 720 232" role="img" aria-label="…" preserveAspectRatio="xMidYMid meet">, then the visually-hidden table, then the figcaption.

COMPOSITION — nine month cells left to right, two window bands sitting above them, three dated markers hanging below.

MONTH CELLS: nine rects, cell i (i = 0…8) at x = 20 + 76·i, width 72, height 40, rx 6, y=104, fill="var(--bc-surface-3)". Labels Jul Aug Sep Oct Nov Dec Jan Feb Mar, class bc-dg-label 17u, text-anchor="middle", cx = 56 + 76·i, baseline y=130. A year divider between Dec and Jan: line x1=476 y1=96 x2=476 y2=152 stroke="var(--bc-line)" stroke-width="2" stroke-dasharray="4 4". Year captions class bc-dg-note 14u: "2026" text-anchor="end" at x=468 baseline y=166, "2027" text-anchor="start" at x=484 baseline y=166.

WINDOW BANDS, above the cells at y=54 height=34 rx=17:
  • AEP: x=280.5 width=133.4 (October 15 through December 7, positioned pro rata within the Oct and Dec cells), fill="var(--bc-ill-fill)" stroke="var(--bc-ill-line)" stroke-width="2". Label "AEP" 17u font-weight 800 fill="var(--bc-accent-on-tint)" text-anchor="middle" at x=347 baseline y=77.
  • Closed gap: no rect. Just a dashed rule, line x1=418 y1=71 x2=472 y2=71 stroke="var(--bc-line)" stroke-width="2" stroke-dasharray="3 4", with "closed" class bc-dg-note 14u text-anchor="middle" at x=445 baseline y=90.
  • MA OEP: x=476 width=224, same y/height/rx, fill="var(--bc-ill-fill)" stroke="var(--bc-ill-line)" stroke-width="2" stroke-dasharray="6 4". Label "MA OEP" 17u font-weight 800 fill="var(--bc-accent-on-tint)" text-anchor="middle" at x=588 baseline y=77.

MARKERS, below the cells. Each is a 4-unit filled circle on the cell baseline y=144 plus a vertical tick up to y=144 and a label below, all class bc-dg-note 15u:
  • x=205.6 (mid-September) — label "ANOC arrives", text-anchor="middle", baseline y=180.
  • x=476 (January 1) — label "New prices start", text-anchor="middle", baseline y=180.
  • x=278.2 (October 14) — label "COLA announced", text-anchor="middle", baseline y=204, on the second row so it does not collide with ANOC. Draw its tick down to y=192 first.
Marker circles and ticks: fill/stroke "var(--bc-accent-2)", stroke-width 2.

OPTIONAL TODAY MARKER (ship it hidden; enhance.js reveals it): <line id="dg-today" x1="20" y1="44" x2="20" y2="152" stroke="var(--bc-ill-accent)" stroke-width="3" stroke-linecap="round" hidden/> plus <text id="dg-today-label" x="20" y="36" text-anchor="middle" class="bc-dg-note" fill="var(--bc-ill-accent)" hidden>today</text>.

RULES. Tokens only, no literal hex. No <style> in the SVG, no gradients, no filters, no rotated text. Do NOT write out the full window names inside the SVG — "AEP" and "MA OEP" fit; the full names live in the visually-hidden table and in the surrounding prose. Do NOT invent dates: every date used here must match the tokens {{AEP_WINDOW_RANGE}}, {{AEP_MA_OEP_RANGE_LONG}} and {{COLA_ANNOUNCE_DATE_LONG}}, and the figcaption/table strings should use those tokens rather than literals. Do NOT bake a today-marker position at build time from {{BUILD_DATE}}.
```

**Alt text** — On the `<svg>`: role="img" aria-label="Timeline strip of nine months, July 2026 through March 2027. The Medicare Annual Enrollment Period runs October 15 to December 7, 2026 and is open to everyone with Medicare. From December 8 to December 31 no window is open. The Medicare Advantage Open Enrollment Period runs January 1 to March 31, 2027 and is only for people already in a Medicare Advantage plan, who may make one change. Three dated markers sit on the strip: your plan's Annual Notice of Change arrives in September 2026, the official 2027 cost-of-living adjustment is expected October 14 2026, and new prices and coverage begin January 1 2027." Following the svg: `<table class="visually-hidden">` with `<caption>Medicare enrolment windows and key dates, July 2026 to March 2027</caption>`, columns "Window or event" / "When" / "Who it is for", rows — "Annual Notice of Change arrives" / "September 2026" / "Everyone in a Medicare Advantage or Part D plan" · "Official 2027 COLA announced" / "October 14, 2026 (expected)" / "Everyone on Social Security" · "Annual Enrollment Period (AEP)" / "October 15 – December 7, 2026" / "Everyone with Medicare; unlimited changes, last one counts" · "No enrolment window open" / "December 8 – December 31, 2026" / "—" · "New coverage and new benefit amounts begin" / "January 1, 2027" / "Everyone" · "Medicare Advantage Open Enrollment Period (MA OEP)" / "January 1 – March 31, 2027" / "Only people already in a Medicare Advantage plan; one change". Then `<figcaption>Two windows, not one — and they are not interchangeable. Between December 8 and December 31 nothing can be changed.</figcaption>`

**Dark mode** — Free via tokens. Month cells `var(--bc-surface-3)`, month labels `var(--bc-ink-soft)`, the year divider and axis `var(--bc-line)`. The AEP band is `fill="var(--bc-ill-fill)" stroke="var(--bc-ill-line)" stroke-width="2"` with its "AEP" label in `var(--bc-accent-on-tint)` — the pre-validated tint/text pair. The MA OEP band uses the SAME tint but a dashed 2u stroke and its label in `var(--bc-ink-soft)`, so the two windows are distinguished by stroke style and label, not by hue alone (WCAG 1.4.1). The closed gap is `fill="none"` with a `var(--bc-line)` dashed top edge and the word "closed" in `var(--bc-ink-faint)` — in dark that becomes #90a29e on #14201e, 6.1:1, comfortably AA. The optional today-marker line uses `var(--bc-ill-accent)` (#d97706 light / #f5c451 dark), the only warm accent on the strip so it cannot be confused with a window. Print: light palette applies (dark block is `@media screen`); add `.bc-dg-note` to the existing `fill:#333` selector at site.css:1066 as part of DIA-01's one-time CSS.

**Compliance check** — No government-affiliation imagery: the strip is a calendar of statutory windows drawn as plain rects — no seal, eagle, dome, flag, or Medicare/CMS/SSA mark, and no framing that suggests this is an official notice. The dates are quoted from the same public CMS and SSA sources the page already cites, and the COLA marker is labelled from {{COLA_ANNOUNCE_DATE_LONG}}, which the pages already qualify as "expected" — so the diagram cannot harden a projected date into a promise. No carriers, plans or products appear, so there is nothing to endorse. No advice about WHICH window to use beyond the eligibility fact that MA OEP is only for people already in a Medicare Advantage plan, which is a rule, not a recommendation. Critically for this site: no envelope-with-a-phone, no clock-with-a-headset, no "act now" urgency device — the page's own guidance (guide-aep.html:81) warns readers that pressure to decide today is a sales tactic, and the diagram must not model one.

---

## DG-5 · "Your numbers never leave your device" data-flow diagram

> **P0** · effort: medium · kind: `inline-svg-diagram` · route: /privacy
> Source lens: Per-page imagery

**Why it earns its place.** Measured: /privacy is 7,437px on desktop and 11,132px on mobile, 2,274 words, and carries only 4 inline SVGs — every one of which is a chrome icon from the sprite, not page content. It is by a wide margin the most visually monotonous route on the site: five contact-sheet columns of near-uniform left-aligned prose in a 52rem measure with a large empty right gutter. It is also the page that proves the site's central promise, and that promise is a *data-flow claim* — the sentence "those numbers are never sent to us" asks the reader to take a mechanism on faith. A diagram is the one format that shows the mechanism instead of asserting it: the reader sees the whole chain sitting inside one enclosure with nothing crossing out. After this exists, a sceptical visitor understands *why* the claim is structurally true (there is no server in the loop) rather than just reading that it is.

**Insertion point.** src/pages/privacy.html:33 — immediately after the `</div>` that closes the `callout callout--info` titled "The calculators run entirely in your browser" (opens line 30, closes line 33), still inside `.wrap.prose`, before the wrap's `</div>` on line 34. It sits between that callout's prose claim and the `<h2>What is collected automatically</h2>` section that opens at line 39.

**Specification** — New partial `src/partials/diagram-device-local.html`. Structure follows the shipped chart contract in scripts/lib/svgcharts.mjs exactly: `<figure class="bc-chart" style="--bc-chart-w:34rem;max-width:34rem;">` › `<svg viewBox="0 0 520 300" role="img" aria-label="…">` › `<p class="visually-hidden">` text alternative › `<figcaption>`. Aspect ratio 26:15. No width/height attributes on the svg; `.bc-chart svg { width:100%; height:auto }` at site.css:862 sizes it, and the viewBox reserves height at parse time so CLS stays 0.0000. Renders 544x314 desktop, and on mobile `.bc-chart` already gets `overflow-x:auto` plus `min-width: min(30rem, …)` at site.css:883-886, so it never shrinks below 480px — which is what keeps the labels legible. ALL <text> at font-size 19 or larger in the 520-unit box (≥17.5px at the 480px mobile floor, ≥24px at desktop). Byte budget 3,400 bytes raw / ≤1,150 gzipped (comparator: the shipped 5-bar COLA chart figure is 2,849 raw / 796 gzipped, measured from dist/how-it-works.html). No new file under /assets/, no new HTTP request, no revalidation round-trip.

**Generation prompt — copy this verbatim**

```text
Write a single hand-authored inline SVG, `viewBox="0 0 520 300"`, flat vector, 2-unit strokes, round line caps and joins, matching the Feather/Lucide house style of src/partials/icons.html. No gradients, no shadows, no <image>, no external refs.

COMPOSITION — two zones separated by a vertical gap at x≈360:

ZONE A, "Your device" (x 16 to 344): one large rounded enclosure, rect x=16 y=44 w=328 h=232 rx=20, fill="none", stroke="var(--bc-ill-line)", stroke-width="2.5", stroke-dasharray="9 7". Its label sits on the enclosure's top edge with a small solid-background notch so the dash does not run through the type: <text x=32 y=36 font-size="19" font-weight="700" fill="currentColor">Your device</text>.
Inside the enclosure, three nodes stacked vertically, each rect w=272 h=52 rx=12 fill="var(--bc-ill-paper)" stroke="var(--bc-ill-line)" stroke-width="2", at x=36 and y=64, y=142, y=220. Centre a label in each, font-size="19", font-weight="600", fill="currentColor", text-anchor="middle", x=172:
  node 1 → "The amount you type"
  node 2 → "The math"
  node 3 → "Your answer"
Join node 1→2 and node 2→3 with short vertical arrows on the centreline x=172, stroke="var(--bc-gold)", stroke-width="3", stroke-linecap="round", each ending in a small solid gold triangle arrowhead about 11 units wide. Draw the arrows inline (an explicit <path> per head); do NOT use <marker> or <defs>, to avoid id collisions with the ic-* sprite.

ZONE B, "Sent to BenefitDial" (x 376 to 504): label <text x=440 y=36 text-anchor="middle" font-size="19" font-weight="700" fill="currentColor">Sent to us</text>. Below it one node, rect x=376 y=142 w=128 h=52 rx=12, fill="var(--bc-ill-fill-2)", stroke="var(--bc-ill-line)", stroke-width="2", stroke-dasharray="6 6", containing <text x=440 y=175 text-anchor="middle" font-size="19" font-weight="700" fill="currentColor">Nothing</text>.

THE LOAD-BEARING DETAIL: there must be NO line, arrow, connector, or dotted path of any kind between Zone A and Zone B. The empty gap is the entire argument — a crossed-out or struck-through arrow would be weaker and more alarming than an absence. Do not add a red X, a prohibition sign, or a warning triangle.

PALETTE — use ONLY these custom properties, never a literal hex: var(--bc-ill-line), var(--bc-ill-paper), var(--bc-ill-fill-2), var(--bc-gold), and currentColor for all type. (Underlying light values, for reference only, do not paste: teal-700 #146066, gold #f5c451, fill-2 #d3e9ea, paper #ffffff.)

TYPE RULE: every <text> is font-size 19 or larger in this 520-unit box and uses font-family="system-ui,-apple-system,Segoe UI,sans-serif" to match the site stack. Five text strings total, listed above — no more.

MUST NOT APPEAR: any government seal, eagle, shield, flag, Capitol dome, or CMS/SSA/Medicare-like mark; any human figure, face, hand, headset, telephone, handset glyph, or speech bubble; any recognisable brand-name cloud, server-rack, or database-cylinder that reads as a specific vendor; any carrier or plan name; any padlock-with-keyhole cliché (the shipped ic-shield-lock icon already carries that idea elsewhere on the site and repeating it here is redundant); any dollar figure, percentage, or date.

OUTPUT: the <svg> element only — the surrounding <figure>, <p class="visually-hidden"> and <figcaption> are authored separately. No XML prolog, no width/height attributes, no <style>, no <defs>, no id attributes. Target under 3,400 bytes.
```

**Alt text** — role="img" aria-label="Diagram: the benefit amount you type, the calculation, and your result all sit inside a single enclosure labelled Your device, connected left to right. A separate box labelled Sent to BenefitDial stands outside that enclosure and is empty. No line crosses between them." Plus a `<p class="visually-hidden">` immediately after the svg reading: "Inside your device: the benefit amount you type, then the calculation, then your result. Outside your device, sent to BenefitDial: nothing." Plus a visible `<figcaption>` reading: "Your benefit amount, the math, and your result never leave your browser."

**Dark mode** — Token-driven, no `<picture>` and no second asset. Enclosure stroke and node outlines use `var(--bc-ill-line)` (#146066 light → #8fe0e2 dark, site.css:1000); node fills `var(--bc-ill-paper)` (#ffffff → #182524, site.css:1004); the inert "nothing" box `var(--bc-ill-fill-2)` (#d3e9ea → #16403f, site.css:1002); connector arrows `var(--bc-gold)` (#f5c451, identical in both themes and readable on both #fbfcfc and #0d1615); label text `currentColor` so it inherits the prose ink in both themes. The figcaption inherits `.bc-chart figcaption` colour, which already has a dark remap. Verified the same token set renders correctly dark on the existing hero art.

**Compliance check** — Government affiliation: the diagram names BenefitDial and nothing else — no agency mark, no seal, no shield, and explicitly no eagle/dome/flag motif. Call-centre imagery: this is the page that promises "There is no talk to a licensed agent, no callback request" (privacy.html:27), so the prompt bans every phone, headset, handset and human figure — a diagram implying a person on the other end would flatly contradict the page it sits on. Carrier endorsement: no carrier, plan, or product name appears; the two named entities are "your device" and "us". Sample data: no dollar amount, percentage or plan figure is baked in, so nothing here can be mistaken for real plan or benefit data and nothing goes stale when the datasets refresh. I also deliberately rejected the padlock/shield visual cliché, which would have implied a security-product claim the page does not make.

# Group D — Page imagery

---

## IM-1 · Compact mobile hero illustration for the homepage

> **P0** · effort: small · kind: `inline-svg-illustration` · route: /
> Source lens: Per-page imagery

**Why it earns its place.** Measured in the browser: at 390x844 `.hero__art` computes to `display:none` (site.css:491), so the mobile homepage has NO focal image anywhere in an 1,089px-tall block of teal (hero spans y=223 to y=1312). Desktop gets a three-object illustration; phone gets a wall of type. This is the shop window for a 65+ audience arriving from search, and it is the one page where mobile is a *downgrade from the shipped design*, not a house style. After this exists, a phone visitor scrolling past the CTA sees concretely what the site produces — a benefit slip with a raise on it next to a plan card — instead of three more paragraphs of teal. Reusing the existing 480x380 art here was tested and rejected: forced visible it renders 350x277 and its baked labels drop to ~10px.

**Insertion point.** src/pages/index.html:30 — inside the existing `<div class="hero__art">` (opens line 29, closes line 31), add `{{> hero-art-compact }}` on a new line immediately BEFORE the existing `{{> hero-art }}`. Paired CSS edit at src/assets/css/site.css:491-494. Measured: `.hero__grid` is a single 350px column below 56rem, so `.hero__art` renders directly after `.hero__copy` — it lands between the `.hero__promise` tick list (ends y=1245) and the two tool cards (start y=1352), and leaves the primary CTA at y=755, still above the 844px fold.

**Specification** — New partial `src/partials/hero-art-compact.html`. Single inline `<svg class="hero__art-svg hero__art-svg--wide" viewBox="0 0 480 200" role="img" aria-label="…" preserveAspectRatio="xMidYMid meet">`. Aspect ratio 12:5. NO `width`/`height` attributes — sized by `.hero__art-svg { width:100%; height:auto }`, so the viewBox reserves 145.8px of height at the 350px mobile column width before any paint. Byte budget 2,600 bytes raw / ≤900 bytes gzipped (measured comparator: existing `src/partials/hero-art.html` is 4,194 raw / 1,249 gzipped for a denser 3-object composition). Zero new files under /assets/, zero new HTTP requests, zero revalidation cost under the `/assets/* max-age=0, must-revalidate` policy in src/static/_headers. CSS edit: change site.css:491 to `.hero__art { display: block; }`; add `.hero__art-svg--tall { display: none; }` and `.hero__art-svg--wide { display: block; max-width: 26rem; margin-inline: auto; }`; inside the existing `@media (min-width: 56rem)` block at site.css:492-494 add `.hero__art-svg--tall { display: block; }` and `.hero__art-svg--wide { display: none; }`. Keep the existing `filter: drop-shadow(...)` on the tall variant only — a heavy drop-shadow under a flat wide mark at phone width muddies the teal.

**Generation prompt — copy this verbatim**

```text
Write a single hand-authored inline SVG, `viewBox="0 0 480 200"`, flat vector, no gradients, no photographic texture, no drop shadows inside the SVG, no <image> elements, no external references. Stroke weights 2 units. Corner radii 14-18 units on cards, 4-5 on placeholder bars. House style is Feather/Lucide flat-document illustration matching src/partials/hero-art.html exactly.

COMPOSITION (left-to-right, two overlapping documents on a transparent background):
1. Social Security payment slip, back layer. Offset shadow plate: rect x=30 y=30 w=210 h=150 rx=14 fill="var(--bc-ill-line)" opacity=".18". Card: rect x=24 y=22 w=210 h=150 rx=14 fill="var(--bc-ill-paper)" stroke="var(--bc-ill-line)" stroke-width="2". Header band: a path clipping the top 30 units of that card, fill="var(--bc-teal-700)", with two bars inside it — rect 40,32 w=96 h=8 rx=4 fill="var(--bc-ill-paper)" opacity=".92" and rect 40,46 w=60 h=6 rx=3 fill="var(--bc-ill-gold)".
2. Inside the slip below the band: three placeholder text bars fill="var(--bc-ill-fill-2)" at (40,72,w=120,h=7,rx=3.5), (40,88,w=150,h=7), (40,104,w=96,h=7). Then the emphasised amount: rect 40,124 w=76 h=12 rx=5 fill="var(--bc-ill-line)" with a gold underline rect 40,142 w=110 h=4 rx=2 fill="var(--bc-ill-gold)". Then one closing bar (40,156,w=130,h=7,rx=3.5) fill="var(--bc-ill-fill-2)".
3. Medicare plan card, front layer, overlapping the slip's right edge. Shadow plate: rect 226,58 w=236 h=118 rx=16 fill="var(--bc-ill-line)" opacity=".18". Card: rect 220,50 w=236 h=118 rx=16 fill="var(--bc-ill-paper)" stroke="var(--bc-ill-line)" stroke-width="2". Header band: top 24 units of that card filled "var(--bc-teal-600)".
4. Star medallion on the plan card: circle cx=262 cy=118 r=26 fill="var(--bc-teal-050)" stroke="var(--bc-ill-line)" stroke-width="2", containing a solid five-point star, fill="var(--bc-ill-gold)", roughly 34 units across, centred on the circle.
5. To the right of the medallion: three placeholder bars fill="var(--bc-ill-fill-2)" at (302,96,w=126,h=8,rx=4), (302,114,w=100,h=8), (302,132,w=140,h=8). Then one amber pill: rect 302,150 w=56 h=14 rx=7 fill="var(--bc-ill-accent)", left EMPTY (no text).
6. Compliance label, bottom-left, clear of both cards: rect 24,178 w=90 h=22 rx=11 fill="var(--bc-teal-800)" stroke="var(--bc-ill-gold)" stroke-width="1.5", containing a single <text> x=69 y=194 text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="13" font-weight="700" letter-spacing=".6" fill="var(--bc-ill-gold)">SAMPLE</text>.

PALETTE — use ONLY these CSS custom properties, never a literal hex, so dark mode inverts for free: var(--bc-ill-paper), var(--bc-ill-line), var(--bc-ill-fill-2), var(--bc-ill-gold), var(--bc-ill-accent), var(--bc-teal-700), var(--bc-teal-600), var(--bc-teal-800), var(--bc-teal-050). (Their light values are teal-900 #0b3b3f, teal-800 #0f4b50, teal-700 #146066, teal-600 #1a7a80, teal-050 #e9f5f5, gold #f5c451, amber-500 #d97706, paper #ffffff — do not paste these into the file.)

TEXT RULE: the word SAMPLE is the ONLY <text> element permitted in this file. Do NOT bake in a percentage pill, a dollar amount, a plan name, a plan ID, a date, or a wordmark — at the 350px mobile render width anything smaller than 20 viewBox units falls under ~15px and becomes a WCAG 1.4.5 problem. Every real number stays in HTML.

MUST NOT APPEAR: any eagle, seal, shield-and-star, star-and-stripe motif, Capitol dome, flag, or anything that could read as a CMS, SSA, Medicare, or federal-government mark; any human figure, face, hand, headset, telephone, handset icon, speech bubble, or call-centre motif; any real or plausible insurance carrier name, logo, plan name, or plan ID; any word implying a recommendation ("best", "top-rated", "recommended", "approved"); any gradient, photo, mesh, or bitmap. The star medallion is a generic quality mark and must not be captioned or numbered.

OUTPUT: the SVG element only, no XML prolog, no <!DOCTYPE>, no width/height attributes, no <style> block, no id attributes that could collide with the icon sprite ids (ic-*). Target file size under 2,600 bytes.
```

**Alt text** — role="img" with aria-label="Illustration: a sample Social Security payment slip with a highlighted raise amount, side by side with a sample Medicare plan card carrying a star rating. Both are mock-ups, not real documents." Not decorative — it is the only image on the mobile page and it states what the two tools produce.

**Dark mode** — Fully handled with zero extra markup by using only the existing illustration tokens: `--bc-ill-paper`, `--bc-ill-line`, `--bc-ill-fill-2`, `--bc-ill-gold`, `--bc-ill-accent`, plus `--bc-teal-700` / `--bc-teal-600` for the header bands. All five `--bc-ill-*` tokens are already remapped for dark at site.css:1000-1004 (`--bc-ill-paper: #182524`, `--bc-ill-line: #8fe0e2`, `--bc-ill-fill-2: #16403f`). I verified the existing hero-art in `prefers-color-scheme: dark` and it inverts correctly with no glow — the compact variant inherits that behaviour exactly. Do NOT hardcode any hex in the SVG.

**Compliance check** — Steered around all three named risks. Government affiliation: no seal, eagle, dome, flag or star-and-stripe motif; the only star is a plain five-point quality medallion inside a plain circle, which is the vocabulary the shipped hero already uses, and the header bands are brand teal, not federal blue. Call-centre/agent imagery: zero human figures, zero telephones, zero headsets — this is the page whose own hero copy promises "We never ask for your phone number", and the illustration must not contradict it. Carrier endorsement: the plan card carries no name, no ID, no carrier mark, and the amber pill is deliberately left empty rather than labelled "Plan" so nothing reads as a named product. Sample-data rule: the SAMPLE badge is carried over verbatim from the shipped hero art and is the one piece of baked text retained, so the mock-up can never be mistaken for a real benefit statement or a real plan document.

# Group E — Social, share and identity

---

## SO-1 · Rebuild og-default as a slotted template card, de-dithered and re-encoded to PNG-8 (110,685 → ~28,000 bytes)

> **P0** · effort: medium · kind: `og-social-image` · route: sitewide (fallback for all 13 routes; primary card for /)
> Source lens: Social & identity

**Why it earns its place.** Two separate wins from one change. First, bytes: the card is a flat vector composition and has no business weighing 110KB — measured, it should weigh ~28KB, and the 82KB of pure waste is dither noise from a gradient nobody can see at Slack thumbnail size. Second, and more important, this turns a hand-tuned one-off into a template with named slots, which is the only reason OG-02..OG-05 are cheap rather than four more hand-authored files. A visitor never fetches this file, but the /assets/* header is `max-age=0, must-revalidate`, so anything shipped there is re-validated forever; keeping it small is the polite default. The composition also fixes a real layout flaw: today the right 38% of the card is empty teal, so at Facebook feed size the card reads as a slogan with a hole in it rather than as a product.

**Insertion point.** Three edits. (1) src/assets/img/og-default.svg:1-25 — replace the whole file with the template below. (2) scripts/gen-images.mjs:14-17 — the JOBS array; this is where the render list lives, between the EXEC constant and the browser launch. (3) scripts/gen-images.mjs:31 — immediately after `await page.screenshot({ path: join(ROOT, j.png), type: "png" });` and before `await page.close();`, insert `reencodeIndexed(join(ROOT, j.png));` and add the encoder as a module-scope function in the same file, importing only `node:zlib`.

**Specification** — 1200x630, aspect 1.9048:1 (Open Graph canonical), PNG colour type 3 (8-bit indexed), 128-entry PLTE, adaptive per-scanline filtering, zlib level 9. Byte budget ≤ 30,000 (measured 29,967 for an identical-complexity card; the simpler default composition measured 27,367 at a 256-entry palette). No alpha channel, no ancillary chunks (no tEXt/pHYs/gAMA — Chromium emits none today and the encoder must not add any). KEEP THE FILENAME og-default.png: renaming would 404 every link already shared. og:image:width/height at src/layout.html:20-21 stay 1200/630 and remain correct. No CLS risk — this file is never rendered by the site's own HTML, there is no <img> tag and none is being added. Encoder must be pure node:zlib (deflate + crc32); it adds ~110 lines to a dev-only script and ZERO runtime dependencies, so the package.json empty-deps promise holds. HARD RULE for the template: nothing load-bearing below y=520 — iMessage overlays a title strip across the bottom ~15% of a rich link, which lands exactly on the promise strip. The promise strip is therefore decorative-redundant by design (the same three promises are in the header trust-bar and in og:description).

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG rasterised via the existing Playwright job — CONTINUE that approach, do not switch to a generative image model. This is a typographic card; a diffusion model cannot hit #f5c451 or set 64px Segoe UI on a baseline. Write this file verbatim to src/assets/img/og-default.svg.

The 14-band background replaces `<linearGradient id="bg">`. The gradient is the ONLY reason the PNG is 110KB (Chromium ordered-dithers it); 14 flat bands are visually indistinguishable at any real unfurl size and compress ~4x better. These are the exact band rects, computed from #0f4b50 → #0b3b3f — call this block [BANDS] and reuse it verbatim in OG-02..OG-05:

  <rect x="0" y="0" width="1200" height="45" fill="#0f4a4f"/>
  <rect x="0" y="45" width="1200" height="45" fill="#0f494e"/>
  <rect x="0" y="90" width="1200" height="45" fill="#0e484d"/>
  <rect x="0" y="135" width="1200" height="45" fill="#0e474c"/>
  <rect x="0" y="180" width="1200" height="45" fill="#0e464b"/>
  <rect x="0" y="225" width="1200" height="45" fill="#0d4549"/>
  <rect x="0" y="270" width="1200" height="45" fill="#0d4448"/>
  <rect x="0" y="315" width="1200" height="45" fill="#0d4247"/>
  <rect x="0" y="360" width="1200" height="45" fill="#0d4146"/>
  <rect x="0" y="405" width="1200" height="45" fill="#0c4044"/>
  <rect x="0" y="450" width="1200" height="45" fill="#0c3f43"/>
  <rect x="0" y="495" width="1200" height="45" fill="#0c3e42"/>
  <rect x="0" y="540" width="1200" height="45" fill="#0b3d41"/>
  <rect x="0" y="585" width="1200" height="45" fill="#0b3c40"/>

MEASURED TYPE METRICS (getBBox in the render Chromium, font-family "Segoe UI, Arial, Helvetica, sans-serif"): headline 64px/800 = 30.05px per character; subhead 29px/500 = 12.82px per character; eyebrow 25px/700 with letter-spacing 2.5 = 17.57px per character; tick 25px/700 = 13.1px per character. Text column runs x=72 to x=730 (658px usable, art panel starts at x=770). THEREFORE: headline ≤21 characters per line at 64px, or drop to 58px for 22-24 characters. Subhead ≤51 characters. Eyebrow ≤37 characters. Exceeding these collides with the art panel — recheck with getBBox after any copy edit.

Full file:

<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="BenefitDial — your Social Security raise and your Medicare plan, side by side">
[BANDS]
  <rect x="0" y="534" width="1200" height="96" fill="#0a3438"/>
  <g transform="translate(72,60)">
    <rect width="88" height="88" rx="20" fill="#12666b"/>
    <circle cx="44" cy="44" r="27.5" fill="none" stroke="#ffffff" stroke-width="6.5"/>
    <path d="M44 24.5 V44 L58 52" fill="none" stroke="#f5c451" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="112" y="52" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="#ffffff">BenefitDial</text>
    <text x="112" y="82" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="21" font-weight="600" fill="#7fd3d6">Independent · ad-supported</text>
  </g>
  <text x="72" y="238" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="2.5" fill="#f5c451">SOCIAL SECURITY · MEDICARE</text>
  <text x="72" y="318" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="58" font-weight="800" fill="#ffffff">Your raise. Your plan.</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="58" font-weight="800" fill="#f5c451">Side by side.</text>
  <text x="72" y="460" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="29" font-weight="500" fill="#bfe0e0">Two fall numbers, side by side. No phone calls.</text>
  <g font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#8fe6d3">
    <text x="72" y="592">✓ No phone number</text>
    <text x="452" y="592">✓ No data selling</text>
    <text x="812" y="592">✓ Free &amp; ad-supported</text>
  </g>
  <g transform="translate(770,186)">
    <rect x="6" y="8" width="200" height="230" rx="16" fill="#062a2d" opacity=".45"/>
    <rect x="0" y="0" width="200" height="230" rx="16" fill="#e9f5f5"/>
    <path d="M0 16A16 16 0 0 1 16 0h168a16 16 0 0 1 16 16v30H0z" fill="#146066"/>
    <rect x="18" y="14" width="104" height="9" rx="4.5" fill="#e9f5f5" opacity=".92"/>
    <rect x="18" y="29" width="68" height="7" rx="3.5" fill="#f5c451"/>
    <rect x="18" y="70" width="132" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="88" width="162" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="128" width="88" height="16" rx="5" fill="#0b3b3f"/>
    <rect x="18" y="150" width="124" height="5" rx="2.5" fill="#f5c451"/>
    <rect x="18" y="176" width="146" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="194" width="92" height="8" rx="4" fill="#bcd7d8"/>
  </g>
  <g transform="translate(890,268)">
    <rect x="6" y="8" width="214" height="142" rx="18" fill="#062a2d" opacity=".45"/>
    <rect x="0" y="0" width="214" height="142" rx="18" fill="#e9f5f5"/>
    <path d="M0 18A18 18 0 0 1 18 0h178a18 18 0 0 1 18 18v18H0z" fill="#1a7a80"/>
    <circle cx="46" cy="84" r="26" fill="#e9f5f5" stroke="#bcd7d8" stroke-width="2"/>
    <path d="M46 68l5.4 10.9 12 1.7-8.7 8.5 2.1 12-10.8-5.7-10.8 5.7 2.1-12-8.7-8.5 12-1.7z" fill="#f5c451"/>
    <rect x="86" y="64" width="110" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="86" y="82" width="86" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="86" y="104" width="58" height="22" rx="11" fill="#7fd3d6"/>
  </g>
  <g transform="translate(770,430)">
    <rect x="0" y="0" width="108" height="30" rx="15" fill="#0b3b3f" stroke="#f5c451" stroke-width="1.5"/>
    <text x="54" y="21" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1" fill="#f5c451">SAMPLE</text>
  </g>
</svg>

MUST NOT APPEAR anywhere on this or any other card: eagles, shields, seals, Capitol domes, stars-and-stripes or any red/white/blue flag motif; any mark resembling the CMS, SSA, Medicare or Medicare.gov logotype; any human figure, headset, telephone handset, or desk-agent scene; any real carrier or plan name; any real contract or plan ID; any phone number; any COLA or premium percentage (see the rejected list — those go stale in crawler caches). The document mocks are abstract grey bars, never legible text, and always carry the SAMPLE pill.

Encoder to add at scripts/gen-images.mjs module scope (pure node:zlib, no npm): decode the Chromium PNG (inflate IDAT, undo per-scanline filters 0-4), histogram the RGB triples, take the 128 most frequent as the palette, map every pixel to the nearest palette entry by squared RGB distance, re-emit as colour type 3 with a PLTE chunk, choosing per scanline the filter (0-4) with the lowest sum of min(v, 256-v) and deflating at level 9. Verify the output with `file` — it must report "8-bit colormap".
```

**Alt text** — BenefitDial social card: "Your raise. Your plan. Side by side." — Social Security COLA plus Medicare plan changes, with no phone calls.

**Dark mode** — No variant needed and none should be made. The card is an opaque dark-teal composition with no transparency, so it never glows on a light surface and never disappears on a dark one; Slack, iMessage, Facebook and X all render OG images on a neutral chrome regardless of the viewer's theme, and none of them expose prefers-color-scheme to a crawler. The site's own dark theme is irrelevant here because no page renders this file — there is no <img> tag pointing at it.

**Compliance check** — The composition is typography plus two abstract document mocks built from grey bars — no legible text inside the mocks, so it can never be mistaken for a reproduction of an SSA statement or a plan ANOC, and it carries the same SAMPLE pill the on-site hero art uses (src/partials/hero-art.html, the badge added specifically so "the mock-up never reads as a real statement"). The card contains no seal, eagle, dome or flag colour, so it cannot imply government affiliation; the palette is entirely the site's own teal/gold. There is no person, no headset and no handset anywhere in it — the risk I steered around hardest is the stock-illustration reflex of putting a smiling advisor on a benefits card, which would directly contradict the "No phone number, ever" promise printed on the card itself. No carrier is named and no plan is depicted as recommended.

---

## SO-2 · Tokenise og:image:alt and add per-page ogimage/ogalt front matter (the plumbing OG-02..05 need)

> **P0** · effort: trivial · kind: `content-component` · route: sitewide
> Source lens: Social & identity

**Why it earns its place.** Without this, OG-02..OG-05 cannot ship — and worse, if someone wires per-route images without it, all four pages get a specific picture under the generic alt text that is hardcoded today, which is an accessibility regression dressed as an improvement. The layout file already flags this exact debt in a comment; this closes it. Nothing about the rendered page changes for a sighted visitor, which is why it is plumbing rather than an asset, but it is a hard prerequisite and cheap.

**Insertion point.** src/layout.html:23-25 — delete the two-line comment ("One shared social card… needs to become a token too") and replace the hardcoded alt on line 25 with `content="{{OG_IMAGE_ALT}}"`. src/layout.html:30 — same substitution for twitter:image:alt. src/layout.html:14 — insert `<meta property="og:locale" content="en_US">` immediately above og:site_name. scripts/build.mjs:313 — replace the hardcoded `OG_IMAGE: `${SITE.url}/assets/img/og-default.png`` with a front-matter-aware form and add an `OG_IMAGE_ALT` entry directly beneath it, both resolved through the existing `fm()` helper (defined at build.mjs:305) so they get the same tokenisation and quote-escaping as TITLE and DESCRIPTION.

**Specification** — Zero bytes shipped (three meta attributes change value, one 44-byte meta line is added). No image, no CLS, no CSP surface. Escaping: OG_IMAGE_ALT must go through the same `.replace(/"/g, "&quot;")` as TITLE/DESCRIPTION at build.mjs:307-311 — the alt strings in OG-01..05 contain double quotes around headlines and will break the attribute otherwise. The build's orphan-token guard (build.mjs:330-333) will catch a missed substitution as a build failure, so a typo cannot ship.

**Draft copy / markup — ready to insert**

```html
At scripts/build.mjs:313, replace the single OG_IMAGE line with:

      OG_IMAGE: SITE.url + fm(meta.ogimage, "/assets/img/og-default.png"),
      OG_IMAGE_ALT: fm(
        meta.ogalt,
        'BenefitDial social card: "Your raise. Your plan. Side by side." — Social Security COLA plus Medicare plan changes, with no phone calls.'
      ).replace(/"/g, "&quot;"),

Then add to the four page front matters:

src/pages/cola-calculator.html (after `ogtype: website`):
  ogimage: /assets/img/og-cola-calculator-2027.png
  ogalt: BenefitDial social card for the COLA calculator: "What will your raise actually be?" — put in your benefit and we subtract Medicare Part B. Beside the text, an illustration of a sample benefit statement marked SAMPLE.

src/pages/medicare-plan-changes.html (after `ogtype: website`):
  ogimage: /assets/img/og-plan-changes-2027.png
  ogalt: BenefitDial social card for the plan-change tool: "What changed in your plan?" — premium, deductible, out-of-pocket and star rating, with an illustration of a sample 2026 plan card and a sample 2027 plan card side by side, marked SAMPLE.

src/pages/guide-cola.html (after `ogtype: article`):
  ogimage: /assets/img/og-guide-cola-2027.png
  ogalt: BenefitDial social card for the COLA guide: "How the 2027 COLA is calculated" — CPI-W, a worked example, and the Part B bite. Beside the text, a bar chart of recent cost-of-living adjustments: 8.7% in 2023, 3.2% in 2024, 2.5% in 2025, 2.8% in 2026, and a dashed outline bar for the 2027 estimate.

src/pages/key-dates.html (after `ogtype: article`):
  ogimage: /assets/img/og-key-dates-2027.png
  ogalt: BenefitDial social card for the key-dates page: "Two announcements, one busy autumn" — a timeline showing the COLA announced in mid-October, Medicare Open Enrollment from October 15 to December 7, and both changes taking effect January 1.

And at src/layout.html:14, above og:site_name:
  <meta property="og:locale" content="en_US">
```

**Alt text** — n/a — this item adds no image. It makes the two alt attributes at src/layout.html:25 and :30 per-page, so each card carries the alt text written out in OG-01 through OG-05.

**Dark mode** — n/a — metadata only.

**Compliance check** — Making the alt per-page is itself the compliance-relevant part: a screen-reader user must be told the card shows a SAMPLE document, and the shared hardcoded alt cannot say that. The default alt string stays exactly as it is today so no existing behaviour regresses.

---

## SO-3 · og-cola-calculator-2027.png — dedicated card for the COLA tool

> **P0** · effort: small · kind: `og-social-image` · route: /cola-calculator
> Source lens: Social & identity

**Why it earns its place.** This is the single highest-value per-route card on the site, because of how it actually gets shared: an adult child texts both tool links to a parent in one iMessage thread. Today those two bubbles are pixel-identical — same teal card, same "Your raise. Your plan." — and the parent has no way to tell which one is the COLA calculator without reading the small grey title line. After this, the card says what the tool does and shows a benefit slip, so the right bubble is identifiable at a glance by someone who is exactly the audience this site was built large-type for. Secondary: robots meta ships `max-image-preview:large` (scripts/build.mjs:319), so Google Discover can surface this image at full width on Android — to this demographic, on this topic, in October.

**Insertion point.** New file src/assets/img/og-cola-calculator-2027.svg (source) → src/assets/img/og-cola-calculator-2027.png (output). Register at scripts/gen-images.mjs:16 — add a JOBS entry directly after the existing og-default line and before the apple-touch-icon line. Wire to the page at src/pages/cola-calculator.html:8 — add `ogimage:` and `ogalt:` front-matter keys on the line after `ogtype: website`, inside the closing `-->` at line 10. Requires CON-08 to be applied first.

**Specification** — 1200x630, 1.9048:1, PNG colour type 3, 128-entry palette, adaptive filtering, zlib 9. Byte budget ≤ 31,000 — the prototype of exactly this card measured 29,967. Filename CARRIES THE YEAR on purpose: /assets/* is `max-age=0, must-revalidate` but assets are not content-hashed, and social crawlers key their cache on the URL, not on Cache-Control. Baking "2027" into pixels behind a stable filename would leave Facebook and Slack serving a 2027 card in 2028; year-stamping the filename makes the URL change when the pixels change. No CLS impact (no <img> tag). og:image:width/height at src/layout.html:20-21 remain correct at 1200/630.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG, rasterised by the existing Playwright job, then run through the OG-01 indexed re-encoder. Write to src/assets/img/og-cola-calculator-2027.svg. This is the OG-01 template with four slots changed and the single-document art panel; [BANDS] means the 14 background rects from OG-01, verbatim.

<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="BenefitDial COLA calculator">
[BANDS]
  <rect x="0" y="534" width="1200" height="96" fill="#0a3438"/>
  <g transform="translate(72,60)">
    <rect width="88" height="88" rx="20" fill="#12666b"/>
    <circle cx="44" cy="44" r="27.5" fill="none" stroke="#ffffff" stroke-width="6.5"/>
    <path d="M44 24.5 V44 L58 52" fill="none" stroke="#f5c451" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="112" y="52" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="#ffffff">BenefitDial</text>
    <text x="112" y="82" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="21" font-weight="600" fill="#7fd3d6">Independent · ad-supported</text>
  </g>
  <text x="72" y="238" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="2.5" fill="#f5c451">SOCIAL SECURITY · COLA CALCULATOR</text>
  <text x="72" y="318" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#ffffff">What will your raise</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#f5c451">actually be?</text>
  <text x="72" y="460" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="29" font-weight="500" fill="#bfe0e0">Put in your benefit. We subtract Medicare Part B.</text>
  <g font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#8fe6d3">
    <text x="72" y="592">✓ No phone number</text>
    <text x="452" y="592">✓ No data selling</text>
    <text x="812" y="592">✓ Free &amp; ad-supported</text>
  </g>
  <g transform="translate(770,196)">
    <rect x="6" y="8" width="230" height="250" rx="16" fill="#062a2d" opacity=".45"/>
    <rect x="0" y="0" width="230" height="250" rx="16" fill="#e9f5f5"/>
    <path d="M0 16A16 16 0 0 1 16 0h198a16 16 0 0 1 16 16v34H0z" fill="#146066"/>
    <rect x="18" y="16" width="120" height="9" rx="4.5" fill="#e9f5f5" opacity=".92"/>
    <rect x="18" y="32" width="78" height="7" rx="3.5" fill="#f5c451"/>
    <rect x="18" y="72" width="150" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="90" width="188" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="146" width="96" height="16" rx="5" fill="#0b3b3f"/>
    <rect x="18" y="168" width="140" height="5" rx="2.5" fill="#f5c451"/>
    <rect x="18" y="192" width="164" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="18" y="210" width="104" height="8" rx="4" fill="#bcd7d8"/>
    <rect x="0" y="258" width="108" height="30" rx="15" fill="#0b3b3f" stroke="#f5c451" stroke-width="1.5"/>
    <text x="54" y="279" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1" fill="#f5c451">SAMPLE</text>
  </g>
</svg>

Measured contrast on the rendered card, all AA-comfortable: gold eyebrow #f5c451 on #0d4448 = 6.66:1; white headline #ffffff on #0d4247 = 11.13:1; gold headline #f5c451 on #0d4146 = 6.93:1; subhead #bfe0e0 on #0c4044 = 8.16:1; ticks #8fe6d3 on #0a3438 = 9.24:1; sub-wordmark #7fd3d6 on #0f494e = 5.85:1.

MUST NOT APPEAR: the projected 3.6% figure or any COLA percentage; any dollar amount; any legible text inside the slip; a person, headset or telephone; any SSA or Medicare mark; any eagle, seal, dome or flag colour. The slip's "amount" is a dark bar with a gold underline — recognisable as a benefit statement in silhouette, unreadable as a document.
```

**Alt text** — BenefitDial social card for the COLA calculator: "What will your raise actually be?" — put in your benefit and we subtract Medicare Part B. Beside the text, an illustration of a sample benefit statement marked SAMPLE.

**Dark mode** — No variant. Opaque dark card, no transparency, identical in every client theme; crawlers never see prefers-color-scheme and no page renders this file.

**Compliance check** — The illustrated benefit slip is deliberately unreadable — every field is an abstract grey bar, and it carries the SAMPLE pill lifted from the site's own hero art. That is the specific risk here: a realistic-looking Social Security statement on a shared card is the fastest way to look like a government mailing, and this composition cannot be mistaken for one. The card also states no percentage, so it never appears to publish an official COLA figure ahead of SSA. No agent, no headset, no phone number, no carrier, no seal.

---

## SO-4 · og-plan-changes-2027.png — dedicated card for the Medicare plan-diff tool

> **P0** · effort: small · kind: `og-social-image` · route: /medicare-plan-changes
> Source lens: Social & identity

**Why it earns its place.** The other half of the iMessage pair, and the page most likely to be posted into a Facebook group or a senior-centre newsletter during Open Enrollment. It is also the one page where a generic card is actively misleading: the page's whole job is a year-over-year comparison, and the card should show two cards and an arrow so the reader understands what they are about to get before they tap. On Facebook the image is roughly 8x the visual weight of the title text, so this is where comprehension actually happens.

**Insertion point.** New file src/assets/img/og-plan-changes-2027.svg → .png. Register at scripts/gen-images.mjs:16 (JOBS array, after the OG-02 entry). Wire at src/pages/medicare-plan-changes.html:9 — add `ogimage:` and `ogalt:` after `ogtype: website`, inside the front-matter block that closes at line 11. Requires CON-08.

**Specification** — 1200x630, 1.9048:1, PNG colour type 3, 128-entry palette, adaptive filtering, zlib 9. Byte budget ≤ 31,000. Year-stamped filename for the same crawler-cache reason as OG-02. No CLS impact.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG → existing Playwright job → OG-01 re-encoder. Write to src/assets/img/og-plan-changes-2027.svg. [BANDS] = the 14 background rects from OG-01, verbatim. Chrome (bands, promise strip, brand lockup, tick row) is identical to OG-02 — copy it — and only the four text slots and the art group change:

  <text x="72" y="238" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="2.5" fill="#f5c451">MEDICARE · PLAN CHANGES 2027</text>
  <text x="72" y="318" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#ffffff">What changed in</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#f5c451">your plan?</text>
  <text x="72" y="460" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="29" font-weight="500" fill="#bfe0e0">Premium, deductible, out-of-pocket, star rating.</text>

Art group — two plan cards, this year and next, with a gold arrow between them:

  <g transform="translate(762,192)">
    <rect x="6" y="8" width="178" height="156" rx="16" fill="#062a2d" opacity=".45"/>
    <rect x="0" y="0" width="178" height="156" rx="16" fill="#e9f5f5"/>
    <path d="M0 16A16 16 0 0 1 16 0h146a16 16 0 0 1 16 16v22H0z" fill="#146066"/>
    <text x="16" y="27" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#e9f5f5">2026</text>
    <rect x="16" y="58" width="120" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="16" y="78" width="94" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="16" y="98" width="110" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="16" y="122" width="58" height="20" rx="10" fill="#7fd3d6"/>
  </g>
  <g transform="translate(956,236)">
    <path d="M0 12 H34" stroke="#f5c451" stroke-width="6" stroke-linecap="round"/>
    <path d="M26 3 L36 12 L26 21" fill="none" stroke="#f5c451" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g transform="translate(1010,192)">
    <rect x="6" y="8" width="118" height="156" rx="16" fill="#062a2d" opacity=".45"/>
    <rect x="0" y="0" width="118" height="156" rx="16" fill="#e9f5f5"/>
    <path d="M0 16A16 16 0 0 1 16 0h86a16 16 0 0 1 16 16v22H0z" fill="#1a7a80"/>
    <text x="16" y="27" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#e9f5f5">2027</text>
    <rect x="16" y="58" width="86" height="9" rx="4.5" fill="#d3a3a3"/>
    <rect x="16" y="78" width="70" height="9" rx="4.5" fill="#a9cbb0"/>
    <rect x="16" y="98" width="78" height="9" rx="4.5" fill="#bcd7d8"/>
    <rect x="16" y="122" width="58" height="20" rx="10" fill="#f5c451"/>
  </g>
  <g transform="translate(762,392)">
    <rect x="0" y="0" width="108" height="30" rx="15" fill="#0b3b3f" stroke="#f5c451" stroke-width="1.5"/>
    <text x="54" y="21" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1" fill="#f5c451">SAMPLE</text>
  </g>

The two muted bars on the 2027 card (#d3a3a3 warm, #a9cbb0 cool) read as "one thing went up, one thing went down" without stating any figure or implying a direction of recommendation. MUST NOT APPEAR: any real or invented carrier name, any contract or plan ID (no H1234-001), any dollar amount, any star count, any "best plan" / ranking / badge language, any government mark, any person or headset. The two cards must be visually equivalent in weight — neither may look like the winner.
```

**Alt text** — BenefitDial social card for the plan-change tool: "What changed in your plan?" — premium, deductible, out-of-pocket and star rating, with an illustration of a sample 2026 plan card and a sample 2027 plan card side by side, marked SAMPLE.

**Dark mode** — No variant. Opaque dark card; unaffected by viewer theme in every unfurl surface.

**Compliance check** — The two plan cards are labelled only by year and carry no carrier name, plan name, contract ID or dollar figure — the exact things that would make this read as a real plan document or a carrier endorsement. The SAMPLE pill is present because the underlying dataset is sample data (src/data/manifest.json sets sample:true) and the page says so loudly; the card must not out-promise the tool. Crucially, the two cards are drawn at equal visual weight with no tick, crown or highlight, so the image never implies which plan is better — implying a plan recommendation is precisely the line that would drag this site toward the TPMO definition it deliberately sits outside.

---

## SO-5 · og-guide-cola-2027.png — card for the COLA explainer, the page that gets linked on announcement day

> P1 · effort: small · kind: `og-social-image` · route: /guides/2027-social-security-cola
> Source lens: Social & identity

**Why it earns its place.** This is the one editorial page with a genuine seasonal spike: cola.json puts the next SSA announcement at 2026-10-14, and on that day "what is the COLA and how is it worked out" links get pasted into forums, group chats and comment threads by people arguing about the number. A card that shows the shape of recent COLAs — a tall 2023 bar collapsing to a short one — communicates the article's actual thesis (the raise is smaller than people remember) in the half-second a feed scroll allows, which no title line can do. It also earns its bytes on Google Discover, where max-image-preview:large lets this run full-width.

**Insertion point.** New file src/assets/img/og-guide-cola-2027.svg → .png. Register at scripts/gen-images.mjs:16 (JOBS array). Wire at src/pages/guide-cola.html:6 — add `ogimage:` and `ogalt:` after the `ogtype: article` line, inside the front-matter block. Requires CON-08.

**Specification** — 1200x630, 1.9048:1, PNG colour type 3, 128-entry palette, adaptive filtering, zlib 9. Byte budget ≤ 31,000. Year-stamped filename. Note the deliberate asymmetry in the chart labels: only CONFIRMED years carry a printed percentage (2023 8.7, 2024 3.2, 2025 2.5, 2026 2.8 — all `status: official` in src/data/cola-history.csv and permanently fixed), while 2027 is a dashed outline bar with no number. That keeps the card permanently accurate even after SSA announces, and it is why this file can be baked rather than regenerated.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG → existing Playwright job → OG-01 re-encoder. Write to src/assets/img/og-guide-cola-2027.svg. [BANDS] and all chrome exactly as OG-02. Slots:

  <text x="72" y="238" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="2.5" fill="#f5c451">GUIDE · SOCIAL SECURITY COLA</text>
  <text x="72" y="318" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#ffffff">How the 2027 COLA</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#f5c451">is calculated</text>
  <text x="72" y="460" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="29" font-weight="500" fill="#bfe0e0">CPI-W, a worked example, and the Part B bite.</text>

Art group — a five-bar column chart on a 220px-tall baseline at x=770..1128, matching the site's own COLA chart idiom (teal bars, gold for the current confirmed year, dashed outline for the estimate). Bar width 52, gap 30, baseline y=452, heights scaled 8.7% → 200px:

  <g transform="translate(770,0)" font-family="Segoe UI, Arial, Helvetica, sans-serif">
    <line x1="0" y1="452" x2="358" y2="452" stroke="#2a9199" stroke-width="2"/>
    <rect x="0"   y="252" width="52" height="200" rx="4" fill="#2a9199"/>
    <rect x="82"  y="378" width="52" height="74"  rx="4" fill="#2a9199"/>
    <rect x="164" y="395" width="52" height="57"  rx="4" fill="#2a9199"/>
    <rect x="246" y="388" width="52" height="64"  rx="4" fill="#f5c451"/>
    <rect x="328" y="370" width="52" height="82"  rx="4" fill="none" stroke="#8fe6d3" stroke-width="3" stroke-dasharray="7 6"/>
    <g font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle">
      <text x="26"  y="240">8.7%</text>
      <text x="108" y="366">3.2%</text>
      <text x="190" y="383">2.5%</text>
      <text x="272" y="376">2.8%</text>
    </g>
    <text x="354" y="358" font-size="20" font-weight="800" fill="#8fe6d3" text-anchor="middle">?</text>
    <g font-size="18" font-weight="600" fill="#bfe0e0" text-anchor="middle">
      <text x="26"  y="478">2023</text>
      <text x="108" y="478">2024</text>
      <text x="190" y="478">2025</text>
      <text x="272" y="478">2026</text>
      <text x="354" y="478">2027</text>
    </g>
    <text x="354" y="498" font-size="16" font-weight="700" fill="#8fe6d3" text-anchor="middle">est.</text>
  </g>

Note the 2027 bar's height is arbitrary-but-modest and is drawn as a dashed OUTLINE with a "?" and an "est." label rather than a value — it depicts uncertainty, not a forecast. MUST NOT APPEAR: any number on the 2027 bar; the 3.6% projection; any SSA or BLS logotype; the words "official" or "announced"; any person, phone or headset; any seal, eagle or flag colour.
```

**Alt text** — BenefitDial social card for the COLA guide: "How the 2027 COLA is calculated" — CPI-W, a worked example, and the Part B bite. Beside the text, a bar chart of recent cost-of-living adjustments: 8.7% in 2023, 3.2% in 2024, 2.5% in 2025, 2.8% in 2026, and a dashed outline bar for the 2027 estimate.

**Dark mode** — No variant. Opaque dark card.

**Compliance check** — The chart labels only years whose COLA is officially confirmed and permanently fixed, and draws the unannounced year as a dashed empty outline with a question mark — so the card can never be screenshotted and circulated as BenefitDial publishing an official 2027 figure, and it never goes stale in a crawler cache. It carries no SSA or BLS mark despite plotting their data, so it cannot read as a government release. No person, phone, headset or carrier appears.

---

## SO-6 · og-key-dates-2027.png — card for the fall calendar page

> P1 · effort: small · kind: `og-social-image` · route: /key-dates
> Source lens: Social & identity

**Why it earns its place.** "Here are the dates" is the most forwardable thing on the site — it is the post a SHIP volunteer, a church bulletin, a senior-centre newsletter or a Facebook caregiving group actually shares, because it is useful to everyone rather than personal to one person. A card carrying the three dates as text means the forward is useful even to people who never click, which is a strange thing to optimise for until you notice that a card people don't click but do trust is how a small site gets linked. The current generic card gives a forwarder nothing to point at.

**Insertion point.** New file src/assets/img/og-key-dates-2027.svg → .png. Register at scripts/gen-images.mjs:16 (JOBS array). Wire at src/pages/key-dates.html:6 — add `ogimage:` and `ogalt:` after `ogtype: article`. Requires CON-08.

**Specification** — 1200x630, 1.9048:1, PNG colour type 3, 128-entry palette, adaptive filtering, zlib 9. Byte budget ≤ 31,000. Year-stamped filename. The dates baked in are the statutory ones only — the AEP window (October 15 – December 7) is fixed by 42 CFR 422.62 and coverage start January 1 is fixed by the same; the COLA announcement is deliberately labelled "Mid-October", not the projected 2026-10-14 from cola.json, because that specific date is a BLS-schedule estimate and would be wrong in pixels if it moved.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG → existing Playwright job → OG-01 re-encoder. Write to src/assets/img/og-key-dates-2027.svg. [BANDS] and all chrome exactly as OG-02. Slots:

  <text x="72" y="238" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="2.5" fill="#f5c451">KEY DATES · FALL 2026</text>
  <text x="72" y="318" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#ffffff">Two announcements,</text>
  <text x="72" y="392" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#f5c451">one busy autumn.</text>
  <text x="72" y="460" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="29" font-weight="500" fill="#bfe0e0">COLA day, Open Enrollment, and when it starts.</text>

(The headline is the page's own H2, verified on the rendered page. "Two announcements," is 18 chars and "one busy autumn." is 16 — both inside the 21-char/64px limit.)

Art group — a vertical timeline, three stops, matching the site's own .timeline idiom:

  <g transform="translate(778,180)" font-family="Segoe UI, Arial, Helvetica, sans-serif">
    <line x1="10" y1="12" x2="10" y2="250" stroke="#1a7a80" stroke-width="4" stroke-linecap="round"/>
    <circle cx="10" cy="16" r="10" fill="#f5c451"/>
    <text x="42" y="12" font-size="26" font-weight="800" fill="#ffffff">Mid-October</text>
    <text x="42" y="42" font-size="20" font-weight="500" fill="#bfe0e0">The COLA is announced</text>
    <circle cx="10" cy="126" r="10" fill="#8fe6d3"/>
    <text x="42" y="122" font-size="26" font-weight="800" fill="#ffffff">Oct 15 – Dec 7</text>
    <text x="42" y="152" font-size="20" font-weight="500" fill="#bfe0e0">Medicare Open Enrollment</text>
    <circle cx="10" cy="236" r="10" fill="#7fd3d6"/>
    <text x="42" y="232" font-size="26" font-weight="800" fill="#ffffff">January 1</text>
    <text x="42" y="262" font-size="20" font-weight="500" fill="#bfe0e0">Both changes take effect</text>
  </g>

Check: longest art string is "Medicare Open Enrollment" at 20px ≈ 232px, starting at x=778+42=820, ending ≈1052 — inside the 1128 right margin. MUST NOT APPEAR: a specific COLA announcement date; any COLA percentage; any premium figure; a calendar page bearing a government seal; any person, phone or headset; any carrier. No SAMPLE pill here — nothing on this card is mock data, and adding one would falsely undermine dates that are statutory.
```

**Alt text** — BenefitDial social card for the key-dates page: "Two announcements, one busy autumn" — a timeline showing the COLA announced in mid-October, Medicare Open Enrollment from October 15 to December 7, and both changes taking effect January 1.

**Dark mode** — No variant. Opaque dark card.

**Compliance check** — The only dates in pixels are the statutory AEP window and the January 1 effective date, plus a deliberately vague "Mid-October" for the announcement — nothing here can become false, and nothing reads as an official notice. The timeline carries no seal, calendar-with-eagle motif, or agency wordmark, so a forwarded copy cannot be mistaken for a CMS or SSA mailing. No agent imagery and no "call to enroll" framing — the card advertises information, not assistance.

---

## SO-7 · Rebuild apple-touch-icon.png from a dedicated full-bleed source — it currently ships baked-in white corners

> **P0** · effort: trivial · kind: `icon` · route: sitewide (src/layout.html:42, and the JSON-LD Organization logo at src/layout.html:62)
> Source lens: Social & identity

**Why it earns its place.** Measured: the shipped apple-touch-icon.png contains 2,141 pure-white pixels in its corner regions. favicon.svg has `rx="14"` on a 64-unit viewBox, so its corners are transparent, and gen-images.mjs rasterises it by screenshotting it on a white page — the transparency becomes white paint. iOS then applies its own squircle mask (≈22.4% radius) over art that is already rounded at 21.9%, which is close enough that a white fringe can survive on the home screen of the device this site's audience most likely uses. The same file is the Organization `logo` in JSON-LD, so those white corners are what Google has on file as the brand mark. Fixing it also drops 6,888 bytes to a measured 2,373 — a real subresource this time, re-validated on every visit under the `must-revalidate` policy, unlike the OG images.

**Insertion point.** New source file src/static/icon-touch.svg (do NOT reuse favicon.svg). scripts/gen-images.mjs:16 — change the second JOBS entry from `{ svg: "src/static/favicon.svg", png: "src/static/apple-touch-icon.png", w: 180, h: 180 }` to point at the new source. The output path src/static/apple-touch-icon.png:1 is overwritten in place, so src/layout.html:42 and :62 need no edit.

**Specification** — 180x180, 1:1, PNG colour type 3 (8-bit indexed), 64-entry palette, no alpha, byte budget ≤ 2,600 (measured 2,373; currently 6,888 — a 65% cut). Fully opaque #0f4b50 to all four edges: iOS masks the icon itself, so any rounding baked into the art is at best redundant and at worst a fringe. Explicit dimensions are irrelevant here (no <img> tag, so no CLS surface). Keep the filename and path so src/layout.html:42 and the JSON-LD `width: 180 / height: 180` at layout.html:64-65 stay truthful — verify with `file src/static/apple-touch-icon.png` that it still reports 180 x 180.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG → existing Playwright job → the OG-01 indexed re-encoder at 64 colours. Write verbatim to src/static/icon-touch.svg. This is favicon.svg's geometry scaled 64→180 with the rounded rect replaced by a full-bleed square:

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" role="img" aria-label="BenefitDial">
  <rect width="180" height="180" fill="#0f4b50"/>
  <circle cx="90" cy="90" r="53" fill="none" stroke="#ffffff" stroke-width="12.6"/>
  <path d="M90 56 V90 L115 105" fill="none" stroke="#f5c451" stroke-width="12.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="90" cy="90" r="7.3" fill="#ffffff"/>
</svg>

Acceptance test after rendering: decode the PNG and assert pixel (0,0), (179,0), (0,179) and (179,179) all equal (15,75,80). If any is (255,255,255) the rounded rect is still in the source. Do NOT touch src/static/favicon.svg — its rounded corners are correct for a browser tab, where nothing masks it and a full-bleed square would look heavy at 16px. Two sources, two jobs, one shared geometry. MUST NOT APPEAR: any text or wordmark (illegible at 60px on a home screen), any seal or flag colour, any element outside the central 70% of the canvas.
```

**Alt text** — n/a — decorative platform icon, referenced by <link rel="apple-touch-icon"> and never rendered in page content. It carries no alt attribute. Its accessible name comes from the manifest `name` and the page <title>. The JSON-LD ImageObject at src/layout.html:66 already supplies `caption: "BenefitDial"`.

**Dark mode** — Deliberately single-look: a solid #0f4b50 field in both themes, matching the `theme_color` at src/layout.html:9 and site.webmanifest:8. iOS gives no dark-mode variant slot for apple-touch-icon, and the teal reads correctly on both the light and dark iOS home-screen wallpapers — which is exactly why the icon must be opaque rather than transparent-cornered.

**Compliance check** — The mark is a clock, not a shield, eagle, star or dome — nothing in it can be read as a federal agency emblem sitting on a user's home screen next to their real government apps, which is the specific confusion an icon (unlike a page) creates silently. The change also removes nothing and adds nothing symbolic; it only makes the existing mark opaque.

---

## SO-8 · Make site.webmanifest truthful — the single icon entry claims "maskable" and it is not

> P1 · effort: small · kind: `icon` · route: sitewide (src/static/site.webmanifest, linked at src/layout.html:44)
> Source lens: Social & identity

**Why it earns its place.** The manifest today declares exactly one icon — `/favicon.svg`, `sizes: "any"`, `purpose: "any maskable"` — and two of those three claims are wrong. favicon.svg is a rounded rect with transparent corners and no maskable safe zone, so a platform that honours `maskable` and crops to a square or a wider shape will show cut corners or transparent wedges; and declaring one icon as both `any` and `maskable` is explicitly discouraged, because a maskable icon rendered as `any` appears zoomed and padded. Note `display: "browser"` (site.webmanifest:6) means no install prompt is possible today, so this is a truthfulness fix first and an installability fix only if someone later changes that line — which is why I am not also recommending screenshots. The cost of honesty here is 8.7KB of new icons and one JSON edit.

**Insertion point.** src/static/site.webmanifest:9-11 — replace the whole `icons` array. Two new source files src/static/icon-maskable.svg → src/static/icon-192.png and src/static/icon-512.png. Register both at scripts/gen-images.mjs:17, appended to the JOBS array after the apple-touch-icon entry.

**Specification** — Two new PNGs from one 512-unit source. icon-192.png: 192x192, 1:1, PNG colour type 3, 64-entry palette, ≤ 2,400 bytes (measured 2,247). icon-512.png: 512x512, 1:1, same encoding, ≤ 6,800 bytes (measured 6,455). Both fully opaque #0f4b50 edge to edge with the clock inside the maskable safe zone (all art within a centred circle of diameter 0.66 x canvas, comfortably inside the 0.8 requirement — the clock's outer stroke radius is 145.5 of 512, i.e. 28.4% of the canvas, against a 40% safe radius). Manifest edit adds ~250 bytes of JSON. `purpose` must be split: the SVG keeps `"any"` only; the two PNGs are `"maskable"` only. Also add `"id": "/"` and `"scope": "/"` and `"lang": "en-US"` while the file is open. Verify with `file src/static/icon-512.png` that it reports 512 x 512 — the whole point of this item is that declared sizes match measured ones.

**Generation prompt — copy this verbatim**

```text
Hand-authored SVG → existing Playwright job (rendered twice, at 512 and 192) → the OG-01 indexed re-encoder at 64 colours. Write verbatim to src/static/icon-maskable.svg:

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="BenefitDial">
  <rect width="512" height="512" fill="#0f4b50"/>
  <circle cx="256" cy="256" r="130" fill="none" stroke="#ffffff" stroke-width="31"/>
  <path d="M256 174 V256 L317 294" fill="none" stroke="#f5c451" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="18" fill="#ffffff"/>
</svg>

Replace src/static/site.webmanifest lines 9-11 with:

  "id": "/",
  "scope": "/",
  "lang": "en-US",
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]

Acceptance test: decode both PNGs and assert every corner pixel equals (15,75,80), and assert no pixel of the clock (white or #f5c451) falls outside a centred circle of radius 0.4 x width. MUST NOT APPEAR: any wordmark or text, any rounded-corner masking baked into the art, any transparency, any seal or flag motif.
```

**Alt text** — n/a — manifest icons are platform chrome and take no alt attribute. The accessible name is site.webmanifest `name`: "BenefitDial".

**Dark mode** — Single opaque #0f4b50 look in both themes, matching manifest `theme_color` (#0f4b50) and `background_color` (#fbfcfc). Android adaptive-icon backgrounds are supplied by the launcher, not the page, so no prefers-color-scheme variant exists or is needed.

**Compliance check** — Same reasoning as IMG-07 — a clock face, no emblem, nothing that would sit in an app drawer looking like a federal agency app. The manifest `description` at site.webmanifest:4 already states "Independent, ad-supported" and stays untouched.

# Group F — Trust, authorship and accountability

---

## TR-1 · /editorial-standards — the accountability page the site has never had

> **P0** · effort: medium · kind: `content-page` · route: new route: /editorial-standards
> Source lens: Trust & authority

**Why it earns its place.** Today a reader who asks "who decided $202.90 is the right number and who do I complain to?" has no page to land on. /about answers 'how do you make money', /how-it-works answers 'which files', neither answers 'who is accountable'. This is the single missing node the other ten items link into: the byline points here, the corrections mailto points here, the Organization JSON-LD points here. An adult child vetting the site for a parent, and a Google quality rater applying the YMYL 'who is responsible for this content' test, both stop at the same wall right now and this is the page that removes it.

**Insertion point.** New file `src/pages/editorial-standards.html`. Linked from `src/partials/footer.html:31` — insert a new `<li>` immediately after the existing `<li><a href="/how-it-works">How it works &amp; data sources</a></li>`, i.e. as line 32, so it sits between the methodology link and the privacy pledge in the ABOUT column. Also referenced by CON-02 (byline), CON-03 (correction note) and CON-06 (Organization.publishingPrinciples).

**Specification** — Body-copy page in the existing section rhythm (alternating `.section` / `.section--wash`, `.wrap.prose`, max-width 52rem). No new CSS beyond `.byline`/`.source-note`/`.correction-note` introduced by CON-02/03/05. Target 900–1,100 visible words — long enough to be a real policy, short enough that a 65+ reader finishes it. Zero images. Zero new bytes on any other route beyond one footer link (~70 bytes). Front matter exactly:
```
title: Editorial Standards & Corrections Policy | BenefitDial
description: Who writes BenefitDial, how each figure is checked against its primary document before publication, and how to tell us we got one wrong.
slug: editorial-standards
nav: about
ogtype: article
head: <meta property="article:published_time" content="{{PAGE_PUBLISHED}}"><meta property="article:modified_time" content="{{PAGE_MODIFIED}}"><meta property="article:section" content="Editorial">
priority: 0.6
changefreq: yearly
```
Section ids are load-bearing (other items deep-link them): `#who`, `#how-we-check`, `#estimates`, `#unverified`, `#corrections`, `#contact`.
HUMAN INPUT REQUIRED before this ships: `{{EDITOR_NAME}}` (a real named person who takes responsibility for the figures), `{{EDITOR_ROLE}}` (e.g. "editor"), `{{EDITOR_BACKGROUND}}` (2–3 sentences of genuine relevant background — do not write this from imagination), `{{REVIEWER_NAME}}` + `{{REVIEWER_BACKGROUND}}` (may be the same person; if so, delete the reviewer paragraph rather than inventing a second name), `{{CORRECTIONS_EMAIL}}`, `{{LEGAL_ENTITY_NAME}}`. A pseudonymous "BenefitDial Editorial Team" byline is worse than useless here — raters discount it and a regulator reads it as evasion.

**Draft copy / markup — ready to insert**

```html
<h1>Editorial standards and corrections</h1>

<p class="lead prose">BenefitDial publishes numbers that people use to make decisions about money and medical coverage. That deserves a page explaining who writes those numbers down, what has to happen before one goes live, and what we do when we get one wrong. This is that page.</p>

<h2 id="who">Who writes this site</h2>
<p>BenefitDial is written and maintained by {{EDITOR_NAME}}, {{EDITOR_ROLE}}. {{EDITOR_BACKGROUND}}</p>
<p>Every figure on this site is checked before publication by {{REVIEWER_NAME}}. {{REVIEWER_BACKGROUND}}</p>
<p>We are not insurance agents, brokers, or financial advisers, and we are not qualified to tell you which plan to choose — we are careful readers of public government files, and that is the whole job. If you want advice about your specific situation, your State Health Insurance Assistance Program (SHIP) offers free, unbiased counselling, and 1-800-MEDICARE can answer questions about your own coverage. We can only tell you what the published files say.</p>
<p>BenefitDial is operated by {{LEGAL_ENTITY_NAME}}. How the site is funded, and what we refuse to take money for, is set out in full on <a href="/about#funding">who is behind BenefitDial</a>.</p>

<h2 id="how-we-check">How a figure gets onto this site</h2>
<p>There is one rule underneath everything here: <strong>a number is only published once someone has traced it to the document that sets it.</strong> Not a news article about the document. The document. In practice that means four steps.</p>
<ol>
  <li><strong>Find the governing document.</strong> The Part B premium is set in a Federal Register notice, not in a press release. The COLA comes from the Social Security Administration's announcement, which in turn comes from a BLS index series with a specific name. We record which document, and its date, alongside every figure.</li>
  <li><strong>Read the figure out of it directly.</strong> Not from a summary, not from another website, not from memory.</li>
  <li><strong>Write the source down next to the number.</strong> Every statutory figure on this site carries a "Source" line naming the document it came from and the date we checked it. If you cannot see where a number came from, that is a bug — please report it.</li>
  <li><strong>Label anything that is not yet official.</strong> Estimates are marked as estimates everywhere they appear, with the name of whoever produced the estimate and the date the official figure is expected.</li>
</ol>
<p>Figures live in plain data files in the site's source code, not typed into the pages. That is deliberate: it means a figure cannot go stale in one paragraph while being updated in another, and the site refuses to build at all if a figure it quotes is missing.</p>

<h2 id="estimates">How we label estimates</h2>
<p>Some of the most useful numbers in the fall are not official yet. The following year's cost-of-living adjustment, for example, is estimated by independent analysts months before the Social Security Administration announces it.</p>
<p>We publish those estimates, because they are genuinely useful, and we hold ourselves to three rules about them: we name who produced the estimate, we state the date the official figure is expected, and we never let an estimate appear without the word "estimate" beside it. When the official number lands, the estimate is replaced — not quietly left in place.</p>
<p>Our Medicare plan comparison tool works the same way. Until CMS publishes the official plan files for the coming year, the tool runs on a clearly-marked sample dataset built to the same structure, so you can see how the comparison works before the real data exists. Every sample plan name begins with the word "Sample," and the tool says so in a warning you cannot miss.</p>

<h2 id="unverified">When we could not read the primary document ourselves</h2>
<div class="callout callout--warn">
  <p class="callout__title">We tell you when a figure rests on secondary sources</p>
  <p style="margin:0;">Occasionally we can corroborate a figure across several independent, reputable sources but have not yet opened the governing document ourselves. When that is true, we say so on the figure — not in a footnote — with a "Secondary sources only" label, and we name the document that still needs to be read. It stays labelled until someone has read it. We would rather show you the seam than paper over it.</p>
</div>

<h2 id="corrections">Our corrections policy</h2>
<p>We will get something wrong. When that happens, here is exactly what we do.</p>
<ul>
  <li><strong>We check it against the source document first</strong> — not against what we published, and not against what another site says.</li>
  <li><strong>We fix a factual error as soon as we have confirmed it</strong>, and always within five working days of confirming it.</li>
  <li><strong>We say what changed.</strong> When we correct a figure or a date that a reader could have acted on, we add a dated correction note to the page itself. We do not silently edit a number and move on.</li>
  <li><strong>We do not remove a correction later.</strong> The note stays on the page.</li>
  <li><strong>Typos, broken links and clearer wording</strong> are just fixed, without a note. The note is for facts, not for grammar.</li>
</ul>
<p>If a figure on this site turns out to have been wrong in a way that could have affected a coverage decision, we would rather you knew than that the page looked clean.</p>

<h2 id="contact">How to reach us</h2>
<p>Email is the only way to contact us, and that is on purpose — we do not run a call centre and we never ask for your phone number.</p>
<ul>
  <li><strong>A number looks wrong:</strong> <a href="mailto:{{CORRECTIONS_EMAIL}}?subject=BenefitDial%20correction">{{CORRECTIONS_EMAIL}}</a>. Tell us the page and the figure; you do not need to be sure, and you do not need to explain why.</li>
  <li><strong>A privacy question:</strong> <a href="mailto:{{PRIVACY_EMAIL}}?subject=BenefitDial%20privacy%20question">{{PRIVACY_EMAIL}}</a>, and see our <a href="/privacy">privacy pledge</a>.</li>
</ul>
<p>One thing we cannot do, however politely you ask: look up <em>your</em> Medicare plan or <em>your</em> Social Security record. We hold no personal information about anyone and we have no access to government systems. For anything about your own coverage, use the official <a href="https://www.medicare.gov/plan-compare/" rel="nofollow noopener" target="_blank">Medicare Plan Finder</a>, <a href="https://www.ssa.gov/" rel="nofollow noopener" target="_blank">SSA.gov</a>, or call 1-800-MEDICARE (TTY 1-877-486-2048).</p>
<p class="muted">Please do not send us your Medicare number, Social Security number, or any medical information. We do not want it, we have no secure way to handle it, and we will delete any message that contains it.</p>
```

**Dark mode** — Pure text on existing role tokens (--bc-ink, --bc-heading, --bc-surface, --bc-surface-2). Themes for free. The one `.callout--warn` block in the #unverified section inherits the dark chip remap at site.css:990-1000. No hardcoded hex anywhere in this page.

**Compliance check** — Names BenefitDial's own staff only — never CMS, SSA or BLS personnel, and never implies a government reviewer signed off. The corrections route is email-only: no phone number appears, preserving the site-wide 'no phone number, ever' promise. The 'we are not qualified to advise on your plan' paragraph explicitly refuses the broker/agent role, so nothing here can be read as insurance advice or a plan recommendation. Deliberately does NOT claim any credential the operator may not hold — every credential is a {{PLACEHOLDER}} for a human to fill or delete.

---

## TR-2 · A corrections channel — the site's first mailto, and a per-page way to use it

> **P0** · effort: small · kind: `content-component` · route: sitewide (footer) + the six article routes + /privacy
> Source lens: Trust & authority

**Why it earns its place.** Verified: `grep -rc mailto dist/` returns zero across all 13 built pages, and the single contact address on the site — `src/pages/privacy.html:99` — is bold text a reader has to retype by hand, on a page most visitors never open. There is no way at all to report a wrong number. That is the finding a journalist writes up and a regulator asks about first, because a publisher of statutory figures with no correction channel is asserting it never needs one. After this, every page carrying a figure ends with a one-click route to say 'this is wrong', and the footer carries it on all 13 routes.

**Insertion point.** (a) `src/partials/footer.html:32` — new `<li>` immediately after the privacy-pledge item and before the external Medicare Plan Finder link, so internal links stay grouped. (b) New partial `src/partials/correction-note.html`, included as the last element inside the final `.wrap.prose` of each article route: `src/pages/how-it-works.html:204`, `src/pages/key-dates.html:134`, `src/pages/guide-cola.html:195`, `src/pages/guide-aep.html:149`, `src/pages/guide-medicare-changes.html:128`, `src/pages/guide-partb.html:155` — in each case directly after the closing `</details>` of the last FAQ item, before the `</div>` closing `.wrap.prose`. (c) `src/pages/privacy.html:99` — replace the unlinked `<strong>privacy@<wbr>benefitdial.com</strong>` with a real `mailto:` anchor. CSS: append `.correction-note` after site.css:920.

**Specification** — Footer link (~120 bytes):
```html
<li><a href="mailto:{{CORRECTIONS_EMAIL}}?subject=BenefitDial%20correction">Report an error or correction</a></li>
```
Partial `src/partials/correction-note.html` (~430 bytes, reuses the existing `#ic-magnifier-diff` sprite symbol — no new icon, no new bytes for the glyph):
```html
<p class="correction-note">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-magnifier-diff" xlink:href="#ic-magnifier-diff"/></svg>
  <span>Think a number on this page is wrong? Email <a href="mailto:{{CORRECTIONS_EMAIL}}?subject=BenefitDial%20correction">{{CORRECTIONS_EMAIL}}</a> and we will check it against the source document. If we got it wrong we fix it and say so — see our <a href="/editorial-standards#corrections">corrections policy</a>.</span>
</p>
```
Privacy fix at privacy.html:99 — keep the existing `<wbr>` so the address still wraps on a 320px screen:
```html
<a href="mailto:{{PRIVACY_EMAIL}}?subject=BenefitDial%20privacy%20question">privacy@<wbr>benefitdial.com</a>
```
CSS (append after site.css:920):
```css
.correction-note { display: flex; align-items: flex-start; gap: var(--bc-space-m); margin: var(--bc-space-3xl) 0 0; padding-top: var(--bc-space-ml); border-top: 1px solid var(--bc-line-soft); font-size: var(--bc-fs-sm); color: var(--bc-ink-soft); }
.correction-note .icon { flex: 0 0 auto; width: 1.4rem; height: 1.4rem; color: var(--bc-accent-2); margin-top: 0.15rem; }
```
Touch target: the mailto anchor inherits the site's link sizing at 19px base; at `.byline`/`.correction-note` scale (--bc-fs-sm) confirm the rendered anchor still clears WCAG 2.2 AA 2.5.8 (24×24 CSS px) — add `padding-block: 0.2rem` to `.correction-note a` if it does not. CLS zero (static text). Total added bytes: ~430 × 6 pages + ~120 footer × 13 pages + ~340 CSS ≈ 4.7 KB sitewide.
HUMAN INPUT REQUIRED: `{{CORRECTIONS_EMAIL}}` — a real, monitored mailbox. `{{PRIVACY_EMAIL}}` — confirm privacy@benefitdial.com actually receives mail before linking it; a dead `mailto:` is worse than the current unlinked string, because a link is a promise that someone is on the other end. Do not ship this item until both are confirmed live.

**Draft copy / markup — ready to insert**

```html
Footer link text: "Report an error or correction"

Per-page note: "Think a number on this page is wrong? Email {{CORRECTIONS_EMAIL}} and we will check it against the source document. If we got it wrong we fix it and say so — see our corrections policy."

Privacy page, revised contact paragraph (privacy.html:98-99):
"<h2>Contact</h2>
<p>Questions about privacy? Email us at <a href=\"mailto:{{PRIVACY_EMAIL}}?subject=BenefitDial%20privacy%20question\">privacy@<wbr>benefitdial.com</a>. To report a wrong figure anywhere on the site, use <a href=\"mailto:{{CORRECTIONS_EMAIL}}?subject=BenefitDial%20correction\">{{CORRECTIONS_EMAIL}}</a> instead — that mailbox is read by the person who maintains the numbers. Please note that because we do not operate a call centre and are not a broker, we cannot look up your specific Medicare plan or Social Security record; for that, contact the official sources at <a href=\"https://www.medicare.gov/plan-compare/\" rel=\"nofollow noopener\" target=\"_blank\">Medicare.gov</a>, <a href=\"https://www.ssa.gov/cola/\" rel=\"nofollow noopener\" target=\"_blank\">the Social Security Administration</a>, or 1-800-MEDICARE. Please do not email us your Medicare number, Social Security number, or medical details — we do not want them and will delete any message that contains them.</p>"
```

**Alt text** — The magnifier-diff icon is decorative and repeats the adjacent sentence — `aria-hidden="true" focusable="false"`, no accessible name, matching the sitewide icon convention.

**Dark mode** — Role tokens only (--bc-ink-soft, --bc-line-soft, --bc-accent-2). --bc-accent-2 remaps to #7fd3d6 in dark (site.css dark block), which is the same treatment `.datasource__fresh .icon` already gets — so the icon reads correctly in both themes with no override.

**Compliance check** — Email only, no phone number and no contact form — the form would need a backend and would start collecting exactly the PII the site promises never to hold. The copy explicitly refuses personal-record lookups and asks readers not to send Medicare or Social Security numbers, so a correction channel cannot quietly become a lead-capture channel or a health-information inbox. No agent, no call-back, no 'talk to someone'.

---

## TR-3 · Byline + last-reviewed block — one partial, six article routes

> **P0** · effort: small · kind: `content-component` · route: /how-it-works · /key-dates · /guides/medicare-aep-2026 · /guides/2027-social-security-cola · /guides/what-changed-medicare-2027 · /guides/part-b-premium-and-your-cola
> Source lens: Trust & authority
> **Merged:** Trust CON-08 (two-part freshness stamp) and Content-gaps CON-04 (figures-verified stamp on the guides) — one byline/freshness partial serves all three.

**Why it earns its place.** Measured: six routes emit `Article` JSON-LD with `dateModified` (2026-07-26 on all four guides) and `author`, and a machine can read all of it — while a human sees no author and no date anywhere on the page. That is the exact inversion of what a cautious reader needs. After this, a 65+ reader reaching the guide on Part B premiums sees a person's name and 'last reviewed 26 July 2026' before the first paragraph, and knows the page is tended rather than abandoned. It also closes the prior audit's '10 of 13 routes carry no visible freshness stamp' finding for the six routes where a date actually means something.

**Insertion point.** New partial `src/partials/byline.html`. Inserted as the last child of the opening `.wrap` on each page's hero section, i.e. immediately after the final `<p>` and before the `</div>` that closes `.wrap`: `src/pages/how-it-works.html:16`, `src/pages/key-dates.html:16`, `src/pages/guide-aep.html:16`, `src/pages/guide-cola.html:17` (after the existing `.badge--info` early-estimate line), `src/pages/guide-medicare-changes.html:17`, `src/pages/guide-partb.html:17`. Requires two new tokens in `scripts/build.mjs`: add `PAGE_MODIFIED_LONG: longDate(pageDates.PAGE_MODIFIED)` to the `pageDates` object at `scripts/build.mjs:299-302`, and `PAGE_LAST_CHECKED` / `PAGE_LAST_CHECKED_LONG` read from the new `src/data/editorial-checks.csv` described in the spec. CSS: append `.byline` rules to `src/assets/css/site.css` after the `.datasource` block at line 918-920.

**Specification** — Single `<p class="byline">`, ~60 bytes of markup per page, no images, no script. Two dates because they are two different facts and conflating them is the usual dishonesty here: `PAGE_MODIFIED` (git-derived, when the page text last changed) and `PAGE_LAST_CHECKED` (when a human last re-read the figures against their source documents). Zero-dependency plumbing for the second: a new 3-column CSV `src/data/editorial-checks.csv` — `route,last_checked,checked_by` — parsed in `scripts/build.mjs` exactly like `medicare-figures.csv` is, keyed on slug, falling back to `PAGE_MODIFIED` when a row is absent. Do NOT default it to the build date; `scripts/build.mjs:200-207` already documents why that is a lie.
Markup:
```html
<p class="byline">
  <span>Written and checked by <strong>{{EDITOR_NAME}}</strong>, {{EDITOR_ROLE}}</span>
  <span aria-hidden="true">·</span>
  <span>Last reviewed <time datetime="{{PAGE_LAST_CHECKED}}">{{PAGE_LAST_CHECKED_LONG}}</time></span>
  <span aria-hidden="true">·</span>
  <a href="/editorial-standards">How we check our numbers</a>
</p>
```
CSS (append after site.css:920):
```css
.byline { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--bc-space-s) 0.6rem; margin: 0 0 var(--bc-space-ml); font-size: var(--bc-fs-sm); color: var(--bc-ink-soft); border-top: 1px solid var(--bc-line-soft); padding-top: var(--bc-space-m); max-width: 52rem; }
.byline strong { color: var(--bc-heading); }
```
CLS: text-only, in normal flow, no async content — no layout shift, so the sitewide 0.0000 CLS holds. Byte cost: ~180 bytes of HTML per page × 6 = ~1.1 KB total, plus ~330 bytes of CSS once. Under the `max-age=0, must-revalidate` policy on /assets/* the CSS is a 304 on repeat views, so the real repeat cost is the inline HTML only.
HUMAN INPUT REQUIRED: `{{EDITOR_NAME}}`, `{{EDITOR_ROLE}}`. Ship nothing here until a real person's name is supplied — a byline reading "BenefitDial Editorial Team" adds a line of text and no credibility.

**Draft copy / markup — ready to insert**

```html
Rendered example (with real values substituted):

Written and checked by {{EDITOR_NAME}}, editor · Last reviewed 26 July 2026 · How we check our numbers

On /guides/part-b-premium-and-your-cola this sits directly beneath the existing "Worked example uses round numbers" badge line, so the reader meets, in order: the headline, what the guide covers, a warning that the worked figures are illustrative, and then who stands behind it.
```

**Dark mode** — Uses only role tokens (--bc-ink-soft, --bc-heading, --bc-line-soft) which are remapped wholesale by the dark block at site.css:960-1000. No new colour is introduced, so nothing to override. Verify --bc-ink-soft on --bc-surface in dark meets 4.5:1 as the existing `.muted` already does.

**Compliance check** — The byline names a BenefitDial writer only. Deliberately avoids the health-publisher convention of a 'Medically reviewed by Dr. X' or 'Reviewed by a licensed insurance agent' line: the first would imply clinical advice this site does not give, and the second would place BenefitDial visibly inside the insurance-sales chain it claims to sit outside — precisely the TPMO framing the project is built to avoid. No credential is asserted that a human has not supplied.

---

## TR-4 · Sample-data forewarning on the seven routes that funnel into the plan tool

> **P0** · effort: small · kind: `content-component` · route: / · /guides · /key-dates · /guides/medicare-aep-2026 · /guides/what-changed-medicare-2027
> Source lens: Trust & authority

**Why it earns its place.** Measured: `/medicare-plan-changes` mentions 'sample' ten times and carries an excellent, print-safe, JS-failure-safe warning banner (medicare-plan-changes.html:33-41). Every route that sends readers there mentions it zero times — grep for 'sample' across index.html, guides.html, key-dates.html and all four guides returns 0, while those same files link to the tool nine times combined. The homepage card at index.html:43 promises 'using public CMS data' with no hint the 2027 side is synthetic. The disclosure is therefore honest but arrives only after the click, which means a reader forms the expectation 'this shows my real plan' on the homepage and has it corrected inside the tool. Fixing the funnel means nobody is ever surprised, and a regulator reading the funnel top-to-bottom finds the disclosure at every entry point rather than only at the destination.

**Insertion point.** New partial `src/partials/sample-data-note.html`. Insert: `src/pages/index.html:53` (immediately after the `</div>` closing the two-card `.grid--2`, still inside `.wrap`); `src/pages/guides.html:49` (after the `</div>` closing the four-card guide grid); `src/pages/key-dates.html:98` (inside the tool-card block that begins at line 97, or immediately after the grid containing it); `src/pages/guide-aep.html:96` (adjacent to the `card--link` to /medicare-plan-changes at line 95); `src/pages/guide-medicare-changes.html:90` (immediately after the `btn--primary` "Check my Medicare plan" at line 89). Also add `id="medicare-data"` to the `<h2>How the Medicare plan data works</h2>` at `src/pages/how-it-works.html:74` so the note can deep-link to the explanation.

**Specification** — One `<p class="sample-note">`, ~420 bytes per insertion, five insertions ≈ 2.1 KB plus ~300 bytes CSS. Text-only, reuses the existing `.badge--warn` chip — no new colour, no image, no icon.
```html
<p class="sample-note">
  <span class="badge badge--warn">Sample data</span>
  <span>The plan checker runs on clearly-marked <strong>sample plans</strong> until CMS publishes the official {{PLAN_YEAR_NEXT}} files, expected late September&nbsp;2026. Every sample plan name begins with the word &ldquo;Sample.&rdquo; <a href="/how-it-works#medicare-data">Why we built it that way.</a></span>
</p>
```
CSS (append after site.css:920):
```css
.sample-note { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--bc-space-s) 0.6rem; margin: var(--bc-space-ml) 0 0; font-size: var(--bc-fs-sm); color: var(--bc-ink-soft); max-width: 62ch; }
```
Uses the existing `{{PLAN_YEAR_NEXT}}` token so it rolls with `src/data/manifest.json` and can never contradict the tool. Do NOT hardcode 2027.
When the real CMS files land, this partial must disappear from all five routes in the same commit that flips `manifest.json.sample` to false — otherwise the site under-claims its own data. Recommend gating it the same way `#pd-sample-banner` is gated, or simply deleting the include, and add a line to the how-it-works timeline at how-it-works.html:155-168 recording that step so it is not forgotten.
CLS: static text in flow, zero shift. No dark-mode raster concerns.

**Draft copy / markup — ready to insert**

```html
"Sample data — The plan checker runs on clearly-marked sample plans until CMS publishes the official 2027 files, expected late September 2026. Every sample plan name begins with the word 'Sample.' Why we built it that way."

On /guides/what-changed-medicare-2027 this lands directly under the 'Check my Medicare plan' button at line 89, so the reader sees the caveat and the call to action in one glance rather than discovering the caveat afterwards.
```

**Dark mode** — `.badge--warn` already has a dedicated dark remap (--bc-chip-warn-bg #33270d / --bc-chip-warn-fg #f5c451 at site.css:993), so the chip stays legible amber-on-dark rather than glowing. Body text uses --bc-ink-soft. Nothing new to theme.

**Compliance check** — This is the sample-data constraint applied where it was missing rather than where it was already handled. The wording never names a real carrier or plan ID, never implies the sample figures approximate any real plan, and does not soften the tool's own stronger in-page banner — it is a forewarning, not a replacement. Keeping the disclosure ahead of the click is what stops a synthetic premium from ever being read as a real one on the strength of a homepage promise.

---

## TR-5 · A real citation pattern — every statutory figure names its governing document

> **P0** · effort: medium · kind: `content-component` · route: /guides/part-b-premium-and-your-cola · /cola-calculator · /guides/what-changed-medicare-2027 · /how-it-works · /guides/2027-social-security-cola
> Source lens: Trust & authority

**Why it earns its place.** Measured: exactly two pages carry a source line (guide-cola.html:77 and guide-medicare-changes.html:31), both hand-rolled with an inline `style="font-size:0.95rem"`, neither linking a document, neither dated. The site says 'a careful reader can check us' (how-it-works.html:15) and then does not give that reader a document to open. Meanwhile `src/data/medicare-figures.csv:16-23` already names the two exact primary sources for $202.90, $283 and $2,100 — Federal Register 2025-20251 and the Final CY 2026 Part D Redesign Program Instructions — and that knowledge dies in a CSV comment no visitor can see. After this, a reader who doubts the Part B figure can click straight through to the Federal Register notice that legally sets it. That is the difference between claiming provenance and having it.

**Insertion point.** New shared class `.source-note` (CSS appended after site.css:920), applied inline at each figure rather than as a partial, because each citation names a different document. Insertions: `src/pages/guide-partb.html:83` (immediately after the existing muted disclaimer at line 82, under the worked-example table) and `src/pages/guide-partb.html:132` (after the Part B premium FAQ answer at line 131); `src/pages/cola-calculator.html:72` (immediately after the `#f-partb-hint` span at line 71, so the citation sits with the pre-filled ${{PART_B_PREMIUM}} field); `src/pages/guide-medicare-changes.html:39` (after the Part D cap paragraph at line 38); `src/pages/guide-cola.html:77` — upgrade the existing ad-hoc `<p class="muted" style="font-size:0.95rem;">Source: …` to the shared class and add the SSA/BLS document links; `src/pages/guide-medicare-changes.html:31` — same upgrade. And `src/pages/how-it-works.html:96-139` — add a fifth `Primary document` column to the sources table so every row links the actual file.

**Specification** — ```html
<p class="source-note">
  <span class="source-note__label">Source</span>
  <span>&hellip;</span>
</p>
```
CSS (append after site.css:920):
```css
.source-note { display: flex; flex-wrap: wrap; gap: var(--bc-space-s) 0.6rem; margin: var(--bc-space-m) 0 var(--bc-space-ml); font-size: var(--bc-fs-s2); line-height: 1.55; color: var(--bc-ink-faint); max-width: 68ch; }
.source-note__label { flex: 0 0 auto; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: var(--bc-accent-on-tint); font-size: var(--bc-fs-s2); }
.source-note a { color: var(--bc-link); }
```
All external document links take the site's existing external-link treatment: `rel="nofollow noopener" target="_blank"`. The 'checked on' date must come from data, not prose — add a `DATA_UPDATED_ISO` token in `scripts/build.mjs` beside the existing `DATA_UPDATED` at line 224 (`DATA_UPDATED_ISO: dataUpdated`) so `<time datetime>` is machine-valid while the visible text stays long-form.
WCAG: --bc-ink-faint (#5c6b67) on --bc-surface (#ffffff) measures 5.74:1, clears AA for the ~15px `--bc-fs-s2` size. Do not drop below that token.
Bytes: ~600–900 per citation, six citations ≈ 4.5 KB, plus ~400 bytes CSS. No images, zero CLS.
The how-it-works table gains one column; it already lives inside `.table-scroll` (how-it-works.html:91) so the new column scrolls horizontally on mobile rather than pushing the page wide — the `overflow-x` container requirement is already satisfied.

**Draft copy / markup — ready to insert**

```html
PART B PREMIUM — guide-partb.html:83 and :132, cola-calculator.html:72:
"SOURCE — The standard Part B premium and deductible for 2026 are set in Federal Register notice 2025-20251, 'Medicare Program; Medicare Part B Monthly Actuarial Rates, Premium Rates, and Annual Deductible Beginning January 1, 2026', published 19 November 2025, and restated in the CMS Parts A & B premiums and deductibles fact sheet. We last checked this figure on 14 November 2025."

PART D OUT-OF-POCKET CAP — guide-medicare-changes.html:39:
"SOURCE — The 2026 Part D out-of-pocket threshold of $2,100 comes from the CMS Final CY 2026 Part D Redesign Program Instructions, which also sets the $615 maximum deductible. The cap is indexed annually under the Inflation Reduction Act — it is not fixed at the $2,000 figure that applied in 2025. We last checked this figure on 14 November 2025."

COLA / CPI-W — replacing guide-cola.html:77:
"SOURCE — CPI-W is published monthly by the U.S. Bureau of Labor Statistics as series CWUR0000SA0. The 2026 COLA of 2.8% was announced by the Social Security Administration on 24 October 2025 — later than usual because of that autumn's federal government shutdown. Both the index and the announcement are public; the arithmetic above is ours, and you can repeat it."

PLAN COUNTS — replacing guide-medicare-changes.html:31:
"SOURCE — CMS Medicare Advantage and Part D Landscape files. 'The average person' is the count of MA-PD plans available where a typical beneficiary lives, not the total number of plans nationwide."

HOW-IT-WORKS TABLE, new fifth column 'Primary document', one row each:
- CMS Landscape files → 'CMS Medicare Advantage/Part D Landscape source files, cms.gov'
- CMS Crosswalk files → 'CMS Plan Crosswalk source files, cms.gov'
- CMS Part D formulary PUFs → 'CMS Part D prescription drug plan formulary PUFs, cms.gov'
- CMS Plan Benefit Package (PBP) → 'CMS PBP benefit data files, cms.gov'
- BLS CPI-W → 'Series CWUR0000SA0, bls.gov/cpi'
- SSA COLA announcement → 'SSA cost-of-living adjustment announcement, ssa.gov/cola'
- (new row) Part B premium & deductible → 'Federal Register 2025-20251, published 19 Nov 2025'
- (new row) Part D out-of-pocket cap → 'CMS Final CY 2026 Part D Redesign Program Instructions'
```

**Dark mode** — --bc-ink-faint, --bc-accent-on-tint and --bc-link are all remapped by the dark block; --bc-accent-on-tint in particular is the token already used for `.provenance__mono` text, so the SOURCE label picks up the same treatment the existing provenance chips get. No hardcoded hex.

**Compliance check** — Links point to the government documents themselves (federalregister.gov, cms.gov, bls.gov, ssa.gov) carrying `rel="nofollow noopener"` exactly as the site's existing external links do — citing a public document is not claiming affiliation, and the wording says 'set in' / 'published by', never 'approved by us' or anything reciprocal. No agency logo or seal accompanies any citation (see rejected list). No carrier document is ever cited, so no plan or carrier can appear endorsed.

---

## TR-6 · Structured data for credibility — Person author, Organization contact, publishing principles

> P1 · effort: small · kind: `content-component` · route: sitewide (layout.html Organization/@graph) + the six Article routes
> Source lens: Trust & authority

**Why it earns its place.** Verified by parsing all 13 built pages: `author` is `{"@id": ".../#org"}` on all six Article nodes — the organisation credits itself — and no `Person` node exists anywhere on the site. The `Organization` node at layout.html:52-69 carries name, url, description, slogan and logo, and nothing that speaks to accountability: no contactPoint, no publishingPrinciples, no legalName, no foundingDate, no sameAs. A quality rater and Google's own YMYL signals both look for a named author and a stated editorial policy; the site currently gives a machine less than it gives a human, which is unusual and fixable in one file. After this, the structured data says who wrote it, who checked it, when it was last reviewed, and where the policy lives — and every claim in it is backed by a visible on-page counterpart from CON-01/02/03, which is the only way structured data is worth adding.

**Insertion point.** `src/layout.html:52-69` — extend the `Organization` node in the head `@graph`, and add a `Person` node to the same `@graph` so every page carries the editor's identity once. Then, on each Article block, point `author` at that Person and add `reviewedBy`/`lastReviewed` to the `mainEntityOfPage` WebPage node: `src/pages/how-it-works.html:241-246`, `src/pages/key-dates.html` (its Article block), `src/pages/guide-cola.html:198-208`, `src/pages/guide-aep.html:152-162`, `src/pages/guide-medicare-changes.html:131-141`, `src/pages/guide-partb.html:158-168`.

**Specification** — Organization additions at layout.html:52-69 (keep the existing @id `{{SITE_URL}}/#org` so every existing publisher reference stays valid):
```json
"legalName": "{{LEGAL_ENTITY_NAME}}",
"foundingDate": "{{ORG_FOUNDING_YEAR}}",
"publishingPrinciples": "{{SITE_URL}}/editorial-standards",
"knowsAbout": ["Social Security cost-of-living adjustment", "Medicare Advantage", "Medicare Part D", "Medicare Part B premiums", "CPI-W"],
"contactPoint": [
  { "@type": "ContactPoint", "contactType": "editorial corrections", "email": "{{CORRECTIONS_EMAIL}}", "url": "{{SITE_URL}}/editorial-standards#corrections", "availableLanguage": "English" },
  { "@type": "ContactPoint", "contactType": "privacy", "email": "{{PRIVACY_EMAIL}}", "url": "{{SITE_URL}}/privacy", "availableLanguage": "English" }
]
```
New Person node in the same `@graph`:
```json
{ "@type": "Person", "@id": "{{SITE_URL}}/#editor", "name": "{{EDITOR_NAME}}", "jobTitle": "{{EDITOR_ROLE}}", "description": "{{EDITOR_SHORT_BIO}}", "url": "{{SITE_URL}}/editorial-standards#who", "worksFor": { "@id": "{{SITE_URL}}/#org" } }
```
Per-Article change — `author` moves to the Person, `publisher` stays the Organization, and the WebPage node gains the review facts:
```json
"author": { "@id": "{{SITE_URL}}/#editor" },
"publisher": { "@id": "{{SITE_URL}}/#org" },
"mainEntityOfPage": { "@type": "WebPage", "@id": "{{SITE_URL}}/guides/…", "lastReviewed": "{{PAGE_LAST_CHECKED}}", "reviewedBy": { "@id": "{{SITE_URL}}/#editor" } }
```
`lastReviewed` and `reviewedBy` are genuine schema.org WebPage properties — this is the correct home for them, not the Article.
IMPORTANT TYPE DECISION, human call required: `correctionsPolicy`, `ownershipFundingInfo` and `actionableFeedbackPolicy` are defined on `NewsMediaOrganization`, not `Organization`. Adding them means asserting `"@type": ["Organization", "NewsMediaOrganization"]` — i.e. declaring BenefitDial a news media organisation. Do not make that call in code. My recommendation: stay `Organization` and rely on `publishingPrinciples` + `contactPoint`, which are valid on Organization and carry the same information to a rater without a claim the site may not want to make. Flag it to the operator as `{{NEWSMEDIA_TYPE_DECISION}}`.
Bytes: ~900 in `layout.html`, so ~900 on every one of the 13 routes ≈ 11.7 KB sitewide, plus ~200 per Article node. Head JSON-LD, so zero rendering and zero CLS impact.
Verify after building with the same parse used to audit it: iterate `<script type="application/ld+json">` blocks per file, `JSON.parse` each, and assert every Article has a Person author and every page has exactly one Organization and one Person node.

**Dark mode** — Not applicable — head-only metadata, renders nothing.

**Compliance check** — Every added property mirrors something a human can read on the page — nothing is asserted to machines that a visitor cannot verify, which is the line between structured data and structured-data spam. `sameAs` is deliberately omitted rather than pointed at anything: linking a government profile or a plausible-looking social account would manufacture an affiliation signal. `NewsMediaOrganization` is left as an explicit human decision rather than being quietly assumed. No credential, licence number, or accreditation is emitted anywhere.

---

## TR-7 · /about — "Who is behind BenefitDial": the ownership and funding section

> P1 · effort: small · kind: `content-section` · route: /about
> Source lens: Trust & authority

**Why it earns its place.** Measured: /about is 2,109 words explaining the business model in genuine detail and does not name a single entity, person, country, or founding year. It answers 'how do you make money' beautifully and 'who are you' not at all. A quality rater's first question about a YMYL site — who is responsible for this content, and can I find out who owns it — currently has no answer on the page literally titled 'Who we are' in the footer. The `#funding` anchor is also what CON-06's `ownershipFundingInfo` (or the publishingPrinciples fallback) points at, so this section is what makes that metadata truthful.

**Insertion point.** `src/pages/about.html:74` — a new `<section class="section" id="funding">` inserted between the `</section>` closing "We run ads. That's it." (line 73) and the `<section class="section">` opening "What we will never do." (line 75). This puts identity immediately after the business model and immediately before the promises, which is the order a sceptical reader asks the questions in.

**Specification** — One `<section class="section" id="funding">` with `.wrap.prose`, ~280–350 words, styled entirely with existing classes (`.eyebrow`, `h2`, `p`, `ul`, `.callout--info`). No images. ~2.6 KB of HTML on a single route. Zero CLS, no new CSS, no dark-mode work.
HUMAN INPUT REQUIRED, and this section must not ship with any of these guessed: `{{LEGAL_ENTITY_NAME}}` (the actual operating entity), `{{ENTITY_TYPE_AND_STATE}}` (e.g. 'a limited liability company registered in …'), `{{FOUNDED_YEAR}}`, `{{OWNERSHIP_DISCLOSURE}}` (who owns it; if independently owned by one or two named people, say so — that is a strength here, not a weakness), `{{EDITOR_NAME}}`, `{{SIZE_STATEMENT}}` (an honest sentence about how many people work on it; 'one person' is a perfectly good answer and reads as candour). If the operator cannot supply the legal entity, ship the section with only the parts that are true and omit the rest — an incomplete honest section beats a complete invented one.

**Draft copy / markup — ready to insert**

```html
<section class="section" id="funding">
  <div class="wrap prose">
    <p class="eyebrow">Ownership &amp; accountability</p>
    <h2>Who is behind BenefitDial.</h2>
    <p>BenefitDial is published by {{LEGAL_ENTITY_NAME}}, {{ENTITY_TYPE_AND_STATE}}, and has been online since {{FOUNDED_YEAR}}. {{OWNERSHIP_DISCLOSURE}}</p>
    <p>{{SIZE_STATEMENT}} The figures on this site are written and maintained by {{EDITOR_NAME}}, and the standards they are held to — including what happens when we get one wrong — are set out on our <a href="/editorial-standards">editorial standards page</a>.</p>
    <p>Three things about that ownership are worth saying plainly, because they are the things that would change what you see if they were not true:</p>
    <ul>
      <li><strong>No insurance carrier, broker, or marketing organisation owns any part of BenefitDial</strong>, and none has any say in what appears here.</li>
      <li><strong>No government agency funds, reviews, or approves this site.</strong> We download the same public files anyone can download. That is the entire relationship.</li>
      <li><strong>Nobody pays us to feature a plan.</strong> Our only revenue is display advertising sold against the page, and an advertiser cannot buy a mention in our comparisons — there is nothing to buy, because we do not rank or recommend plans at all.</li>
    </ul>
    <div class="callout callout--info">
      <p class="callout__title">If that ever changes, this page changes first</p>
      <p style="margin:0;">If BenefitDial were ever sold, took outside investment, or added a revenue source beyond display advertising, we would say so here before it took effect — not in a footnote, and not after the fact. You can hold us to that.</p>
    </div>
  </div>
</section>
```

**Dark mode** — Existing section/prose/callout classes only. `.callout--info` already has its dark treatment (site.css:718 + the dark override at :1017 for its link colour). Nothing new.

**Compliance check** — The section states independence in the same terms the footer disclaimer already uses, so the two cannot drift apart. It names no government body as a partner, sponsor, or reviewer; the only relationship described with CMS/SSA/BLS is 'we download their public files'. It also restates that no carrier or brokerage has an ownership stake or an editorial say, which is the specific conflict a journalist would probe on a Medicare comparison site.

---

## TR-8 · Surface the "not read first-hand" caveat that currently hides in a CSV comment

> P1 · effort: medium · kind: `content-component` · route: /guides/part-b-premium-and-your-cola · /cola-calculator · /guides/what-changed-medicare-2027 · /how-it-works
> Source lens: Trust & authority

**Why it earns its place.** `src/data/medicare-figures.csv:10-16` says, in the repo's own words, that the 2026 Part B premium, deductible and Part D cap are "still not read first-hand" — corroborated across independent secondary sources but never checked against the governing document, because the environment had no outbound network. Those three figures ($202.90, $283, $2,100) then appear as bare facts on four routes, fourteen times, including as the pre-filled value in the COLA calculator's Part B field. The site's own promise is 'we don't estimate in secret'. This is the one place where it does, and the honesty is already written down — it just never reaches a reader. Surfacing it costs almost nothing, is the single most defensible thing on this list if a journalist reads the repo, and gives the operator a mechanism that clears itself the moment someone opens the Federal Register notice.

**Insertion point.** Data: add a `verified_firsthand` column to `src/data/medicare-figures.csv:24` (header row) and each data row, carried through `scripts/build-medicare-figures.mjs` into `medicare-figures.json`, exposed as a `{{FIGURES_VERIFIED_FIRSTHAND}}` boolean token in `scripts/build.mjs`. Rendering: a conditional amber chip inside the `.source-note` component from CON-05, at each of its insertion points — `src/pages/guide-partb.html:83`, `src/pages/guide-partb.html:132`, `src/pages/cola-calculator.html:72`, `src/pages/guide-medicare-changes.html:39` — plus one paragraph in the how-it-works honesty callout at `src/pages/how-it-works.html:143-146`, which already handles the sample-data caveat and is the natural home for this one.

**Specification** — Chip appended to the relevant `.source-note`, rendered only while `verified_firsthand=no`:
```html
<span class="badge badge--warn">Secondary sources only</span>
```
followed by the sentence in contentDraft. Reuses `.badge--warn` — no new CSS, no new colour, no image. ~330 bytes per insertion, four insertions plus one paragraph ≈ 1.7 KB.
The mechanism is what matters: when someone opens Federal Register 2025-20251 and confirms $202.90 / $283, they flip one CSV cell to `yes` and the chip and its sentence vanish from all four routes in the next build. That is a self-clearing disclosure rather than a paragraph someone has to remember to delete. Add the same column semantics to `src/data/cola-history.csv` for symmetry if the COLA rows have the same provenance gap — check before assuming they do.
Zero CLS (static text), no dark-mode raster.
HUMAN INPUT REQUIRED: none for the mechanism. But the real fix is a person opening two documents — Federal Register 2025-20251 (published 2025-11-19) and the CMS Final CY 2026 Part D Redesign Program Instructions — and setting the flag. This item makes the gap visible; it does not close it.

**Draft copy / markup — ready to insert**

```html
Chip + sentence appended to the Part B source note:
"[Secondary sources only] We have corroborated this figure across several independent sources but have not yet read the Federal Register notice that sets it. It stays labelled this way until someone here has opened the document. Why we label figures this way."

Chip + sentence appended to the Part D cap source note:
"[Secondary sources only] We have corroborated the $2,100 cap across independent sources but have not yet read the CMS Final CY 2026 Part D Redesign Program Instructions directly. It stays labelled this way until someone here has."

New paragraph inside the existing how-it-works honesty callout (how-it-works.html:143-146), after the sample-data paragraph:
"And a second honest note, about the statutory figures. Where we have confirmed a number across several independent, reputable sources but have not yet opened the government document that sets it, we mark it 'Secondary sources only' on the figure itself — not in a footnote — and name the document that still needs reading. Right now that applies to the 2026 Part B premium and deductible, and to the 2026 Part D out-of-pocket cap. We would rather show you the seam than let a number look more settled than it is."
```

**Dark mode** — `.badge--warn` carries its own dark chip tokens (--bc-chip-warn-bg / --bc-chip-warn-fg, site.css:993). Body sentence inherits `.source-note` colours. Nothing new to theme.

**Compliance check** — This is the compliance item that protects the operator rather than constraining them: publishing a statutory dollar figure with no caveat while internally recording that the governing document was never read is the finding that would actually hurt in a regulatory or press context. The wording states a fact about BenefitDial's own process, makes no claim about CMS, and does not suggest the figure is wrong — only that we have not yet read the notice that sets it. It points readers to the official sources for confirmation, consistent with every other disclosure on the site.

---

## TR-9 · Independence disclosure — a short version above the fold on the two tool pages

> P2 · effort: trivial · kind: `content-component` · route: /medicare-plan-changes · /cola-calculator
> Source lens: Trust & authority

**Why it earns its place.** The full disclaimer at `src/partials/independence-disclaimer.html` is genuinely good — it names CMS and SSA, refuses the broker role, and disclaims commissions and lead-gen in one paragraph. Its problem is placement: it is rendered only inside `.footer-disclaimer`, at the very bottom of pages that run 5,000+ pixels, in small muted text on teal, and a reader using the plan tool never scrolls to it. The one moment a visitor most needs to know 'this is not the government and nobody here is selling you a plan' is while they are choosing a plan from a dropdown. This is a placement fix, not a rewrite — 26 words above the fold, linking to the full text, on the two pages where the question actually arises.

**Insertion point.** `src/pages/medicare-plan-changes.html:51` (immediately after the `#pd-provenance` paragraph, before the `<form id="plandiff-form">`) and `src/pages/cola-calculator.html:30` (immediately after the `{{> provenance-strip-cola }}` include at line 29). New partial `src/partials/independence-short.html`.

**Specification** — ```html
<p class="independence-short">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-shield-lock" xlink:href="#ic-shield-lock"/></svg>
  <span><strong>Not a government site, and not a broker.</strong> BenefitDial is independent, takes no commissions, and will never ask for your phone number. <a href="/about">Who we are</a> &middot; <a href="/editorial-standards">how we check our numbers</a>.</span>
</p>
```
CSS (append after site.css:920):
```css
.independence-short { display: flex; align-items: flex-start; gap: var(--bc-space-m); margin: 0 0 var(--bc-space-ml); font-size: var(--bc-fs-sm); color: var(--bc-ink-soft); }
.independence-short .icon { flex: 0 0 auto; width: 1.5rem; height: 1.5rem; color: var(--bc-accent-2); margin-top: 0.1rem; }
.independence-short strong { color: var(--bc-heading); }
```
Reuses the existing `#ic-shield-lock` sprite symbol — no new icon. ~390 bytes per page, two pages, plus ~330 bytes CSS ≈ 1.1 KB. Zero CLS.
Deliberately short. Do NOT duplicate the full footer disclaimer here — the footer version must remain the canonical, complete text, and having two long versions that can drift apart is worse than having one long and one short that links to it. On /medicare-plan-changes it sits below the sample-data banner, never above it: the sample warning is the more urgent message on that page and must stay first.

**Draft copy / markup — ready to insert**

```html
"Not a government site, and not a broker. BenefitDial is independent, takes no commissions, and will never ask for your phone number. Who we are · how we check our numbers."
```

**Alt text** — The shield-lock icon is decorative and duplicates the sentence beside it — `aria-hidden="true" focusable="false"`, consistent with every other icon use on the site.

**Dark mode** — --bc-ink-soft / --bc-heading / --bc-accent-2, all remapped by the dark block. --bc-accent-2 becomes #7fd3d6 in dark, measured 9.71:1 on the dark surface per the note at site.css:1020-1029, so the icon stays well clear of the 3:1 non-text minimum.

**Compliance check** — This is the no-government-affiliation disclosure moved to where it is read, and its first four words are the disclaimer itself rather than a lead-in. It restates the no-broker and no-commission position in the same terms as the footer, so the short and long versions cannot contradict each other. It also repeats the no-phone-number promise at the exact point a lead-gen site would be asking for a phone number, which is the most useful place that sentence can possibly appear.

# Group G — Missing content

---

## CG-1 · /glossary — a plain-language dictionary of the 39 terms the site already uses without defining

> **P0** · effort: large · kind: `content-page` · route: new route: /glossary
> Source lens: Content gaps

**Why it earns its place.** I counted the jargon the site uses in body copy and never defines: ANOC, MOOP, formulary, tier, prior authorization, star rating, plan ID, Crosswalk, Landscape, PBP, PUF, Medigap, SEP, IRMAA, hold-harmless, doughnut hole, CPI-W, MA-PD, PDP, service-area reduction, consolidation. Some get one inline gloss on one page (IRMAA on /guides/part-b-premium-and-your-cola, Crosswalk on /how-it-works) and appear undefined on three others. A reader holding an ANOC and looking at the plan tool's result table meets "MOOP", "star rating" and "consolidated" in one screen; today the only way to learn what they mean is to read a 2,500-word guide that may not define them either. After this page exists, a reader can look up the one word blocking them in about ten seconds and return to the tool. It is also the cheapest real SEO surface the site has — every one of these terms is a standing search query — and it carries zero compliance risk because every entry is definitional.

**Insertion point.** New file /home/user/BenefitClock/src/pages/glossary.html (build.mjs picks up src/pages/*.html automatically; front matter sets slug: glossary). Two link insertions are required or the page is an orphan: (1) src/partials/footer.html:24 — a new <li> between the Guides item on line 23 and the closing </ul> on line 24, so it sits in the "Tools & pages" column on all 14 routes; (2) src/pages/guides.html:49 — a new paragraph between the closing </div> of the four-card grid (line 48) and the closing </div> of .wrap (line 49). Optional third: src/static/_redirects, add `/terms  /glossary  301` alongside the existing aliases.

**Specification** — ~1,750 words of body copy across five <h2> topic groups, each entry an <h3 id="…"> plus one to three <p>. No new CSS: .prose already styles h2/h3/p/ul, and the site has no dl/dt/dd rules, so <h3>+<p> is the zero-CSS path. Every h3 carries a stable kebab-case id (#anoc, #moop, #irmaa …) so other pages can deep-link a single term — that is the glossary-tooltip replacement, and it needs no JS. Add a jump list at the top using the same <nav aria-label="On this page"> pattern as CON-07. Front matter: title: A Plain-Language Glossary of Medicare & Social Security Terms | BenefitDial · description (≤160 chars) · slug: glossary · nav: guides · ogtype: website · priority: 0.6 · changefreq: monthly. Add a DefinedTermSet JSON-LD block at the foot mirroring the existing BreadcrumbList pattern in guides.html:111. Expected built size ~30 KB raw / ~7 KB brotli — inside the existing 17–36 KB per-page envelope (largest today is what-changed-medicare-2027 at 35,715 bytes). Verified tokens used: PART_B_PREMIUM (202.90), PART_B_DEDUCTIBLE (283), PART_D_OOP_CAP (2,100), MEDICARE_FIGURES_YEAR (2026), COLA_CONFIRMED (2.8), COLA_CONFIRMED_YEAR (2026), AEP_WINDOW_RANGE_LONG, AEP_MA_OEP_RANGE_LONG, AEP_COVERAGE_START_LONG — all present in scripts/build.mjs:209-248 and all resolved from src/data/*.json.

**Draft copy / markup — ready to insert**

```html
<!--
title: A Plain-Language Glossary of Medicare & Social Security Terms | BenefitDial
description: Plain-English definitions of the words on your Medicare paperwork and your Social Security notice — ANOC, MOOP, formulary, IRMAA, hold-harmless, CPI-W and more.
slug: glossary
nav: guides
ogtype: website
priority: 0.6
changefreq: monthly
-->
<section class="section" style="padding-bottom:1.5rem;">
  <div class="wrap">
    <p class="eyebrow">Glossary · Plain language</p>
    <h1>The words on your Medicare and Social Security paperwork, explained</h1>
    <p class="lead prose">Every autumn the mail arrives full of terms nobody uses in ordinary conversation. None of them are complicated once someone says what they mean. Look up the one that is in your way, then go back to what you were reading.</p>
    <nav class="prose" aria-label="On this page" style="margin-top:1.5rem;">
      <p class="eyebrow">On this page</p>
      <ul style="margin:0;padding-left:1.2rem;">
        <li><a href="#costs">What your plan costs</a></li>
        <li><a href="#parts">The parts of Medicare</a></li>
        <li><a href="#windows">Enrollment windows and paperwork</a></li>
        <li><a href="#raise">Your Social Security raise</a></li>
        <li><a href="#files">The public files behind this site</a></li>
      </ul>
    </nav>
  </div>
</section>

{{> ad-leaderboard }}

<section class="section" style="padding-top:1.75rem;">
  <div class="wrap prose">
    <h2 id="costs">What your plan costs</h2>

    <h3 id="premium">Premium</h3>
    <p>The fixed amount you pay each month to keep a plan, whether or not you use it. A Medicare Advantage plan can have a $0 premium and still cost you money in copays. Your Part B premium is separate and is usually withheld from your Social Security payment.</p>

    <h3 id="deductible">Deductible</h3>
    <p>The amount you pay yourself before the plan starts paying its share. It resets every January 1. A plan can have one deductible for medical care and a different one for drugs.</p>

    <h3 id="copay">Copay</h3>
    <p>A flat charge for a particular service or prescription — $15 to see your doctor, $10 for a refill. You know the amount before you go.</p>

    <h3 id="coinsurance">Coinsurance</h3>
    <p>A percentage of the cost rather than a flat charge — 20% of whatever the service costs. Unlike a copay, you do not know the dollar amount in advance.</p>

    <h3 id="moop">Maximum out-of-pocket (MOOP)</h3>
    <p>The most a Medicare Advantage plan will make you pay for covered medical care in one calendar year. Once you reach it, the plan pays the rest of the year. It is the number that decides how bad a bad year can get, which is why our comparison shows it. Original Medicare on its own has no such limit.</p>

    <h3 id="formulary">Formulary</h3>
    <p>The list of prescription drugs a plan covers. Every drug plan has one, and every plan's is different. A drug that is not on the formulary is generally not covered, so checking your own medicines against it matters more than the premium.</p>

    <h3 id="tier">Tier</h3>
    <p>The price band a formulary puts a drug in. Tier 1 is usually the cheapest generics and the top tiers are the most expensive specialty drugs. A plan can keep covering your medicine but move it to a higher tier, and your cost goes up without the drug ever leaving the list.</p>

    <h3 id="prior-authorization">Prior authorization</h3>
    <p>A rule that the plan must approve something before it will pay. It does not mean no, but it means your doctor has to ask first, and that takes time.</p>

    <h3 id="network">Network</h3>
    <p>The doctors, hospitals and pharmacies a plan has an agreement with. Going outside the network costs more, and with some plans is not covered at all. Networks are rewritten every year, so a doctor who was in last year may not be this year.</p>

    <h3 id="star-rating">Star rating</h3>
    <p>A score from 1 to 5 that Medicare gives each plan every year, based on things like member complaints, customer service and how well the plan manages care. It is a rough summary, not a verdict about whether the plan fits you.</p>

    <h3 id="supplemental-benefits">Supplemental benefits (extras)</h3>
    <p>The dental, vision, hearing, over-the-counter allowance and fitness benefits some Medicare Advantage plans add on top of basic Medicare. They are not part of Medicare itself, which is why they are often the first thing trimmed when a plan is under cost pressure.</p>

    <h3 id="plan-id">Plan ID</h3>
    <p>The code that identifies your exact plan, like H1234-001. It is on your member card and on the notice your plan mails each September. The letter matters: H is generally a Medicare Advantage contract, S a stand-alone drug plan. Two plans can share a name and differ entirely by ID.</p>
  </div>
</section>

<section class="section section--wash">
  <div class="wrap prose">
    <h2 id="parts">The parts of Medicare</h2>

    <h3 id="part-a">Part A</h3>
    <p>Hospital insurance — inpatient stays, skilled nursing after a hospital stay, hospice. Most people have paid for it through payroll taxes and owe no monthly premium for it.</p>

    <h3 id="part-b">Part B</h3>
    <p>Medical insurance — doctor visits, outpatient care, tests, equipment. It has a monthly premium, and for most people that premium is taken straight out of the Social Security payment. For {{MEDICARE_FIGURES_YEAR}} the standard premium is ${{PART_B_PREMIUM}} a month and the yearly deductible is ${{PART_B_DEDUCTIBLE}}. Higher earners pay more; see <a href="#irmaa">IRMAA</a>.</p>

    <h3 id="original-medicare">Original Medicare</h3>
    <p>Parts A and B together, run directly by the federal government. You can use any doctor or hospital that accepts Medicare, there is no network, and there is no yearly limit on what you pay. It does not include prescription drug coverage on its own — that is what <a href="#part-d">Part D</a> is for.</p>

    <h3 id="medicare-advantage">Medicare Advantage (Part C)</h3>
    <p>A private plan that takes the place of Original Medicare and must cover at least what Parts A and B cover. In exchange for a network and rules like prior authorization, it usually adds a yearly out-of-pocket limit and often extras such as dental or vision. Most Medicare Advantage plans include drug coverage.</p>

    <h3 id="part-d">Part D</h3>
    <p>Prescription drug coverage. You get it either built into a Medicare Advantage plan or as a stand-alone plan bought alongside Original Medicare. Each Part D plan has its own formulary, its own tiers and its own pharmacy network.</p>

    <h3 id="ma-pd">MA-PD</h3>
    <p>Shorthand for a Medicare Advantage plan that includes prescription drug coverage. If you see "MA-PD" in a comparison, it means one plan doing both jobs.</p>

    <h3 id="pdp">Stand-alone Part D plan (PDP)</h3>
    <p>A drug-only plan, bought to sit alongside Original Medicare. Nationwide the number offered fell from 474 in 2025 to 367 in 2026, which is why comparing them each year is worth the time.</p>

    <h3 id="medigap">Medigap (Medicare Supplement)</h3>
    <p>A separate private policy that pays some of the costs Original Medicare leaves to you. It is not a Medicare Advantage plan and you cannot hold both. Medigap is sold and priced under different rules from the plans in our comparison tool, and switching outside your one-time guaranteed-issue window can involve medical questions.</p>
  </div>
</section>

<section class="section">
  <div class="wrap prose">
    <h2 id="windows">Enrollment windows and paperwork</h2>

    <h3 id="aep">Annual Enrollment Period (AEP)</h3>
    <p>The main fall window, {{AEP_WINDOW_RANGE_LONG}}, open to everyone with Medicare. You can switch between Original Medicare and Medicare Advantage, change Medicare Advantage plans, or add, drop or change a Part D plan. You may make as many changes as you like; only the last one counts, and it takes effect {{AEP_COVERAGE_START_LONG}}. Also called Open Enrollment or the fall Medicare season.</p>

    <h3 id="ma-oep">Medicare Advantage Open Enrollment Period (MA OEP)</h3>
    <p>A second, narrower window, {{AEP_MA_OEP_RANGE_LONG}}. It is only for people already in a Medicare Advantage plan and allows one change. It is not the same thing as AEP, and if you are on Original Medicare it is not for you.</p>

    <h3 id="sep">Special Enrollment Period (SEP)</h3>
    <p>A window outside the usual ones, opened by a specific life event such as moving. If you have missed AEP and think an event applies to you, the official Medicare Plan Finder or 1-800-MEDICARE will tell you whether it does.</p>

    <h3 id="anoc">Annual Notice of Change (ANOC)</h3>
    <p>The booklet your plan mails every September setting out what changes for next year — premium, deductible, copays, drug list, and any benefit being dropped. It is the single most useful piece of paper you get all year, and the easiest to set aside unopened. The summary of changes is at the front.</p>

    <h3 id="renewing">Renewing</h3>
    <p>Your plan continues into next year under the same plan ID. It does not mean nothing changed — a renewing plan can still raise its premium, move a drug to a higher tier or drop a dental benefit.</p>

    <h3 id="consolidated">Consolidated</h3>
    <p>Your plan is being folded into a different plan, which becomes your coverage unless you choose otherwise. The successor has its own premium, its own drug list and its own network, so it is a new plan rather than a continuation.</p>

    <h3 id="service-area-reduction">Service-area reduction</h3>
    <p>The plan still exists but is being offered in fewer places. The only question it raises is whether it is still offered in your county.</p>

    <h3 id="terminating">Terminating</h3>
    <p>The plan will not be offered next year. This is the result with a deadline attached, because doing nothing has a consequence — see <a href="/medicare-plan-changes#what-to-do-next">what to do next</a>.</p>
  </div>
</section>

<section class="section section--wash">
  <div class="wrap prose">
    <h2 id="raise">Your Social Security raise</h2>

    <h3 id="cola">Cost-of-living adjustment (COLA)</h3>
    <p>The yearly increase Social Security adds to your benefit so that rising prices do not shrink what it buys. It is set by a formula written into law, not by a vote. It takes effect with your January payment and is permanent. The {{COLA_CONFIRMED_YEAR}} COLA was {{COLA_CONFIRMED}}%.</p>

    <h3 id="cpi-w">CPI-W</h3>
    <p>The Consumer Price Index for Urban Wage Earners and Clerical Workers, published monthly by the Bureau of Labor Statistics as series CWUR0000SA0. It is the specific inflation measure the COLA law names — not the more commonly quoted CPI-U. Only July, August and September count.</p>

    <h3 id="gross-and-net">Gross benefit and net deposit</h3>
    <p>Two different numbers. Your gross benefit is the amount before anything is taken out. Your net deposit is what reaches your bank after Part B is withheld. A COLA raises the first by the full percentage; the second can rise by less. The gap between them is Part B.</p>

    <h3 id="hold-harmless">Hold-harmless provision</h3>
    <p>A protection in the law meaning that, for most people, the dollar rise in the Part B premium cannot exceed the dollar rise in their Social Security benefit — so a Part B increase should not push the deposit backwards. It does not cover everyone; people new to Medicare and higher earners paying IRMAA are among those it may not fully shield.</p>

    <h3 id="irmaa">IRMAA</h3>
    <p>The Income-Related Monthly Adjustment Amount — an extra charge added to the standard Part B and Part D premiums for people above certain income levels. It is based on a tax return from a couple of years earlier and rises in steps. If it applies to you, more of your raise is absorbed. The income thresholds are set by the government and change each year, so check the current ones rather than last year's.</p>

    <h3 id="part-d-cap">Part D out-of-pocket cap</h3>
    <p>A yearly ceiling on what you pay out of pocket for covered prescription drugs. It began in 2025 and is raised a little every year, so it is not a fixed amount. For {{MEDICARE_FIGURES_YEAR}} it is ${{PART_D_OOP_CAP}}. It covers deductibles, copays and coinsurance on covered drugs — not your monthly premium, and not drugs your plan does not cover.</p>

    <h3 id="doughnut-hole">Coverage gap (the "doughnut hole")</h3>
    <p>The old stretch of Part D in which your share of drug costs jumped once spending passed a threshold. The yearly cap replaced it. If you hear the phrase, it is describing how Part D used to work.</p>
  </div>
</section>

<section class="section">
  <div class="wrap prose">
    <h2 id="files">The public files behind this site</h2>
    <p>These are the government files our tools read. You can download every one of them yourself; none of it is proprietary. <a href="/how-it-works">How it works</a> shows the full list and the math.</p>

    <h3 id="landscape">Landscape file</h3>
    <p>The CMS file listing which plans are offered in each county, with the headline facts — premium, deductible, star rating. It is the snapshot of what is on the shelf.</p>

    <h3 id="crosswalk">Crosswalk file</h3>
    <p>The CMS file that maps each plan's current ID to its ID for next year and flags whether it is renewing, being consolidated or terminating. Without it you could not tell whether "your plan" next year is the same plan, a merged one, or gone. It is what makes a real year-over-year comparison possible.</p>

    <h3 id="pbp">Plan Benefit Package (PBP)</h3>
    <p>The CMS benefit data behind the headline numbers — what a plan actually covers, including the maximum out-of-pocket and the extras.</p>

    <h3 id="puf">Public Use File (PUF)</h3>
    <p>A dataset CMS releases for anyone to download. The Part D formulary PUFs hold the drug lists and pricing tiers.</p>

    <h3 id="ship">State Health Insurance Assistance Program (SHIP)</h3>
    <p>A free counseling service. Every state has one. SHIP counselors sit with you, look at your own medicines and doctors, and take no commission from any insurer. They are not connected with us. Find your state's program through the official <a href="https://www.medicare.gov/plan-compare/" rel="nofollow noopener" target="_blank">Medicare</a> site or by calling 1-800-MEDICARE.</p>
  </div>
</section>

<section class="section section--wash">
  <div class="wrap center">
    <h2>Now put a word to work.</h2>
    <p class="lead" style="margin-inline:auto;max-width:44ch;">Both tools are free, run in your browser, and never ask for your name or phone number.</p>
    <div class="hero__cta" style="justify-content:center;">
      <a class="btn btn--primary btn--lg" href="/medicare-plan-changes">See what changed in my plan</a>
      <a class="btn btn--ghost btn--lg" href="/cola-calculator">Calculate my raise</a>
    </div>
  </div>
</section>

<!-- Footer link to add at src/partials/footer.html:24 -->
<li><a href="/glossary">Glossary of terms</a></li>

<!-- Paragraph to add at src/pages/guides.html:49 -->
<p class="muted center" style="margin-top:1.75rem;max-width:60ch;margin-inline:auto;">Meet a word you do not know? The <a href="/glossary">plain-language glossary</a> defines every term these guides use, from ANOC to IRMAA.</p>
```

**Alt text** — No image asset. The only graphics are existing sprite icons in the jump list, which stay <svg class="icon" aria-hidden="true" focusable="false"> exactly as elsewhere. Do not add an illustration — a glossary that opens with a decorative image pushes the first term below the fold at the largest of the three text sizes.

**Dark mode** — Inherits entirely. Uses only .prose, .section, .section--wash, .badge and .eyebrow, all of which already have dark-theme token definitions in src/assets/css/site.css. One caution: do not wrap entries in .callout with .callout__title — that class is recoloured for dark mode and prints near-white on white paper (see the comment at src/pages/medicare-plan-changes.html:33-35), and a glossary is a page people print.

**Compliance check** — The risk here is a glossary reading as if it speaks for CMS or SSA. Steered around by writing every entry as description, never instruction — no entry contains "you should", none compares plan types favourably, none names a carrier, and none reproduces anything that looks like a plan document. The Part D cap and Part B entries quote only the tokenised figures from src/data/medicare-figures.csv and label the year. No seals, eagles, flags or agency marks; the footer independence disclaimer (src/partials/independence-disclaimer.html) renders on this page as on every other. The SHIP entry names the program and says plainly that it is not us and takes no commission — which reinforces the non-TPMO position rather than eroding it.

---

## CG-2 · "What to do next, by result" — the missing step after the plan tool tells you your plan is terminating

> **P0** · effort: medium · kind: `content-section` · route: /medicare-plan-changes
> Source lens: Content gaps

**Why it earns its place.** This is the sharpest place on the site where a page stops one step short. The tool computes a diff, labels the plan Renewing / Consolidated / Service-area reduction / Terminating, and the page then explains what each word means — and stops. A reader whose plan is terminating now knows a fact with a deadline attached and has been given no order of operations. The existing follow-through is one sentence in a footnote at line 129 ("Always confirm on the official Medicare Plan Finder"), which is where to go, not what to do. After this section exists, each of the four results has a concrete next action, the deadline is stated where the consequence is stated, and the reader is told the three things (drug list, pharmacy, doctors) that decide most of the cost difference and that the comparison table deliberately cannot show.

**Insertion point.** src/pages/medicare-plan-changes.html:175 — between the closing </ul> of the four-status list (line 174) and the {{> ad-inline }} include (line 176), inside the existing <div class="wrap prose"> of the "How to read your result" section.

**Specification** — ~470 words. One <h2 id="what-to-do-next"> plus five <h3>. Pure prose inside the existing .wrap.prose — no new classes, no new CSS, no JS. Adds ~4.2 KB raw / ~1.3 KB brotli to a 33,855-byte page. Uses only tokens already resolved on this page's token map (build.mjs:323 spreads colaTokens into every page): AEP_COVERAGE_START_LONG = "January 1, 2027", AEP_WINDOW_END_LONG = "December 7, 2026", AEP_WINDOW_RANGE_LONG = "October 15 – December 7, 2026". The h2 id is the deep-link target used by the glossary's #terminating entry (CON-01).

**Draft copy / markup — ready to insert**

```html
<h2 id="what-to-do-next">What to do next, by result</h2>
<p>Knowing the label is half of it. Here is the order most people work through for each result, and where to confirm the answer. None of this is advice about a particular plan — we do not recommend plans, and we are not paid to.</p>

<h3>If your plan is renewing</h3>
<p>Nothing is being taken away from you, so you have time. Read the change column above and ask three questions. Did the premium or deductible move by an amount that matters to you? Did the maximum out-of-pocket go up? Did an extra you actually use — dental, vision, hearing, an over-the-counter allowance — disappear? If all three answers are no, you can leave your coverage alone and it continues on {{AEP_COVERAGE_START_LONG}}. If any answer is yes, put your plan side by side with two others before {{AEP_WINDOW_END_LONG}}.</p>

<h3>If your plan is being consolidated</h3>
<p>Your plan is being folded into the successor plan named above, and unless you choose something else that is the plan you will be in on {{AEP_COVERAGE_START_LONG}}. Treat the successor as a new plan rather than a continuation: it has its own premium, its own drug list and its own network. Look up its plan ID on the official Medicare Plan Finder and check your prescriptions and your doctors against it, not against the plan you have now.</p>

<h3>If your plan has a service-area reduction</h3>
<p>The plan still exists, but in fewer places. That raises exactly one question: is it still offered in your county? Confirm it with your ZIP code on the official Medicare Plan Finder. If it is not, you are in the same position as someone whose plan is ending — read the next paragraph.</p>

<h3>If your plan is terminating</h3>
<p>This is the result with a deadline attached, because doing nothing has a consequence. Your plan will not exist on {{AEP_COVERAGE_START_LONG}}. If a Medicare Advantage plan ends and you do not choose another, you may be moved back to Original Medicare — which on its own does not include prescription drug coverage. If a stand-alone Part D plan ends and you do not choose another, you can be left without drug coverage. Pick a replacement during the {{AEP_WINDOW_RANGE_LONG}} window. Your plan is also required to write to you about the ending; keep that letter.</p>

<h3>Whatever your result says</h3>
<p>Take three things with you when you confirm: a list of the medicines you take with their doses, the pharmacy you use, and the doctors you want to keep. Those three decide most of the cost difference between plans, and none of them can appear in the comparison above — the public files do not know what you take or who you see. Enter them on the official <a href="https://www.medicare.gov/plan-compare/" rel="nofollow noopener" target="_blank">Medicare Plan Finder</a>, or call 1-800-MEDICARE. If you would rather talk it through with a person who earns no commission either way, your State Health Insurance Assistance Program counselor is free.</p>
```

**Alt text** — No image asset. Do not add a decision-tree diagram here — a flowchart of four branches would be an inline SVG that the print stylesheet has to handle and that a screen reader has to be given an equivalent for, and the four <h3> headings already give the branching a navigable structure for free.

**Dark mode** — Inherits from .prose. Deliberately avoids .callout / .callout__title even though the terminating branch is the most urgent: that class is recoloured for dark mode and prints near-white on white paper, which is documented at src/pages/medicare-plan-changes.html:33-35, and this is a section people will print alongside the tool's result via the existing #pd-print button. Plain <h3> + <p> survives both themes and the printed page.

**Compliance check** — The live risk is that "what to do next" turns into plan advice, which would put the site inside the CMS chain of enrollment it is built to stay outside of. Steered around three ways: no branch names a plan, a plan type, or a carrier as better; every branch ends by sending the reader to the official Medicare Plan Finder or 1-800-MEDICARE to confirm rather than to us; and the section opens by saying explicitly that it is an order of operations, not advice about a particular plan. The terminating branch mirrors the hedged wording the site already uses at src/pages/guide-aep.html:118 and src/pages/medicare-plan-changes.html:173 rather than introducing a new eligibility rule — it says what most people find, not what the regulation requires. No phone number of ours appears, and nothing here collects anything.

---

## CG-3 · "Free help that is not us" — a shared block naming SHIP, 1-800-MEDICARE and the Plan Finder

> P1 · effort: small · kind: `content-component` · route: sitewide (partial, used on /about and /guides/medicare-aep-2026)
> Source lens: Content gaps

**Why it earns its place.** The site's entire promise is "no phone number, no hand-off, we will not answer questions about your coverage." It states that refusal fourteen times across /about, /privacy, /how-it-works and every guide, and never once completes the sentence with where a person should go instead. SHIP appears twice in the whole site — once in a bullet at src/pages/guide-aep.html:82 and once inside a collapsed FAQ at src/pages/guides.html:66 — with no explanation of what it is. A reader who genuinely needs a human is currently left with "not here" and nothing else, which is the one place the site's positioning reads as evasive rather than principled. After this block exists, the refusal has a destination attached, and the site's independence claim gets stronger rather than weaker: it names the free, commission-free alternatives and says plainly that none of them pays us.

**Insertion point.** New partial /home/user/BenefitClock/src/partials/free-help.html. Primary insertion: src/pages/about.html:90 — between the closing </div> of the "See it for yourself" callout (line 89) and the closing </div> of .wrap.prose (line 90), so it lands directly after the page's list of promises. Second insertion: src/pages/guide-aep.html:89 — between the closing </div> of the "Where BenefitDial stands" callout (line 88) and the closing </div> of .wrap.prose (line 89). Include with {{> free-help }}.

**Specification** — ~150 words in a single <aside class="callout callout--info" aria-label="Free help that is not us">. Reuses .callout, .callout__title, and the ic-shield-lock sprite symbol. No new CSS. ~1.5 KB raw / ~600 bytes brotli per insertion, ~3 KB total across two pages. Deliberately uses ic-shield-lock and NOT ic-phone: ic-phone is the icon /about uses at line 45 to label the lead-gen funnel negatively, and reusing it here would visually equate SHIP with a call center. No tokens required.

**Draft copy / markup — ready to insert**

```html
<aside class="callout callout--info" aria-label="Free help that is not us">
  <p class="callout__title"><svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-shield-lock" xlink:href="#ic-shield-lock"/></svg> If you want to talk to a person, here is who — and it is not us</p>
  <p>We do not answer questions about your own coverage, and we have no one to pass you to. That is on purpose. Three places will help you for nothing, and none of them earns a commission if you enroll:</p>
  <ul style="margin:0.6rem 0 0;">
    <li><strong>Your State Health Insurance Assistance Program (SHIP).</strong> Every state has one. SHIP counselors sit down with your own medicines and your own doctors and take no money from any insurer. Ask for your state's program on the official Medicare site or by calling 1-800-MEDICARE.</li>
    <li><strong>1-800-MEDICARE</strong> (TTY 1-877-486-2048) — the official government line.</li>
    <li><strong>The official <a href="https://www.medicare.gov/plan-compare/" rel="nofollow noopener" target="_blank">Medicare Plan Finder</a></strong>, where you enter your medicines and pharmacy, see your real costs, and actually enroll.</li>
  </ul>
  <p style="margin:0.9rem 0 0;">BenefitDial is not connected with any of them, and none of them pays us. We list them because they are the honest answer to a question we will not answer for you.</p>
</aside>
```

**Alt text** — No image asset. The single icon is <svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-shield-lock"…> exactly as at src/pages/index.html:78, so it is decorative and correctly excluded from the accessibility tree. Do not illustrate this block — any depiction of a person helping another person over the phone is the exact imagery the compliance rules forbid.

**Dark mode** — Inherits. .callout--info and .callout__title both have dark-theme token definitions. Note the documented caveat: .callout__title prints near-white on white paper (src/pages/medicare-plan-changes.html:33-35). This block is not inside either printable result region, so the title class is safe here — but if it is ever moved into the plan-tool result, swap the title to an inline-styled <p style="font-weight:800;">.

**Compliance check** — Two risks. First, naming 1-800-MEDICARE and SHIP could read as government affiliation — steered around by the closing line, which states in the site's own voice that BenefitDial is not connected with any of them and lists them precisely because it will not answer for you; the footer independence disclaimer restates the non-affiliation on the same page. Second, this must not become a hand-off: there is no form, no callback, no BenefitDial phone number, and nothing is collected — the reader dials a government line or finds a state counselor themselves. The block also strengthens the non-TPMO position by naming SHIP as commission-free, which is the honest contrast to the lead-gen funnel /about already describes. I deliberately did NOT hardcode shiphelp.org: I could not resolve it from this environment (all outbound hosts are refused at the proxy), and the site's standard is that every link it publishes is one it has checked. Route readers via the official Medicare site and 1-800-MEDICARE, both of which the site already links twelve times; add the direct SHIP URL later, once someone has opened it.

---

## CG-4 · "Don't see your plan in the list?" — closing the dead end for readers on Original Medicare or Medigap

> P1 · effort: small · kind: `content-section` · route: /medicare-plan-changes
> Source lens: Content gaps

**Why it earns its place.** The tool asks for state, then county, then plan, and every failure to find a plan currently looks like the same failure. Three quite different readers hit it: someone on Original Medicare with no private plan, who has nothing to look up and does not know that; someone with a Medigap policy, which is not in the CMS Landscape and Crosswalk files the tool reads; and someone whose county is outside the dataset. Only the third is acknowledged, in a .hint at line 55 that a reader has to have already opened the state dropdown to see. The first two get no explanation at all and reasonably conclude the tool is broken. This is also the site's only "is this me?" orientation moment, and it belongs here rather than on a separate page — the question only occurs to people once they are already stuck. After this ships, each of the three readers gets a one-line diagnosis and is routed to the tool that does answer their question (the Original Medicare reader in particular is sent to /cola-calculator, which is genuinely the right tool for them).

**Insertion point.** src/pages/medicare-plan-changes.html:135 — between the closing </div> of .tool (line 134) and the opening <div class="grid grid--2"> of the two promo cards (line 136). It must sit above the promo cards: a reader who could not find their plan should meet this before being offered two more links.

**Specification** — ~180 words in one <div class="callout callout--info" style="margin-top:1.75rem;"> containing a .callout__title, one <p>, and a three-item <ul>. Reuses existing classes only; no new CSS, no JS. ~1.9 KB raw / ~700 bytes brotli on a 33,855-byte page. No tokens required. Give it id="no-plan" so the tool's own coverage hint at line 55 and the glossary's #medigap entry can link straight to it.

**Draft copy / markup — ready to insert**

```html
<div class="callout callout--info" id="no-plan" style="margin-top:1.75rem;">
  <p class="callout__title">Don't see your plan in the list?</p>
  <p>There are three ordinary reasons, and none of them mean something is broken.</p>
  <ul style="margin:0.6rem 0 0;">
    <li><strong>You have Original Medicare and no separate drug plan.</strong> Then there is no plan here to look up, and that is fine. Parts A and B do not get rewritten each year the way a private plan does. What changes for you is the Part B premium that comes out of your Social Security check — and our <a href="/cola-calculator">COLA calculator</a> is the tool that answers that.</li>
    <li><strong>You have a Medigap policy.</strong> Medigap is sold and priced under different rules, and it is not in the CMS Landscape and Crosswalk files this tool reads — so it will never appear in the list. Your insurer sends you its own notice of any change.</li>
    <li><strong>Your county is not in this checker.</strong> We cover a limited list of counties. The official <a href="https://www.medicare.gov/plan-compare/" rel="nofollow noopener" target="_blank">Medicare Plan Finder</a> covers every county in the country, and 1-800-MEDICARE can look it up with you.</li>
  </ul>
</div>
```

**Alt text** — No image asset. Deliberately not illustrated — this block appears immediately below a tool that already carries a large amber sample-data warning, and a second visual at this point competes with the one warning on the page that must not be missed.

**Dark mode** — Inherits. .callout--info has dark-theme tokens. One real caveat: .callout__title is recoloured for dark mode and prints near-white on white paper, documented at src/pages/medicare-plan-changes.html:33-35. This block sits outside #plandiff-results and so is not part of what the #pd-print button prints, which makes the title class safe here — but if it is ever moved inside the result region, replace .callout__title with <p style="font-weight:800;font-size:1.1rem;"> the way the sample-data banner at line 36 already does.

**Compliance check** — Two risks handled. First, describing what Medigap is could drift into advising a coverage type — steered around by saying only what our data does and does not contain, which is a verifiable fact about our own dataset (src/data/plans-current.json holds Medicare Advantage and stand-alone Part D sample records and no Medigap records), rather than making a claim about how Medigap works. Second, the Original Medicare bullet must not read as "Original Medicare is simpler, choose it" — it is phrased as a diagnosis of why the dropdown is empty for you, and immediately hands off to the COLA calculator. No carrier is named, no plan is compared, and nothing here collects anything. The county bullet repeats the existing routing to the official Plan Finder verbatim.

---

## CG-5 · "Where to find the two numbers this asks for" — on the COLA calculator

> P1 · effort: small · kind: `content-section` · route: /cola-calculator
> Source lens: Content gaps

**Why it earns its place.** The calculator asks for three figures and tells you where to find none of them. The benefit-amount hint at line 40 says "You'll find it on your SSA benefit statement" and stops — it does not say that a December mailed notice and the my Social Security message center in late November also carry it, both of which the site itself documents on /key-dates at lines 48-54. The Part B hint at line 71 says "Change it to match what comes out of your check" without saying where that figure is printed. And the optional next-year Part B field says "Leave blank if unknown" without ever saying when it stops being unknown, so a reader has no idea whether they are missing something. The page currently pre-fills plausible defaults, which means a reader can compute a confident-looking answer using someone else's numbers and not realise it. After this section exists, a reader knows exactly which piece of paper to fetch, and knows that the third box is genuinely empty for everyone until CMS publishes in the autumn.

**Insertion point.** src/pages/cola-calculator.html:148 — a new <section class="section"> between the closing </section> of the tool block (line 147) and the opening <section class="section section--wash"> of "How the COLA and Part B work together" (line 149).

**Specification** — ~330 words. One <h2 id="find-your-numbers"> and three <h3> inside a plain <div class="wrap prose">. No new classes, no CSS, no JS. ~3.1 KB raw / ~1.1 KB brotli on a 32,927-byte page. Tokens used, all verified against src/data/medicare-figures.json: MEDICARE_FIGURES_YEAR (2026) and PART_B_PREMIUM (202.90). Deliberately quotes no next-year Part B figure — none exists in src/data/medicare-figures.csv, whose own header comment states the CMS fact sheet is "published ~November, effective January 1", which is the only timing claim the draft makes. The my-Social-Security and December-notice timings restate src/pages/key-dates.html:48-54 rather than introducing new claims.

**Draft copy / markup — ready to insert**

```html
<section class="section">
  <div class="wrap prose">
    <h2 id="find-your-numbers">Where to find the two numbers this asks for</h2>
    <p>The calculator opens with example amounts so you can see how it behaves before you type anything. To make the answer yours, you need two figures — and both are already printed on paper you have.</p>

    <h3>Your current monthly benefit, before Part B</h3>
    <p>This is the gross amount, not the amount that lands in your bank. Three places show it. Your annual Social Security benefit statement. The COLA notice mailed each December, which states your new monthly amount for the year ahead. And the message center of your my Social Security account online, where that notice usually appears in late November, before the paper copy reaches you. If the only number you know is your deposit, add your Part B premium back onto it and you have the gross figure.</p>

    <h3>Your Medicare Part B premium</h3>
    <p>For {{MEDICARE_FIGURES_YEAR}} the standard premium is ${{PART_B_PREMIUM}} a month, and that is what the box starts with. Yours may not be the standard one. It is higher if the income-related surcharge applies to you, it may be lower if the hold-harmless provision protects you, and some people have it paid on their behalf. The amount actually withheld is printed on the same Social Security notice as your benefit — use that one rather than the standard figure.</p>

    <h3>Next year's Part B premium, if you want it</h3>
    <p>Leave this box empty until the number exists. CMS sets the following year's standard premium each autumn and publishes it in November, so for most of the year there is genuinely nothing to enter. An empty box tells the calculator to assume the premium holds steady, which is the honest assumption until the announcement. When it lands, come back and type it in — that is the version of the answer that tells you what your deposit really does.</p>
  </div>
</section>
```

**Alt text** — No image asset. The obvious temptation is a labelled mock-up of a Social Security benefit statement with the two figures circled. Reject it: a realistic-looking government notice is precisely the imagery the compliance rules forbid, and a fake one with made-up amounts on a page about your real deposit is worse. Prose naming the three documents does the same job with no risk.

**Dark mode** — Inherits fully — .section, .wrap, .prose, h2, h3 and p all carry dark-theme token definitions in site.css. Nothing here has a background of its own, so there is no light panel to glow in dark mode.

**Compliance check** — Risk: describing Social Security notices could read as speaking for SSA, and stating who pays what for Part B could read as an eligibility rule. Steered around by naming documents rather than paraphrasing rules — the draft says where a figure is printed, not who qualifies for what — and by hedging the four Part B situations with "may" and "if", exactly as src/pages/guide-partb.html:131 already does. No dollar amount is asserted beyond the tokenised {{PART_B_PREMIUM}} from the data layer, and no next-year figure is invented. No form, no collection, no phone number of ours, no imagery.

---

## CG-6 · An "All four guides" block — repairing a guide link graph where one guide links to no sibling at all

> P2 · effort: small · kind: `content-component` · route: /guides/medicare-aep-2026, /guides/2027-social-security-cola, /guides/what-changed-medicare-2027, /guides/part-b-premium-and-your-cola
> Source lens: Content gaps

**Why it earns its place.** I extracted the internal link graph from all thirteen built pages. /guides/medicare-aep-2026 links to no other guide — its two cards go to the plan tool and /key-dates. Each of the other three links to exactly one sibling. So a reader who arrives on a guide from search, reads 1,100 words, and wants the next thing has at most one option and sometimes none; the only route to the full set is back up to /guides, and only the primary nav offers it. The four guides are the site's deepest content and its most likely search entry points, and they currently behave as four dead ends. After this ships, every guide ends with the whole shelf visible, plus one line pointing at the glossary — which is also how CON-01 avoids being an orphan.

**Insertion point.** New partial /home/user/BenefitClock/src/partials/guides-all.html, included as {{> guides-all }} immediately before each guide's FAQ heading, inside the existing .wrap.prose. Primary: src/pages/guide-aep.html:113 — directly above <h2>Frequently asked questions</h2> (line 113), because that guide is the one with zero sibling links today. Then guide-cola.html:159, guide-medicare-changes.html:92, guide-partb.html:119.

**Specification** — ~130 words plus four <a class="card card--link"> in a <div class="grid grid--2">, each with the existing card__icon + sprite symbol, an h3, a muted description and a .badge--info affordance — identical in structure to the four cards already on src/pages/guides.html:24-47, so the markup can be lifted from there. .grid--2 inside .wrap.prose is already an established pattern (src/pages/guide-cola.html:144). One shared partial including all four means the current guide links to itself; that is the zero-duplication path and matches how the site already repeats tool links on every page. If self-linking is unwanted, write four near-identical three-card blocks instead and accept the duplication — I would not, for a ~600-byte saving. ~2.6 KB raw per page, ~10.5 KB across four pages, ~2.8 KB brotli total. Tokens: COLA_PROJECTED_YEAR, PART_D_OOP_CAP, MEDICARE_FIGURES_YEAR, AEP_WINDOW_RANGE — all already used verbatim in the guides index.

**Draft copy / markup — ready to insert**

```html
<!-- src/partials/guides-all.html -->
<h2 id="all-guides">All four guides</h2>
<p>Each one stands on its own, so read whichever matches the question in front of you.</p>
<div class="grid grid--2" style="margin-top:1.25rem;">
  <a class="card card--link" href="/guides/2027-social-security-cola">
    <div class="card__icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="#ic-coins-up" xlink:href="#ic-coins-up"/></svg></div>
    <h3>The {{COLA_PROJECTED_YEAR}} Social Security COLA, explained</h3>
    <p class="muted">How the raise is figured from CPI-W, why the {{COLA_PROJECTED_YEAR}} figure is still an estimate, and when the official number arrives.</p>
    <span class="badge badge--info">Read the guide →</span>
  </a>
  <a class="card card--link" href="/guides/medicare-aep-2026">
    <div class="card__icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="#ic-calendar-check" xlink:href="#ic-calendar-check"/></svg></div>
    <h3>Medicare Open Enrollment: dates &amp; how it works</h3>
    <p class="muted">The {{AEP_WINDOW_RANGE}} window, what you are allowed to change, and how to get ready in about 20 minutes.</p>
    <span class="badge badge--info">Read the guide →</span>
  </a>
  <a class="card card--link" href="/guides/what-changed-medicare-2027">
    <div class="card__icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="#ic-doc-gov" xlink:href="#ic-doc-gov"/></svg></div>
    <h3>What changed across Medicare for {{COLA_PROJECTED_YEAR}}</h3>
    <p class="muted">Fewer plans on the shelf, formulary shifts, and the yearly Part D drug-cost cap — ${{PART_D_OOP_CAP}} in {{MEDICARE_FIGURES_YEAR}}.</p>
    <span class="badge badge--info">Read the guide →</span>
  </a>
  <a class="card card--link" href="/guides/part-b-premium-and-your-cola">
    <div class="card__icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="#ic-heart-pulse" xlink:href="#ic-heart-pulse"/></svg></div>
    <h3>How Medicare Part B eats into your COLA</h3>
    <p class="muted">Why a higher premium quietly shrinks your raise, plus hold-harmless and IRMAA in plain terms.</p>
    <span class="badge badge--info">Read the guide →</span>
  </a>
</div>
<p class="muted" style="margin-top:1.25rem;">Met a word you do not know? The <a href="/glossary">plain-language glossary</a> defines every term these guides use.</p>
```

**Alt text** — No image asset. The four card icons are the existing sprite symbols ic-coins-up, ic-calendar-check, ic-doc-gov and ic-heart-pulse, each inside <div class="card__icon" aria-hidden="true"> exactly as on src/pages/guides.html:25 — decorative, and the card heading carries the meaning.

**Dark mode** — Inherits with no work. .card and .card--link already have dark-theme surface and border tokens, and the ::before gradient accent at site.css:335 is theme-independent. The sprite icons are stroke="currentColor", so they follow the card text colour in both themes.

**Compliance check** — No compliance surface: four internal links and one glossary link, no figures beyond tokens already published on the guides index, no external links, no imagery beyond existing decorative sprite icons. Worth noting only that the card copy must stay descriptive of the guide and never of a plan — the drafts below reuse the guides-index wording, which has already been through that filter.

---

## CG-7 · Give the privacy policy a real last-updated date instead of a bare year

> P2 · effort: trivial · kind: `content-section` · route: /privacy
> Source lens: Content gaps

**Why it earns its place.** The privacy page currently stamps itself "Last updated: 2026". Two things are wrong with that on a page whose entire job is verifiable trust. A year is not a last-updated date — it cannot distinguish a policy revised in January from one revised last week, which is exactly the distinction a reader checking a privacy pledge is looking for. And BUILD_YEAR is derived from new Date() at scripts/build.mjs:53, so it re-stamps on every deploy regardless of whether a word of the policy changed — the same failure the codebase already identified and fixed for sitemap lastmod (see the comment at build.mjs:95-97) and for the data-freshness stamp (build.mjs:201-207), but never applied here. The page also promises at line 96 that it will "change the 'Last updated' date at the top" when the policy changes; today that promise cannot be kept, because the date changes whether or not the policy does. PAGE_MODIFIED is already computed per page from that file's own git history at build.mjs:299 and is already in every page's token map, so the fix is a one-token swap.

**Insertion point.** src/pages/privacy.html:15 — replace <p class="muted">Last updated: {{BUILD_YEAR}}</p> in place.

**Specification** — A single-line edit: {{BUILD_YEAR}} → {{PAGE_MODIFIED}}. PAGE_MODIFIED renders as an ISO date (currently 2026-08-08), derived from `git log -1 --format=%cs` on src/pages/privacy.html, with a documented fallback to the build date on a shallow clone. ISO is acceptable and conventional on a policy page. If a long date is preferred, add one line to the tokens object at scripts/build.mjs:320 — PAGE_MODIFIED_LONG: longDate(pageDates.PAGE_MODIFIED) — using the longDate helper already defined at build.mjs:186; that same token is the optional extension noted in CON-04, so take both together or neither. Net byte change: zero. Effort: one minute, plus a rebuild.

**Draft copy / markup — ready to insert**

```html
<!-- src/pages/privacy.html:15 — replace this line -->
<p class="muted">Last updated: {{BUILD_YEAR}}</p>

<!-- with this -->
<p class="muted">Last updated: {{PAGE_MODIFIED}}</p>

<!-- Optional, if a long-form date is preferred. Add to the tokens object at scripts/build.mjs:320,
     alongside ...pageDates, and use {{PAGE_MODIFIED_LONG}} here and in CON-04:

       PAGE_MODIFIED_LONG: longDate(pageDates.PAGE_MODIFIED),

     longDate is already defined at build.mjs:186 and already formats DATA_UPDATED,
     COLA_ANNOUNCE_DATE_LONG and COLA_CONFIRMED_ANNOUNCED_LONG. -->
```

**Alt text** — No image asset.

**Dark mode** — No change — .muted is unchanged and already token-driven in both themes.

**Compliance check** — This is the rare item that reduces compliance risk rather than adding any. A privacy policy that appears to have been revised on every deploy, when it has not, is a weaker document than one carrying an accurate date — and the page makes an explicit promise about that date at line 96 which it currently cannot honour. No new claim is introduced, no figure, no imagery.

# Group H — Scannability and long-form format

---

## SC-1 · `.answer` component — the reusable "short answer" box

> **P0** · effort: trivial · kind: `content-component` · route: sitewide (CSS), consumed by the 4 guides
> Source lens: Scannability

**Why it earns its place.** There is no component on this site that can carry a summary block today. `.callout` is already spoken for as an *interruption* mid-prose (12 instances across the four guides), and reusing it for a page-level summary would make the summary read as a footnote. Without this one 420-byte rule, CON-02..CON-05 cannot be built, and the measured problem — the four guides run 10,344px to 12,425px at 390x844, i.e. 12.3 to 14.7 phone screens — has no fix that doesn't require a reader to scroll.

**Insertion point.** src/assets/css/site.css:730 — immediately after the `.callout__title` rule (line 729) and before the `/* ----- Ad slots */` comment block at line 731. It sits with the callout family because it is the same visual DNA: tinted ground, accent border, heading + body. Also add `.answer__title` to the print selector list at src/assets/css/site.css:1059-1062 so it forces to #000 on paper like every other `--bc-heading` carrier.

**Specification** — CSS only, ~420 bytes raw / ~230 bytes gzipped, added once to the single stylesheet. No new file, no dependency, no JS. Uses only existing custom properties, no new tokens.

```css
/* ----- Short-answer summary -------------------------------------------
   A page-level answer, not a mid-prose interruption: 2px ring so it does not
   read as a .callout, and it sits above the first h2 rather than inside the
   argument. */
.answer {
  border: 2px solid var(--bc-accent-2);
  border-radius: var(--bc-radius-lg);
  background: var(--bc-teal-050);
  padding: 1.2rem 1.35rem;
  margin: 1.75rem 0 0;
  max-width: var(--bc-maxw-prose);
}
.answer__title { font-size: var(--bc-fs-xl); margin: 0 0 0.65rem; }
.answer ul { margin: 0; padding-left: 1.15rem; }
.answer li { margin-bottom: 0.6rem; }
.answer li:last-child { margin-bottom: 0; }
.answer a { font-weight: 700; }
```

Rendered footprint at 390px with 19px body text: 44px vertical padding + 40px title + 5 bullets × ~92px = roughly 540px, i.e. 0.64 of a phone screen. Cap drafts at 5 bullets of ≤32 words to hold that budget.

**Generation prompt — copy this verbatim**

```text
Construction spec (not a generated asset — copy the CSS block above verbatim into src/assets/css/site.css at line 730). Markup skeleton that CON-02..CON-05 fill:

```html
      <aside class="answer" aria-labelledby="ans-KEY">
        <h2 class="answer__title" id="ans-KEY">The short answer</h2>
        <ul>
          <li><strong>Lead clause.</strong> Supporting clause.</li>
        </ul>
      </aside>
```

Rules for anyone filling it: every bullet opens with a bolded independent clause that is itself the answer, so the bold text alone reads as a coherent summary; no bullet exceeds 32 words; no fact may be introduced that is not already stated lower on the same page; all figures use build tokens, never hard-coded numbers.
```

**Alt text** — n/a — no image. Accessibility contract: the box is an `<aside>` with `aria-labelledby` pointing at its own `<h2 class="answer__title">`, so it becomes a named complementary landmark a screen-reader user can jump to directly. The h2 sits between the h1 and the first section h2, which keeps the hierarchy legal (no level skipped).

**Dark mode** — Zero dark-specific CSS required. `--bc-teal-050` remaps #e9f5f5 → #10302f at src/assets/css/site.css:971, `--bc-accent-2` remaps #1a7a80 → #7fd3d6 at line 980, and `--bc-heading` (inherited by `.answer__title` from the global `h1,h2,h3,h4` rule at line 188) remaps to #eefaf9 at line 977. Body text inside inherits `--bc-ink`. Verified against the same token pairing already used by `.callout--info` (line 718), which ships in dark today.

**Compliance check** — Pure typographic component — no imagery, no seals, no marks, nothing that could read as a government or carrier device. The `--bc-teal-050` ground is the site's own existing tint, already used by `.callout--info` and `.badge--info`, so it introduces no new visual authority signal. Risk steered around: a summary box styled with an official-looking rule or seal would read as a Medicare/CMS notice; a plain 2px teal ring in the site's own palette cannot.

---

## SC-2 · "The short answer" for the What Changed Across Medicare guide

> **P0** · effort: small · kind: `content-section` · route: /guides/what-changed-medicare-2027
> Source lens: Scannability

**Why it earns its place.** This is the worst page on the site: 12,425px tall at 390x844 = 14.7 phone screens. The three things the page exists to say are buried at 1,559px (plan-count charts), 4,197px (the $2,100 drug cap callout — 5.0 screens down) and 6,430px (the three-forces list — 7.6 screens down). A reader who reads only the lead paragraph learns that things changed but not one thing that changed. After this block, the same reader knows the four concrete facts at 480px — 0.6 screens — and can decide whether the remaining 14 screens are worth their time.

**Insertion point.** src/pages/guide-medicare-changes.html:17 — a new block inserted between the badge/provenance paragraph at line 16 and the closing `</div>` at line 17, so it lands inside the opening `.wrap` and above the `{{> ad-leaderboard }}` at line 20.

**Specification** — HTML text block, ~1,020 bytes raw / ~440 bytes gzipped. Renders ~560px tall at 390x844 (four bullets, 24/38/31/28 words). Zero images, zero async content, no `<img>` or web font, so CLS stays at the measured 0.0000 — the block is static server-rendered markup that occupies its space on first paint. Pushes the ad-leaderboard from 1,024px to ~1,584px and the first h2 from 1,152px to ~1,712px; page total grows 12,425px → ~12,985px (+4.5%). That is the honest cost, and it buys the reader 5.0 screens of scrolling they no longer have to do to reach the drug cap.

**Draft copy / markup — ready to insert**

```html
<aside class="answer" aria-labelledby="ans-wc">
        <h2 class="answer__title" id="ans-wc">The short answer</h2>
        <ul>
          <li><strong>There are fewer plans to choose from.</strong> Stand-alone Part D drug plans fell from 474 in 2025 to 367 in 2026, and the average person's Medicare Advantage choices went from 34 to 32.</li>
          <li><strong>Your drug costs now have a ceiling.</strong> Part D caps what you pay out of pocket for covered prescriptions at <strong>${{PART_D_OOP_CAP}}</strong> in {{MEDICARE_FIGURES_YEAR}}, and the old "doughnut hole" is gone. The cap is raised a little every year.</li>
          <li><strong>Premiums, drug lists and extras are all moving.</strong> Plans are re-pricing to fit the redesigned Part D benefit, so dental, vision and drug tiers can change even when the plan name stays the same.</li>
          <li><strong>Averages won't tell you what happened to you.</strong> Read the Annual Notice of Change your plan mails each September, then <a href="/medicare-plan-changes">compare your own plan side by side</a>.</li>
        </ul>
      </aside>
```

**Alt text** — n/a — no image. `<aside class="answer" aria-labelledby="ans-wc">` with `<h2 class="answer__title" id="ans-wc">The short answer</h2>`, giving a named complementary landmark. Heading order on the page becomes h1 (line 14) → h2 "The short answer" → h2 "Fewer plans on the menu" (line 24): no level skipped, WCAG 1.3.1 intact.

**Dark mode** — Inherits CON-01 entirely; no per-page dark rules. The one page-specific check: the `<a href="/medicare-plan-changes">` inside bullet 4 sits on `--bc-teal-050`, which in dark is #10302f. Link colour comes from `--bc-link` (#7ecbd0 in dark) — the same pairing already shipping inside `.callout--info` links on this page at line 42, and the dark block at src/assets/css/site.css:1017 already re-points `.callout--info a` to `--bc-accent`. Add `.answer a` to that same line-1017 selector list so the link keeps identical treatment.

**Compliance check** — Every figure is lifted from the page's own body copy and cited to the same public CMS files the page already names — 474/367 and 34/32 from line 33 (repeated in the FAQ at line 97), the cap from lines 38 and 42, re-pricing from lines 45 and 52-58, the ANOC from line 62. No new fact is invented. No carrier is named, no plan ID appears, and the closing bullet routes to BenefitDial's own comparison tool rather than implying a recommendation — consistent with the site's non-TPMO positioning stated at line 125 and on /about. The phrase "compare your own plan side by side" deliberately avoids "find the best plan", which would read as a recommendation.

---

## SC-3 · "The short answer" for the Part B and your COLA guide

> **P0** · effort: small · kind: `content-section` · route: /guides/part-b-premium-and-your-cola
> Source lens: Scannability

**Why it earns its place.** The page's payoff number — "raise you actually keep, +$45.00" — is the last row of the worked-example table, measured at 3,698px, which is 4.4 phone screens down. The whole page is 10,344px (12.3 screens). Worse, the longest unbroken prose run on the site's second-longest guide starts at 1,332px: 916px of continuous body text, 3 paragraphs, 160 words, with no heading, list, table, callout or figure to break it. A reader who bounces before 4.4 screens leaves with nothing. This block gives them the formula and the worked result at 0.6 screens.

**Insertion point.** src/pages/guide-partb.html:17 — between the badge paragraph at line 16 and the closing `</div>` at line 17, inside the opening `.wrap`, above `{{> ad-leaderboard }}` at line 20.

**Specification** — HTML text block, ~1,150 bytes raw / ~480 bytes gzipped. Renders ~640px at 390x844 (five bullets). Static markup only — CLS unchanged at 0.0000. Pushes the ad-leaderboard from 1,160px to ~1,800px and the first h2 from 1,288px to ~1,928px; page total 10,344px → ~10,984px (+6.2%).

**Draft copy / markup — ready to insert**

```html
<aside class="answer" aria-labelledby="ans-pb">
        <h2 class="answer__title" id="ans-pb">The short answer</h2>
        <ul>
          <li><strong>Part B comes out of your check before you ever see it.</strong> Social Security withholds the premium and sends it to Medicare, so your raise and your premium increase land on the same deposit.</li>
          <li><strong>The whole thing is one subtraction.</strong> Net deposit = your benefit × (1 + COLA) − your Medicare Part B premium.</li>
          <li><strong>A worked example: a $2,000 benefit with a 3% raise gains $60 a month — but if Part B rises $15, you keep $45.</strong> Those are round, made-up figures, used to show the shape of the subtraction.</li>
          <li><strong>For most people your deposit cannot go backwards.</strong> The hold-harmless provision stops the dollar rise in Part B exceeding the dollar rise in your benefit — though it doesn't cover everyone, including people new to Medicare and higher earners who pay IRMAA.</li>
          <li><strong>The real {{MEDICARE_FIGURES_YEAR}} figures:</strong> the standard Part B premium is <strong>${{PART_B_PREMIUM}}</strong> a month and the deductible is <strong>${{PART_B_DEDUCTIBLE}}</strong> for the year. <a href="/cola-calculator">Run your own numbers →</a></li>
        </ul>
      </aside>
```

**Alt text** — n/a — no image. `<aside class="answer" aria-labelledby="ans-pb">` + `<h2 id="ans-pb">The short answer</h2>`. Heading order: h1 (line 14) → h2 "The short answer" → h2 "Why the two are linked" (line 24). Legal, no skipped level.

**Dark mode** — Inherits CON-01. The `<a href="/cola-calculator">` in the final bullet takes the same `--bc-link` / `.callout--info a` treatment described in CON-02; adding `.answer a` to the dark-block selector at src/assets/css/site.css:1017 covers it once for all four guides.

**Compliance check** — Bullet 3 carries the page's own "round, made-up figures" hedge in the same breath as the numbers, matching the guardrail already written at line 35 and line 82 — the $2,000/3%/$180/$195 example must never travel without it, or it reads as a benefit quote. The real premium and deductible are pulled from build tokens ({{PART_B_PREMIUM}} = 202.90, {{PART_B_DEDUCTIBLE}} = 283) so they cannot drift from the CMS-sourced data file. No carrier, no plan, no phone number, no advisor; the only outbound action is the site's own on-device calculator, which the page states at line 103 never transmits input.

---

## SC-4 · "The short answer" for the Medicare Open Enrollment guide

> **P0** · effort: small · kind: `content-section` · route: /guides/medicare-aep-2026
> Source lens: Scannability

**Why it earns its place.** This is the most deadline-driven page on the site and its actionable content is the furthest away: the 20-minute preparation checklist sits at 4,600px (5.5 screens) and the FAQ block at 8,799px (10.4 screens) on an 11,065px page. The dates are already in the lead at 488px, which is the one thing this page gets right — so the summary's job here is different: it must deliver the *permissions* (what you may actually change) and the AEP-vs-OEP distinction, which today only appear at 2,480px and 2,123px. Measured: the longest unbroken prose run on this page is 458px starting at 3,235px.

**Insertion point.** src/pages/guide-aep.html:16 — between the lead paragraph at line 15 and the closing `</div>` at line 16, above `{{> ad-leaderboard }}` at line 19.

**Specification** — HTML text block, ~1,080 bytes raw / ~450 bytes gzipped. Renders ~600px at 390x844 (five bullets). Static markup — CLS stays 0.0000. Pushes the ad-leaderboard from 904px to ~1,504px; page total 11,065px → ~11,665px (+5.4%).

**Draft copy / markup — ready to insert**

```html
<aside class="answer" aria-labelledby="ans-aep">
        <h2 class="answer__title" id="ans-aep">The short answer</h2>
        <ul>
          <li><strong>The window is {{AEP_WINDOW_RANGE_LONG}}.</strong> Anything you change takes effect <strong>{{AEP_COVERAGE_START_LONG}}</strong>, not the day you enroll.</li>
          <li><strong>You can switch between Original Medicare and Medicare Advantage, move to a different Medicare Advantage plan, or join, switch or drop a Part D drug plan.</strong> Medigap is the exception — its rules work differently.</li>
          <li><strong>You can change your mind as often as you like.</strong> Only the plan you are enrolled in when {{AEP_WINDOW_END}} passes actually counts.</li>
          <li><strong>Getting ready takes about 20 minutes.</strong> Read the Annual Notice of Change your plan mailed in September, write down your prescriptions and pharmacies, and list the doctors you want to keep.</li>
          <li><strong>You never have to give anyone a phone number to compare plans</strong> — and Medicare will never call you out of the blue to sell one.</li>
        </ul>
      </aside>
```

**Alt text** — n/a — no image. `<aside class="answer" aria-labelledby="ans-aep">` + `<h2 id="ans-aep">The short answer</h2>`. Heading order: h1 (line 14) → h2 "The short answer" → h2 "What Open Enrollment is — and when it happens" (line 23).

**Dark mode** — Inherits CON-01 with no page-specific rules. This block contains no links, so the `.answer a` dark treatment is not exercised here.

**Compliance check** — This is the highest-compliance-risk page on the site, because it is the page a lead-gen operator would monetise. The draft mirrors the page's own anti-TPMO language verbatim from lines 79-80 and reproduces the "no phone number / no cold calls" promise as the closing bullet, so the summary reinforces the site's positioning rather than diluting it. No carrier is named, no plan is recommended, no enrollment path is offered here — the page already routes enrollment to medicare.gov and 1-800-MEDICARE at line 71 and the draft does not compete with that. Dates come from the {{AEP_*}} build tokens sourced from CMS Medicare & You / 42 CFR 422.62, so they cannot go stale independently of the data file.

---

## SC-5 · "The short answer" for the 2027 Social Security COLA guide

> **P0** · effort: small · kind: `content-section` · route: /guides/2027-social-security-cola
> Source lens: Scannability

**Why it earns its place.** 11,039px page (13.1 screens). The CPI-W formula bullets are at 2,316px (2.7 screens) and the worked-example table at 3,579px (4.2 screens). Critically, the page's most important caveat — that 3.6% is an estimate and can move — is written out at 5,050-5,366px, six screens down; the badge at 857px says "Early estimate" but a reader skimming a headline number will take 3.6% as fact. Putting the estimate/official distinction in bullet 1 at 0.5 screens is the single highest-value scannability edit on this page, and it is also the one with a factual-accuracy consequence.

**Insertion point.** src/pages/guide-cola.html:17 — between the estimate-badge paragraph at line 16 and the closing `</div>` at line 17, above `{{> ad-leaderboard }}` at line 20.

**Specification** — HTML text block, ~1,130 bytes raw / ~470 bytes gzipped. Renders ~590px at 390x844 (four bullets, one of them long). Static markup — CLS 0.0000. Pushes the ad-leaderboard from 990px to ~1,580px; page total 11,039px → ~11,629px (+5.3%).

**Draft copy / markup — ready to insert**

```html
<aside class="answer" aria-labelledby="ans-cola">
        <h2 class="answer__title" id="ans-cola">The short answer</h2>
        <ul>
          <li><strong>The {{COLA_PROJECTED_YEAR}} COLA is estimated at {{COLA_PROJECTED}}%, and that is not the official number.</strong> The Social Security Administration is expected to announce the real figure on <strong>{{COLA_ANNOUNCE_DATE_LONG}}</strong>. For comparison, the confirmed {{COLA_CONFIRMED_YEAR}} COLA was {{COLA_CONFIRMED}}%.</li>
          <li><strong>Nobody votes on it — the formula is written into law.</strong> Average the CPI-W price index for July, August and September, compare it with the same three months of the last year a COLA took effect, and round to the nearest tenth of a percent.</li>
          <li><strong>The raise starts with your January payment and is permanent.</strong> Each year's adjustment is added on top of the benefit you already receive.</li>
          <li><strong>Your deposit will rise by less than the headline.</strong> Medicare Part B is withheld from your check, so when the premium goes up it eats into the raise. <a href="/cola-calculator">See both figures for your own benefit →</a></li>
        </ul>
      </aside>
```

**Alt text** — n/a — no image. `<aside class="answer" aria-labelledby="ans-cola">` + `<h2 id="ans-cola">The short answer</h2>`. Heading order: h1 (line 14) → h2 "The short answer" → h2 "What the COLA is, and why it exists" (line 24).

**Dark mode** — Inherits CON-01. The `/cola-calculator` link in bullet 4 uses the shared `.answer a` treatment (add to the dark selector list at src/assets/css/site.css:1017 once, per CON-02).

**Compliance check** — Bullet 1 leads with the estimate caveat rather than trailing it — this is the compliance-critical ordering, because a summary that opens "The 2027 COLA is 3.6%" would state an unannounced government figure as fact. All values are build tokens from src/data/cola.json (projectedCola 3.6, confirmedCola 2.8, nextAnnouncementDate 2026-10-14), so the copy cannot outlive the data. The page attributes the estimate to The Senior Citizens League and AARP at line 125; the summary omits the attribution only because it says plainly that the figure is unofficial, which is the material point — if the reviewer prefers, append "from independent analysts" at 4 words' cost. No SSA branding, no seal, no implication that BenefitDial is announcing anything.

---

## SC-6 · In-page contents (jump links) for the six routes over 10,000px

> **P0** · effort: medium · kind: `content-component` · route: /guides/what-changed-medicare-2027 · /guides/2027-social-security-cola · /guides/medicare-aep-2026 · /guides/part-b-premium-and-your-cola · /how-it-works · /key-dates
> Source lens: Scannability
> **Merged:** Content-gaps CON-07 — same component, independently specified; take the measured scroll heights from both.

**Why it earns its place.** Measured scroll heights at 390x844: what-changed 12,425px (14.7 screens), how-it-works 12,653px (15.0 screens), privacy 11,127px, guide-aep 11,065px, guide-cola 11,039px, key-dates 10,356px, about 10,517px, part-b 10,344px. There is currently no in-page navigation anywhere on the site — a reader who wants only the IRMAA section on the Part B guide (6,090px) or only the AEP checklist (4,600px) has no way to get there except thumb-scrolling five to seven screens. The crucial finding: **the site is already anchor-ready and nobody has used it.** `html { scroll-padding-top: calc(var(--bc-header-h) + var(--bc-space-l)); }` exists at src/assets/css/site.css:168, and enhance.js measures the sticky header into `--bc-header-h` at line 80. So jump links will land correctly under the 111px sticky header with zero new JS and zero new offset maths. All that is missing is ids on the h2s and a list of links.

**Insertion point.** One `<nav class="toc">` per page, placed immediately AFTER the `.answer` block from CON-02..CON-05 and inside the same `.wrap`: guide-medicare-changes.html:17 · guide-partb.html:17 · guide-cola.html:17 · guide-aep.html:16 · how-it-works.html:17 (after the lead, before `</div>`) · key-dates.html:17. CSS goes in src/assets/css/site.css:774 — directly after the `.callout__title` / `.answer` group and before the ad-slot block. Heading ids to add: guide-medicare-changes.html lines 24, 37, 51, 65, 92 · guide-partb.html lines 24, 29, 87, 95, 119 · guide-cola.html lines 24, 29, 79, 129, 159 · guide-aep.html lines 23, 48, 64, 76, 113 · how-it-works.html lines 24, 74, 153, 175 · key-dates.html lines 26, 70, 86, 105.

**Specification** — CSS ~340 bytes raw / ~190 bytes gzipped, added once. Per-page markup ~430-480 bytes raw / ~200 bytes gzipped, plus ~25 bytes per h2 id (5 ids = 125 bytes). Total across six routes: ~3.5 KB raw / ~1.5 KB gzipped, one-time. Renders ~310px at 390x844 for a five-item list — 2.5% of a 12,425px page. No JS, no images, no dependency, CLS 0.0000.

```css
/* ----- In-page contents ------------------------------------------------
   Jump links only. html{scroll-padding-top} (line 168) already clears the
   sticky header, so this needs no offset of its own. */
.toc {
  border-left: 4px solid var(--bc-line);
  padding: 0.1rem 0 0.1rem 1.1rem;
  margin: 1.5rem 0 0;
  max-width: var(--bc-maxw-prose);
}
.toc__title {
  font-weight: 800; color: var(--bc-heading);
  font-size: var(--bc-fs-m); text-transform: uppercase;
  letter-spacing: 0.06em; margin: 0 0 0.55rem;
}
.toc ul { list-style: none; margin: 0; padding: 0; }
.toc li { margin-bottom: 0.3rem; }
.toc a { display: inline-block; padding-block: 0.4rem; font-weight: 600; }
```

The 0.4rem block padding is deliberate: it lifts each link's hit area past the 44px WCAG 2.2 AA target-size minimum at 19px body text without adding visible chrome.

**Generation prompt — copy this verbatim**

```text
Construction spec. Add the CSS block above at src/assets/css/site.css:774. Then per page, (a) add a kebab-case `id` to each h2 listed in insertAt, and (b) insert the matching nav. Use the page's own h2 wording, shortened, and prefer the CON-10 question rewrites where those land. Example for /guides/part-b-premium-and-your-cola (insert at guide-partb.html:17, after the CON-03 block):

```html
      <nav class="toc" aria-labelledby="toc-h">
        <p class="toc__title" id="toc-h">On this page</p>
        <ul>
          <li><a href="#linked">Why Part B comes out of your check</a></li>
          <li><a href="#math">The math, with a worked example</a></li>
          <li><a href="#hold-harmless">Can my check go down?</a></li>
          <li><a href="#irmaa">What is IRMAA?</a></li>
          <li><a href="#faq">Questions people ask</a></li>
        </ul>
      </nav>
```

Ids for that page: `linked` (line 24), `math` (line 29), `hold-harmless` (line 87), `irmaa` (line 95), `faq` (line 119). Skip the CTA-section h2s ("See it for your own check", line 102) — they are conversion furniture, not content the reader is looking for. Hold every list to 4-6 items; a 10-item contents list on /privacy would cost more screen than it saves, which is why /privacy is excluded despite being 11,127px.
```

**Alt text** — n/a — no image. `<nav class="toc" aria-labelledby="toc-h">` with `<p class="toc__title" id="toc-h">On this page</p>`. Deliberately a `<p>`, not a heading — a heading here would inject a spurious level between the h1 and the section h2s and would then have to appear in its own list. `aria-labelledby` still gives the navigation landmark an accessible name, which matters because the page already has a "Primary" nav landmark and two unnamed navs would be indistinguishable in a screen-reader landmark list.

**Dark mode** — Uses only `--bc-line` (#d5ddda → #2b3b39 at src/assets/css/site.css:966), `--bc-heading` (→ #eefaf9 at line 977) and the global link colour `--bc-link` (→ #7ecbd0 at line 981). Nothing hard-codes a hex, so the rule needs no dark override. In print the `a[href]::after` rule at line 1069 would append the full anchor URL to every jump link, producing junk like "(#irmaa)" — add `.toc { display: none; }` to the print block at line 1045, since jump links are meaningless on paper anyway.

**Compliance check** — Navigation only, no claims. The one thing to police: the link labels must not become promises the sections do not keep — e.g. do not label the AEP guide's "What to watch out for" section as "Avoid Medicare fraud", which would imply BenefitDial is issuing a fraud advisory. The CON-10 rewrite "How do I avoid Medicare scams and sales calls?" stays a question, which is the safe framing. Excluding the CTA h2s from the list also keeps the contents block from reading as a funnel.

---

## SC-7 · IRMAA: break the site's longest single-paragraph block into a scannable list

> P1 · effort: trivial · kind: `content-section` · route: /guides/part-b-premium-and-your-cola
> Source lens: Scannability

**Why it earns its place.** Measured: 627px of unbroken body text at 390x844, 125 words, one paragraph, and it is the entire content of its section — there is no heading, list, table, callout or visual anywhere inside it. It is also the last substantive section before the CTA, sitting at 6,090px (7.2 screens), so it is reached by the most fatigued reader on the page. Five separate facts are packed in there — what the letters stand for, what triggers it, that it steps rather than slides, what it does to the COLA, and that the thresholds move annually — and a reader scanning for "does this apply to me?" cannot find the trigger condition without reading all 125 words.

**Insertion point.** src/pages/guide-partb.html:96 — replace the single 714-character `<p>` in its entirety. It is the only element between the h2 at line 95 and the closing `</div>` at line 97, so the section currently consists of exactly one paragraph.

**Specification** — Replaces ~714 bytes with ~880 bytes raw (+166 bytes raw, +~70 bytes gzipped). Renders ~660px at 390x844 versus 627px today — essentially height-neutral, but with five scan anchors instead of zero. No images, static markup, CLS 0.0000. Uses the existing bare `<ul>` inside `.prose`, so no new CSS at all.

**Draft copy / markup — ready to insert**

```html
<p>Most people pay the standard Part B premium. If your income is above a certain level you pay more — an extra amount added on top of the standard premium for both Part B and Part D. That surcharge is called <strong>IRMAA</strong>.</p>
    <ul>
      <li><strong>What the letters mean.</strong> Income-Related Monthly Adjustment Amount.</li>
      <li><strong>What triggers it.</strong> The income reported on your tax return from a couple of years back.</li>
      <li><strong>How it grows.</strong> In steps, not smoothly — cross a threshold and the surcharge jumps.</li>
      <li><strong>What it does to your raise.</strong> A bigger Part B deduction absorbs a bigger slice of your COLA.</li>
      <li><strong>Where to find the numbers.</strong> The income thresholds are set by the government and change each year, so check the current official figures rather than last year's.</li>
    </ul>
```

**Alt text** — n/a — no image. The bolded lead clause of each `<li>` acts as the scan anchor; screen readers announce a 5-item list where they previously announced one long paragraph, which is itself the accessibility win.

**Dark mode** — No new styling — inherits `.prose ul` and `--bc-ink`, both already dark-correct. `<strong>` inside prose takes `--bc-ink` weight only, no colour override, so nothing to check.

**Compliance check** — Every clause is a direct restatement of guide-partb.html:96 — nothing added, no threshold dollar figures introduced. Deliberately does NOT print any income bracket, because IRMAA tiers change annually and a hard-coded bracket on a static site is exactly the kind of stale figure that reads as advice. The final bullet keeps the page's own "check the official sources" instruction, which is the compliance-safe landing. No calculation is offered, so the page cannot be read as telling someone whether IRMAA applies to them.

---

## SC-8 · "What this means if you're renewing" — a 110-word paragraph that should be three bullets

> P1 · effort: trivial · kind: `content-section` · route: /guides/what-changed-medicare-2027
> Source lens: Scannability

**Why it earns its place.** This paragraph is the consequence half of the page's opening argument — it is where a reader learns that doing nothing can move them onto different coverage, or leave them with no drug coverage at all. It is buried as the tail of the longest unbroken prose run measured anywhere on the site: 1,069px from 2,420px to 3,489px, three blocks, 202 words, with nothing between them. Three distinct risks are welded into one paragraph. A reader scanning for "what happens to me if I ignore this" cannot see any of them.

**Insertion point.** src/pages/guide-medicare-changes.html:35 — replace the single 657-character `<p>`. It sits between the "sharpest drop" paragraph at line 33 and the h2 at line 37.

**Specification** — Replaces ~657 bytes with ~900 bytes raw (+243 bytes raw, +~95 bytes gzipped). Renders ~590px at 390x844 versus 407px today (+183px), but breaks the 1,069px unbroken run into 480px + 590px-with-three-anchors. Static markup, existing `.prose ul`, no new CSS, CLS 0.0000.

**Draft copy / markup — ready to insert**

```html
<p><strong>What this means if you're renewing.</strong> A smaller menu doesn't automatically mean your plan is gone — most plans still renew year to year. But plan contraction is exactly why the fall check-up matters:</p>
    <ul>
      <li><strong>Your plan is likelier to be one of the ones cut.</strong> When a carrier trims its lineup, individual plans get ended or folded into another plan.</li>
      <li><strong>Doing nothing can move you.</strong> If your plan ends and you don't act, you can be placed in a replacement plan automatically — or, if a drug plan terminates, left with no prescription coverage at all.</li>
      <li><strong>The plans that survive change too.</strong> The ones that remain may have adjusted their prices and benefits to absorb members from the plans that went away.</li>
    </ul>
```

**Alt text** — n/a — no image. Bolded lead clauses serve as scan anchors and as the list's spoken structure.

**Dark mode** — No new styling; inherits `.prose ul` and `--bc-ink`. Nothing to override.

**Compliance check** — A pure restructure of guide-medicare-changes.html:35 with no new claims. The "doing nothing can move you" bullet is the one with teeth, and it is worded as the page words it — a description of how automatic reassignment works, not a warning designed to drive a call. No carrier is named as the one doing the trimming, no plan type is presented as safer than another, and the bullets do not point at a recommendation. Note the deliberate absence of any urgency device ("act now", a countdown): the site's own AEP guide at line 81 names pressure-to-decide as a sales tactic, so this page must not use one.

---

## SC-9 · The Part D redesign: 928px of machinery prose becomes a two-column what-changed table

> P1 · effort: small · kind: `content-section` · route: /guides/what-changed-medicare-2027
> Source lens: Scannability

**Why it earns its place.** Measured 928px unbroken run, 2 paragraphs, 157 words, starting at 4,772px (5.7 screens down). The content has an obvious two-column shape that the prose actively hides: each item is a piece of regulatory machinery paired with a consequence for the reader. The paragraph even says so out loud — "You don't have to track the machinery. What matters for you is the result" — and then delivers both in the same run-on block. The page already uses `table.data` inside `.table-scroll` twice, so the component is proven here and the reader has already been taught to read it.

**Insertion point.** src/pages/guide-medicare-changes.html:45-47 — replace both paragraphs (the 672-character redesign paragraph at line 45 and the 328-character installments paragraph at line 47), keeping the `{{> ad-inline }}` at line 49 in place after the replacement.

**Specification** — Replaces ~1,000 bytes with ~1,450 bytes raw (+450 bytes raw, +~150 bytes gzipped). Renders ~880px at 390x844 versus 928px today — height-neutral, but the 928px unbroken run drops to a 190px intro paragraph plus a scannable three-row table. Uses the existing `.table-scroll` wrapper, which enhance.js already instruments for scroll shadows (src/assets/js/enhance.js:96) and which the print block flattens at src/assets/css/site.css:1068. No new CSS, no images, CLS 0.0000.

**Draft copy / markup — ready to insert**

```html
<p>The change didn't stop there. Part D is being <strong>redesigned</strong> over several years to make that cap work, and the details keep getting finalized. You don't have to track the machinery — here is what actually reaches you.</p>

    <div class="table-scroll">
      <table class="data">
        <caption>The Part D redesign: the machinery, and what you feel</caption>
        <thead>
          <tr>
            <th scope="col">What changed</th>
            <th scope="col">What it means for you</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>The <strong>CY2027 Final Rule</strong>, published in April 2026, finalized changes to the <strong>Manufacturer Discount Program</strong> — how much drug makers chip in toward your prescription costs once you reach certain spending points.</td>
            <td>Plans have re-priced premiums and reworked their drug lists to fit the new rules. A plan that was a good fit two years ago may look different now.</td>
          </tr>
          <tr>
            <td>Part D now has a firm yearly ceiling on what you pay out of pocket for covered drugs, and the law raises it a little every year.</td>
            <td>For {{MEDICARE_FIGURES_YEAR}} the ceiling is <strong>${{PART_D_OOP_CAP}}</strong>. Past that point, covered prescriptions cost you nothing for the rest of the calendar year.</td>
          </tr>
          <tr>
            <td>You can choose to spread your out-of-pocket drug costs across the year in monthly installments.</td>
            <td>It doesn't lower your total — it stops one large amount landing at the pharmacy counter all at once.</td>
          </tr>
        </tbody>
      </table>
    </div>
```

**Alt text** — n/a — no image. The `<caption>` carries the table's accessible name; both `<th>` cells take `scope="col"`, matching the pattern already used at guide-partb.html:42-44.

**Dark mode** — `table.data` and `.table-scroll` already ship dark — `thead th` uses `--bc-surface-2` (#f4f7f6 → #182524) and `--bc-heading`, and the print block already forces `table.data caption` and `thead th` to #000 at src/assets/css/site.css:1060. Nothing new to check.

**Compliance check** — Every cell restates guide-medicare-changes.html:45 and :47 plus the cap figure already stated at line 38; nothing new is asserted about the rule. The cap uses the {{PART_D_OOP_CAP}} build token (2100 for 2026) rather than a literal, so it tracks src/data/medicare-figures.json. The table is explicitly about the Medicare program, not about any plan — no carrier, no plan ID, no formulary example that could read as a real plan document. The "what it means for you" column stays descriptive ("plans have re-priced") and never becomes prescriptive ("so you should switch").

---

## SC-10 · Rewrite twelve section headings as the questions people actually ask

> P1 · effort: small · kind: `content-section` · route: /guides/part-b-premium-and-your-cola · /guides/what-changed-medicare-2027 · /guides/2027-social-security-cola · /guides/medicare-aep-2026 · /key-dates · /how-it-works
> Source lens: Scannability

**Why it earns its place.** The heading hierarchy is structurally sound — I dumped every h1/h2/h3 across all 13 routes and found no skipped levels and exactly one h1 per page. The problem is wording. Roughly half the h2s are essay signposts ("The math, plainly", "Why the two are linked", "A quick word on IRMAA") or slogans with terminal full stops ("Two announcements, one busy autumn.", key-dates.html:26). Two consequences, both measured: a reader scanning the CON-06 contents list gets no signal about which section answers their question, and the headings are wasted as featured-snippet targets even though the same pages already carry FAQPage JSON-LD with well-formed questions. "The hold-harmless provision" is the sharpest example — it leads with a term the reader has never heard, when the question they actually have is "can my check go down?". Three headings also need fixing on their own merits: "How to see YOUR changes" (guide-medicare-changes.html:65) shouts in caps, and the two key-dates/how-it-works slogans read as marketing rather than structure.

**Insertion point.** Twelve one-line edits. guide-partb.html:24, :29, :87, :95 · guide-medicare-changes.html:24, :51, :65 · guide-cola.html:24, :129 · guide-aep.html:76 · key-dates.html:26 · how-it-works.html:24. Each is a self-contained `<h2>` on its own line.

**Specification** — Twelve `<h2>` text swaps, net roughly +180 bytes raw / +70 bytes gzipped across six files. Zero layout change: h2 uses `clamp(1.6rem, 1.25rem + 1.5vw, 2.15rem)` at src/assets/css/site.css:190 and the longest rewrite is 46 characters, which wraps to the same 2 lines at 390px as several existing headings already do. No CSS, no images, CLS 0.0000. Do this edit at the same time as CON-06 so the ids and the final wording land together.

**Draft copy / markup — ready to insert**

```html
guide-partb.html:24  "Why the two are linked" → "Why is Part B taken out of my Social Security check?"
guide-partb.html:29  "The math, plainly" → "How do I work out the raise I actually keep?"
guide-partb.html:87  "The hold-harmless provision" → "Can my check go down because Part B went up?"
guide-partb.html:95  "A quick word on IRMAA" → "What if my income is higher? IRMAA, explained"

guide-medicare-changes.html:24  "Fewer plans on the menu" → "Are there fewer Medicare plans for {{COLA_PROJECTED_YEAR}}?"
guide-medicare-changes.html:51  "Why premiums and benefits are shifting" → "Why did my premium and benefits change?"
guide-medicare-changes.html:65  "How to see YOUR changes" → "How do I see what changed in my own plan?"

guide-cola.html:24  "What the COLA is, and why it exists" → "What is the Social Security COLA?"
guide-cola.html:129  "Why your raise feels smaller than the headline" → "Why is my raise smaller than the number in the news?"

guide-aep.html:76  "What to watch out for" → "How do I avoid Medicare scams and sales calls?"

key-dates.html:26  "Two announcements, one busy autumn." → "When do the {{COLA_PROJECTED_YEAR}} COLA and Medicare enrollment happen?"

how-it-works.html:24  "The COLA, step by step" → "How is the Social Security COLA calculated?"

Leave alone: every "Frequently asked questions" h2 (already a landmark readers expect), the CTA-section h2s ("See it for your own check", "Check what changed in your own plan"), and the /about and /privacy h2s — /about's voice-driven headings are the point of that page, and /privacy's ten short noun headings are correct for a policy document people scan for a topic, not a question.
```

**Alt text** — n/a — no image. These edits improve the document outline that assistive technology exposes via heading navigation, which is the primary accessibility benefit.

**Dark mode** — No styling change whatsoever — same element, same class, same `--bc-heading` token.

**Compliance check** — The one to watch is guide-aep.html:76. "How do I avoid Medicare scams and sales calls?" is a question the reader asks; it must not drift into "Protect yourself from Medicare fraud", which would position BenefitDial as issuing an official consumer-protection advisory. Keeping it interrogative and first-person keeps it a reader's question, not an authority's warning. Likewise guide-medicare-changes.html:24 becomes a question about the Medicare program, not a claim about any carrier's lineup. Year references use the {{COLA_PROJECTED_YEAR}} token so headings age with the data.

---

## SC-11 · Reading level: fix the five sentences that push three pages past grade 9

> P1 · effort: small · kind: `content-section` · route: /how-it-works · /key-dates · /privacy · /guides/part-b-premium-and-your-cola · /guides/medicare-aep-2026
> Source lens: Scannability

**Why it earns its place.** I sampled every `.prose > p`, `.prose li`, `.callout p` and `.lead` on all 13 routes and computed Flesch-Kincaid, Flesch Reading Ease and Gunning-Fog on the real text. Against a grade 8-9 target for a 65+ general audience, the site is close but two pages miss: **/how-it-works FK 9.6** (Flesch 59.5, Fog 12.8, 18.5 words/sentence, 47 sentences) and **/key-dates FK 9.0** (Flesch 61.2, Fog 13.6 — the highest Fog on the site). The rest pass: /about 6.5, /privacy 6.8, /medicare-plan-changes 7.1, /guides/medicare-aep-2026 7.9, /guides/2027-social-security-cola 7.9, /guides 8.4, / 8.7, /cola-calculator 8.7, /guides/part-b-premium-and-your-cola 8.7, /guides/what-changed-medicare-2027 8.8. Page averages hide the real problem, though: five individual sentences score FK 16.6 to 21.1 — one of them is 44 words with four clauses. The worst sentence on the entire site is key-dates.html:81 at **FK 21.1, 44 words**, and it happens to be the sentence that explains the AEP-vs-MA-OEP distinction people most often get wrong. Fixing five sentences pulls /how-it-works to roughly FK 9.0 and /key-dates to roughly FK 8.4 without touching any other copy.

**Insertion point.** how-it-works.html:145 (inside the `.callout` after the h2 at line 153's preceding section) · key-dates.html:81 (inside the `.callout` body) · privacy.html:99 (the Contact paragraph) · guide-partb.html:82 (the muted source note under the worked-example table) · guide-aep.html:57 (the Medigap paragraph).

**Specification** — Five paragraph rewrites, net roughly +120 bytes raw / +45 bytes gzipped. No structural change, no new elements except sentence splits. Renders within ±40px of current heights. No CSS, no images, CLS 0.0000. Re-measure after: re-run FK on `.prose > p, .prose li, .callout p, .lead` and expect /how-it-works ≈9.0 and /key-dates ≈8.4.

**Draft copy / markup — ready to insert**

```html
key-dates.html:81 — WORST SENTENCE ON THE SITE, FK 21.1, 44 words.
Was: "The <strong>Medicare Advantage Open Enrollment Period (January 1 – March 31, 2027)</strong> is different: it's only for people already enrolled in a Medicare Advantage plan, and it allows just <strong>one</strong> change — switch to another MA plan, or drop back to Original Medicare (and add a Part D plan)."
Now: "The <strong>Medicare Advantage Open Enrollment Period</strong> ({{AEP_MA_OEP_RANGE_LONG}}) is different. It is only for people already in a Medicare Advantage plan. It allows just <strong>one</strong> change: move to a different Medicare Advantage plan, or go back to Original Medicare and add a Part D plan."  → FK ≈ 9.2

how-it-works.html:145 — FK 20.7, 40 words.
Was: "Until CMS publishes the official {{COLA_PROJECTED_YEAR}} files (late September / early October), our plan tool runs on a <strong>structurally identical sample dataset</strong> — same fields, same layout, real behavior — so you can see exactly how the comparison works before the real numbers exist."
Now: "CMS publishes the official {{COLA_PROJECTED_YEAR}} files in late September or early October. Until then, our plan tool runs on a <strong>sample dataset</strong> built to the same shape — same fields, same layout, real behavior. You can see exactly how the comparison works before the real numbers exist."  → FK ≈ 10.5, and the sample-data disclosure now leads its own sentence instead of arriving mid-clause.

privacy.html:99 — FK 20.8, 41 words.
Was: "Please note that because we don't operate a call center and aren't a broker, we can't look up your specific Medicare plan or Social Security record — for that, contact the official sources at Medicare.gov, the Social Security Administration, or 1-800-MEDICARE."
Now: "We can't look up your Medicare plan or your Social Security record. We don't run a call center and we aren't a broker. For those, go to Medicare.gov or the Social Security Administration, or call 1-800-MEDICARE."  → FK ≈ 8.1

guide-partb.html:82 — FK 17.3, 33 words.
Was: "The real standard Part B premium for {{MEDICARE_FIGURES_YEAR}} is <strong>${{PART_B_PREMIUM}}</strong> a month, CMS resets it each fall, and the {{COLA_PROJECTED}}% {{COLA_PROJECTED_YEAR}} COLA stays an early estimate until the Social Security Administration announces the official number, expected {{COLA_ANNOUNCE_DATE_LONG}}."
Now: "The real standard Part B premium for {{MEDICARE_FIGURES_YEAR}} is <strong>${{PART_B_PREMIUM}}</strong> a month, and CMS resets it each fall. The {{COLA_PROJECTED}}% {{COLA_PROJECTED_YEAR}} COLA is still an early estimate. The Social Security Administration is expected to announce the official number on {{COLA_ANNOUNCE_DATE_LONG}}."  → FK ≈ 10.8

guide-aep.html:57 — FK 16.6, 22 words, and the only sentence in its paragraph.
Was: "Switching Medigap plans can involve medical underwriting outside your one-time guaranteed-issue window, so those rules work differently from the AEP changes above."
Now: "Outside your one-time guaranteed-issue window, switching Medigap plans can mean answering health questions first. Those rules are separate from the AEP changes above."  → FK ≈ 11.9. "Medical underwriting" is the single hardest term on the page for this audience; "answering health questions first" is what it means to the reader.
```

**Alt text** — n/a — no image. Shorter sentences also reduce cognitive load for screen-reader listening, where a 44-word sentence with three em-dash asides is materially harder to hold than three short ones.

**Dark mode** — No styling change.

**Compliance check** — Two of these five rewrites are compliance-load-bearing, not just readability edits. how-it-works.html:145 is the site's sample-data disclosure (hard constraint 7): the rewrite promotes "sample dataset" out of a subordinate clause into its own sentence, so a skimming reader is more likely to register it, not less. privacy.html:99 is the non-broker / no-call-center statement: the rewrite leads with the limitation rather than burying it behind "Please note that because", and preserves all three official routes verbatim. key-dates.html:81 preserves the "only one change" constraint in bold. No figure, date, threshold or official source was dropped in any of the five.

---

## SC-12 · Break the COLA guide's 884px opening run by demoting the 1975 history to an aside

> P2 · effort: trivial · kind: `content-section` · route: /guides/2027-social-security-cola
> Source lens: Scannability

**Why it earns its place.** 884px unbroken, 3 paragraphs, 146 words, starting at 1,193px — the longest run on this page and the first thing a reader hits after the h2. The middle paragraph is the odd one out: lines 25 and 27 answer "what is a COLA and when do I get it", while line 26 is a paragraph of legislative history from 1975 that no reader arrived for. Demoting it to a callout does two things at once — it breaks the run into roughly 350px + 330px with a visual boundary between, and it signals that the history is optional context, so a skimming reader can skip it in good conscience instead of grinding through it. Cheapest structural win on the page: two lines of markup, no rewriting.

**Insertion point.** src/pages/guide-cola.html:26 — wrap this single paragraph in a `.callout` so it visibly separates from the paragraphs at lines 25 and 27, which stay as prose.

**Specification** — Wraps ~376 bytes in ~110 bytes of `.callout` markup (+110 bytes raw, +~40 bytes gzipped). Renders ~410px versus ~330px today (+80px from the callout's 1.1rem padding and border). The unbroken-prose measurement drops from 884px to a 350px run and a 330px run separated by a bordered block. Uses the existing `.callout` component — no new CSS. Static markup, CLS 0.0000.

**Draft copy / markup — ready to insert**

```html
<div class="callout">
      <p class="callout__title">Why the raise is automatic</p>
      <p style="margin:0;">Congress built automatic COLAs into Social Security back in 1975. Before then, it took an act of Congress to raise benefits, and increases often lagged years behind inflation. Now the adjustment happens on a set schedule, tied to a government measure of prices — no vote required. The goal is simple: protect the buying power of the benefit you've already earned.</p>
    </div>
```

**Alt text** — n/a — no image. `.callout` with a `.callout__title` gives the block a visible label; no ARIA role is needed since it is inline commentary, not a landmark.

**Dark mode** — Plain `.callout` (not `--info` or `--warn`) uses `--bc-surface` (#ffffff → #14201e), `--bc-line` and `--bc-accent-2` for the left border, all of which remap in the dark block at src/assets/css/site.css:966-980. `.callout__title` inherits `--bc-heading` and is already in the print force-to-black list at line 1061.

**Compliance check** — Text is guide-cola.html:26 verbatim; only the wrapper and a four-word title are new. The title "Why the raise is automatic" describes the mechanism and avoids any framing that could read as political commentary on Congress or on benefit policy — which matters on a page about a government payment. No new claim, no figure, no source change.

# Group I — Print

---

## PR-1 · Make the printed page a keepable document: identity band, and result-first tool printing

> P1 · effort: medium · kind: `content-component` · route: sitewide print stylesheet, with tool-specific rules for /cola-calculator and /medicare-plan-changes
> Source lens: Scannability
> **Merged:** Social CON-09 (print masthead + colophon) and CON-10 (scope the tool print to the numbers) — three specifications of one print pass.

**Why it earns its place.** Both tools ship a "Print or save these numbers" button (cola-calculator.html:124 and medicare-plan-changes.html:128, wired at cola.js:279 and plan-diff.js:420) and there is a real print stylesheet at src/assets/css/site.css:1043. I rendered all three routes through Chromium's print pipeline and measured the result. **Verdict: no, a person would not keep any of them.** Two concrete failures. (1) **The printed page is anonymous.** Line 1045 hides `.site-header`, `.site-footer` and `.trust-bar`, so the paper carries no site name, no URL and no date. A reader who prints the Part B guide in October and finds it in a drawer in January cannot tell where it came from or how current it is — on a page whose entire value proposition is data provenance. (2) **The calculator prints the form, not the answer.** With $2,000 / $202.90 / $215.00 entered, the print-media document is 4,071px at 96dpi ≈ 3.9 Letter pages, and the result headline ("You'll keep about $60 more each month after Part B…") does not appear until roughly 1,900px — the middle of page 2. Pages 1 and 2 are the h1, the lead, the tool heading, the provenance chips and four input fields with their full hint text, none of which mean anything on paper. /medicare-plan-changes is the same shape at 3,835px ≈ 3.6 pages. The guide prints at 4,416px ≈ 4.2 pages of unbranded body text.

**Insertion point.** src/assets/css/site.css:1045-1046 — extend the existing `display: none !important` list and add new rules inside the same `@media print` block that currently ends at line 1070. Plus one new print-only element in src/partials/footer.html (append before its closing element, currently 44 lines) carrying the site name and `{{CANONICAL}}`.

**Specification** — CSS ~640 bytes raw / ~300 bytes gzipped added to the existing `@media print` block, plus ~180 bytes of markup in the footer partial (rendered once per page, hidden on screen). No JS — the date cannot be injected without script, so the identity band uses the build-time `{{CANONICAL}}` URL alongside the provenance strip the tools already print ("Figures verified November 14, 2025", visible in the print render), which together give the reader both source and vintage. Expected result: /cola-calculator drops from ~3.9 pages to ~1.3 pages with the answer on page 1; /medicare-plan-changes from ~3.6 to ~1.5; guides gain a masthead line at the top and a source line at the foot.

```css
  /* Identity: paper has no address bar. Keep the wordmark, drop the nav. */
  .site-header { display: block !important; position: static !important;
                 background: none !important; border-bottom: 1pt solid #999; }
  .site-header .textsize, .site-header .nav-toggle,
  .site-header .primary-nav { display: none !important; }
  .print-source { display: block !important; font-size: 9pt; color: #333;
                  border-top: 1pt solid #999; padding-top: 6pt; margin-top: 12pt; }
  .toc { display: none !important; }
  /* Tools: print the answer, not the form. */
  .tool .field, .tool .field-row, .tool__head p,
  .tool .datasource + .field, .lead { display: none !important; }
  .result, .callout--sample, .provenance { display: block !important;
                                           break-inside: avoid; }
```

And in src/partials/footer.html, plus `.print-source { display: none; }` in the screen CSS near line 847:

```html
  <p class="print-source">BenefitDial — {{CANONICAL}} · Independent · not affiliated with Medicare, CMS or the Social Security Administration. Figures are from public government files; check the verification date above before relying on them.</p>
```

**Draft copy / markup — ready to insert**

```html
Print-only footer line, appended to src/partials/footer.html:

"BenefitDial — {{CANONICAL}} · Independent · not affiliated with Medicare, CMS or the Social Security Administration. Figures are from public government files; check the verification date above before relying on them."
```

**Alt text** — n/a — no image. One a11y note: `.print-source` must be `display: none` on screen rather than `.visually-hidden`, because a screen-reader user does not need a printed-artifact footer read aloud; `display:none` removes it from the accessibility tree in both themes.

**Dark mode** — The print block already sets `:root { color-scheme: light; }` at line 1044 and the dark theme is scoped `@media screen` at line 960, so print output is unconditionally light. The restored `.site-header` must have its `background: rgba(251,252,252,0.92)` and `backdrop-filter` (site.css:373-374) neutralised — printers drop backgrounds and the blur is meaningless on paper — hence `background: none !important` above. `.print-source` uses literal #333 rather than a token, matching the existing print block's convention at line 1063.

**Compliance check** — This is the highest-stakes compliance surface in the whole brief, because a printed page travels without its context and can be shown to a family member or an advisor as if it were an official document. Three guards. (1) The identity band names BenefitDial and states non-affiliation with Medicare, CMS and SSA on every sheet — the same disclaimer already carried on screen by src/partials/independence-disclaimer.html — so a printed comparison can never be mistaken for a CMS or SSA notice. (2) `.callout--sample` is explicitly forced visible in print: /medicare-plan-changes runs on a sample dataset and its warning was authored specifically to survive printing (see the comment at medicare-plan-changes.html:34-35); suppressing the form must not suppress that. (3) Keeping `.provenance` in print preserves the "Figures verified" date, so a stale printout announces its own age. No phone number, no advisor prompt and no carrier mark appears anywhere on the printed artifact.

---

# What was cut, merged or deferred

An executable brief is one somebody finishes. These 13 were removed on purpose.

- **DIA-02 · "The raise you actually keep" waterfall chart** *(Per-page imagery)* — MERGED into DG-1. Two lenses designed the same Part B offset picture; the vertical flow is the better fit for a 390px column.
- **DIA-03 · Fall season ribbon — the COLA announcement and the enrollment windows on one axis** *(Per-page imagery)* — MERGED into DG-4.
- **DIA-04 · Season ribbon reused on the Open Enrollment guide** *(Per-page imagery)* — MERGED into DG-4 as its second placement.
- **DIA-05 · The Crosswalk diagram — how a year-over-year plan comparison is even possible** *(Per-page imagery)* — MERGED into DG-2. Same diagram approached from the mechanism side rather than the outcome side.
- **DIA-06 · "Who pays for this page" money-flow diagram** *(Per-page imagery)* — CUT. A money-flow diagram explaining ad funding is decoration: /about and /privacy already state it in plain sentences, and no reader is confused about how a free page is paid for.
- **CON-09 · Print masthead + colophon — the printout currently carries no brand, no URL, no date and no non-affiliation notice** *(Social & identity)* — MERGED into PR-1.
- **CON-10 · Scope the tool print to the numbers — "Print or save these numbers" currently emits five pages** *(Social & identity)* — MERGED into PR-1.
- **IMG-11 · Print-only QR pair — the one image that makes the paper artifact work** *(Social & identity)* — CUT. A QR code on a printed page for a 65+ primary audience is an extra step, not a shortcut, and it adds a raster to a site that has none. The printed URL in PR-1's colophon does the same job.
- **CON-08 · Two-part freshness stamp — separate "when the source was published" from "when we last checked"** *(Trust & authority)* — MERGED into TR-3.
- **DIA-01 · "From government file to the number you see" — inline SVG provenance chain** *(Trust & authority)* — DEFERRED. A provenance chain is a good idea, but P2/large and it overlaps DG-5's territory. Revisit after the citation pattern (TR-5) ships — that may make the diagram unnecessary.
- **CON-04 · A "figures verified" stamp on the four guides — the receipt the tool pages carry and the guides do not** *(Content gaps)* — MERGED into TR-3.
- **CON-07 · An "On this page" jump list for the five pages that run past seven screens** *(Content gaps)* — MERGED into SC-6 — the same jump-list component, specified twice.
- **CON-09 · /helping-a-parent — the page for the adult child, who is currently not addressed anywhere on the site** *(Content gaps)* — DEFERRED, not cut. /helping-a-parent identifies a real second audience nobody else spotted, but it is a whole new page (P2/large) and the site should first be good for the beneficiary. Reconsider once CG-1 and CG-2 are live.

---

# Candidates the lenses considered and rejected

The reasoning behind what is *absent* from this brief, kept verbatim from each lens.


## Diagrams

- **Replacing the CPI-W worked-example tables on /how-it-works (lines 31-59) and /guides/2027-social-security-cola (lines 44-76) with DIA-02** — The brief asked me to decide, and the answer is complement, not replace. The tables already do the arithmetic well — four labelled steps, a `<caption>`, `class="num"` alignment — and they are the accessible primary source for the numbers. DIA-02 adds only the thing a table cannot show: which three of twelve months are inside the window, and that the comparison is Q3-over-Q3. Removing the tables would trade a precise, screen-reader-native artefact for a picture, and would make the diagram carry the division and the rounding rule, which is exactly the overload that makes diagrams unreadable. Keeping both is why DIA-02's visually-hidden table is deliberately only two rows: so a screen-reader user does not hear the same sum twice.
- **A standalone 'what happens if you do nothing' decision tree for /guides/medicare-aep-2026 and /key-dates** — Folded into DIA-03 instead. Drawn separately it would share three of its four branches with the Crosswalk diagram (renew / merge / terminate), and a site with two near-identical branching diagrams on adjacent pages teaches readers that the pictures are decoration. Putting the consequence on each Crosswalk branch — as visible HTML, not SVG text — makes one diagram answer both questions, and it lands on the higher-traffic route.
- **A hold-harmless diagram for /guides/part-b-premium-and-your-cola (the cap on the Part B dollar increase)** — Cut, though it was the closest call. The prose at line 88-89 already lands the idea in one sentence — 'your net Social Security deposit shouldn't go down from one year to the next just because Part B went up' — with a 'put simply' restatement, so I could not honestly claim a sentence readers re-read twice. More decisively, drawing a cap requires two contrasting scenarios with invented dollar amounts, on a page that has already spent a muted paragraph (line 82) warning that its numbers are made up. A second set of made-up figures showing a protection that does not cover everyone (line 92) is a compliance and comprehension risk out of proportion to the gain.
- **A Part D out-of-pocket spending ladder for /guides/what-changed-medicare-2027 (the cap and the closed doughnut hole)** — Cut. It is a genuinely hard mechanic, but drawing a spending ladder needs deductible and coinsurance phase boundaries that the page deliberately does not state — it gives only the {{PART_D_OOP_CAP}} figure and says the cap moves every year. Inventing the intermediate phases to make the picture work would put numbers on screen that the site has chosen not to assert, which is the opposite of its stated methodology.
- **A data-provenance flow for /how-it-works (Landscape + Crosswalk + PUF + PBP → our comparison)** — Cut on compliance grounds. The table at lines 92-140 already maps each file to what it powers, with format, cadence and licence — a diagram would restate it. Worse, the natural visual vocabulary for it is government file icons flowing into a tool, which is precisely the government-affiliation implication the site spends four FAQ answers denying. A picture that puts CMS/SSA/BLS artefacts inside the BenefitDial frame reads as a pipeline the site is part of.
- **An IRMAA income-bracket ladder for /guides/part-b-premium-and-your-cola** — Cut. The page explicitly refuses to publish the thresholds — 'check the official sources for the figures that apply to your situation rather than relying on last year's numbers' (line 96). A stepped ladder with unlabelled steps teaches nothing; a labelled one contradicts the page.
- **Baking a 'you are here' marker into DIA-04 from {{BUILD_DATE}}** — Rejected in favour of a ~14-line progressive enhancement in the already-loaded enhance.js, using the client clock. The site is a static build and HTML shares the `max-age=0, must-revalidate` posture, but a page can still be viewed weeks after the build that produced it. A marker pointing at the wrong week of the enrolment year is worse than no marker on a page whose entire job is deadlines. The strip is complete and correct with JS off.
- **Duplicating DIA-01 onto /cola-calculator and /key-dates** — Cut. /cola-calculator already renders the live, personalised version of this exact idea (cola.js flowChart, injected at cola-calculator.html:118) — a static duplicate above it would be redundant and would compete with the tool. /key-dates discusses the offset in two sentences at line 88 and links out; it gets DIA-04 instead. Two insertion points for DIA-01 is the right ceiling.
- **Rasterising any of these diagrams to PNG, or making per-route OG images from them** — Out of scope for this lens and wrong on the merits: it would add four to eight files under /assets/*, each costing a conditional request on every page view under `_headers:42-43`, each needing explicit width/height to hold CLS at 0.0000, each needing a `<picture>` + `prefers-color-scheme` pair to survive dark mode, and each turning real text into an image of text (WCAG 1.4.5). Inline SVG avoids all four problems at once — that is the whole argument for this lens.
- **Animating the diagrams (drawing the arrows, filling the bands on scroll)** — Cut. enhance.js already respects `prefers-reduced-motion`, so it is technically possible, but motion on an explanatory diagram for a 65+ audience delays comprehension and adds JS to something that is complete as static markup. The site's only existing chart transition (site.css:873-875) animates values that genuinely change at runtime; nothing here changes.

## Visual system

- **Any photograph of a person — a hero photo on /, a portrait on /about, a lifestyle image in the guides** — Rejected as a standing rule, not case by case. It contradicts published copy (/about promises 'we will never ask you to speak with a licensed agent'; /privacy promises 'no one will call you'), so a warm attentive face is a picture of the thing the page says does not exist. One person reads as a testimonial, two read as an agent — there is no third reading available in Medicare marketing. It is also the competitor's visual signature: /about calls the site 'the opposite of a robocall' and 'a public utility, not a lead funnel', and stock photography of seniors is the most recognisable convention of the funnels. And it is measurably expensive here: /assets/* is max-age=0, must-revalidate with no content hashing, so every raster is a conditional round-trip on every page view forever, on a site that currently ships zero <img> tags across all 13 routes and measures CLS 0.0000.
- **Illustrated human figures instead of photographs — abstracted, faceless, or geometric** — Rejected for the same three reasons, plus one specific to abstraction: a featureless rounded-head silhouette is still a person and still reads as 'an advisor', and it is the single most common motif in Medicare lead-gen creative. Abstraction does not defuse the endorsement or agent reading, it just makes it cheaper to produce. There is also a 65+-audience trap with no exit — draw them frail and the site condescends to the people paying its bills, draw them vigorous and grinning and it becomes indistinguishable from the advertising it opposes, and every choice of gender, skin tone and pairing becomes a claim about who the site is 'for' on a site whose argument is that it is for whoever arrives with a number.
- **A raster image-generation pipeline (Midjourney/DALL-E-class output, optimised and committed as WebP/PNG)** — Rejected on four independent grounds. CSP img-src 'self' data: means self-hosting only. Zero dependencies means no sharp/imagemin, so there is no optimisation path beyond Chromium's own encoder. Dark mode cannot be served by one raster, so every asset doubles into a <picture>. And the killer: a generated raster cannot be coloured by --bc-ill-* tokens, so it can never participate in the theme system that every other visual on this site already uses for free. Inline SVG authored as code is strictly better here on bytes, theming, accessibility and CLS — and scripts/lib/svgcharts.mjs proves the repo already knows how to do it.
- **ic-download / ic-database for the 'public government files' concept on /how-it-works** — Rejected as redundant. ic-doc-gov (a document with a checkmark) already covers 'a public file we verified' and is used exactly that way at index.html:83, guide-partb.html:112 and medicare-plan-changes.html:144. Rather than add a fourth glyph to an overloaded area, I removed two of ic-doc-gov's competing meanings by giving 'print' its own icon (ICON-02) and 'prescription drugs' its own (ICON-04). Subtracting meanings from an existing glyph beats adding glyphs.
- **A three-icon set for the plan-status categories at medicare-plan-changes.html:169–172 — renewing / consolidated / terminating** — Rejected on cost-benefit. Three new symbols (~800 bytes raw across 13 pages) to decorate four list items that already carry colour-coded .badge chips with explicit words on them. Unlike the callout--warn case, the colour here is not the only signal — the badge text says 'Renewing', 'Consolidated', 'Terminating' — so there is no WCAG 1.4.1 gap to close. Arrow-merge and circle-slash glyphs would also be the two hardest marks in the set to read at 17px.
- **ic-calculator for /guides/part-b-premium-and-your-cola ('The math, plainly') and the two tool pages** — Rejected as a near-duplicate. ic-coins-up already means 'your money going up' and is the site's most-used glyph (9 call sites), and it already marks both calculator entry points on every cross-link card. A calculator icon would compete with it for the same slot without adding a distinguishable meaning.
- **ic-pharmacy / ic-stethoscope / ic-provider-network for doctor-and-network coverage** — Rejected on both frequency and compliance. 'Doctor|provider|network' appears 7 times across 13 pages — far below the threshold that earns a permanent sprite entry. More importantly, clinical imagery (stethoscopes, crosses, caducei) is the closest this vocabulary gets to implying medical authority or an official health-agency mark, and the site is explicit at /about:84 that it is 'not financial, legal, or medical advice'. A plain capsule outline (ICON-04) is the only pharmaceutical form the spec permits, and it is enough.
- **Making the hero illustration visible on mobile by removing display:none at site.css:491** — Rejected, but promoted from an accident to a stated Tier A rule in SYS-01 §9. The piece is 480 user units wide with 13–14 unit text; rendered into a 288px content box at 320px it would put its 'SAMPLE' label at ~8px, well under the 14px floor. The correct fix is a separately-authored mobile composition, which belongs to whichever lens owns homepage art, not to the system lens. What the system lens owes is the constraint: a Tier A piece may never be the only place a fact appears, and its aria-label must duplicate adjacent copy — both of which hero-art already satisfies.
- **Adding playwright to devDependencies so scripts/gen-images.mjs works out of the box** — Rejected — it would put a ~300 MB browser download in front of every contributor for a script that runs perhaps twice a year, and package.json's empty dependency lists are a promise the README makes explicitly. The right repair (SYS-04) resolves the module and the binary at runtime and fails with an install instruction instead of a stack trace, keeping the script honest dev-only tooling with committed output. It must also stay out of npm run build and CI for the same reason.
- **A build step that subsets the icon sprite per page, emitting only the symbols each page uses** — Rejected at current scale. The full sprite is 668 bytes gzipped today and ~1,050 after all seven additions — per page, on 13 pages. Per-page subsetting would save under a kilobyte per view while adding a usage-scanning pass to build.mjs and a new class of failure (a symbol referenced from JS-injected markup, as plan-diff.js could do, would be silently pruned). Revisit only if the sprite passes 20 symbols; that trigger is written into SYS-04.
- **Full-bleed decorative section-break illustrations between the long prose sections on /how-it-works, /key-dates and the four guides** — Rejected. src/partials/section-divider.html already provides a lightweight wave rule for exactly this rhythm problem, and the pages that genuinely need visual relief (key-dates at 2,440 words, what-changed at 3,000) need an explanatory diagram of the actual timeline or the actual math — Tier B art that a reader learns something from — not more decoration. Decorative full-bleed art would add bytes to every page while making the pages longer, which is the opposite of the fix.

## Per-page imagery

- **Hero art on the twelve non-home routes (/cola-calculator, /medicare-plan-changes, /guides, all four guides, /how-it-works, /key-dates, /about, /privacy, /404)** — I screenshotted every one of these at 390x844 and 1280x800. They share one deliberate opening pattern — eyebrow, h1, lead paragraph, no art — and that consistency is what makes the site read as a document rather than a brochure. Twelve hero illustrations would cost roughly 36KB of inline SVG and would make the site LOOK more like the marketing pages it is positioning against. The homepage is the sole exception, and only because art already exists there on desktop and is suppressed on mobile — that is a regression from the shipped design, not a house style, which is why IMG-01 is the only hero recommendation in this brief.
- **Card illustrations for the four guide cards on /guides** — /guides is the second-shortest route on the site at 3,921px desktop / 6,424px mobile, and its four cards already carry distinct icons from the sprite (ic-coins-up, ic-calendar-check, ic-doc-gov, ic-heart-pulse) so each is already visually differentiated. Four card illustrations would cost more bytes than every diagram in this brief combined and would change nothing a visitor does — they are already one tap from the guide. There is no scroll-depth problem to solve and no comprehension gap to close.
- **Any imagery on /404** — The 845-word count is misleading — I measured the rendered page and it is 2,532px on desktop, the shortest route on the site, because most of that word count is the shared footer disclaimer, not page body. The visible content is a headline, a reassurance line, one primary button, two icon cards, and a three-link row. A lost visitor needs the fastest possible route back, and the page already delivers it above the fold on both viewports. Adding art would push the two recovery cards down and lengthen the one page where length is pure cost.
- **Any imagery on /cola-calculator or /medicare-plan-changes** — On both routes the interactive tool IS the focal element and it is visible within the first screen on desktop and one short scroll on mobile. Both pages also already carry build-time charts from scripts/build.mjs (CHART_COLA_HISTORY on /cola-calculator:160, CHART_PLANS_MAPD and CHART_PLANS_PDP on /medicare-plan-changes:159-160). An illustration above or beside a form competes for attention with the input the visitor came to fill in, and on /medicare-plan-changes it would additionally sit next to a prominent sample-data warning where any extra mock-up risks muddying which numbers are real.
- **A CPI-W formula diagram on /how-it-works (the two third-quarter averages)** — Tempting on paper — 2,631 words, longest page on the site, and the formula is a mechanism. But I looked at the actual sequence: the prose explanation at line 27 is followed at lines 31-52 by a four-row worked-example table that already lays out base quarter, new quarter, division and rounding, and then three lines later at line 61 by CHART_COLA_HISTORY. Dropping a diagram in there puts three visuals within about 600px of each other and leaves the remaining 8,000px of the page untouched. Better rhythm to place one diagram further down where the page has nothing, which is what DIA-05 does.
- **A Part D $2,100 out-of-pocket cap diagram on /guides/what-changed-medicare-2027** — Genuinely the biggest substantive change the guide covers, and at 3,000 words / 12,424px mobile it is the longest guide. But it already opens with two side-by-side charts at lines 27-30, and the cap has its own dedicated info callout. Of the candidates that survived triage this had the lowest marginal value — the page is the best-served long guide already, while /guides/part-b-premium-and-your-cola (DIA-02) has literally zero charts. If budget appears later, this is the first item to promote.
- **Any raster photography — retirees at a kitchen table, mail on a counter, a hand holding a benefit letter** — Four independent reasons, any one sufficient. It reads as stock-photo filler on a site whose entire pitch is that it is not marketing. It costs 40-150KB against inline SVG diagrams that cost 0.8-1.2KB gzipped. Under `/assets/* Cache-Control: max-age=0, must-revalidate` (src/static/_headers) every raster costs a conditional request on every single page view, forever, because assets are not content-hashed. And a photograph with a light background glows in dark mode unless paired via `<picture>` + prefers-color-scheme, doubling the byte cost again. Every idea in this brief is better served by inline SVG on the existing `--bc-ill-*` token system, which inverts for free.
- **Per-route OG / social preview images** — A real gap — all 13 routes share one og-default.png (110,685 bytes), so a link to the COLA calculator previews identically to a link to the privacy policy. But it is not per-page imagery: nothing about it changes what a visitor sees once they arrive. It belongs to whichever lens owns social and brand assets, and specifying it here would collide with that work.
- **A screenshot of the "What Changed" tool's result panel, used as an illustration on /guides/what-changed-medicare-2027 or /about** — Would need the SAMPLE watermark and the sample-data warning carried through into the image or it becomes a compliance problem; would go stale every time the plan dataset refreshes; would be a raster under /assets/* paying revalidation on every page view; and would bake plan figures into pixels, failing WCAG 1.4.5. The live tool is one link away and always current — link to it.
- **An illustration of "how a lead funnel works" featuring an agent, a headset, or a ringing phone, on /about** — Directly banned by the compliance constraint, and self-defeating on a page that promises no phone number and no licensed agent. The abstract money-flow treatment in DIA-06 makes the identical argument with no people and no telephones — and, because about.html:51 says in the site's own words "We're not saying brokers are bad", I additionally stripped the accusatory visual language (red X's, prohibition signs) that this candidate would have invited.
- **Decorative section dividers, background textures, or a repeating brand pattern behind the section--wash bands** — The site already ships `src/partials/section-divider.html` and `src/partials/ripple.html`, and the alternation between `.section` and `.section--wash` already carries the page rhythm — visible in every contact sheet I generated. Adding texture would spend bytes on decoration while the actual problem on /privacy, /how-it-works and /guides/part-b-premium-and-your-cola is that the reader has no picture of the mechanism being described.

## Social & identity

- **Per-route OG images for all 13 routes** — Eight of the thirteen have no realistic share path, and a card nobody sees is 30KB of maintenance debt with a year baked into it. /404 is `robots: noindex, follow` and is never deliberately shared. /privacy, /about and /how-it-works get linked FROM the site, not TO it, and when they are shared it is usually as evidence in an argument where the title carries the point. /guides is a hub — people share the article, not the index. That leaves three of the four guides: /guides/part-b-premium-and-your-cola and /guides/what-changed-medicare-2027 are strong articles, but their share spike is the same October window as /guides/2027-social-security-cola, which is the one people actually link on announcement day, and /guides/medicare-aep-2026 overlaps /key-dates almost entirely. I decided by asking, per route, "who pastes this link, to whom, in what week?" — five routes had a concrete answer and eight did not. The eight fall back to the reworked og-default, which is a good card, not a placeholder.
- **Baking the COLA percentage (3.6%) or the Part B premium ($202.90) into any OG card** — This is the trap the year-stamped filenames exist to avoid, and it is worth stating plainly. cola.json marks 3.6% as `projectedSource: "The Senior Citizens League / AARP early estimate"`, with the official SSA announcement due 2026-10-14. Social crawlers cache OG images by URL for weeks and ignore Cache-Control; /assets/* is not content-hashed, so the URL never changes. A card reading "3.6%" would therefore keep circulating on Facebook and in Slack for weeks AFTER SSA announces a different number, under a BenefitDial wordmark, looking authoritative. The site's whole positioning is that it does not front-run the government. OG-04 solves this by labelling only the four permanently-confirmed historical years and drawing 2027 as a dashed empty outline with a question mark.
- **JPEG or WebP for the OG images** — Measured, not assumed. Rendering the flat-background card through Chromium as JPEG gives 61,289 bytes at q88 and 51,807 at q82; the same card as an 8-bit indexed PNG is 27,367. JPEG is 2x larger AND rings around the 64px headline strokes, because this is flat vector art with hard edges — the worst possible case for DCT. WebP would compress better still, but iMessage and several enterprise Slack/Teams unfurl proxies remain patchy on it, and the download is crawler-only so there is nothing to win. Indexed PNG is both the smallest and the safest, which is a rare combination.
- **sharp, imagemin, oxipng, pngquant, or any npm image pipeline** — package.json has empty `dependencies` AND empty `devDependencies`, and the README makes that a promise. It is also unnecessary: I implemented the entire indexed re-encoder — inflate, unfilter, histogram, nearest-colour map, adaptive re-filter, deflate, CRC — using nothing but the standard library, and measured 110,685 → 27,367 on the real file. That is ~110 lines added to scripts/gen-images.mjs, which is dev tooling that never ships. Reaching for pngquant here would trade a written-once function for a supply-chain dependency in a project whose selling point is that it has none.
- **Manifest `screenshots` (wide + narrow pair) and an install prompt** — site.webmanifest:6 sets `display: "browser"`, which makes the site ineligible for an install prompt on every platform — so screenshots would be dead JSON pointing at dead PNGs. An installable BenefitDial is actually a defensible idea for a 65+ audience who would rather tap an icon than type a URL, but that is a product decision (it changes `display`, needs a service worker story, and turns a static site into something with an update lifecycle), not an imagery decision. IMG-08 makes the icon set honest and ready; if `display` ever becomes `standalone`, add the screenshots then and not before.
- **A photographic or AI-generated illustrated OG image (retirees at a kitchen table, a mailbox, an autumn scene)** — Three independent reasons, any one of which is disqualifying. Compliance: the moment a human appears on a benefits card, the nearest visual cliché is an advisor or a call-centre scene, and the site's headline promise printed on the same card is "No phone number, ever". Bytes: a photograph at 1200x630 lands at 90-180KB even well-compressed — the whole point of this lens's biggest win was getting off 110KB. Craft: a diffusion model cannot render "BenefitDial" in Segoe UI Extra Bold at #ffffff on a 630px canvas, so it would have to be a photo with SVG text composited over it, which is strictly more work than the SVG alone for a worse result.
- **A generated one-page PDF artifact ("download your summary")** — It needs a PDF library (breaks the empty-dependencies promise), or a server (there isn't one, and the privacy pledge is that the calculator never sends the numbers anywhere), or the browser's own print-to-PDF — which is exactly what the print button already invokes. The honest answer to "does this site need a printable artifact" is yes, and it already has one; it is just badly cropped and unbranded. CON-09 and CON-10 turn five unbranded pages into one and a half branded ones for about 1.8KB, which is the entire PDF feature for none of the cost.
- **A dark-mode variant of any OG image, via <picture> or a prefers-color-scheme swap** — There is no mechanism. og:image is a single absolute URL fetched by a crawler that has no theme, and no unfurl surface — Facebook, X, Slack, iMessage, LinkedIn — supports a media-conditional social image. The cards are opaque dark teal anyway, so they read correctly against both light and dark Slack chrome. The dark-mode constraint bites hard elsewhere in this project but genuinely does not apply here, and pretending otherwise would have produced five files nothing would ever request.
- **Adding a 48x48 / 96x96 PNG favicon for Google Search results** — Google's favicon guidance asks for a square multiple of 48px OR an SVG of any size, and src/layout.html:41 already declares `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`. The 16+32 favicon.ico at src/static/favicon.ico exists for pre-Safari-16 clients and for crawlers that request /favicon.ico blindly — the layout comment at lines 33-38 documents that reasoning and it is correct. Adding a third raster size would be two more files to keep in sync for no measurable gain.
- **Renaming og-default.png (or adding ?v=2) to force social caches to refresh after the rework** — Tempting and wrong. Renaming 404s the URL that is already embedded in every link shared so far, turning existing unfurls into broken images — strictly worse than a stale-but-valid card. A query string is worse still, because several crawlers normalise or drop it and Cloudflare Pages would serve the same asset under two cache keys. The reworked card says the same thing as the old one, so a slow refresh costs nothing. The year-stamped filenames on OG-02..05 exist precisely because those cards say something that CAN expire; og-default's does not.
- **Showing the QR codes on screen as well as in print** — A QR on a screen is a code pointing at the page you are already looking at — pure noise, and on a phone it is actively confusing. Its entire value is crossing the paper-to-phone gap, which only exists after the print button is pressed. Keeping it inside `.print-only` also keeps it out of the screen render tree entirely, so it cannot touch the 0.0000 CLS baseline.
- **twitter:site / twitter:creator meta** — scripts/build.mjs:51 has `twitter: ""` — there is no account. Emitting an empty or invented handle is worse than emitting nothing; X falls back cleanly on `summary_large_image` plus og:title/description, which the layout already provides correctly at src/layout.html:26-30. Revisit only if an account actually exists.

## Trust & authority

- **A photographic or illustrated author headshot beside the byline** — The site has no named person yet. A stock portrait presented as staff is fabrication, and an illustrated avatar for a person who does not exist is the same lie in a friendlier style. It also adds a raster to a site with zero <img> tags, on a route where the credibility gain over a plain text name is close to zero. Ship the name first; a real photo of a real person is a reasonable follow-up once one exists.
- **A "Fact-checked" / "Verified" seal or shield badge graphic on each guide** — Two failures at once. A circular seal with a tick reads as third-party accreditation the site does not have, and on a Medicare page any seal-shaped mark sits uncomfortably close to a government trust mark — the exact compliance line the brief draws hardest. The honest form of this signal is a byline with a person's name and a date, which is CON-02, and it costs 180 bytes instead of a raster.
- **A source-logo strip on /how-it-works or the homepage showing CMS, SSA and BLS agency logos** — Straightforward endorsement implication and almost certainly a mark-usage problem. The existing provenance-band already solved this correctly with plain letter monograms (SSA / BLS / CMS) in rounded rectangles — that pattern conveys the same provenance with none of the risk, and every new item here reuses it rather than replacing it.
- **"Reviewed by a licensed insurance agent" or a broker-credentialed reviewer line** — It is the standard E-E-A-T move for Medicare content and it would actively damage this site. Putting a licensed agent visibly in the editorial chain undercuts the entire not-a-broker positioning at /about and /privacy, and gives a regulator a reason to look harder at whether BenefitDial sits inside the CMS chain of enrolment. The reviewer should be an editor accountable for reading documents, not someone who can sell a plan.
- **"Medically reviewed by" on the Part B and Part D guides** — Wrong domain. Nothing on this site is clinical advice — it is arithmetic on published dollar figures — and a medical-review line would imply a kind of authority the content does not claim and does not need. It would also invite readers to treat the pages as guidance about their care.
- **A contact form or feedback widget for corrections** — Needs a backend and starts collecting exactly the personal information the site promises never to hold — and the privacy page specifically says there is nowhere on the site to enter your name. A mailto link achieves the same outcome with zero JS, zero PII, zero infrastructure, and no contradiction of the site's own pledge.
- **A phone number or callback route for corrections and questions** — The single most load-bearing promise on the site is 'no phone number, ever'. A corrections hotline would break it for a marginal accessibility gain, and would be the first thing a sceptical reader pointed at when weighing the rest of the promises.
- **Auto-stamping "Last updated" from the build date on every page** — It would instantly clear the '10 of 13 routes have no visible freshness stamp' finding and it would be dishonest. scripts/build.mjs:200-207 already documents that a previous version did exactly this and had unrelated CSS commits re-stamping the site as freshly verified. The git-derived PAGE_MODIFIED plus a human-maintained editorial-checks.csv is slower to operate and is the only version that means anything.
- **Per-page Open Graph cards for /editorial-standards, /about and each guide** — Eight new 1200×630 PNGs at roughly 110 KB each, on a site where /assets/* is served max-age=0, must-revalidate. It changes nothing about on-page credibility for the four audiences this lens is written for, and the existing shared card already carries an accurate og:image:alt. If per-page OG is ever added it belongs to a distribution lens, not this one.
- **An "Our team" page with role cards** — There is nothing truthful to populate it with. One named, accountable editor on /editorial-standards is worth more to a quality rater than a page of invented roles, and considerably more than a page of empty placeholders.
- **A pseudonymous byline — "By the BenefitDial Editorial Team"** — It looks like the cheap way to close the authorship gap and it is worse than leaving the gap open. Raters discount generic team bylines, and a corrections policy signed by nobody is precisely the thing a journalist quotes. CON-02 is specified to block on a real name rather than ship a placeholder identity.
- **Declaring @type: NewsMediaOrganization to unlock correctionsPolicy / ownershipFundingInfo in JSON-LD** — Those properties are only valid on NewsMediaOrganization, so using them means asserting BenefitDial is a news media organisation — a claim with its own consequences that a code change should not make on the operator's behalf. CON-06 instead uses publishingPrinciples and contactPoint, which are valid on plain Organization, and flags the type decision as a human call.
- **A visible "corrections issued" changelog page listing every past correction** — Right instinct, wrong sequencing. With zero corrections issued to date it would be an empty page advertising that nothing has ever been fixed, which reads as either perfect or unmaintained. The corrections policy at /editorial-standards#corrections commits to dated per-page correction notes; build the log once there is something in it.

## Content gaps

- **A printable AEP checklist page (/aep-checklist)** — It already exists twice, unlabelled. src/pages/guide-aep.html:66-72 is a five-step numbered preparation list with time estimates, and src/pages/key-dates.html:70-77 lists what you may change during the window. A third page would be the same content under a new URL, competing with its own sources in search. If the goal is really printing, the cheaper fix is a @media print rule for the existing guide — the site already has two print buttons (#r-print, #pd-print) and no print stylesheet is documented, which is a finding for another lens, not a new page.
- **A "what changed this year" annual summary page** — That page is /guides/what-changed-medicare-2027 — 3,000 words, the longest on the site, covering the narrower plan menu, the Part D cap and the redesign. Proposing it again would be proposing a duplicate.
- **A state-by-state or county-coverage page for the plan tool** — src/data/manifest.json has sample: true and covers ten states (FL, TX, CA, NY, PA, AZ, OH, NC, GA, IL) of made-up plans whose names all begin with "Sample". A page enumerating coverage would be publishing a directory of fabricated plan data at a stable, indexable URL — the single most dangerous thing this site could ship, and directly against constraint 7. The honest version of this need is CON-05, which explains the three reasons a plan is missing without publishing any list.
- **A glossary-term tooltip component (hover or tap to reveal a definition)** — Wrong pattern for this audience and this codebase. It needs JavaScript on a site that ships four small vanilla scripts and promises zero dependencies; hover-only reveals are unusable on touch and hostile to the 65+ readers the header's three-step text-size control exists for; and a tooltip cannot be printed, which matters on a site with two print buttons. Deep links to /glossary#anoc from first use cost nothing, work everywhere, and are already built into CON-01's ids.
- **A changelog page ("what we updated and when")** — The freshness claim is already carried by {{DATA_UPDATED}}, which build.mjs:201-207 deliberately derives from the data's own provenance dates rather than the build date. A changelog is a page that is trustworthy only while someone keeps writing it, and its first stale entry undoes more trust than the whole page ever built. CON-04 gets the same signal onto the four pages currently missing it, for about 1.4 KB.
- **An FAQ section on the home page** — / is the only route with no FAQPage schema, which makes it look like an omission. It is not. The home page's job is to get a reader into one of two tools; it is 5.6 screens already, and the tool cards sit at 1,206 px. A fifth section pushes them further down to answer questions that /about and /how-it-works answer at length and that the home page already links to twice each.
- **Site search** — Thirteen routes, a persistent primary nav, and a footer that lists every page. Search would need either a client-side index (bytes and JavaScript) or a hosted service (a CSP change and an external host, breaking constraint 1). The glossary in CON-01 is the thing people would actually search for, so build that instead.
- **An email alert for when the COLA is announced ("tell me on October 14")** — It is the most-requested feature this site will never have, and it contradicts the pledge in writing: src/pages/privacy.html:26 says "There's no sign-up, no newsletter, and no 'enter your email to see results.'" Collecting an address would also move the site toward the data-capture model /about:46-49 exists to criticise. The site's own answer — "bookmark this" at index.html:157 — is the correct one.
- **Testimonials, reviewer bylines, or an "as seen in" strip** — The site collects nothing and has no users to quote, so anything here would be invented — which is fabricated-record territory. Its credibility comes from showing its arithmetic (/how-it-works) and naming its files, and that is a stronger claim than a quote.
- **Programmatic per-state or per-plan landing pages for SEO** — Thin pages generated from a dataset the site itself labels as fabricated, on a site whose entire proposition is that its numbers are checkable. It would also multiply the fake plan names across hundreds of indexable URLs.
- **A "which plan should I pick" recommendation or scoring feature** — Straightforward compliance failure. It would put BenefitDial inside the CMS chain-of-enrollment definition the layout comment at src/layout.html:90-91 is written to keep it out of, and it contradicts four separate on-page promises never to recommend a plan for payment. CON-02 goes as far as this site can honestly go: what each result means and what to check next, with the choice left entirely to the reader.
- **Comments, a Q&A section, or "ask us a question"** — Any of them collects personal information from people discussing their own health coverage, on a site whose pledge is that it holds nothing. It would also create an expectation of individual advice that /privacy:99 explicitly declines.

## Scannability

- **A collapsed `<details>` table of contents, to keep the jump-link block under 100px on mobile** — The block would cost ~90px closed instead of ~310px open, which is tempting on a 12,425px page. Rejected on audience grounds: this site is built for 65+ readers to the point of shipping a three-step text-size control in the header and an 19px body default. A disclosure widget that hides navigation behind a tap is a discoverability tax on exactly the readers the site optimises for, and the site's own `details.faq` pattern is used for questions the reader can choose to skip — not for wayfinding they need. 310px on a 12,425px page is 2.5% overhead; that is affordable. Keep it open.
- **A sticky/floating in-page contents rail that follows the reader down long guides** — It is the obvious answer to a 14.7-screen page and I still cut it. At 390px there is no gutter to put it in, so it would have to become a fixed bottom bar or a floating button — both of which collide with the already-sticky 111px `.site-header`, and both of which need JavaScript to track the active section. That breaks the zero-dependency promise in spirit and adds a scroll listener to a site whose only JS is 5 small hand-written files. The static contents block gets most of the benefit for zero JS.
- **A table of contents on /privacy (11,127px, 10 h2s) and /about (10,517px)** — /privacy is genuinely the third-tallest route and has the most h2s on the site, so it looks like the best TOC candidate by the numbers. But a 10-item contents list would itself run ~560px, and policy pages are read by topic-hunting with Ctrl-F or by reading straight through for compliance reasons — a summary-and-jump treatment on a privacy policy also risks reading as if the summary were the policy. /about is voice-driven marketing copy where the headings ("The opposite of a robocall.", "We run ads. That's it.") are doing deliberate rhetorical work; a contents list would flatten that. Cut both.
- **A "key takeaways" block on /how-it-works (12,653px — the tallest route on the site)** — It is taller than any guide and it has the site's worst reading level (FK 9.6), so it was a real candidate. Cut because its job is different: it is the provenance/methodology page, and the value of reading it is precisely the detail — a summary saying "we use public CMS, SSA and BLS files" is already the h1 and the first sentence. Summarising a trust document is self-defeating. Its two genuine problems are the reading level (fixed in CON-11) and the lack of jump links (fixed in CON-06), which is exactly the right treatment for it.
- **Converting the Part B worked-example table into the site's existing `.bc-flow` horizontal bar (keep vs. Part B segments)** — The `.bc-flow-*` CSS already exists (site.css:890-899) and would turn an 8-row table into one glanceable bar, which is a strong scannability idea. Rejected from this lens on two counts: the classes are currently rendered only by client-side JS in cola.js:48-53, so a static version needs a new build-time chart function in scripts/build.mjs alongside `planCountChart` — roughly 40 lines of new build code, i.e. medium effort for a table that already works and already prints. And it is fundamentally a visual-vocabulary recommendation, not a content-format one; it belongs to whichever lens owns the chart system, where it can be weighed against the other chart work rather than smuggled in here.
- **Adding "reading time" estimates to the four guide headers** — Cheap and conventional, and it would honestly describe the problem — these are 8 to 11 minute reads. Cut because it announces the cost without reducing it, and for a reader deciding whether to engage, "11 min read" on a Medicare deadline page is more likely to cause a bounce than the short-answer block is. If the summary and the contents list ship, the reader can see the shape of the page and self-select without being told a number.
- **Moving the FAQ blocks up the page (currently at 8,003-10,129px, i.e. 9.5-12 screens down)** — The FAQ summaries are the best-written questions on the site and they sit at the very bottom of every guide, which looks like a straightforward ordering bug. But moving them would break the FAQPage JSON-LD's positional relationship to the article body, would put question-and-answer pairs ahead of the explanation they depend on, and would displace the CTA sections. The cheaper fix is already in CON-06: put "Questions people ask" in the contents list so the FAQ is one tap away from the top instead of twelve screens.
- **Splitting the 3,000-word what-changed guide into two shorter pages** — It is the only intervention that actually reduces the 12,425px, and I considered it seriously. Rejected because the page's argument is cumulative — the plan-count contraction, the drug cap and the re-pricing pressure only mean anything together, and the site already runs a four-guide hub at /guides where a fifth stub would dilute rather than clarify. It would also fork the URL that currently holds the Article and FAQPage schema and the breadcrumb trail. Structure the page; don't break it.
- **Adding `scroll-margin-top` to the h2s so jump links clear the sticky header** — Not rejected on merit — rejected as unnecessary, which is worth recording because it is the mistake someone will make while implementing CON-06. `html { scroll-padding-top: calc(var(--bc-header-h) + var(--bc-space-l)); }` is already at src/assets/css/site.css:168, and enhance.js measures the live header into `--bc-header-h` at line 80 with a resize listener. Adding per-heading `scroll-margin-top` would double the offset and land anchors too low. Add ids only.

---

# Post-audit grade

**The curve.** `A` is not "good for a small project". `A` is *would pass a launch review at
a Fortune 500* — the bar where a YMYL consumer-finance property gets signed off by legal,
brand, accessibility and SRE before it is allowed to take traffic. On that curve most
competent small sites land in the C range. Grades below are for the site **as it stands
today**, after the three audit passes and their remediation, and **before** any item in
this brief is executed.

| Dimension | Grade | The evidence, measured |
| --- | --- | --- |
| Engineering & build integrity | **A−** | Zero runtime and dev dependencies, a 397-line purpose-built generator, one gate (`deploy.yml` calls `ci.yml` via `workflow_call`, so a red CI cannot race a deploy), 78 passing tests, an internal-link checker across 13 pages. The build *refuses* on missing figures and now on a self-contradicting COLA. Held off an A by dead weight: 12 of 18 scripts in `scripts/` are referenced by nothing and crash on invocation, and six import an undeclared package. |
| Performance | **A** | Zero third-party requests, zero cookies, zero `localStorage` on load, CLS measured 0.0000 sitewide, no framework, no webfont. Assets revalidate rather than go stale. The only real cost is that nothing is content-hashed, which is a documented, deliberate trade. This is genuinely better than most Fortune 500 marketing properties. |
| Accessibility | **A−** | Full AA sweep across 13 routes × light/dark found two failures this pass, both single hardcoded values, both now fixed. Real focus management, a working text-size control that scales the rem system, `prefers-reduced-motion` honoured in CSS *and* JS, charts paired with visually-hidden data tables, 19px base type for a 65+ audience. Not an A because the checking is all manual — no automated a11y gate runs in CI, so this is a snapshot, not a guarantee. |
| Data correctness & integrity | **B** | Referential integrity across all seven data files is clean (0 duplicate plan keys, 0 dangling crosswalk targets, exact manifest counts). Statutory rules are encoded as build-failing invariants. But the gate only started checking figure *values* in the last commit, and the two 2026 statutory figures still rest on secondary sources — the primary-source check is an open, acknowledged item. |
| SEO & technical discoverability | **B** | Clean canonicals, a generated sitemap that cannot drift from the domain, valid JSON-LD, no duplicate titles, correct robots handling. Held down by entity weakness: no author, no `Person`, no `sameAs`, and 47 FAQ answers hand-duplicated into JSON-LD with no test on the built markup. |
| Content depth & editorial quality | **C+** | 1,266–3,000 words per route, accurate, plainly written, reading level around grade 8 on most pages. But there is no glossary for the 39 terms the site uses without defining, no "what do I do now" after a tool returns a result, no jump list on six routes that run past 10,000px, and the site's longest single sentence — 44 words, FK 21.1 — is the one explaining the distinction readers most often get wrong. |
| Visual design & brand | **C+** | The token architecture is genuinely good: a declared layering contract, a full dark theme, a type ladder, a spacing scale. The restraint is a real position, not an absence of one. But the type ladder is an accumulation of 17 steps rather than a scale, 106 inline `style` attributes bypass the system entirely (and are the sole reason CSP needs `'unsafe-inline'`), the palette cannot be changed in one place, and the brand exists only as a wordmark and a clock glyph. |
| Media & imagery | **D** | Six image files. Zero `<img>` tags. One generic 110KB OG card serving all 13 routes. The single illustration is invisible on every phone. No diagram anywhere explains the Part B offset — the central idea of the entire product — despite three pages discussing it in prose. At the Fortune 500 bar this is not a stylistic choice; it is an unbuilt layer. |
| Trust, authorship & accountability | **D** | This is the disqualifier. A site publishing government benefit figures to people making irreversible financial decisions has **no named author, no reviewer, no editorial policy, no corrections channel, and zero `mailto:` links across all 13 pages**. There is one unlinked address on `/privacy`. No page states who checked the numbers or when they were last verified against source. Legal and brand review at any large organisation stops here, before design is even discussed. |
| Operational readiness | **C−** | Deploys are gated and atomic, and the artifact that ships is the one that was verified. But nothing reads the clock and there is no `schedule:` trigger, so on **2026-10-15 the site begins stating something false in 31 places across 8 pages** with no mechanism to correct itself. A property whose whole value is date-sensitive government data has no freshness automation at all. |

## Overall: **B− (82)**

Weighted toward what this site *is* — a YMYL consumer-finance utility — which means
correctness, accessibility and accountability carry more than polish.

**Why it is not lower.** The engineering underneath is better than most of what ships at
large companies. Zero dependencies with a real gate, 78 tests encoding statutory rules,
CLS at 0.0000, a full dark theme that passes AA, and a build that would rather fail than
publish a figure it cannot reconcile. Three audits have made it genuinely hard to ship a
wrong number here by accident. That is rare and it is worth saying plainly.

**Why it is not higher.** Two things, and they are the same kind of thing — the site is
excellent at being *correct* and has not yet started being *accountable*.

1. **Nobody's name is on it.** For YMYL content this is not a polish item, it is a
   gating one. A reader cannot tell who wrote this, who checked it, when it was last
   verified, or how to report an error. Items `TR-1` through `TR-5` close it, and three of
   them need a human to supply a real person and a real address — no audit can invent those.
2. **The clock is not wired to anything.** 68 days from the audit date the site starts
   telling visitors that an announcement expected on a past date is still ahead of them,
   and the architecture has no way to notice. A one-line `schedule:` trigger is the floor;
   deriving the date from data is the fix.

Close those two and the media layer in this brief, and this is an **A−** property. The
foundation is already there; what is missing is the layer that tells a stranger why they
should believe it.

*Grades reflect the site at commit `0d2caac`. Every figure cited above was measured during
the audits of 2026-08-08 and 2026-08-16, not estimated.*
