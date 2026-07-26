/* ==========================================================================
   build.mjs — BenefitDial's tiny static-site generator (zero dependencies)

   - Assembles src/pages/*.html into full documents using src/layout.html
     and src/partials/*.html (token + include based).
   - Copies src/assets -> dist/assets and src/data/*.json -> dist/data.
   - Regenerates data JSON from CSV (via build-*-data.mjs) when needed.
   - Emits sitemap.xml, robots.txt passthrough, and Cloudflare Pages config.

   Page front-matter is an HTML comment at the very top of each page file:

     <!--
     title: Page title | BenefitDial
     description: Meta description (<=160 chars).
     slug: cola-calculator        # output path; "" or "index" => site root
     nav: cola                    # active nav id (home|cola|medicare|dates|guides|about)
     scripts: cola.js             # comma-separated module scripts from /assets/js
     ogtype: website
     -->
   ========================================================================== */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { colaHistoryChart, planCountChart } from "./lib/svgcharts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

/* SITE_URL must be an absolute origin. A protocol-less value ("benefitdial.com")
   silently produces relative canonicals, og:image and sitemap <loc> entries —
   all of which look fine in the build log and are broken in production. */
function resolveSiteUrl(raw) {
  const value = (raw || "https://benefitdial.com").trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[^/\s]+$/i.test(value)) {
    throw new Error(
      `SITE_URL must be an absolute origin such as "https://benefitdial.com" ` +
        `(got ${JSON.stringify(raw)}). Canonical URLs, og:image and sitemap entries depend on it.`
    );
  }
  return value;
}

const SITE = {
  name: "BenefitDial",
  url: resolveSiteUrl(process.env.SITE_URL),
  tagline: "Your Social Security raise and your Medicare plan — side by side, with no phone calls.",
  twitter: "",
  buildDate: new Date().toISOString().slice(0, 10),
  buildYear: new Date().getFullYear(),
};

/* ---- helpers ----------------------------------------------------------- */
const read = (p) => readFileSync(p, "utf8");
const partialsDir = join(SRC, "partials");

function parseFrontMatter(raw) {
  const m = raw.match(/^\s*<!--([\s\S]*?)-->\s*/);
  const meta = {};
  let body = raw;
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key) meta[key] = val;
    }
  }
  return { meta, body };
}

// Recursively resolve {{> partial }} includes.
function resolveIncludes(html, seen = new Set()) {
  return html.replace(/\{\{>\s*([a-z0-9\-_]+)\s*\}\}/gi, (_, name) => {
    if (seen.has(name)) return "";
    const file = join(partialsDir, `${name}.html`);
    if (!existsSync(file)) throw new Error(`Missing partial: ${name}`);
    const nested = new Set(seen);
    nested.add(name);
    return resolveIncludes(read(file), nested);
  });
}

function applyTokens(html, tokens) {
  return html.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : m
  );
}

/* sitemap <lastmod> should describe when the page changed. Stamping every URL
   with the build date meant it re-fired on every rebuild and carried no signal.
   Fall back to omitting lastmod (it is optional) rather than inventing one. */
function gitDate(args) {
  try {
    const out = execFileSync("git", args, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim().split("\n").filter(Boolean);
    const date = args.includes("--diff-filter=A") ? out[out.length - 1] : out[0];
    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  } catch {
    return null;
  }
}

const lastCommitDate = (file) => gitDate(["log", "-1", "--format=%cs", "--", file]);

/* Article datePublished/dateModified describe the page, so derive them from the
   page's own history rather than hardcoding a date that never moves again.
   Degrades to null on a shallow clone, same as sitemap lastmod. */
const firstCommitDate = (file) => gitDate(["log", "--diff-filter=A", "--format=%cs", "--", file]);

function cleanUrl(slug) {
  if (!slug || slug === "index") return "/";
  return `/${slug}`;
}

function outPath(slug) {
  if (!slug || slug === "index") return join(DIST, "index.html");
  return join(DIST, `${slug}.html`);
}

/* ---- data build -------------------------------------------------------- */
function buildData() {
  console.log("• Building data (CPI-W + CMS plan JSON + statutory figures + AEP season)…");
  execFileSync(process.execPath, [join(__dirname, "build-cola-data.mjs")], { stdio: "inherit" });
  execFileSync(process.execPath, [join(__dirname, "build-medicare-figures.mjs")], { stdio: "inherit" });
  execFileSync(process.execPath, [join(__dirname, "build-aep-data.mjs")], { stdio: "inherit" });
  execFileSync(process.execPath, [join(__dirname, "build-plan-data.mjs")], { stdio: "inherit" });
}

/* Every figure the pages quote comes from the data layer. When the data stops
   carrying a figure, the correct outcome is a failed build — not a plausible
   number baked into money copy that no test would ever flag. */
function requireFigure(value, token, hint) {
  if (value == null || value === "") {
    throw new Error(
      `Missing data for {{${token}}}. ${hint}\n` +
        `Refusing to build: pages quote this figure in copy about people's benefits.`
    );
  }
  return String(value);
}

/* ---- main -------------------------------------------------------------- */
function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  buildData();

  // Pull confirmed/projected COLA figures so pages stay in sync with the data.
  // A missing or unreadable data file is a build failure, not a fallback.
  let cola;
  try {
    cola = JSON.parse(read(join(SRC, "data", "cola.json")));
  } catch (err) {
    throw new Error(`Could not read src/data/cola.json — every COLA figure on the site comes from it. (${err.message})`);
  }
  let figures;
  try {
    figures = JSON.parse(read(join(SRC, "data", "medicare-figures.json")));
  } catch (err) {
    throw new Error(`Could not read src/data/medicare-figures.json — Part B and Part D figures come from it. (${err.message})`);
  }
  /* The enrolment season rolls on its own schedule too — see aep.csv. */
  let aep;
  try {
    aep = JSON.parse(read(join(SRC, "data", "aep.json")));
  } catch (err) {
    throw new Error(`Could not read src/data/aep.json — the Annual Enrollment Period dates come from it. (${err.message})`);
  }
  /* The plan tool compares its own pair of years, which roll on the CMS
     schedule — not with the COLA or the Part B figures. Borrowing any of those
     tokens for plan-year copy would read wrong for weeks at each roll point. */
  let planManifest;
  try {
    planManifest = JSON.parse(read(join(SRC, "data", "manifest.json")));
  } catch (err) {
    throw new Error(`Could not read src/data/manifest.json — the plan-comparison years come from it. (${err.message})`);
  }

  const longDate = (iso) => {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return y && m && d ? `${months[m - 1]} ${d}, ${y}` : String(iso || "");
  };
  const money = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const whole = (n) => Number(n).toLocaleString("en-US");

  const announce = requireFigure(
    cola.nextAnnouncementDate,
    "COLA_ANNOUNCE_DATE",
    "Set nextAnnouncementDate in scripts/build-cola-data.mjs for the current cycle."
  );

  /* "Data last refreshed" describes the DATA, so it is derived from the data's
     own provenance dates. Using the build date meant every unrelated CSS commit
     silently re-stamped the site as freshly verified. */
  const provenanceDates = [
    ...(cola.history || []).map((h) => h.announced).filter(Boolean),
    figures.sourceUpdated,
  ].filter(Boolean).sort();
  const dataUpdated = provenanceDates[provenanceDates.length - 1] || null;

  const colaTokens = {
    COLA_CONFIRMED: requireFigure(cola.confirmedCola, "COLA_CONFIRMED", "No official COLA in src/data/cola-history.csv."),
    COLA_CONFIRMED_YEAR: requireFigure(cola.confirmedYear, "COLA_CONFIRMED_YEAR", "No official COLA row in src/data/cola-history.csv."),
    COLA_PROJECTED: requireFigure(
      cola.projectedCola,
      "COLA_PROJECTED",
      "No row with status=projected in src/data/cola-history.csv. After an official COLA is announced, add the next year's projection row — do not leave pages quoting the previous estimate."
    ),
    COLA_PROJECTED_YEAR: requireFigure(cola.projectedYear, "COLA_PROJECTED_YEAR", "No row with status=projected in src/data/cola-history.csv."),
    COLA_PROJECTED_SOURCE: requireFigure(cola.projectedSource, "COLA_PROJECTED_SOURCE", "The projected row in src/data/cola-history.csv needs a source."),
    COLA_ANNOUNCE_DATE: announce,
    COLA_ANNOUNCE_DATE_LONG: longDate(announce),
    COLA_CONFIRMED_ANNOUNCED: requireFigure(cola.confirmedAnnounced, "COLA_CONFIRMED_ANNOUNCED", "The latest official row in src/data/cola-history.csv needs an `announced` date."),
    COLA_CONFIRMED_ANNOUNCED_LONG: longDate(requireFigure(cola.confirmedAnnounced, "COLA_CONFIRMED_ANNOUNCED_LONG", "The latest official row in src/data/cola-history.csv needs an `announced` date.")),
    DATA_UPDATED: longDate(requireFigure(dataUpdated, "DATA_UPDATED", "No provenance dates found in the COLA history or Medicare figures.")),

    // Statutory Medicare figures — indexed annually, so never inline them in markup.
    PART_B_PREMIUM: money(requireFigure(figures.partBPremium, "PART_B_PREMIUM", "Add the current year's part_b_premium to src/data/medicare-figures.csv.")),
    PART_B_DEDUCTIBLE: whole(requireFigure(figures.partBDeductible, "PART_B_DEDUCTIBLE", "Add the current year's part_b_deductible to src/data/medicare-figures.csv.")),
    PART_D_OOP_CAP: whole(requireFigure(figures.partDOopCap, "PART_D_OOP_CAP", "Add the current year's part_d_oop_cap to src/data/medicare-figures.csv.")),
    MEDICARE_FIGURES_YEAR: requireFigure(figures.currentYear, "MEDICARE_FIGURES_YEAR", "src/data/medicare-figures.csv has no official row."),

    // Plan-comparison years, straight from the plan data the tool actually loads.
    PLAN_YEAR_CURRENT: requireFigure(planManifest.currentYear, "PLAN_YEAR_CURRENT", "src/data/manifest.json has no currentYear — check scripts/build-plan-data.mjs."),
    PLAN_YEAR_NEXT: requireFigure(planManifest.nextYear, "PLAN_YEAR_NEXT", "src/data/manifest.json has no nextYear — check scripts/build-plan-data.mjs."),

    /* Enrolment season. The window dates are quoted in body copy and in FAQ
       structured data, so every phrasing the pages need is derived in
       build-aep-data.mjs rather than restated by hand on either side. */
    AEP_SEASON_YEAR: requireFigure(aep.seasonYear, "AEP_SEASON_YEAR", "No row with status=current in src/data/aep.csv."),
    AEP_COVERAGE_YEAR: requireFigure(aep.coverageYear, "AEP_COVERAGE_YEAR", "No row with status=current in src/data/aep.csv."),
    AEP_WINDOW_START: requireFigure(aep.windowStartLabel, "AEP_WINDOW_START", "The current row in src/data/aep.csv needs a window_start."),
    AEP_WINDOW_END: requireFigure(aep.windowEndLabel, "AEP_WINDOW_END", "The current row in src/data/aep.csv needs a window_end."),
    AEP_WINDOW_END_LONG: requireFigure(aep.windowEndLong, "AEP_WINDOW_END_LONG", "The current row in src/data/aep.csv needs a window_end."),
    AEP_WINDOW_RANGE: requireFigure(aep.windowRange, "AEP_WINDOW_RANGE", "The current row in src/data/aep.csv needs window_start and window_end."),
    AEP_WINDOW_RANGE_LONG: requireFigure(aep.windowRangeLong, "AEP_WINDOW_RANGE_LONG", "The current row in src/data/aep.csv needs window_start and window_end."),
    AEP_COVERAGE_START: requireFigure(aep.coverageStartLabel, "AEP_COVERAGE_START", "The current row in src/data/aep.csv needs an ma_oep_start."),
    AEP_COVERAGE_START_LONG: requireFigure(aep.coverageStartLong, "AEP_COVERAGE_START_LONG", "The current row in src/data/aep.csv needs an ma_oep_start."),
    AEP_MA_OEP_RANGE_LONG: requireFigure(aep.maOepRangeLong, "AEP_MA_OEP_RANGE_LONG", "The current row in src/data/aep.csv needs ma_oep_start and ma_oep_end."),
  };

  // Site-level tokens that front matter may also reference (titles, descriptions).
  const SITE_TOKENS = {
    SITE_URL: SITE.url,
    SITE_NAME: SITE.name,
    BUILD_YEAR: String(SITE.buildYear),
    BUILD_DATE: SITE.buildDate,
  };

  // Build-time inline-SVG charts (golden-fact data; no client JS, SEO-friendly).
  const chartTokens = {
    CHART_COLA_HISTORY: cola.history
      ? colaHistoryChart(cola.history, cola.confirmedYear, cola.projectedYear)
      : "",
    CHART_PLANS_MAPD: planCountChart({
      ariaWhat: "Average Medicare Advantage prescription-drug (MA-PD) plans available to a typical beneficiary",
      caption: "Average MA-PD plans available to a typical beneficiary.",
      fromYear: 2025, fromValue: 34, toYear: 2026, toValue: 32, unitLabel: "Plans",
    }),
    CHART_PLANS_PDP: planCountChart({
      ariaWhat: "Stand-alone Medicare Part D prescription drug plans offered nationwide",
      caption: "Stand-alone Part D plans offered nationwide.",
      fromYear: 2025, fromValue: 474, toYear: 2026, toValue: 367, unitLabel: "Plans",
    }),
  };

  const layout = read(join(SRC, "layout.html"));
  const pagesDir = join(SRC, "pages");
  const pageFiles = readdirSync(pagesDir).filter((f) => f.endsWith(".html"));

  const built = [];
  for (const file of pageFiles) {
    const raw = read(join(pagesDir, file));
    const { meta, body } = parseFrontMatter(raw);
    const slug = meta.slug !== undefined ? meta.slug : basename(file, ".html");
    const url = cleanUrl(slug);
    const canonical = SITE.url + (url === "/" ? "/" : url);

    const scripts = (meta.scripts || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<script type="module" src="/assets/js/${s}"></script>`)
      .join("\n    ");

    /* Front-matter values are substituted INTO the token map, so they are never
       themselves scanned by applyTokens. Resolve them first, otherwise a title
       or description can only ever hardcode a year that the body tokenises. */
    const pageDates = {
      PAGE_PUBLISHED: firstCommitDate(join(pagesDir, file)) || SITE.buildDate,
      PAGE_MODIFIED: lastCommitDate(join(pagesDir, file)) || SITE.buildDate,
    };
    const fm = (value, fallback) =>
      applyTokens(String(value ?? fallback), { ...colaTokens, ...SITE_TOKENS, ...pageDates, CANONICAL: canonical });

    const tokens = {
      // TITLE lands in <title> and in several quoted attributes (og:title,
      // twitter:title, JSON-LD), so it needs the same escaping as DESCRIPTION.
      TITLE: fm(meta.title, SITE.name).replace(/"/g, "&quot;"),
      DESCRIPTION: fm(meta.description, SITE.tagline).replace(/"/g, "&quot;"),
      CANONICAL: canonical,
      SITE_URL: SITE.url,
      SITE_NAME: SITE.name,
      OG_TYPE: meta.ogtype || "website",
      OG_IMAGE: `${SITE.url}/assets/img/og-default.png`,
      BUILD_DATE: SITE.buildDate,
      BUILD_YEAR: String(SITE.buildYear),
      PAGE_SCRIPTS: scripts,
      // Resolved like title/description — head: carries article:* meta that
      // needs the same tokens the body uses.
      HEAD_EXTRA: fm(meta.head, ""),
      ...pageDates,
      ROBOTS: meta.robots || "index, follow, max-image-preview:large",
      CONTENT: body.trim(),
      ...colaTokens,
      ...chartTokens,
    };

    let html = layout.replace("{{CONTENT}}", () => tokens.CONTENT);
    html = resolveIncludes(html);
    html = applyTokens(html, tokens);

    /* A token that never got substituted ships as literal "{{FOO}}" in front of
       a reader. Treat it as a build failure rather than a proofreading problem. */
    const orphans = [...new Set((html.match(/\{\{\s*[A-Z0-9_]+\s*\}\}|\{\{>\s*[a-z0-9\-_]+\s*\}\}/gi) || []))];
    if (orphans.length) {
      throw new Error(`${file}: unresolved template token(s) in output: ${orphans.join(", ")}`);
    }

    // Active nav state.
    if (meta.nav) {
      html = html.replace(
        new RegExp(`(data-nav="${meta.nav}")`),
        `$1 aria-current="page"`
      );
    }

    const dest = outPath(slug);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, html);
    built.push({ slug, url, file, priority: meta.priority, changefreq: meta.changefreq, robots: meta.robots, lastmod: lastCommitDate(join(pagesDir, file)) });
    console.log(`  → ${url}  (${basename(dest)})`);
  }

  // Assets & data. og-default.svg is the *source* the OG PNG is rendered from;
  // shipping it too just serves ~1.7 KB nobody requests.
  cpSync(join(SRC, "assets"), join(DIST, "assets"), {
    recursive: true,
    filter: (src) => basename(src) !== "og-default.svg",
  });
  if (existsSync(join(SRC, "data"))) {
    mkdirSync(join(DIST, "data"), { recursive: true });
    for (const f of readdirSync(join(SRC, "data"))) {
      if (f.endsWith(".json")) cpSync(join(SRC, "data", f), join(DIST, "data", f));
    }
  }

  // Static root passthrough (favicon, _headers, _redirects, robots, manifest…)
  const staticDir = join(SRC, "static");
  if (existsSync(staticDir)) {
    for (const f of readdirSync(staticDir)) {
      cpSync(join(staticDir, f), join(DIST, f), { recursive: true });
    }
  }

  // sitemap.xml
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    built
      .filter((p) => !/noindex/i.test(p.robots || ""))
      .map((p) => {
        const loc = SITE.url + (p.url === "/" ? "/" : p.url);
        const pr = p.priority || (p.url === "/" ? "1.0" : "0.8");
        const cf = p.changefreq || "weekly";
        const lastmod = p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : "";
        return `  <url><loc>${loc}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority>${lastmod}</url>`;
      })
      .join("\n") +
    `\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), sitemap);

  // robots.txt — generated from SITE_URL so it can never drift from the domain.
  writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

  console.log(`\n✓ Built ${built.length} pages to dist/  (site: ${SITE.url})`);
}

build();
