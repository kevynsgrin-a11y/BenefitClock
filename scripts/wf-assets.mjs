export const meta = {
  name: 'benefitclock-visual-assets',
  description: 'Build isolated visual assets (icon sprite, hero illustration, provenance, motion JS) to exact contracts',
  phases: [{ title: 'Build assets' }],
};

const RULES = `
You are building ONE self-contained asset file for BenefitClock (an independent, ad-supported,
senior-first Medicare/Social Security utility). It is a STATIC, ZERO-DEPENDENCY site. Hard rules:
- Plain HTML/CSS/vanilla-JS and inline SVG only. No frameworks, no external anything.
- COLOR TOKENS ALREADY EXIST in src/assets/css/site.css — never hard-code hex. Use CSS variables:
  --bc-teal-900/800/700/600/500, --bc-teal-050, --bc-amber-500, --bc-amber-600, --bc-gold (#f5c451),
  --bc-ill-line, --bc-ill-fill, --bc-ill-fill-2, --bc-ill-accent, --bc-ill-gold, --bc-ill-paper,
  --bc-ink, --bc-surface. All of these already flip correctly in dark mode. For SVG, prefer
  stroke="currentColor" / fill via var(--bc-ill-*) so the art is theme-aware automatically.
- Accessibility (audience is 65+, WCAG 2.1 AA): decorative SVG gets aria-hidden="true" focusable="false"
  and NO <title>; a meaningful illustration gets role="img" + a descriptive aria-label. Never bake the
  page's real headline/body copy into SVG. Honor prefers-reduced-motion for any motion.
- Budgets: each inline-SVG partial <= 4KB; any JS file <= 2KB; keep it lean.
Write EXACTLY the file path given, with ONLY the specified contents (no <html>/<head>/<body> wrappers
for partials). Do not touch any other file. Return one line confirming what you wrote.
`;

const ASSETS = [
  {
    file: 'src/partials/icons.html',
    label: 'icon-sprite',
    task: `Build a hidden inline-SVG SYMBOL SPRITE to be included once per page. Structure:
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <symbol id="ic-clock" viewBox="0 0 24 24">…</symbol>
  … (all symbols) …
</defs></svg>
Every symbol: viewBox="0 0 24 24", fill="none", stroke="currentColor", stroke-width="2",
stroke-linecap="round", stroke-linejoin="round", no hard-coded colors, no shadows, clean 24px line-icon
geometry that reads clearly at ~28-48px. Provide these 8 symbols (ids EXACT):
  ic-clock            → a clock face with two hands (reuse a circle + two hands; the brand mark).
  ic-magnifier-diff   → a magnifying glass over two short stacked bars (a "compare/what-changed" idea).
  ic-coins-up         → a small stack of coins with an up arrow (a raise / more money).
  ic-phone-off        → a phone handset with a slash through it (no phone calls).
  ic-shield-lock      → a shield with a small keyhole/lock (privacy).
  ic-doc-gov          → a document/page with a small classical-column or check mark (public government data — do NOT draw any real seal or eagle).
  ic-calendar-check   → a calendar with a checkmark (key dates).
  ic-arrow-right      → a simple right arrow (CTA).
Keep total file under 4KB. Return confirmation.`,
  },
  {
    file: 'src/partials/hero-art.html',
    label: 'hero-art',
    task: `Build the HERO FOCAL ILLUSTRATION — the marquee "pop" graphic — as ONE inline SVG. Requirements:
- Root: <svg class="hero__art-svg" viewBox="0 0 480 380" role="img" aria-label="Example: a Social Security payment slip and a Medicare plan card shown side by side, with a clock" preserveAspectRatio="xMidYMid meet"> … </svg>
- It sits on the dark teal hero, so use LIGHT/duotone fills that read on dark: paper elements fill var(--bc-ill-paper) with stroke var(--bc-ill-line); accents in var(--bc-ill-gold) (#f5c451) and var(--bc-ill-accent). Add soft rounded corners and a subtle drop feel via layering (no filters needed).
- SCENE (a stylized, clearly-illustrative "example", NOT a real document):
  1) A "Social Security payment" slip: a rounded paper rectangle with a teal header band, a couple of
     light placeholder text lines (thin rounded rects), and one emphasized amount line with a GOLD
     underline; near it a small gold pill reading "+2.7% · +$61/mo" (tiny text is OK inside the art).
  2) Overlapping it, a generic "Medicare plan" CARD (deliberately generic — teal + gold, an abstract
     5-point star medallion, a few placeholder lines; a small "Plan" chip). ABSOLUTELY NO red/white/blue
     facsimile, NO federal seal, NO eagle — it must read as a neutral illustration.
  3) A clock motif echoing the brand: a ring with a GOLD minute hand, small, tucked in a corner.
  4) A tiny "Example" tag/badge in a corner so it is honest.
- Keep it balanced and premium; under 4KB. All internal text is illustrative (described by the aria-label).
Return confirmation.`,
  },
  {
    file: 'src/partials/provenance-band.html',
    label: 'provenance',
    task: `Build TWO provenance partials (write BOTH files):

FILE 1 — src/partials/provenance-band.html (the FULL band, used on the home page):
<aside class="provenance" aria-label="Where our data comes from">
  <div class="provenance__chips">
    <span class="provenance__chip"><span class="provenance__mono" aria-hidden="true">SSA</span> Social Security Administration</span>
    <span class="provenance__chip"><span class="provenance__mono" aria-hidden="true">BLS</span> Bureau of Labor Statistics</span>
    <span class="provenance__chip"><span class="provenance__mono" aria-hidden="true">CMS</span> Centers for Medicare &amp; Medicaid Services</span>
  </div>
  <p class="provenance__note">Every figure on BenefitClock comes from public U.S. government files — no proprietary data, no guesswork. Data last refreshed {{DATA_UPDATED}}.</p>
</aside>
(Use exactly those class names; keep the {{DATA_UPDATED}} token literally — the build fills it in.)

FILE 2 — src/partials/provenance-strip.html (the COMPACT strip, used under each tool):
<p class="datasource">
  <span class="badge badge--info">Source: CMS Landscape &amp; Crosswalk files</span>
  <span class="badge badge--neutral">SSA · BLS CPI-W</span>
  <span class="datasource__fresh"><svg class="icon" aria-hidden="true" focusable="false"><use href="#ic-clock"/></svg> Figures verified {{DATA_UPDATED}}</span>
</p>
Return one line confirming both files.`,
  },
  {
    file: 'src/assets/js/enhance.js',
    label: 'enhance-js',
    task: `Write src/assets/js/enhance.js — one small vanilla IIFE (<=2KB, no deps, no inline eval) providing THREE
progressive-enhancement features. It loads with defer. Critical: it must NEVER hide content for JS-off,
reduced-motion, or no-IntersectionObserver users, and must not touch the live COLA/plan result tiles.

1) SCROLL REVEAL: const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches. If reduce OR no
   'IntersectionObserver' in window → do nothing. Otherwise select [data-reveal] elements; for each that is
   NOT already in the initial viewport (getBoundingClientRect().top > innerHeight*0.9), add class
   'reveal--armed' (CSS will set it to opacity:0/translateY). Observe with IntersectionObserver
   (threshold 0.15, rootMargin '0px 0px -8%'); on intersect add 'is-visible' and unobserve. Never arm
   above-the-fold elements (avoids a flash).
2) COUNT-UP: for each [data-countup] element, read the final integer from its data-countup attribute (a
   number; may include a prefix/suffix via data-prefix/data-suffix). If reduce OR no IntersectionObserver,
   leave the element's existing textContent (which already shows the final value) untouched. Otherwise set
   textContent to the start (prefix+0+suffix), observe; on first intersect animate from 0 to final over
   ~900ms with requestAnimationFrame, and ALWAYS finish by setting textContent to the exact final
   (prefix + final + suffix). Do not wire aria-live here.
3) TEXT-SIZE CONTROL: read saved value from localStorage 'bc-textsize' ('','l','xl') and set it on
   document.documentElement.dataset.textsize on load. Delegate clicks: buttons matching
   [data-textsize-set] set dataset.textsize to their value, persist to localStorage, and update
   aria-pressed on all [data-textsize-set] buttons (pressed = matching current). Guard all localStorage
   access in try/catch.
Wrap it as (function(){ ... })(); and run after DOMContentLoaded if needed. Return confirmation.`,
  },
];

phase('Build assets');

const results = await parallel(
  ASSETS.map((a) => () =>
    agent(`${RULES}\n\n════════ YOUR ASSET ════════\nWrite: ${a.file}\n\n${a.task}`,
      { label: `asset:${a.label}`, phase: 'Build assets', agentType: 'general-purpose', effort: 'high' })
      .then((o) => ({ file: a.file, ok: true, out: String(o || '').slice(0, 160) }))
      .catch((e) => ({ file: a.file, ok: false, out: String(e && e.message || e).slice(0, 160) }))
  )
);

log(`Built ${results.filter((r) => r && r.ok).length}/${ASSETS.length} asset files`);
return results;
