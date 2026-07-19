/* verify-browser.mjs — drives the two interactive tools in a real browser and
   captures screenshots. Requires a running preview server (npm run serve) and
   playwright-core with the pre-installed Chromium. Not part of the shipped app. */
import { chromium } from "playwright-core";

const BASE = process.env.BASE || "http://localhost:4321";
const EXEC = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOT = process.env.SHOT_DIR || "/tmp/claude-0/-home-user-BenefitClock/6620c0dd-7aa4-597e-8c09-e135e4cf3918/scratchpad";

const results = [];
const fail = (m) => { results.push(["FAIL", m]); };
const pass = (m) => { results.push(["ok", m]); };

const browser = await chromium.launch({
  executablePath: EXEC,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

async function newPage(name) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.__errors = errors;
  return page;
}

/* ---- 1. COLA calculator ------------------------------------------------ */
try {
  const page = await newPage("cola");
  await page.goto(`${BASE}/cola-calculator`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.getElementById("r-new-gross")?.textContent?.includes("$"));
  const gross = (await page.textContent("#r-new-gross"))?.trim();
  const netInc = (await page.textContent("#r-net-increase"))?.trim();
  if (gross === "$2,072") pass(`COLA default gross = ${gross}`); else fail(`COLA default gross expected $2,072, got ${gross}`);
  if (netInc === "+$72.00") pass(`COLA net increase = ${netInc}`); else fail(`COLA net increase expected +$72.00, got ${netInc}`);

  // Change benefit to 3000 and re-check.
  await page.fill("#f-benefit", "3000");
  await page.waitForFunction(() => document.getElementById("r-new-gross")?.textContent === "$3,108");
  const gross2 = (await page.textContent("#r-new-gross"))?.trim();
  if (gross2 === "$3,108") pass(`COLA recompute (3000 @3.6%) = ${gross2}`); else fail(`COLA recompute expected $3,108, got ${gross2}`);

  // Switch to confirmed 2.8% preset.
  await page.selectOption("#f-cola-preset", { label: "2026 confirmed COLA — 2.8%" });
  await page.waitForFunction(() => document.getElementById("r-cola-echo")?.textContent === "2.8%");
  pass("COLA preset switch to 2.8% works");

  await page.screenshot({ path: `${SHOT}/shot-cola.png`, fullPage: true });
  if (page.__errors.length) fail(`COLA page console errors: ${page.__errors.join(" | ")}`); else pass("COLA page: no console errors");
  await page.close();
} catch (e) {
  fail(`COLA test threw: ${e.message}`);
}

/* ---- 2. Medicare plan-changes diff ------------------------------------- */
try {
  const page = await newPage("plan");
  await page.goto(`${BASE}/medicare-plan-changes`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelectorAll("#f-state option").length > 1);
  pass("Plan tool: state dropdown populated");

  await page.selectOption("#f-state", "FL");
  await page.waitForFunction(() => !document.getElementById("f-county").disabled && document.querySelectorAll("#f-county option").length > 1);
  await page.selectOption("#f-county", { index: 1 });
  await page.waitForFunction(() => !document.getElementById("f-plan").disabled && document.querySelectorAll("#f-plan option").length > 1);
  await page.selectOption("#f-plan", { index: 1 });
  await page.waitForSelector("#plandiff-results:not([hidden])", { timeout: 5000 });
  const rows = await page.$$eval("#pd-tbody tr", (trs) => trs.length);
  if (rows >= 1) pass(`Plan diff rendered ${rows} comparison rows`); else fail("Plan diff produced no rows");
  const headline = (await page.textContent("#pd-headline"))?.trim();
  pass(`Plan diff headline: "${headline}"`);
  const status = (await page.textContent("#pd-status"))?.trim();
  pass(`Plan diff status badge: "${status}"`);

  // Test the direct plan-ID shortcut with a known-good ID from the selected option.
  await page.screenshot({ path: `${SHOT}/shot-plan.png`, fullPage: true });
  if (page.__errors.length) fail(`Plan page console errors: ${page.__errors.join(" | ")}`); else pass("Plan page: no console errors");
  await page.close();
} catch (e) {
  fail(`Plan test threw: ${e.message}`);
}

/* ---- 3. Home page smoke + mobile screenshot ---------------------------- */
try {
  const page = await newPage("home");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const h1 = (await page.textContent("h1"))?.trim();
  pass(`Home h1: "${h1}"`);
  await page.screenshot({ path: `${SHOT}/shot-home.png`, fullPage: true });
  // mobile
  const m = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await m.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await m.screenshot({ path: `${SHOT}/shot-home-mobile.png`, fullPage: true });
  await m.close();
  if (page.__errors.length) fail(`Home console errors: ${page.__errors.join(" | ")}`); else pass("Home page: no console errors");
  await page.close();
} catch (e) {
  fail(`Home test threw: ${e.message}`);
}

await browser.close();

console.log("\n===== BROWSER VERIFICATION =====");
for (const [s, m] of results) console.log(`${s === "ok" ? "  ✓" : "  ✗ FAIL"} ${m}`);
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
