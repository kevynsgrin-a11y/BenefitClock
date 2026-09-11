#!/usr/bin/env node
// Normalizes CMS's official CY2026 MA/Part D Landscape Source File into the
// src/data/landscape-current.csv shape build-plan-data.mjs consumes, scoped to the
// site's served counties (the full national file is ~360k rows; the site's tool
// covers its GEO list). Run once per plan year; re-run when CMS publishes the next
// landscape (CY2027, expected early October) to produce landscape-next.csv with
// --year 2027 --out landscape-next.csv.
//
// Source (public domain): https://www.cms.gov/medicare/coverage/prescription-drug-coverage
// → "CY2026 Landscape (202609) (ZIP)" — place CY2026_Landscape_202609.csv next to
// this script or pass --src <path>.
//
// NOTE: the CY2026 combined landscape no longer publishes dental/vision/hearing
// benefit flags (they lived in older per-year files); those columns are emitted
// empty and the site's manifest records the limitation. Never guess them.
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const argOf = (name, fallback) => { const i = argv.indexOf(name); return i === -1 ? fallback : argv[i + 1] }

const GEO = {
  FL: ['broward', 'miamidade', 'palmbeach'], TX: ['harris', 'dallas', 'bexar'],
  CA: ['losangeles', 'sandiego', 'orange'], NY: ['kings', 'queens', 'erie'],
  PA: ['philadelphia', 'allegheny'], AZ: ['maricopa', 'pima'],
  OH: ['cuyahoga', 'franklin'], NC: ['mecklenburg', 'wake'],
  GA: ['fulton', 'dekalb'], IL: ['cook', 'dupage'],
}
const countyKey = (c) => String(c).toLowerCase().replace(/[^a-z]/g, '')

const OUT = join(HERE, '..', 'src', 'data', argOf('--out', 'landscape-current.csv'))
const SRC = argOf('--src', join(HERE, 'CY2026_Landscape_202609.csv'))
if (!existsSync(SRC)) {
  console.error(`Source CSV not found at ${SRC}. Download the CY2026 Landscape ZIP from CMS and extract it, or pass --src <path>.`)
  process.exit(1)
}

// Minimal CSV splitter honoring quoted fields.
function splitLine(line) {
  const out = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ; continue }
    if (ch === ',' && !inQ) { out.push(cur); cur = ''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}
const csv = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const num = (v) => (v == null || v === '' ? '' : String(v).replace(/[$,]/g, ''))

const rl = createInterface({ input: createReadStream(SRC, 'utf8') })
let header = null
const idx = {}
const rows = []
for await (const line of rl) {
  const cells = splitLine(line)
  if (!header) {
    header = cells.map((h) => h.replace(/^\uFEFF/, '').trim())
    for (const [i, h] of header.entries()) idx[h] = i
    continue
  }
  const state = cells[idx['State Territory Abbreviation']]
  const counties = GEO[state]
  if (!counties) continue
  if (!counties.includes(countyKey(cells[idx['County Name']]))) continue
  const pick = (name) => (idx[name] !== undefined ? cells[idx[name]] : '')
  rows.push([
    pick('Contract ID'), String(pick('Plan ID')).padStart(3, '0'), pick('Segment ID'),
    pick('Organization Marketing Name') || pick('Contract Name'), pick('Plan Type'),
    pick('Plan Name'),
    num(pick('Monthly Consolidated Premium (Part C + D)')) || num(pick('Part C Premium')),
    num(pick('Annual Part D Deductible Amount')), num(pick('In-Network Maximum Out-of-Pocket (MOOP) Amount')),
    num(pick('Overall Star Rating')) || num(pick('Part C Summary Star Rating')),
    /^yes$/i.test(pick('Part D Coverage Indicator')) ? '1' : '',
    '', '', '', // dental/vision/hearing: not published in the CY2026 combined file
    state, pick('County Name'), '',
  ])
}

const COLUMNS = 'contract_id,plan_id,segment_id,organization_name,plan_type,plan_name,premium,drug_deductible,moop,star_rating,has_drug,has_dental,has_vision,has_hearing,state,county,fips'
writeFileSync(OUT, [COLUMNS, ...rows.map((r) => r.map(csv).join(','))].join('\n') + '\n')
const states = [...new Set(rows.map((r) => r[14]))].join(',')
console.log(`${OUT}: ${rows.length} plans across ${states}`)
console.log('Note: dental/vision/hearing flags are not in the CY2026 combined landscape; emitted empty (never guessed).')
