/* serve.mjs — tiny static server for local preview of dist/ (zero deps).
   Resolves clean URLs (/foo -> foo.html) the way Cloudflare Pages does. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = process.env.PORT ? Number(process.env.PORT) : 4321;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

async function tryFiles(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [];
  if (clean.endsWith("/")) candidates.push(join(DIST, clean, "index.html"));
  else {
    candidates.push(join(DIST, clean));
    if (!extname(clean)) {
      candidates.push(join(DIST, clean + ".html"));
      candidates.push(join(DIST, clean, "index.html"));
    }
  }
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch { /* next */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let file = await tryFiles(url.pathname === "/" ? "/index.html" : url.pathname);
  let status = 200;
  if (!file) {
    file = join(DIST, "404.html");
    status = 404;
  }
  try {
    const body = await readFile(file);
    res.writeHead(status, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(500).end("500");
  }
});

server.listen(PORT, () => console.log(`BenefitClock preview → http://localhost:${PORT}`));
