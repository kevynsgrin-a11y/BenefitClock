/* ==========================================================================
   verify-build-output.mjs — assertions against dist/ that the existing gates
   cannot make.

   ci.yml already checks that the pages exist, that no {{TOKEN}} survived, and
   that every HTML href/src resolves. Three classes of breakage slip straight
   through all of that:

     1. The JSON the plan tool fetches at RUNTIME. It is requested by
        /assets/js/plan-diff.js, never by an href or src, so a data file that
        failed to copy into dist/ is invisible to the link checker and shows up
        as a broken tool in production.
     2. The _redirects targets. Seven friendly aliases 301 to canonical URLs;
        nothing verifies the destinations still exist, so a renamed slug turns a
        published alias into a 404 silently.
     3. Whether the built HTML still says what the data says. The repo's worst
        historical defect was a COLA figure that disagreed with itself while the
        build exited 0, and its second worst was sample plan data presented as
        verified CMS figures. Both were content-level, and both passed every
        structural check that existed at the time.

   Run after `npm run build`. Exits non-zero on any failure.
   ========================================================================== */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { failures++; console.log(`  ✗ ${m}`); };
const read = (p) => readFileSync(p, "utf8");
const isFile = (p) => existsSync(p) && statSync(p).isFile();

if (!existsSync(DIST)) {
  console.error("dist/ does not exist — run `npm run build` first.");
  process.exit(1);
}

/* ---- 1. Runtime-fetched JSON ------------------------------------------ */
console.log("\nRuntime data files (fetched by plan-diff.js)");
{
  const js = read(join(ROOT, "src/assets/js/plan-diff.js"));
  // Derive the list from the code itself so this cannot drift from what the
  // browser actually requests.
  const refs = [...js.matchAll(/\$\{DATA_BASE\}\/([\w.-]+\.json)/g)].map((m) => m[1]);
  const unique = [...new Set(refs)];
  if (!unique.length) bad("no ${DATA_BASE}/*.json references found — has plan-diff.js changed shape?");
  for (const name of unique) {
    const p = join(DIST, "data", name);
    if (!isFile(p)) { bad(`dist/data/${name} is missing — the plan tool fetches it at runtime`); continue; }
    try { JSON.parse(read(p)); ok(`dist/data/${name} exists and parses`); }
    catch (e) { bad(`dist/data/${name} is not valid JSON — ${e.message}`); }
  }
}

/* ---- 2. _redirects targets -------------------------------------------- */
console.log("\nRedirect targets (_redirects)");
{
  const file = join(DIST, "_redirects");
  if (!isFile(file)) bad("_redirects did not reach dist/");
  else {
    const rules = read(file)
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split(/\s+/));
    if (!rules.length) bad("_redirects contains no rules");
    for (const [from, to] of rules) {
      if (!to) { bad(`malformed rule: "${from}"`); continue; }
      const path = to.split(/[?#]/)[0];
      const hit = [join(DIST, path), join(DIST, path + ".html"), join(DIST, path, "index.html")].some(isFile);
      hit ? ok(`${from} → ${to}`) : bad(`${from} → ${to} — the target does not exist in dist/`);
    }
  }
}

/* ---- 3. Built HTML agrees with the data ------------------------------- */
console.log("\nBuilt pages agree with the data layer");
{
  const cola = JSON.parse(read(join(DIST, "data", "cola.json")));
  const calc = read(join(DIST, "cola-calculator.html"));

  /* The projected COLA is the calculator's own default. When these disagree the
     tool computes a raise from a percentage the rest of the page never mentions. */
  const projected = String(cola.projectedCola);
  calc.includes(`${projected}%`)
    ? ok(`projected COLA ${projected}% from cola.json appears on the calculator`)
    : bad(`cola.json says projectedCola=${projected} but "${projected}%" does not appear in cola-calculator.html`);

  const confirmed = String(cola.confirmedCola);
  const keyDates = read(join(DIST, "key-dates.html"));
  keyDates.includes(`${confirmed}%`)
    ? ok(`confirmed COLA ${confirmed}% from cola.json appears on key-dates`)
    : bad(`cola.json says confirmedCola=${confirmed} but "${confirmed}%" does not appear in key-dates.html`);

  /* Statutory figures are indexed annually and must never be inlined. */
  const figures = JSON.parse(read(join(DIST, "data", "medicare-figures.json")));
  const premium = Number(figures.partBPremium).toFixed(2);
  calc.includes(premium)
    ? ok(`Part B premium $${premium} from the data appears on the calculator`)
    : bad(`medicare-figures.json says partBPremium=${premium}, absent from cola-calculator.html`);
}

/* ---- 4. Sample data is disclosed, visibly ----------------------------- */
console.log("\nSample-data disclosure");
{
  const manifest = JSON.parse(read(join(DIST, "data", "manifest.json")));
  const page = read(join(DIST, "medicare-plan-changes.html"));

  if (manifest.sample === true) {
    /* The banner must ship VISIBLE and be hidden only by script, so that a JS
       failure degrades toward honesty. A `hidden` attribute in the built markup
       inverts that: the disclosure would then depend on the very script that
       could fail. */
    const banner = page.match(/<div[^>]*id="pd-sample-banner"[^>]*>/);
    if (!banner) bad('manifest.sample is true but #pd-sample-banner is not in the built page');
    else if (/\shidden[\s>=]/.test(banner[0])) {
      bad(`#pd-sample-banner ships with a "hidden" attribute — the sample warning would depend on JS running: ${banner[0]}`);
    } else ok("#pd-sample-banner ships visible (hidden only by script)");

    const inline = page.match(/<p[^>]*id="pd-sample-inline"[^>]*>/);
    if (!inline) bad('manifest.sample is true but #pd-sample-inline is not in the built page');
    else if (/\shidden[\s>=]/.test(inline[0])) bad('#pd-sample-inline ships hidden');
    else ok("#pd-sample-inline ships visible");

    page.toLowerCase().includes("sample")
      ? ok("the word \"sample\" is present in the built page text")
      : bad('manifest.sample is true but the page never says "sample"');
  } else {
    ok("manifest.sample is false — real CMS data; disclosure checks not applicable");
  }
}

/* ---- 5. Manifest icons resolve ---------------------------------------- */
console.log("\nPWA manifest icons");
{
  const mf = JSON.parse(read(join(DIST, "site.webmanifest")));
  for (const icon of mf.icons || []) {
    isFile(join(DIST, icon.src.replace(/^\//, "")))
      ? ok(`${icon.src} exists`)
      : bad(`${icon.src} is declared in the manifest but missing from dist/ — installability fails on a 404 icon`);
  }
}

console.log(
  failures === 0
    ? `\nBuild output verified.\n`
    : `\n${failures} check(s) FAILED.\n`
);
process.exit(failures === 0 ? 0 : 1);
