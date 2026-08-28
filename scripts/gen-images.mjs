/* gen-images.mjs — renders the SVG brand assets to the PNGs required by social
   crawlers (og:image) and iOS (apple-touch-icon). Dev tooling; run when the
   brand SVGs change, then commit the PNGs. Requires playwright-core + the
   pre-installed Chromium. */
import { chromium } from "playwright-core";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* `transparent: true` omits the white page backdrop, which matters for the
   rounded-corner favicon: baked-in white corners are visible against any dark
   launcher. The maskable icon is deliberately NOT transparent — it is
   full-bleed by design, and its own rect paints every pixel.

   Chrome's installability check does not accept an SVG alone: it requires a
   PNG of at least 192px. That is why icon-192/icon-512 exist at all. */
const JOBS = [
  { svg: "src/assets/img/og-default.svg", png: "src/assets/img/og-default.png", w: 1200, h: 630 },
  { svg: "src/static/favicon.svg", png: "src/static/apple-touch-icon.png", w: 180, h: 180 },
  { svg: "src/static/favicon.svg", png: "src/static/icons/icon-192.png", w: 192, h: 192, transparent: true },
  { svg: "src/static/favicon.svg", png: "src/static/icons/icon-512.png", w: 512, h: 512, transparent: true },
  { svg: "src/static/icon-maskable.svg", png: "src/static/icons/icon-maskable-512.png", w: 512, h: 512 },
];

const browser = await chromium.launch({
  executablePath: EXEC, headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

for (const j of JOBS) {
  const svg = readFileSync(join(ROOT, j.svg), "utf8");
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><head><style>*{margin:0;padding:0}html,body{width:${j.w}px;height:${j.h}px;overflow:hidden;background:transparent}svg{width:${j.w}px;height:${j.h}px;display:block}</style></head><body>${svg}</body></html>`,
    { waitUntil: "networkidle" }
  );
  mkdirSync(dirname(join(ROOT, j.png)), { recursive: true });
  await page.screenshot({ path: join(ROOT, j.png), type: "png", omitBackground: !!j.transparent });
  await page.close();
  console.log(`rendered ${j.png} (${j.w}x${j.h})${j.transparent ? " [transparent]" : ""}`);
}
await browser.close();
