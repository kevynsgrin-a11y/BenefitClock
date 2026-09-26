// GA4 bootstrap. A same-origin file rather than an inline <script> because the
// CSP in src/static/_headers has no 'unsafe-inline' in script-src, so the
// browser refuses an inline gtag('config') call. The gtag.js loader itself is
// in src/layout.html.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-FQNWJB3T8W");
