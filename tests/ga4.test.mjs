// GA4 has to execute under the CSP this site actually serves. An inline
// gtag('config') bootstrap is refused (script-src has no 'unsafe-inline'), and
// GA4 then records nothing without any visible error, so pin the wiring here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ID = "G-FQNWJB3T8W";
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const layout = read("src/layout.html");
const csp = read("src/static/_headers")
  .split("\n")
  .find((l) => /^\s*Content-Security-Policy:/.test(l))
  .replace(/^\s*Content-Security-Policy:\s*/, "");
const directive = (name) =>
  (csp.split(";").map((d) => d.trim().split(/\s+/)).find((d) => d[0] === name) || []).slice(1);

test("layout loads gtag.js exactly once, with the per-site ID", () => {
  const loaders = layout.match(/googletagmanager\.com\/gtag\/js\?id=[^"]+/g) || [];
  assert.deepEqual(loaders, [`googletagmanager.com/gtag/js?id=${ID}`]);
});

test("the bootstrap is the same-origin file, not an inline script", () => {
  assert.match(layout, /<script src="\/assets\/js\/ga4\.js"><\/script>/);
  assert.doesNotMatch(layout, /gtag\(/);
  assert.match(read("src/assets/js/ga4.js"), new RegExp(`gtag\\("config", "${ID}"\\)`));
});

test("the CSP admits GA4 and the Cloudflare beacon, and nothing broader", () => {
  const script = directive("script-src");
  for (const host of ["'self'", "https://www.googletagmanager.com", "https://static.cloudflareinsights.com"]) {
    assert.ok(script.includes(host), `script-src is missing ${host}`);
  }
  assert.ok(!script.includes("'unsafe-inline'") && !script.includes("'unsafe-eval'"));
  for (const host of ["'self'", "https://*.google-analytics.com", "https://*.analytics.google.com",
    "https://*.googletagmanager.com", "https://cloudflareinsights.com"]) {
    assert.ok(directive("connect-src").includes(host), `connect-src is missing ${host}`);
  }
  for (const host of ["https://*.google-analytics.com", "https://*.googletagmanager.com"]) {
    assert.ok(directive("img-src").includes(host), `img-src is missing ${host}`);
  }
  for (const d of ["script-src", "connect-src", "img-src"]) {
    assert.ok(!directive(d).some((s) => s === "*" || s === "https:"), `${d} has a blanket source`);
  }
});
