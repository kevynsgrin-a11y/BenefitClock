/* gen-images.mjs — renders the SVG brand assets to the PNGs required by social
   crawlers (og:image) and iOS (apple-touch-icon). Dev tooling; run when the
   brand SVGs change, then commit the PNGs. Requires playwright-core + the
   pre-installed Chromium. */
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const JOBS = [
  { svg: "src/assets/img/og-default.svg", png: "src/assets/img/og-default.png", w: 1200, h: 630 },
  { svg: "src/static/favicon.svg", png: "src/static/apple-touch-icon.png", w: 180, h: 180 },
];

const browser = await chromium.launch({
  executablePath: EXEC, headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

for (const j of JOBS) {
  const svg = readFileSync(join(ROOT, j.svg), "utf8");
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><head><style>*{margin:0;padding:0}html,body{width:${j.w}px;height:${j.h}px;overflow:hidden}svg{width:${j.w}px;height:${j.h}px;display:block}</style></head><body>${svg}</body></html>`,
    { waitUntil: "networkidle" }
  );
  await page.screenshot({ path: join(ROOT, j.png), type: "png" });
  await page.close();
  console.log(`rendered ${j.png} (${j.w}x${j.h})`);
}
await browser.close();
