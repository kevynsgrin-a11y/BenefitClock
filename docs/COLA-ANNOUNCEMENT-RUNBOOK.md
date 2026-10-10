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

**Rehearse first (any time from Sept 1 until the flip):**

```
node scripts/dry-run-flip.mjs
```

It copies the repo to a temp folder, promotes the projected row with
placeholder numbers, builds, runs the tests and `verify:build`, and scans every
built page for wording that is only true BEFORE the announcement ("expected on",
"early estimate", "Awaiting", a leftover old percentage, a tscl.org link, a
mention of the next year). It runs two variants: promote the row only, and
promote it AND append a next-year projection. Both must be clean. CI runs it on
every commit in the window, so a new stale sentence fails the PR instead of
the announcement.

`node scripts/dry-run-flip.mjs --copy-list /tmp/official-copy.md` also writes
every sentence that only exists after the flip, next to the sentence it
replaces, for a read-through.

**On the day:** `src/data/cola-history.csv`, last line. Today it reads:

```csv
2027,3.5,2027-01-01,,,projected,The Senior Citizens League COLA Watch September 2026,2026-10-14,
```

**One edit is required, a second is optional.**

1. Replace the 2027 line with the official row (values from step 1;
   `announced` = today's date):

```csv
2027,<OFFICIAL_PCT>,2027-01-01,<TODAY>,<Q3_CPIW_AVG>,official,Social Security Administration,,
```

That alone is a complete flip. Every page that said "expected" or "early
estimate" switches to its official wording (the `{{#projected}}` / `{{#official}}`
pairs in `src/pages/`), and the site stops mentioning a next-year COLA.

2. **Optional — only if you have a real source for a next-year projection**,
append it as a new last line. Use the real source and the expected 2027
   announcement date (BLS release calendar). The history chart then draws the
   2028 bar labelled as an estimate; nothing else changes:

```csv
2028,<PROJECTED_PCT>,2028-01-01,,,projected,<PROJECTION SOURCE AND MONTH>,<EXPECTED_ANNOUNCE_DATE>,
```

Do not invent a projection to satisfy the build. It no longer asks for one.

Column order: `year, cola_pct, effective, announced, q3_cpiw_avg, status,
source, announce_expected, late_reason`. `announce_expected` is EMPTY on
official rows. `late_reason` is empty unless the announcement came later than
usual; if it did, put the reason there (no commas). It feeds the "later than
usual" note and the "the date can move" sentences. Do not put an unverified
reason in it.

**How the copy follows the row.** Sentences about the cycle's COLA are written
twice in the page source and the build keeps one, chosen by the cycle row's
`status`:

```html
{{#projected}}The 2027 COLA is expected on {{COLA_ANNOUNCE_DATE_LONG}}.{{/projected}}{{#official}}The {{CYCLE_YEAR}} COLA was announced {{CYCLE_ANNOUNCE_DATE_LONG}}.{{/official}}
```

Use `{{CYCLE_YEAR}}`, `{{CYCLE_COLA}}` and `{{CYCLE_ANNOUNCE_DATE_LONG}}`
(expected date while projected, actual date once official) in the official
branch. The `COLA_PROJECTED*` and `COLA_ANNOUNCE_DATE*` tokens describe the
projected row and exist only while one does; using one outside a
`{{#projected}}` block fails the post-flip build by name. Blocks do not nest.

**Check the source credit.** The projected-state credit comes from the
`source` column of the projected row. Two links on `src/pages/open-enrollment.html`
(the "projection:" source line and the "COLA projection" list item) are
hardcoded to The Senior Citizens League and sit inside `{{#projected}}`
blocks, so they disappear on the flip. If you later add a next-year projection
from another source, the open-enrollment page does not show it.

**Next year's rollover.** The "recent COLAs" table on the COLA guide hardcodes
2023–2025 and reads the two newest rows from the data. When the 2028 row is
promoted, 2026 drops out of that table unless you add a row for it.

## 3. Rebuild and verify

```
npm run build:data   # cola.json regenerates; log should print
                    # "cola.json: confirmed 2027=<PCT>% · projected 2028=<PCT>%"
                    # (or "projected null=null%" if you skipped the optional row)
npm run build
npm test             # incl. the no-date-literals and worked-example gates
npm run verify:build
```

Watch the build log's worked-vs-official check: it computes the COLA from
the Q3 averages and logs `worked check X% (official Y%)` — X and Y should
match (tolerance is a rounding tenth). If they diverge, the CPI-W figure is
wrong, not the announced one; re-check step 1.

Never edit an `official` row after the fact. A later estimate cycle is always
a fresh `projected` row.

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
