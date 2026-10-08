# COLA announcement-day runbook (2027 cycle — expected ~2026-10-14)

Purpose: turn announcement day into a 15-minute mechanical flip. The site
already renders the estimate cycle correctly (`fea304b` readiness: worked
examples, PAA FAQs, cycle-keyed templating); this is the same-day switch to
the official number, plus the amplification steps that ride the news cycle.

Everything below assumes BLS releases September CPI-W ~8:30 a.m. ET and SSA
announces the official COLA the same day.

## 1. Get the two official numbers

From the SSA news release (ssa.gov/news) or the press telegram:

- **Official 2027 COLA %** (one decimal, e.g. `3.4`)
- **Q3 2026 CPI-W average** (three decimals, e.g. `318.512`) — the July,
  August, September average, printed in the release's technical note.

## 2. Flip the projected row to official

`src/data/cola-history.csv`, last line. Today it reads:

```csv
2027,3.5,2027-01-01,,,projected,The Senior Citizens League COLA Watch September 2026,2026-10-14
```

Change to (values from step 1; `announced` = today's date):

```csv
2027,<OFFICIAL_PCT>,2027-01-01,<TODAY>,<Q3_CPIW_AVG>,official,Social Security Administration,
```

Column order: `year, cola_pct, effective, announced, q3_cpiw_avg, status,
source, announce_expected` — note `announce_expected` is left EMPTY for
official rows.

## 3. Rebuild and verify

```
npm run build:data   # cola.json regenerates; log should print
                    # "cola.json: confirmed 2027=<PCT>% · projected <next>=null"
npm run build
npm test             # incl. the no-date-literals and worked-example gates
npm run verify:build
```

Watch the build log's worked-vs-official check: it computes the COLA from
the Q3 averages and logs `worked check X% (official Y%)` — X and Y should
match (tolerance is a rounding tenth). If they diverge, the CPI-W figure is
wrong, not the announced one; re-check step 1.

If a new estimate cycle begins (e.g. a 2028 projected row is added later),
add it as a fresh `projected` row — never edit an `official` row.

## 4. Ship

Branch, commit (`cola: official 2027 COLA <PCT>%`), PR, wait for green
checks, merge (owner standing directive: merges post green checks).
Cloudflare Pages deploys from main automatically.

## 5. Same-day amplification (the part that rides the news cycle)

- **IndexNow** (GscOps repo): `node scripts/indexnow-submit.mjs benefitdial.com`
- **GSC**: PUT the sitemap for `sc-domain:benefitdial.com`
  (feed `https://benefitdial.com/sitemap.xml`) → expect 204.
- **Owner packet B3** (GscOps `docs/OWNER-LINK-SUBMISSIONS-UTILITY3-2026-10-04.md`):
  send the calculator link to personal-finance newsletters and senior-news
  tip lines the same day — they cite calculators in annual COLA coverage.
- **Re-audit the new #1** of "social security cola 2027" (GscOps weekly
  probe / per-URL audit) to see who won the post-announcement SERP.

## 6. Follow-ups within the week

- Medicare Part B 2027 premium lands later in the fall — when it does,
  update `src/data/medicare-figures.csv` + `npm run build:data`; the
  `/guides/medicare-premiums-2027` page flips from projection to official
  the same way (its table marks the 2027 row "(projection)" until then).
- Watchtower gate (Monday automation): expect the cola/AEP page-impression
  surge to fire this week — that's the plan's first success gate.
