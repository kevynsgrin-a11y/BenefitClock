export const meta = {
  name: 'benefitdial-design-studio',
  description: 'A design studio of specialist agents that produce a coherent, buildable visual-elevation spec',
  phases: [
    { title: 'Research & critique', detail: 'researcher, designer, architect, a11y, brand — in parallel' },
    { title: 'Synthesis', detail: 'creative director merges everything into one prioritized spec' },
  ],
};

const CONTEXT = `
PROJECT: "BenefitDial" — an independent, ad-supported PUBLIC UTILITY for U.S. seniors (65+) for the
fall Medicare + Social Security season. Two working tools (a COLA calculator and a Medicare "What
Changed" plan diff) plus guide/info pages. Brand promise: the calm, HONEST opposite of aggressive
Medicare TV ads and lead-gen funnels — "no phone number, we never sell your data, free & ad-supported."

CURRENT STATE (read these to see exactly what exists before proposing anything):
  • src/pages/index.html (home), src/pages/cola-calculator.html, src/pages/medicare-plan-changes.html
  • src/assets/css/site.css  (the ENTIRE design system — teal/amber palette, cards, buttons, timeline, charts)
  • src/partials/header.html, footer.html, independence-disclaimer.html
  • src/assets/js/*  (progressive-enhancement only)
It already has: a teal (#0b3b3f–#146066) + amber (#d97706/#f5c451) palette, a senior-first design system
(19px base, high contrast, big targets, light+dark themes), a sticky header + trust bar, cards, a timeline,
labeled ad slots, an independence disclaimer, and NEW hand-crafted inline-SVG charts (COLA history bars,
plan-count bars, and a live "where your raise goes" bar chart in the COLA tool).

HARD CONSTRAINTS (any proposal that violates these is out of scope — respect them):
  1. It is a STATIC site with ZERO runtime/npm dependencies. No React, no chart libs, no CSS frameworks,
     no third-party script. Enhancements must be plain HTML/CSS/vanilla-JS and inline SVG.
  2. Self-hosted assets are allowed (e.g., a self-hosted woff2 font, SVG illustrations) but keep it light
     and fast; no external CDNs/fonts (a strict Content-Security-Policy blocks off-origin).
  3. Senior-first + WCAG 2.1 AA is non-negotiable: large type, high contrast in BOTH light and dark,
     big tap targets, visible focus, honor prefers-reduced-motion, no motion that harms readability.
  4. Do NOT undermine the brand: no fake urgency, no stock-cliché "confused senior" imagery, no sales
     pressure, no dark patterns, no PII capture.
Real licensed photography can't be committed to this repo — favor CUSTOM SVG illustration, refined
gradients/patterns, iconography, depth, and motion for "pop." (A separate v0/photo track exists elsewhere.)

Your output is CONSUMED BY OTHER AGENTS AND A BUILD, so return concrete, specific, buildable items —
not vague adjectives. Where you can, name exact files, classes, and before/after specifics.
`;

const LIST = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          rationale: { type: 'string' },
          files: { type: 'string' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string', enum: ['low', 'medium', 'high'] },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['title', 'detail', 'impact', 'effort'],
      },
    },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'items'],
};

phase('Research & critique');

const [research, design, architecture, a11y, brand] = await parallel([
  () => agent(
    `${CONTEXT}\n\nROLE: MARKET RESEARCHER. Use web search + fetch to study 6–8 genuinely well-designed, high-trust websites in adjacent categories: senior-focused finance/insurance, Medicare/health decision tools, consumer-finance utilities (e.g. NerdWallet, GoodRx, Credit Karma), and government-adjacent info sites (Medicare.gov, SSA.gov). Identify the CONCRETE visual + UX patterns the best ones share that build trust and drive action — hero structure, imagery style, trust signals/social proof, CTA design, whitespace & rhythm, typography, use of color, motion, data presentation, and mobile behavior. Then translate them into specific, prioritized recommendations that FIT BenefitDial's no-sales, senior-first, ad-supported model (and its zero-dependency constraint). Put each recommendation in items[] (with impact/effort/risk); list the sites you studied in sources[].`,
    { label: 'role:market-researcher', phase: 'Research & critique', schema: LIST, agentType: 'general-purpose', effort: 'high' }
  ).catch(() => null),

  () => agent(
    `${CONTEXT}\n\nROLE: ART DIRECTOR / VISUAL DESIGNER. Read the current pages + CSS, then propose the highest-impact VISUAL ADDITIONS that would make the site "pop" while staying coherent and on-brand: e.g. a richer hero (layered gradient/mesh + a custom SVG focal illustration of "your check + your Medicare card, side by side"), a cohesive spot-illustration/duotone-icon system, refined type scale & rhythm, elevated cards/depth, a trust/"built on public government data" band, section dividers, tasteful scroll-reveal + number count-up micro-interactions, and dark-mode richness. For each, specify exactly what to add/change, the files, and the before→after. Rank by impact in items[].`,
    { label: 'role:designer', phase: 'Research & critique', schema: LIST, agentType: 'general-purpose', effort: 'high' }
  ).catch(() => null),

  () => agent(
    `${CONTEXT}\n\nROLE: FRONT-END ARCHITECT. Define HOW to implement visual enhancements within the zero-dependency static build (scripts/build.mjs partial/token system) without regressions. Decide: font strategy (self-host one variable display font as woff2 with font-display:swap, or refine the system stack — recommend one, with the CSP/font-src implication); illustration/asset strategy (inline SVG in partials vs /assets/img SVG files); a motion strategy (a single small IntersectionObserver-based reveal utility + count-up, gated by prefers-reduced-motion, progressive-enhancement only); a performance/size budget; how to keep everything in the design-token system; and where new code should live (new partials, a new CSS section, one small JS file). Give guardrails + concrete implementation guidance in items[].`,
    { label: 'role:architect', phase: 'Research & critique', schema: LIST, agentType: 'general-purpose', effort: 'high' }
  ).catch(() => null),

  () => agent(
    `${CONTEXT}\n\nROLE: ACCESSIBILITY SPECIALIST (senior-first). For the kinds of "pop" additions being proposed (animation, new hero, illustrations, a possible new font, richer color/gradients), enumerate the concrete WCAG 2.1 AA guardrails and failure modes to prevent: contrast in light AND dark for any new colors/gradients/overlaid text; prefers-reduced-motion for all motion; count-up must not hide the final value from AT; decorative SVG must be aria-hidden and non-decorative SVG must have accessible names; focus states preserved; text remains selectable/zoomable to 200%; large tap targets. Give must-haves and things to reject in items[].`,
    { label: 'role:a11y', phase: 'Research & critique', schema: LIST, agentType: 'general-purpose', effort: 'medium' }
  ).catch(() => null),

  () => agent(
    `${CONTEXT}\n\nROLE: BRAND & ILLUSTRATION SPECIALIST. Design a cohesive, buildable SVG illustration + iconography SYSTEM that fits the clock/teal/amber brand: a hero focal illustration concept ("your Social Security check + your Medicare card, side by side, with a clock motif"), a set of 4–6 duotone spot illustrations for the key sections/tools, section dividers/background patterns (subtle topographic or arc/line motifs in teal), and consistent icon stroke/sizing rules. Describe each as something an implementer can hand-build in inline SVG (shapes, palette tokens, proportions), not as a photo brief. Put concrete, buildable specs in items[].`,
    { label: 'role:brand', phase: 'Research & critique', schema: LIST, agentType: 'general-purpose', effort: 'high' }
  ).catch(() => null),
]);

phase('Synthesis');

const SPEC = {
  type: 'object', additionalProperties: false,
  properties: {
    northStar: { type: 'string' },
    tokens: { type: 'string' },
    enhancements: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          priority: { type: 'integer' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string', enum: ['low', 'medium', 'high'] },
          files: { type: 'string' },
          spec: { type: 'string' },
          acceptance: { type: 'string' },
        },
        required: ['id', 'title', 'priority', 'impact', 'effort', 'spec', 'acceptance'],
      },
    },
    doNot: { type: 'array', items: { type: 'string' } },
    sequencing: { type: 'string' },
  },
  required: ['northStar', 'enhancements', 'doNot'],
};

const pack = (name, r) => `\n===== ${name} =====\n${r ? JSON.stringify(r, null, 2) : '(no output)'}\n`;

const spec = await agent(
  `${CONTEXT}\n\nROLE: CREATIVE DIRECTOR / VISUAL COORDINATOR. Below are five specialist reports (market research, design, architecture, accessibility, brand). Reconcile them into ONE coherent, prioritized, BUILDABLE implementation spec that will make BenefitDial genuinely pop while honoring every hard constraint and the senior-first brand. Resolve conflicts, drop anything off-brand or infeasible, and MERGE overlaps. Output:
- northStar: one paragraph on the elevated visual direction.
- tokens: any new/changed design tokens (colors, gradients, type scale, spacing, shadows) as concrete CSS values that fit the existing palette.
- enhancements[]: a ranked list (priority 1 = build first). Each MUST be specific enough for an implementer to build with no further questions — name exact files/partials/classes and describe the markup + CSS + any JS. Include acceptance criteria (incl. light/dark contrast + reduced-motion where relevant). Keep it to the ~8–12 highest-impact items.
- doNot[]: explicit guardrails / rejected ideas.
- sequencing: the recommended build order and any handoffs.
${pack('MARKET RESEARCH', research)}${pack('DESIGN', design)}${pack('ARCHITECTURE', architecture)}${pack('ACCESSIBILITY', a11y)}${pack('BRAND & ILLUSTRATION', brand)}`,
  { label: 'role:creative-director', phase: 'Synthesis', schema: SPEC, agentType: 'general-purpose', effort: 'high' }
).catch((e) => ({ error: String(e && e.message || e) }));

log(`Design studio done — ${spec && spec.enhancements ? spec.enhancements.length : 0} enhancements specced`);
return { research, design, architecture, a11y, brand, spec };
