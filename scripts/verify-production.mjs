/* ==========================================================================
   verify-production.mjs — does the LIVE site actually serve what src/static
   promises?

   Everything in src/static/_headers is a promise Cloudflare Pages has to keep,
   and nothing in this repo can tell whether it does: the build never reads that
   file, CI never requests a URL, and the local preview server (scripts/serve.mjs)
   implements neither _headers nor _redirects. A Pages project pointed at the
   wrong output directory, or two deploy paths racing each other, drops the whole
   header block and every check here still passes. The audit that prompted this
   script could not close that gap either — its sandbox refused all outbound
   requests — so the verification stayed theoretical.

   Run it from any networked machine after a deploy:

     node scripts/verify-production.mjs
     node scripts/verify-production.mjs https://staging.example.pages.dev

   Exits non-zero if anything is missing, so it can gate a release.
   Zero dependencies; needs Node 18+ for global fetch.
   ========================================================================== */

const BASE = (process.argv[2] || "https://benefitdial.com").replace(/\/+$/, "");

let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { failures++; console.log(`  ✗ ${m}`); };

/* Header values are asserted by substring, not equality: Cloudflare may append
   to some of these, and an exact match would fail on a change that is not a
   regression. The tokens below are the parts that carry the security property. */
const REQUIRED_HEADERS = [
  ["strict-transport-security", "max-age=63072000", "HSTS with a two-year max-age"],
  ["strict-transport-security", "includeSubDomains", "HSTS covers subdomains"],
  ["strict-transport-security", "preload", "HSTS is preload-eligible"],
  ["content-security-policy", "default-src 'self'", "CSP defaults to same-origin"],
  ["content-security-policy", "frame-ancestors 'none'", "CSP forbids framing"],
  ["content-security-policy", "object-src 'none'", "CSP forbids plugins"],
  ["x-content-type-options", "nosniff", "MIME sniffing disabled"],
  ["x-frame-options", "DENY", "Framing denied"],
  ["referrer-policy", "strict-origin-when-cross-origin", "Referrer policy set"],
  ["permissions-policy", "geolocation=()", "Permissions-Policy denies geolocation"],
  ["permissions-policy", "browsing-topics=()", "Permissions-Policy denies Topics"],
  ["cross-origin-opener-policy", "same-origin", "COOP set"],
];

/* From src/static/_redirects. A friendly alias that stops redirecting is a
   silent 404 on a URL that may already be linked or printed somewhere. */
const REDIRECTS = [
  ["/cola", "/cola-calculator"],
  ["/calculator", "/cola-calculator"],
  ["/medicare", "/medicare-plan-changes"],
];

async function main() {
  console.log(`\nVerifying ${BASE}\n`);

  /* ---- 1. Security headers on the document ---------------------------- */
  console.log("Security headers (/)");
  let res;
  try {
    res = await fetch(`${BASE}/`, { redirect: "manual" });
  } catch (err) {
    console.log(`  ✗ could not reach ${BASE}/ — ${err.message}`);
    console.log("\nNothing else could be checked.\n");
    process.exit(1);
  }
  if (res.status !== 200) bad(`GET / returned ${res.status}, expected 200`);
  else ok("GET / returns 200");

  for (const [header, token, label] of REQUIRED_HEADERS) {
    const value = res.headers.get(header);
    if (!value) bad(`${label} — header "${header}" is absent entirely`);
    else if (!value.includes(token)) bad(`${label} — "${header}" is present but lacks "${token}" (got: ${value})`);
    else ok(label);
  }

  /* An unparseable Permissions-Policy directive voids the WHOLE header
     silently, so confirm the browser-visible shape rather than trusting it. */
  const pp = res.headers.get("permissions-policy");
  if (pp && /[^,]\s+[a-z-]+=\(/.test(pp.replace(/,\s*/g, ", "))) {
    // tokens must be comma-separated; a missing comma silently kills the header
    ok("Permissions-Policy is comma-delimited");
  }

  /* ---- 2. Caching on unhashed assets ---------------------------------- */
  console.log("\nAsset caching (/assets/css/site.css)");
  const css = await fetch(`${BASE}/assets/css/site.css`, { redirect: "manual" });
  const cc = css.headers.get("cache-control") || "";
  if (css.status !== 200) bad(`site.css returned ${css.status}`);
  else if (!/must-revalidate|max-age=0/.test(cc)) {
    bad(`assets are not revalidated (cache-control: ${cc || "absent"}) — filenames are not content-hashed, so a stale asset can outlive the HTML that references it`);
  } else ok(`assets revalidate (cache-control: ${cc})`);

  /* ---- 3. Friendly-alias redirects ------------------------------------ */
  console.log("\nRedirects (_redirects)");
  for (const [from, to] of REDIRECTS) {
    const r = await fetch(`${BASE}${from}`, { redirect: "manual" });
    const loc = r.headers.get("location");
    if (r.status < 300 || r.status >= 400) bad(`${from} returned ${r.status}, expected a 3xx redirect`);
    else if (!loc || !loc.endsWith(to)) bad(`${from} redirects to ${loc || "nothing"}, expected ${to}`);
    else ok(`${from} → ${to} (${r.status})`);
  }

  /* ---- 4. Crawler-facing files ---------------------------------------- */
  console.log("\nCrawler files");
  const robots = await fetch(`${BASE}/robots.txt`);
  const robotsBody = robots.ok ? await robots.text() : "";
  if (!robots.ok) bad(`robots.txt returned ${robots.status}`);
  else if (!robotsBody.includes(`${BASE}/sitemap.xml`)) {
    bad(`robots.txt does not point at ${BASE}/sitemap.xml — it reads:\n${robotsBody.trim()}`);
  } else ok("robots.txt advertises the sitemap on this origin");

  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  const sitemapBody = sitemap.ok ? await sitemap.text() : "";
  const locs = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!sitemap.ok) bad(`sitemap.xml returned ${sitemap.status}`);
  else if (!locs.length) bad("sitemap.xml contains no <loc> entries");
  else if (!locs.every((l) => l.startsWith(BASE))) {
    bad(`sitemap has entries on another origin: ${locs.find((l) => !l.startsWith(BASE))}`);
  } else ok(`sitemap.xml lists ${locs.length} URLs, all on this origin`);

  /* ---- 5. PWA manifest is installable --------------------------------- */
  console.log("\nPWA manifest");
  const mf = await fetch(`${BASE}/site.webmanifest`);
  if (!mf.ok) bad(`site.webmanifest returned ${mf.status}`);
  else {
    const m = await mf.json();
    if (!["standalone", "fullscreen", "minimal-ui"].includes(m.display)) {
      bad(`display is "${m.display}" — Chrome offers no install prompt unless it is standalone/fullscreen/minimal-ui`);
    } else ok(`display is "${m.display}"`);

    const png192 = (m.icons || []).some(
      (i) => (i.type || "").includes("png") &&
        String(i.sizes || "").split(/\s+/).some((s) => parseInt(s, 10) >= 192)
    );
    png192 ? ok("a PNG icon of at least 192px is declared")
           : bad("no PNG icon >= 192px — Chrome will not treat the site as installable");

    for (const icon of m.icons || []) {
      const r = await fetch(`${BASE}${icon.src}`, { redirect: "manual" });
      r.ok ? ok(`icon ${icon.src} resolves (${r.status})`)
           : bad(`icon ${icon.src} returned ${r.status} — a manifest icon that 404s fails installability`);
    }
  }

  console.log(
    failures === 0
      ? "\nAll production checks passed.\n"
      : `\n${failures} check(s) FAILED — production is not serving what src/static promises.\n`
  );
  process.exit(failures === 0 ? 0 : 1);
}

await main();
