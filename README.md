# BenefitClock

**An independent, ad-supported public utility for the fall benefits season.**
BenefitClock helps U.S. Medicare beneficiaries do two things in under a minute — with
no phone number, no lead form, and no data selling:

1. **Estimate their Social Security COLA raise** and see the amount they actually keep
   after the Medicare Part B premium is withheld.
2. **See exactly what changed in their Medicare plan** year over year — premium,
   deductible, maximum out-of-pocket, star rating, and dropped extras — using the public
   CMS Landscape and Crosswalk files.

The whole product is a **static site** (HTML/CSS/vanilla JS) with **zero runtime
dependencies**, built for near-zero hosting cost on Cloudflare Pages and monetized
purely through **programmatic display advertising** — never carrier/broker commissions,
lead sales, or captured PII. That business-model choice is deliberate: it keeps the site
outside the CMS "chain of enrollment" (TPMO) definition and out of the insurance sales
funnel entirely.

---

## Quick start

```bash
npm run build      # regenerate data + assemble dist/
npm run serve      # preview at http://localhost:4321
npm test           # unit tests for the COLA + plan-diff math (node --test)
```

No `npm install` is required to build or run the site — there are **no dependencies**.
(`playwright-core` is used only by the optional browser verification and is installed
transiently, never committed.)

## How it's built

A tiny, purpose-built static-site generator (`scripts/build.mjs`, ~200 lines, no deps):

- **Pages** live in `src/pages/*.html`. Each starts with an HTML-comment front-matter
  block (`title`, `description`, `slug`, `nav`, `scripts`, …) followed by body sections.
- **Layout** (`src/layout.html`) wraps every page; **partials** (`src/partials/*.html`)
  provide the header, footer, independence disclaimer, and ad slots via `{{> name }}`
  includes. Shared figures/dates are injected as `{{TOKENS}}`.
- **Assets** (`src/assets`) and generated **data** (`src/data/*.json`) are copied to
  `dist/`. `sitemap.xml`, `_headers`, `_redirects`, and `robots.txt` are emitted too.

```
src/
  layout.html            # document shell (head, OG, JSON-LD, skip link)
  partials/              # header, footer, disclaimer, ad slots
  pages/                 # one file per page (front-matter + body)
  assets/
    css/site.css         # the entire design system (senior-first, WCAG-minded)
    js/
      lib/cola-core.js       # pure COLA math  (shared by browser + tests)
      lib/plandiff-core.js   # pure diff logic (shared by browser + tests)
      cola.js / plan-diff.js # progressive-enhancement UI wiring
      nav.js
  data/                  # CSV sources (committed) -> JSON (generated, gitignored)
scripts/                 # build.mjs, build-*-data.mjs, serve.mjs, verify-browser.mjs
tests/                   # node --test unit tests
```

## Data sources (all public domain)

| Source | Powers | Cadence |
| --- | --- | --- |
| CMS **Landscape** files | Plan availability, premiums, org names | Late Sep / early Oct, annual |
| CMS **Crosswalk** files | Prior→next plan ID mapping + status (the diff engine) | With Landscape |
| CMS **PUF / PBP** files | Drug tiers, deductibles, supplemental benefits | Monthly / annual |
| BLS **CPI-W** (`CWUR0000SA0`) | COLA calculation | Monthly |
| SSA **COLA** announcement | Confirmed COLA figure | Announced Oct 14, 2026 |

### Updating the data each fall

- **COLA:** edit `src/data/cola-history.csv` after the SSA announcement, then rebuild.
- **Medicare plans:** drop the real CMS CSVs into `src/data/` as
  `landscape-current.csv`, `landscape-next.csv`, and `crosswalk.csv`, then rebuild.
  `scripts/build-plan-data.mjs` ingests them automatically. **Until those files are
  published, the plan tool runs on a deterministic, structurally-faithful _sample_
  dataset** (`manifest.sample = true`) so the tool is fully demonstrable — every sample
  plan is flagged `sample: true`.

## Deploying to Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment:** set `SITE_URL` to the production origin (defaults to
  `https://benefitclock.org`) so canonical URLs, the sitemap, and `robots.txt` are correct.

`_headers` sets security headers (HSTS, `X-Content-Type-Options`, a restrictive
`Permissions-Policy`, etc.) and cache policies. `_redirects` maps friendly aliases.

## Monetization & compliance stance

BenefitClock is **not** a broker, agent, or Third-Party Marketing Organization (TPMO):

- It takes **no** carrier or broker commissions / CPA and sells **no** leads or data.
- It captures **no** personal information — no name, email, or phone number — and the
  calculators run entirely in the browser.
- It never recommends a specific plan for compensation and always points users to the
  official **Medicare Plan Finder** or **1-800-MEDICARE** to enroll.

Ad-network loader scripts (AdSense/Mediavine/Raptive/etc.) attach at the single marked
spot in `src/layout.html`. See `/how-it-works` and `/privacy` on the site itself.

## Not affiliated with the U.S. government

BenefitClock is an independent educational utility and is not connected with or endorsed
by the U.S. government, the federal Medicare program, CMS, or the SSA. Figures for future
years are estimates until the official government announcements. Nothing here is
financial, legal, or medical advice.

## License

MIT — see [LICENSE](./LICENSE).
