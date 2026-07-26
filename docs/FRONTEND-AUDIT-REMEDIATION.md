# Front-End Audit — Remediation

Companion to `docs/FRONTEND-AUDIT.md`. Every number below was re-measured against
the fixed site, independently of the passes that made the changes.

## The three criticals

**C1 · Sample plan data presented as verified CMS data.** The tool rendered
generated dollar figures for real carrier names and real CMS contract IDs under a
"Figures verified" provenance badge, with a print button beside them. The manifest
and every record carried `sample: true`; neither was read.

| | Before | After |
| --- | --- | --- |
| `"sample"` in `body.innerText` | 0 | 3 (33 in print) |
| Provenance strip | `Figures verified November 14, 2025` | `Sample data — not real plan figures` |
| Real CMS IDs in page | H5253, H1610, S5601, real carriers | none |

The banner renders **visible by default** and is only ever hidden by script, so a
JS failure cannot silently restore the misleading state. The dataset was also
regenerated with invented carriers and placeholder IDs, so no real-world
identifier appears even if the banner is missed.

**C2 · Build substituted a hardcoded COLA literal into money copy.** When the data
legitimately reported `null`, the build inlined `"3.6"`. Running the README's own
annual-update procedure shipped 41 stale figures across 7 pages — build exiting 0,
tests passing, both workflows' sanity checks passing. The build now fails:

```
Missing data for {{COLA_PROJECTED}}. No row with status=projected in
src/data/cola-history.csv. After an official COLA is announced, add the next
year's projection row — do not leave pages quoting the previous estimate.
Refusing to build: pages quote this figure in copy about people's benefits.
```

**C3 · Stale hardcoded statutory figures.** The calculator prefilled a prior-year
Part B premium presented as current, and a superseded Part D cap was asserted 13×.
Both are indexed annually and now live in `src/data/medicare-figures.csv`.
Part B prefill measured: `202.90`.

## Highs

| Finding | Before | After |
| --- | --- | --- |
| Dollar figures clipped at 320px | `+$158.50` rendered as `+$15` (135px clipped) | not clipped at any tested width |
| Empty benefit answered anyway | full result for the unentered $2,000 | `— — — —` + *"Please enter your current monthly benefit."* |
| `data-state="empty"` matched no CSS | stale figures stayed painted | cleared in script; CSS rules now exist too |
| Part B unvalidated | `185,00` → `-$16,428.00` | *"Please use numbers only, like 202.90."* |
| Dark-mode nav toggle | 1.50:1 text / 1.56:1 border | 17.22:1 / 3.50:1 |
| Text-size control | 50.9% of characters never changed; scale inverted | 2.1% (residual is SVG/ad px by design); no inversion |
| Ad-slot CLS on fill | 0.0069–0.0739, up to 195px shove | 0.0000 everywhere |
| Stale-asset window | up to 8 days of old CSS against new HTML | revalidates every request |
| FAQ focus ring | 100% clipped, 47 tab stops | visible (0 → 4352 px A/B) |
| Control borders | 1.38:1 | 3.31:1 |
| Plan table at 320px | 0/32 cells visible, no keyboard access | 9/36 visible, `tabindex="0"`, `role="region"` |
| JSON-LD COLA drift | JSON-LD said 3.6% while page said 2.9% | both move together |
| CI gating | red CI could not block a deploy | deploy calls CI and depends on it |

## Sitewide, re-measured

| Check | Result |
| --- | --- |
| Console errors, 13 routes × light/dark | 0 |
| Third-party requests | 0 |
| Cookies + localStorage on load | 0 |
| Horizontal overflow at 320px, normal and 24px font | 0 |
| Dark-mode contrast failures | 13 → 0 (1154 pairs) |
| Light-mode contrast failures | 0 → 0 (1148 pairs) |
| FAQ structured data vs rendered Q&A | 47 pairs, 0 mismatches |
| Heading skips | 0 on all 13 routes |
| Print from dark mode | min 1.07:1 → 5.02:1 |
| Tests | 21 → 43 passing |

## Deliberately left open

**AEP season years are still literal** (`guide-aep.html`). No token means
"enrolment season", and borrowing the COLA or Medicare-figures year would roll the
title while the body stayed pinned to the current season — reintroducing the drift
this work removed. Needs an AEP entry in the data layer.

**Assets are not content-hashed.** The correct fix for the stale-asset window is
hashed filenames; it would require rewriting ES module import specifiers across the
tool scripts, which is real breakage risk for what is now purely a performance gain
— `must-revalidate` already makes a stale asset impossible. The policy to switch to
is recorded at the relevant line in `_headers`.

**Chart label sizing** (`scripts/lib/svgcharts.mjs`) hardcodes a 720-unit viewBox,
so label size is structurally tied to container width. CSS lifts 320px phones from
5.4px to 9.3–12.7px; the durable fix is sizing the viewBox to the container.

**The 2026 statutory figures need one primary-source check.** They were corroborated
from secondary sources; direct fetches to cms.gov, medicare.gov and
federalregister.gov returned 403 from the sandbox. The caveat is recorded in
`src/data/medicare-figures.csv` beside the row it applies to.

Two audit findings were also **refuted during remediation** and correctly left
alone: the privacy page's ad-network disclosure is properly hedged and accurate,
and the `Permissions-Policy` header was never voided.
