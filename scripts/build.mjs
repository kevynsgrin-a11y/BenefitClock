/* ==========================================================================
   build.mjs — BenefitClock's tiny static-site generator (zero dependencies)

   - Assembles src/pages/*.html into full documents using src/layout.html
     and src/partials/*.html (token + include based).
   - Copies src/assets -> dist/assets and src/data/*.json -> dist/data.
   - Regenerates data JSON from CSV (via build-*-data.mjs) when needed.
   - Emits sitemap.xml, robots.txt passthrough, and Cloudflare Pages config.

   Page front-matter is an HTML comment at the very top of each page file:

     <!--
     title: Page title | BenefitClock
     description: Meta description (<=160 chars).
     slug: cola-calculator        # output path; "" or "index" => site root
     nav: cola                    # active nav id (home|cola|medicare|learn|about)
     scripts: cola.js             # comma-separated module scripts from /assets/js
     ogtype: website
     -->
   ========================================================================== */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

const SITE = {
  name: "BenefitClock",
  url: (process.env.SITE_URL || "https://benefitclock.org").replace(/\/$/, ""),
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
  console.log("• Building data (CPI-W + CMS plan JSON)…");
  execFileSync(process.execPath, [join(__dirname, "build-cola-data.mjs")], { stdio: "inherit" });
  execFileSync(process.execPath, [join(__dirname, "build-plan-data.mjs")], { stdio: "inherit" });
}

/* ---- main -------------------------------------------------------------- */
function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  buildData();

  // Pull confirmed/projected COLA figures so pages stay in sync with the data.
  let cola = {};
  try { cola = JSON.parse(read(join(SRC, "data", "cola.json"))); } catch { /* optional */ }
  const longDate = (iso) => {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return y && m && d ? `${months[m - 1]} ${d}, ${y}` : String(iso || "");
  };
  const announce = cola.nextAnnouncementDate || "2026-10-14";
  const colaTokens = {
    COLA_CONFIRMED: cola.confirmedCola != null ? String(cola.confirmedCola) : "2.8",
    COLA_CONFIRMED_YEAR: cola.confirmedYear != null ? String(cola.confirmedYear) : "2026",
    COLA_PROJECTED: cola.projectedCola != null ? String(cola.projectedCola) : "3.6",
    COLA_PROJECTED_YEAR: cola.projectedYear != null ? String(cola.projectedYear) : "2027",
    COLA_ANNOUNCE_DATE: announce,
    COLA_ANNOUNCE_DATE_LONG: longDate(announce),
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

    const tokens = {
      TITLE: meta.title || SITE.name,
      DESCRIPTION: (meta.description || SITE.tagline).replace(/"/g, "&quot;"),
      CANONICAL: canonical,
      SITE_URL: SITE.url,
      SITE_NAME: SITE.name,
      OG_TYPE: meta.ogtype || "website",
      OG_IMAGE: `${SITE.url}/assets/img/og-default.svg`,
      BUILD_DATE: SITE.buildDate,
      BUILD_YEAR: String(SITE.buildYear),
      PAGE_SCRIPTS: scripts,
      HEAD_EXTRA: meta.head || "",
      CONTENT: body.trim(),
      ...colaTokens,
    };

    let html = layout.replace("{{CONTENT}}", () => tokens.CONTENT);
    html = resolveIncludes(html);
    html = applyTokens(html, tokens);

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
    built.push({ slug, url, file, priority: meta.priority, changefreq: meta.changefreq });
    console.log(`  → ${url}  (${basename(dest)})`);
  }

  // Assets & data
  cpSync(join(SRC, "assets"), join(DIST, "assets"), { recursive: true });
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
      .map((p) => {
        const loc = SITE.url + (p.url === "/" ? "/" : p.url);
        const pr = p.priority || (p.url === "/" ? "1.0" : "0.8");
        const cf = p.changefreq || "weekly";
        return `  <url><loc>${loc}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority><lastmod>${SITE.buildDate}</lastmod></url>`;
      })
      .join("\n") +
    `\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), sitemap);

  console.log(`\n✓ Built ${built.length} pages to dist/  (site: ${SITE.url})`);
}

build();
