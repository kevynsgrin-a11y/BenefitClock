/* verify-full.mjs — self-contained: starts server, drives both tools + the new
   interactions (text-size, print, provenance), asserts, tears down. Dev tooling. */
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 4351;
const BASE = `http://localhost:${PORT}`;
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const out = [];
const ok = (m) => out.push(["ok", m]);
const bad = (m) => out.push(["FAIL", m]);

const srv = spawn(process.execPath, [join(ROOT, "scripts", "serve.mjs")], {
  env: { ...process.env, PORT: String(PORT) }, stdio: "ignore",
});
async function ready(n = 40) { for (let i = 0; i < n; i++) { try { if ((await fetch(BASE + "/")).ok) return; } catch {} await new Promise((r) => setTimeout(r, 150)); } throw new Error("server down"); }

const ROUTES = ["/", "/cola-calculator", "/medicare-plan-changes", "/key-dates", "/guides", "/about", "/how-it-works", "/privacy", "/guides/2027-social-security-cola", "/guides/what-changed-medicare-2027"];

try {
  await ready();
  const b = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });

  // Console-error sweep across pages (light + dark)
  for (const scheme of ["light", "dark"]) {
    for (const r of ROUTES) {
      const p = await b.newPage({ colorScheme: scheme });
      const errs = [];
      p.on("pageerror", (e) => errs.push(String(e)));
      p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
      await p.goto(BASE + r, { waitUntil: "networkidle" });
      await p.waitForTimeout(150);
      if (errs.length) bad(`console ${scheme} ${r}: ${errs.join(" | ")}`);
      await p.close();
    }
  }
  ok(`console-error sweep: ${ROUTES.length} routes × light+dark`);

  // COLA tool still computes + recomputes
  {
    const p = await b.newPage();
    await p.goto(BASE + "/cola-calculator", { waitUntil: "networkidle" });
    await p.waitForFunction(() => document.getElementById("r-new-gross")?.textContent?.includes("$"));
    const g = (await p.textContent("#r-new-gross")).trim();
    g === "$2,072" ? ok(`COLA default $2,072`) : bad(`COLA default expected $2,072 got ${g}`);
    const head = (await p.textContent("#r-headline")).trim();
    /You'll keep about/.test(head) ? ok(`COLA keep-first headline`) : bad(`COLA headline not keep-first: ${head}`);
    (await p.$("#cola-chart svg")) ? ok(`COLA flow chart present`) : bad(`COLA flow chart missing`);
    (await p.$("#r-print")) ? ok(`COLA print button present`) : bad(`COLA print button missing`);
    (await p.$(".datasource")) ? ok(`COLA provenance strip present`) : bad(`COLA provenance missing`);
    await p.fill("#f-benefit", "3000");
    await p.waitForFunction(() => document.getElementById("r-new-gross")?.textContent === "$3,108");
    ok(`COLA recompute $3,108`);
    await p.close();
  }

  // Plan diff still renders
  {
    const p = await b.newPage();
    await p.goto(BASE + "/medicare-plan-changes", { waitUntil: "networkidle" });
    await p.waitForFunction(() => document.querySelectorAll("#f-state option").length > 1);
    await p.selectOption("#f-state", "FL");
    await p.waitForFunction(() => !document.getElementById("f-county").disabled && document.querySelectorAll("#f-county option").length > 1);
    await p.selectOption("#f-county", { index: 1 });
    await p.waitForFunction(() => !document.getElementById("f-plan").disabled && document.querySelectorAll("#f-plan option").length > 1);
    await p.selectOption("#f-plan", { index: 1 });
    await p.waitForSelector("#plandiff-results:not([hidden])");
    const rows = await p.$$eval("#pd-tbody tr", (t) => t.length);
    rows >= 1 ? ok(`plan diff ${rows} rows`) : bad(`plan diff no rows`);
    (await p.$("#pd-print")) ? ok(`plan print button present`) : bad(`plan print missing`);
    await p.close();
  }

  // Text-size control scales the rem base and persists
  {
    const p = await b.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const base0 = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bc-fs-base").trim());
    await p.click('[data-textsize-set="xl"]');
    await p.waitForTimeout(50);
    const baseXL = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bc-fs-base").trim());
    const ds = await p.evaluate(() => document.documentElement.dataset.textsize);
    const pressed = await p.getAttribute('[data-textsize-set="xl"]', "aria-pressed");
    (baseXL !== base0 && ds === "xl" && pressed === "true") ? ok(`text-size XL scales (${base0} → ${baseXL}), aria-pressed set`) : bad(`text-size failed base0=${base0} xl=${baseXL} ds=${ds} pressed=${pressed}`);
    // persist across reload
    await p.reload({ waitUntil: "networkidle" });
    const dsAfter = await p.evaluate(() => document.documentElement.dataset.textsize);
    dsAfter === "xl" ? ok(`text-size persists across reload`) : bad(`text-size did not persist: ${dsAfter}`);
    await p.close();
  }

  await b.close();
} catch (e) {
  bad(`threw: ${e.message}`);
} finally {
  srv.kill("SIGKILL");
}

console.log("\n===== FULL VERIFICATION =====");
for (const [s, m] of out) console.log(`${s === "ok" ? "  ✓" : "  ✗ FAIL"} ${m}`);
const fails = out.filter((r) => r[0] === "FAIL").length;
console.log(`\n${out.length - fails}/${out.length} checks passed`);
process.exit(fails ? 1 : 0);
