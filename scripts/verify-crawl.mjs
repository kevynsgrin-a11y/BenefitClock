/* verify-crawl.mjs — visit every route, assert no console/page errors, screenshot a few. */
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://localhost:4321";
const EXEC = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SHOT = "/tmp/claude-0/-home-user-BenefitClock/6620c0dd-7aa4-597e-8c09-e135e4cf3918/scratchpad";

const ROUTES = [
  "/", "/cola-calculator", "/medicare-plan-changes", "/key-dates", "/guides",
  "/guides/2027-social-security-cola", "/guides/medicare-aep-2026",
  "/guides/what-changed-medicare-2027", "/guides/part-b-premium-and-your-cola",
  "/about", "/how-it-works", "/privacy", "/404",
];
const SHOTS = { "/guides": "shot-guides.png", "/key-dates": "shot-key-dates.png", "/guides/2027-social-security-cola": "shot-guide-cola.png", "/about": "shot-about.png" };

const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] });
let failures = 0;
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("requestfailed", (r) => { const u = r.url(); if (!u.includes("favicon")) errs.push(`reqfail ${u} ${r.failure()?.errorText}`); });
  const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  const status = resp ? resp.status() : 0;
  const title = await page.title();
  const h1 = (await page.textContent("h1").catch(() => "")) || "";
  const ok = errs.length === 0 && (status === 200 || route === "/404");
  if (!ok) failures++;
  console.log(`${ok ? "  ✓" : "  ✗"} ${route}  [${status}]  "${title.slice(0, 40)}"  h1="${h1.trim().slice(0, 36)}"${errs.length ? "  ERR: " + errs.join(" | ") : ""}`);
  if (SHOTS[route]) await page.screenshot({ path: `${SHOT}/${SHOTS[route]}`, fullPage: true });
  await page.close();
}
await browser.close();
console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routes clean`);
process.exit(failures ? 1 : 0);
