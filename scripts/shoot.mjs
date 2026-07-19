/* shoot.mjs — self-contained screenshotter: starts the preview server, captures
   a set of shots (light/dark/mobile), then tears everything down. Dev tooling. */
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 4333;
const BASE = `http://localhost:${PORT}`;
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOT = process.env.SHOT_DIR || "/tmp/claude-0/-home-user-BenefitClock/6620c0dd-7aa4-597e-8c09-e135e4cf3918/scratchpad";

const SHOTS = [
  { route: "/", file: "enh-home.jpg", w: 1200, h: 1400, full: true },
  { route: "/", file: "enh-home-dark.jpg", w: 1200, h: 1400, full: true, dark: true },
  { route: "/", file: "enh-home-mobile.jpg", w: 390, h: 900, full: false, dsf: 2 },
  { route: "/cola-calculator", file: "enh-cola.jpg", w: 1160, h: 1400, full: true },
  { route: "/cola-calculator", file: "enh-cola-dark.jpg", w: 1160, h: 1400, full: true, dark: true },
  { route: "/medicare-plan-changes", file: "enh-medicare.jpg", w: 1160, h: 1400, full: true },
];

const srv = spawn(process.execPath, [join(ROOT, "scripts", "serve.mjs")], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore",
});

async function waitReady(tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + "/");
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("server never came up");
}

const allErrors = [];
try {
  await waitReady();
  const browser = await chromium.launch({
    executablePath: EXEC, headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  for (const s of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: s.dsf || 1,
      colorScheme: s.dark ? "dark" : "light",
      reducedMotion: s.motion ? "no-preference" : "reduce",
    });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await page.goto(BASE + s.route, { waitUntil: "networkidle" });
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(SHOT, s.file), fullPage: s.full, type: "jpeg", quality: 72 });
    if (errs.length) allErrors.push(`${s.route} (${s.dark ? "dark" : "light"}): ${errs.join(" | ")}`);
    await page.close();
    console.log(`shot ${s.file}`);
  }
  await browser.close();
} catch (e) {
  console.error("SHOOT ERROR:", e.message);
} finally {
  srv.kill("SIGKILL");
}
console.log(allErrors.length ? "CONSOLE ERRORS:\n" + allErrors.join("\n") : "no console errors");
process.exit(0);
