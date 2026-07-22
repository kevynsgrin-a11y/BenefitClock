/* audit-full.mjs — comprehensive dependency-free front-end audit. Self-contained:
   starts the preview server, drives headless Chromium, tears down. Dev tooling only
   (not shipped). Checks beyond the existing verify-*.mjs scripts:
     - real WCAG contrast-ratio math (no axe-core) for text/background pairs
     - exactly one <h1>, landmark presence, canonical/meta/OG/JSON-LD sanity
     - keyboard-only tab traversal + focus-visible outline presence
     - tap-target sizing (>=44x44 for non-inline interactive controls)
     - 200% zoom reflow (no horizontal scroll)
     - sitemap.xml / robots.txt cross-consistency
     - compliance + content-accuracy string presence
   Prints a findings ledger; exits non-zero if any FAIL. */
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 4361;
const BASE = `http://localhost:${PORT}`;
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOT = process.env.SHOT_DIR || "/tmp/claude-0/-home-user-BenefitClock/6620c0dd-7aa4-597e-8c09-e135e4cf3918/scratchpad/audit";

const ROUTES = [
  "/", "/cola-calculator", "/medicare-plan-changes", "/key-dates", "/guides",
  "/guides/2027-social-security-cola", "/guides/medicare-aep-2026",
  "/guides/what-changed-medicare-2027", "/guides/part-b-premium-and-your-cola",
  "/about", "/how-it-works", "/privacy",
];

const findings = [];
function flag(route, dim, severity, summary, detail) {
  findings.push({ route, dim, severity, summary, detail });
}

const srv = spawn(process.execPath, [join(ROOT, "scripts", "serve.mjs")], {
  env: { ...process.env, PORT: String(PORT) }, stdio: "ignore",
});
async function ready(n = 40) {
  for (let i = 0; i < n; i++) { try { if ((await fetch(BASE + "/")).ok) return; } catch {} await new Promise((r) => setTimeout(r, 150)); }
  throw new Error("server never came up");
}

/* Injected into the page: real relative-luminance contrast ratio, WCAG formula. */
function contrastRatioFn() {
  function luminance(rgb) {
    const [r, g, b] = rgb.map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function parseColor(str) {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
  }
  function effectiveBg(el) {
    // Returns null (instead of defaulting to white) if a gradient/image
    // background sits between the text and the nearest solid color — we
    // cannot compute a real ratio against a multi-color surface without
    // pixel sampling, and defaulting to white produced false "invisible
    // text" reports for light text deliberately placed on dark gradients.
    let node = el;
    while (node) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
      const bg = parseColor(cs.backgroundColor);
      if (bg && bg.a > 0.01) return bg.rgb;
      node = node.parentElement;
    }
    return [255, 255, 255];
  }
  window.__contrastAudit = function () {
    const out = [];
    const all = document.querySelectorAll("body *");
    for (const el of all) {
      if (!(el.offsetWidth || el.offsetHeight)) continue;
      const text = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!text) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const fg = parseColor(cs.color);
      if (!fg) continue;
      const bgRgb = effectiveBg(el);
      if (!bgRgb) continue; // gradient/image background — can't assess, don't guess
      const L1 = luminance(fg.rgb), L2 = luminance(bgRgb);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = px >= 24 || (px >= 18.67 && bold);
      const minAA = large ? 3 : 4.5;
      if (ratio < minAA) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: el.className && typeof el.className === "string" ? el.className.slice(0, 40) : "",
          text: (el.textContent || "").trim().slice(0, 40),
          ratio: Math.round(ratio * 100) / 100,
          need: minAA,
          fg: cs.color, bg: `rgb(${bgRgb.join(",")})`,
        });
      }
    }
    return out;
  };
}

const out = [];
try {
  await ready();
  const browser = await chromium.launch({
    executablePath: EXEC, headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  /* ---- Per-route structural + metadata + contrast + zoom checks -------- */
  for (const route of ROUTES) {
    for (const scheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, colorScheme: scheme });
      await page.addInitScript(contrastRatioFn);
      const consoleErrs = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text()); });
      page.on("pageerror", (e) => consoleErrs.push(String(e)));
      const resp = await page.goto(BASE + route, { waitUntil: "networkidle" });
      const status = resp ? resp.status() : 0;
      if (status !== 200) flag(route, "A", "blocker", `HTTP ${status} loading page`, `scheme=${scheme}`);

      if (scheme === "light") {
        // Structural checks (theme-independent) — only run once.
        const h1Count = await page.$$eval("h1", (els) => els.length);
        if (h1Count !== 1) flag(route, "G", "major", `Expected exactly one <h1>, found ${h1Count}`, "");
        const canonical = await page.$eval('link[rel="canonical"]', (el) => el.href).catch(() => null);
        if (!canonical || !canonical.startsWith("https://benefitdial.com")) flag(route, "G", "major", `Canonical missing or wrong domain: ${canonical}`, "");
        const metaDesc = await page.$eval('meta[name="description"]', (el) => el.content).catch(() => "");
        if (!metaDesc) flag(route, "G", "major", "Missing meta description", "");
        else if (metaDesc.length > 160) flag(route, "G", "minor", `Meta description ${metaDesc.length} chars (>160)`, metaDesc);
        else if (metaDesc.length < 50) flag(route, "G", "minor", `Meta description ${metaDesc.length} chars (<50, thin)`, metaDesc);
        const title = await page.title();
        if (!title || title.length > 65) flag(route, "G", "minor", `Title missing or long (${title.length} chars)`, title);
        const ogImage = await page.$eval('meta[property="og:image"]', (el) => el.content).catch(() => null);
        if (ogImage) {
          // og:image is intentionally an absolute production URL (crawlers
          // require that); fetching it here would hit the real internet from
          // a sandboxed box, which is a test-environment problem, not a site
          // bug. Check the local build output serves the same path instead.
          const localPath = new URL(ogImage).pathname;
          const r = await page.request.get(BASE + localPath).catch(() => null);
          if (!r || r.status() !== 200) flag(route, "G", "major", `og:image path does not exist in the build (${localPath})`, `status=${r ? r.status() : "err"}`);
        } else flag(route, "G", "minor", "Missing og:image", "");
        // JSON-LD validity
        const ldBlocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent));
        for (const block of ldBlocks) {
          try { JSON.parse(block); } catch (e) { flag(route, "G", "major", "Invalid JSON-LD block", String(e.message)); }
        }
        // Landmarks
        const hasMain = await page.$("main");
        if (!hasMain) flag(route, "B", "major", "No <main> landmark", "");
        // Tap target sizing (non-inline interactive controls)
        const smallTargets = await page.$$eval("a, button, input, select, summary", (els) =>
          els.filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return false;
            const cs = getComputedStyle(el);
            if (cs.display === "inline" && el.tagName === "A") return false; // inline text links exempt (WCAG 2.5.8)
            return r.width < 44 || r.height < 44;
          }).map((el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className ? "." + String(el.className).split(" ")[0] : ""}`)
        );
        if (smallTargets.length) flag(route, "B", "minor", `${smallTargets.length} interactive control(s) under 44x44px`, smallTargets.slice(0, 8).join(", "));

        // WCAG 1.4.10 Reflow: content must not require horizontal scrolling
        // at a 320px CSS-px viewport (the real SC 1.4.10 test — equivalent to
        // 400% zoom on a 1280px design). Note: the CSS `zoom` property is NOT
        // an equivalent test; it scales rendering without changing
        // window.innerWidth the way real browser/OS zoom does, and produced
        // a 100%-of-pages false-positive rate in an earlier run of this script.
        const prevSize = page.viewportSize();
        await page.setViewportSize({ width: 320, height: prevSize.height });
        await page.waitForTimeout(100);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
        if (overflow) flag(route, "C", "major", "Horizontal overflow at 320px viewport (WCAG 1.4.10 reflow)", "");
        await page.setViewportSize(prevSize);

        // Keyboard traversal + focus-visible outline
        await page.keyboard.press("Tab");
        let tabbable = 0, noOutline = 0;
        for (let i = 0; i < 15; i++) {
          const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const cs = getComputedStyle(el);
            const hasRing = cs.outlineStyle !== "none" && cs.outlineWidth !== "0px";
            const hasShadowRing = cs.boxShadow && cs.boxShadow !== "none";
            return { tag: el.tagName, hasRing: hasRing || hasShadowRing };
          });
          if (!info) break;
          tabbable++;
          if (!info.hasRing) noOutline++;
          await page.keyboard.press("Tab");
        }
        if (tabbable > 0 && noOutline > 0) flag(route, "B", "major", `${noOutline}/${tabbable} tabbed elements have no visible focus indicator`, "");
      }

      // Contrast audit (theme-specific)
      const contrastFails = await page.evaluate(() => window.__contrastAudit());
      if (contrastFails.length) {
        const worst = contrastFails.sort((a, b) => a.ratio - b.ratio).slice(0, 5);
        flag(route, "B", "major", `${contrastFails.length} element(s) under WCAG AA contrast in ${scheme} mode`,
          worst.map((w) => `${w.tag}"${w.text}" ${w.ratio}:1 (need ${w.need}:1) fg=${w.fg} bg=${w.bg}`).join(" || "));
      }

      if (consoleErrs.length) flag(route, "D", "blocker", `Console errors (${scheme})`, consoleErrs.join(" | "));
      await page.close();
    }
  }

  /* ---- Mobile viewport horizontal-scroll spot check --------------------- */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (overflow) flag(route, "C", "major", "Horizontal overflow at 390px mobile width", "");
    }
    await page.close();
  }

  /* ---- Reduced-motion scroll-reveal spot check --------------------------- */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const stuck = await page.$$eval("[data-reveal]", (els) => els.filter((el) => getComputedStyle(el).opacity === "0").length);
    if (stuck > 0) flag("/", "B", "blocker", `${stuck} [data-reveal] element(s) stuck invisible under reduced-motion`, "");
    await page.close();
  }

  /* ---- 404 page: correct status, noindex, not in sitemap --------------- */
  {
    const page = await browser.newPage();
    const resp = await page.goto(BASE + "/this-route-does-not-exist", { waitUntil: "networkidle" });
    if (!resp || resp.status() !== 404) flag("/404", "A", "major", `404 route returned ${resp ? resp.status() : "no response"}`, "");
    const robotsMeta = await page.$eval('meta[name="robots"]', (el) => el.content).catch(() => "");
    if (!/noindex/i.test(robotsMeta)) flag("/404", "G", "major", `404 page missing noindex (got "${robotsMeta}")`, "");
    await page.close();
  }

  /* ---- Sitemap / robots.txt consistency --------------------------------- */
  {
    const sm = await (await fetch(BASE + "/sitemap.xml")).text();
    const robots = await (await fetch(BASE + "/robots.txt")).text();
    if (!/Sitemap:\s*https:\/\/benefitdial\.com\/sitemap\.xml/.test(robots)) flag("/robots.txt", "G", "major", "robots.txt does not reference sitemap.xml correctly", robots.slice(0, 200));
    if (/\/404/.test(sm)) flag("/sitemap.xml", "G", "major", "404 page present in sitemap.xml (should be excluded)", "");
    const urlCount = (sm.match(/<url>/g) || []).length;
    if (urlCount < 12) flag("/sitemap.xml", "G", "minor", `sitemap.xml has only ${urlCount} <url> entries`, "");
  }

  /* ---- Compliance + content-accuracy string presence -------------------- */
  {
    const page = await browser.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const bodyText = (await page.textContent("body")) || "";
    const mustHave = [
      [/not connected with or endorsed by/i, "independence disclaimer on home"],
      [/1-800-MEDICARE|1\.800\.MEDICARE/i, "1-800-MEDICARE reference on home"],
    ];
    for (const [re, label] of mustHave) if (!re.test(bodyText)) flag("/", "H", "blocker", `Missing required compliance text: ${label}`, "");

    await page.goto(BASE + "/cola-calculator", { waitUntil: "networkidle" });
    const colaText = (await page.textContent("body")) || "";
    if (!/2\.8%/.test(colaText)) flag("/cola-calculator", "F", "major", "Confirmed 2026 COLA figure (2.8%) not found on page", "");
    if (/3\.6%/.test(colaText) && !/(estimate|projected|projection)/i.test(colaText)) flag("/cola-calculator", "F", "major", "3.6% figure present without an estimate/projection label nearby", "");

    await page.goto(BASE + "/key-dates", { waitUntil: "networkidle" });
    const kdText = (await page.textContent("body")) || "";
    if (!/October 15/.test(kdText) || !/December 7/.test(kdText)) flag("/key-dates", "F", "major", "AEP window (Oct 15 – Dec 7) not found verbatim on key-dates", "");
    await page.close();
  }

  await browser.close();
} catch (e) {
  flag("GLOBAL", "-", "blocker", `Audit script threw: ${e.message}`, e.stack || "");
} finally {
  srv.kill("SIGKILL");
}

console.log("\n===== FULL AUDIT LEDGER =====");
const order = { blocker: 0, major: 1, minor: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);
for (const f of findings) {
  console.log(`\n[${f.severity.toUpperCase()}] ${f.route}  (dim ${f.dim})`);
  console.log(`  ${f.summary}`);
  if (f.detail) console.log(`  detail: ${f.detail}`);
}
const blockers = findings.filter((f) => f.severity === "blocker").length;
const majors = findings.filter((f) => f.severity === "major").length;
const minors = findings.filter((f) => f.severity === "minor").length;
console.log(`\n${findings.length} finding(s): ${blockers} blocker, ${majors} major, ${minors} minor`);
process.exit(findings.length ? 1 : 0);
