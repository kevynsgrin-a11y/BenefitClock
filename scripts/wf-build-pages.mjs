export const meta = {
  name: 'benefitdial-build-pages',
  description: 'Build every BenefitDial content page in parallel against the locked design system',
  phases: [{ title: 'Build pages', detail: 'one senior front-end agent per page' }],
};

const CONTRACT = `
You are a senior front-end engineer at a high-end web studio, building pages for BenefitDial —
an independent, ad-supported public-utility website that helps U.S. seniors (age 65+) during the
fall Medicare + Social Security season. The visual system, build pipeline, and two interactive
tool pages are ALREADY BUILT. Your job is to write ONE additional page's HTML so it is
indistinguishable in quality and voice from the pages already shipped.

════════ NON-NEGOTIABLE FIRST STEP ════════
Before writing anything, READ these files to match the exact conventions:
  • src/pages/index.html            (home — voice, section rhythm, front-matter format)
  • src/pages/cola-calculator.html  (tool page — cards, callouts, FAQ, JSON-LD)
  • src/pages/medicare-plan-changes.html (badges, tables, timeline usage)
  • src/assets/css/site.css          (the ONLY styling vocabulary you may use)
  • src/partials/footer.html         (the independence disclaimer already lives site-wide)
Match them. Do not invent a new visual style.

════════ OUTPUT FORMAT ════════
Write a COMPLETE file to the given path with the Write tool. The file must contain:
  1) An HTML comment front-matter block at the very top, EXACTLY this shape:
     <!--
     title: <60-65 char SEO title> | BenefitDial
     description: <150-160 char meta description>
     slug: <given slug>
     nav: <given nav id, or leave the value empty>
     ogtype: <website or article>
     priority: <0.6-0.9>
     changefreq: <monthly or weekly>
     -->
  2) The page BODY ONLY — a series of <section class="section">…</section> blocks.
     DO NOT include <!doctype>, <html>, <head>, <body>, the site header, the footer, or the
     nav — the build wraps your body in the shared layout automatically.
  3) Optionally, one or more <script type="application/ld+json"> blocks at the very end for SEO
     (Article, FAQPage, BreadcrumbList as appropriate). Valid JSON only.

════════ COMPONENT VOCABULARY (use ONLY these classes; no <style> tags, no new CSS) ════════
Layout:    <section class="section">, add "section--wash" (grey) or "section--teal" (dark hero) to alternate;
           inside every section put <div class="wrap"> (max width) and optionally class "prose" for reading width.
Type:      h1 (exactly ONE per page), h2, h3; <p class="lead"> for an intro paragraph;
           <p class="eyebrow"> for a small label above a heading; class "muted" for secondary text; "center" to center.
Grid:      <div class="grid grid--2"> or "grid--3" for equal columns.
Cards:     <div class="card"> … </div>; make a whole card a link with <a class="card--link" href>…</a>;
           optional <div class="card__icon" aria-hidden="true">EMOJI</div> then h3 + <p class="muted">.
Buttons:   <a class="btn btn--primary btn--lg"> (amber, main CTA), "btn--solid" (teal), "btn--ghost",
           and on a teal section use "btn--onteal".
Badges:    <span class="badge badge--good|--warn|--bad|--info|--neutral">…</span>.
Callouts:  <div class="callout callout--info|--warn"><p class="callout__title">Title</p><p>…</p></div>.
Tables:    <div class="table-scroll"><table class="data"><caption>…</caption><thead>…</thead><tbody>…</tbody></table></div>;
           add class "num" to numeric <th>/<td>.
Timeline:  <ul class="timeline"><li><span class="date">DATE</span> description</li>…</ul>.
FAQ:       <details class="faq"><summary>Question?</summary><div class="faq__body"><p>Answer.</p></div></details>.
Defn list: <dl class="dl-clean"><div><dt>Term</dt><dd>Value</dd></div>…</dl>.
Ads:       place the leaderboard between two sections with:  {{> ad-leaderboard }}
           place ONE in-article unit inside a prose section with:  {{> ad-inline }}

════════ BUILD TOKENS (write them literally; the build fills them in — never hardcode these numbers) ════════
  {{COLA_CONFIRMED}}=2.8   {{COLA_CONFIRMED_YEAR}}=2026
  {{COLA_PROJECTED}}=3.6   {{COLA_PROJECTED_YEAR}}=2027
  {{COLA_ANNOUNCE_DATE_LONG}}=October 14, 2026   {{BUILD_YEAR}}=current year
Use these tokens wherever those figures/dates appear so pages stay in sync with the data.
Data-driven year spans elsewhere may use <span data-year-current>2026</span> / <span data-year-next>2027</span>.

════════ GOLDEN FACTS (authoritative — never contradict; do not invent other statistics) ════════
• The 2026 Social Security COLA was exactly 2.8%, announced Oct 24, 2025 (delayed by the federal shutdown).
• The average retired-worker check rose from about $1,976 to about $2,032 with the 2026 COLA.
• The COLA formula uses CPI-W (Urban Wage Earners & Clerical Workers), NOT CPI-U. It is the % increase in the
  average CPI-W for Jul–Aug–Sep vs the same quarter of the last year a COLA took effect, rounded to 0.1%.
• Worked example that yields 2.8%: Q3-2024 CPI-W avg 308.729 → Q3-2025 avg 317.373.
• 2027 COLA is an EARLY ESTIMATE of 3.6% (The Senior Citizens League / AARP). Official figure: October 14, 2026.
• BLS releases September CPI-W and SSA announces the COLA on October 14, 2026, 8:30 a.m. ET.
• Medicare Annual Enrollment Period (AEP): October 15 – December 7 (every year).
• Medicare Advantage Open Enrollment Period (OEP): January 1 – March 31, 2027.
• CMS releases the Landscape + Crosswalk + PBP files in late September / early October each year.
• 2026: the average beneficiary has access to 32 MA-PD plans (down from 34 in 2025).
• Stand-alone Part D (PDP) plans dropped from 474 (2025) to 367 (2026) nationwide.
• Inflation Reduction Act: $2,000 annual out-of-pocket cap on Part D drug costs began in 2025; Manufacturer
  Discount Program changes finalized for 2027 (CY2027 Final Rule, published April 2026).
• Data sources are PUBLIC DOMAIN: CMS Landscape/Crosswalk/PUF/PBP files; BLS CPI-W (series CWUR0000SA0); SSA COLA.
• BenefitDial is NOT a broker/agent/TPMO: it takes NO carrier or broker commissions/CPA, captures NO personal
  info (no name/email/phone), sells NO leads or data, and is supported ONLY by programmatic display ads. It never
  recommends a specific plan for payment. This is the site's core identity — reinforce it, never undercut it.
  Always point users to the official Medicare Plan Finder (medicare.gov/plan-compare) or 1-800-MEDICARE to enroll.

════════ VOICE & ACCESSIBILITY ════════
• Audience is 65+. Write plainly, warmly, and concretely. Short sentences. No jargon without a plain gloss.
• No hype, no fear-mongering, no sales language, no fake urgency, no testimonials, no invented people or quotes.
• Honesty: label every future-year number as an estimate until its official announcement.
• Accessibility: exactly one h1; heading levels in order; descriptive link text (never "click here");
  emojis used decorate-only with aria-hidden; tables get a <caption>; sufficient contrast (use the classes as-is).
• Internal links you may use: / , /cola-calculator , /medicare-plan-changes , /key-dates , /guides ,
  /guides/2027-social-security-cola , /guides/medicare-aep-2026 , /guides/what-changed-medicare-2027 ,
  /guides/part-b-premium-and-your-cola , /about , /how-it-works , /privacy .
  External official links (add rel="nofollow noopener" target="_blank"): https://www.medicare.gov/plan-compare/ ,
  https://www.ssa.gov/cola/ , https://www.bls.gov/cpi/ , https://www.cms.gov/ .
• Substance: each content page should be genuinely useful and reasonably deep (roughly 700–1300 words of real
  content), end with a relevant call-to-action card or button to a tool, and include a short FAQ where it fits.

Return ONLY a one-line confirmation of what you wrote (the file itself is the deliverable).
`;

const PAGES = [
  {
    file: 'src/pages/about.html', slug: 'about', nav: 'about',
    label: 'about',
    brief: `PAGE: "About BenefitDial" (slug about, nav about, ogtype website).
Purpose: build trust and explain the independent, no-sales-calls stance in human terms.
Include, as flowing sections (not a wall of text):
 - A hero-ish opening (plain "section", NOT teal) with h1 "The benefits utility that doesn't want your phone number" (or similar) and a lead.
 - "Why we built this": the AEP season buries seniors in ads/robocalls/mail designed to capture a phone number; we wanted the opposite — the numbers, fast, no strings.
 - "How we're different from the brokers": a grid--2 or grid--3 of cards contrasting BenefitDial (independent, ad-supported, no PII, no commissions) vs typical lead-gen funnels (capture phone number → call center). Keep it factual, not mean.
 - "How we make money — plainly": we run standard display ads (like a newspaper). We accept NO commissions from insurers/brokers, sell NO leads, and take NO payment to recommend a plan. Explain this is deliberate: it keeps us independent AND keeps us out of the insurance sales chain.
 - "What we will never do": a short list (ask for your phone number/email; sell your data; push a specific plan for pay; pretend to be the government).
 - A callout pointing to /how-it-works (data) and /privacy (pledge).
 - Close with a CTA card row to /cola-calculator and /medicare-plan-changes.`,
  },
  {
    file: 'src/pages/how-it-works.html', slug: 'how-it-works', nav: '',
    label: 'how-it-works',
    brief: `PAGE: "How it works & where our data comes from" (slug how-it-works, nav empty, ogtype article).
Purpose: credibility/methodology. This is the page a skeptical reader checks.
Include:
 - h1 + lead explaining we only use public government files and show our math.
 - "The Social Security COLA, step by step": explain CPI-W, the Jul–Aug–Sep third-quarter average rule, rounding to 0.1%. Show the worked example as a small table (Q3-2024 avg 308.729 → Q3-2025 avg 317.373 → 2.8%). State the net-benefit formula: Net = (current benefit × (1 + COLA)) − Part B premium.
 - "Medicare plan data": explain the CMS Landscape file (baseline availability/premiums), the Crosswalk file (maps this year's plan IDs to next year's; flags renewal/consolidation/termination — this powers our diff), and the Public Use Files / PBP (benefits & drug tiers). Note all are public domain, released late Sep/early Oct.
 - A "data sources" TABLE (class data, with caption) with columns: Source | What it powers | Format & cadence | License. Rows for: CMS Landscape files; CMS Crosswalk files; CMS Part D formulary PUFs; CMS Plan Benefit Package (PBP); BLS CPI-W (CWUR0000SA0); SSA COLA announcement. Licenses = "Public domain".
 - An honest callout: until the official 2027 CMS files publish (late Sep/early Oct), the plan tool runs on a structurally identical SAMPLE dataset so people can see how it works; real files load the moment CMS posts them.
 - "How we keep it current": each October we ingest the new CMS files and the SSA COLA.
 - CTA to the two tools.`,
  },
  {
    file: 'src/pages/privacy.html', slug: 'privacy', nav: '',
    label: 'privacy',
    brief: `PAGE: "Privacy & our no-data-selling pledge" (slug privacy, nav empty, ogtype article).
Purpose: a real, readable privacy policy that matches the brand promise. Plain language, not legalese-heavy, but complete.
Include:
 - h1 + lead: the short version — we don't want your personal information, so we don't collect it.
 - "What we DON'T collect": no name, address, email, or PHONE NUMBER; no account/login; the COLA and plan calculators run entirely in your browser and the numbers you type are never sent to us.
 - "What is collected automatically": standard, aggregate web analytics and the fact that our display-ad provider (a third-party ad network such as Google AdSense/Mediavine/Raptive) may set cookies or use identifiers to show ads and measure them — describe this honestly and link out to how users can control ad personalization (e.g., https://www.aboutads.info/choices and Google Ads Settings) with rel="nofollow noopener" target="_blank".
 - "What we will never do": sell or share your personal data; generate or sell sales leads; hand your info to a call center or insurance broker.
 - "Cookies" short section; "Children" (site is for adults); "Your choices" (browser Do Not Track / ad settings); "Changes to this policy"; "Contact" (a generic privacy@ mailbox placeholder is fine).
 - A closing line reaffirming the independence stance and linking to /about and /how-it-works.
 - Keep a clear "Last updated: {{BUILD_YEAR}}" line near the top.`,
  },
  {
    file: 'src/pages/key-dates.html', slug: 'key-dates', nav: 'dates',
    label: 'key-dates',
    brief: `PAGE: "Key Medicare & Social Security dates for fall 2026 into 2027" (slug key-dates, nav dates, ogtype article).
Purpose: high-intent SEO + genuinely useful calendar. Use the timeline component prominently.
Include:
 - h1 + lead about the overlapping fall calendar (your raise and your plan land at once).
 - A big <ul class="timeline"> covering, in order: mid-July — AARP/TSCL early COLA projections begin; September — CMS releases Landscape + Crosswalk files & plans mail the Annual Notice of Change (ANOC); {{COLA_ANNOUNCE_DATE_LONG}} 8:30 a.m. ET — BLS September CPI-W release and SSA announces the official {{COLA_PROJECTED_YEAR}} COLA; October 15 – December 7, 2026 — Medicare AEP; late November — COLA notices appear in the my Social Security message center; December — mailed COLA notices; January 1, 2027 — new plan year & new benefit amounts begin; January 1 – March 31, 2027 — Medicare Advantage OEP.
 - A short "What you can change during AEP" section (switch between Original Medicare and Medicare Advantage; change MA plans; add/drop/switch Part D).
 - A callout distinguishing AEP (Oct 15–Dec 7, open to all) from the MA OEP (Jan 1–Mar 31, one change for people already in an MA plan).
 - Two CTA cards: /cola-calculator and /medicare-plan-changes.
 - A short FAQ (e.g., "When will I actually see the bigger check?", "What if I miss AEP?").`,
  },
  {
    file: 'src/pages/guides.html', slug: 'guides', nav: 'guides',
    label: 'guides-hub',
    brief: `PAGE: "Guides" hub (slug guides, nav guides, ogtype website).
Purpose: a clean index linking to the four guide articles, plus a short framing intro.
Include:
 - h1 "Plain-language guides" + a lead.
 - A grid--2 (or grid--3) of card--link tiles, one per guide, each with a card__icon emoji, h3 = the guide's title, and a one-sentence muted summary and a "Read the guide →" badge. Link to:
     /guides/2027-social-security-cola  (The 2027 Social Security COLA, explained)
     /guides/medicare-aep-2026          (Medicare Open Enrollment 2026: dates & how it works)
     /guides/what-changed-medicare-2027 (What changed across Medicare for 2027)
     /guides/part-b-premium-and-your-cola (How Medicare Part B eats into your COLA)
 - A closing CTA band linking to both tools.`,
  },
  {
    file: 'src/pages/guide-cola.html', slug: 'guides/2027-social-security-cola', nav: 'guides',
    label: 'guide-cola',
    brief: `PAGE: guide article "The {{COLA_PROJECTED_YEAR}} Social Security COLA, explained" (slug guides/2027-social-security-cola, nav guides, ogtype article).
Deep but readable explainer (~900-1200 words). Include:
 - h1 + lead; a BreadcrumbList JSON-LD (Home → Guides → this) and an Article JSON-LD at the end.
 - "What the COLA is and why it exists" (protects buying power against inflation).
 - "How it's calculated" — CPI-W, the Q3 (Jul–Aug–Sep) average rule, rounding to 0.1%; a worked example table showing 308.729 → 317.373 = 2.8% (the confirmed {{COLA_CONFIRMED_YEAR}} figure).
 - "A short history" table of recent COLAs: 2023 = 8.7%, 2024 = 3.2%, 2025 = 2.5%, {{COLA_CONFIRMED_YEAR}} = {{COLA_CONFIRMED}}%, and {{COLA_PROJECTED_YEAR}} = {{COLA_PROJECTED}}% (label the last as an ESTIMATE; official on {{COLA_ANNOUNCE_DATE_LONG}}).
 - "Why your raise feels smaller" — the Part B interaction (link to /guides/part-b-premium-and-your-cola).
 - An {{> ad-inline }} mid-article.
 - Strong CTA to /cola-calculator ("Estimate your own raise").
 - A short FAQ.`,
  },
  {
    file: 'src/pages/guide-aep.html', slug: 'guides/medicare-aep-2026', nav: 'guides',
    label: 'guide-aep',
    brief: `PAGE: guide article "Medicare Open Enrollment 2026: dates, deadlines & how it works" (slug guides/medicare-aep-2026, nav guides, ogtype article).
~900-1200 words. Include:
 - h1 + lead; BreadcrumbList + Article JSON-LD.
 - "What AEP is and when": October 15 – December 7, 2026; changes take effect January 1, 2027.
 - "What you can and can't do during AEP" (switch Original Medicare ↔ Medicare Advantage; change MA plan; change/add/drop Part D). Contrast with the MA OEP (Jan 1 – Mar 31, 2027, one change for current MA enrollees).
 - "How to prepare in 20 minutes": read your ANOC; list your drugs & pharmacies; check your doctors; then run the BenefitDial plan-changes tool and confirm on the official Medicare Plan Finder.
 - "Watch out for" — the flood of ads/robocalls; you never have to give a phone number to compare plans; the government never cold-calls you.
 - {{> ad-inline }} mid-article.
 - CTA to /medicare-plan-changes and /key-dates.
 - Short FAQ (e.g., "What if I do nothing?" → most plans auto-renew but terms may change; "Can I change my mind?").`,
  },
  {
    file: 'src/pages/guide-medicare-changes.html', slug: 'guides/what-changed-medicare-2027', nav: 'guides',
    label: 'guide-changes',
    brief: `PAGE: guide article "What changed across Medicare for {{COLA_PROJECTED_YEAR}}" (slug guides/what-changed-medicare-2027, nav guides, ogtype article).
~900-1200 words, macro overview (the big picture behind the personal diff tool). Include:
 - h1 + lead; BreadcrumbList + Article JSON-LD.
 - "Fewer plans on the menu": the average beneficiary has 32 MA-PD plans for 2026 (down from 34 in 2025); stand-alone PDPs fell from 474 (2025) to 367 (2026). Present these as a small table or figure row. Explain what plan contraction means for renewers.
 - "The $2,000 drug cap and Part D redesign": the Inflation Reduction Act's $2,000 annual out-of-pocket cap on Part D began in 2025; CY2027 Final Rule (published April 2026) finalized Manufacturer Discount Program changes for 2027. Explain in plain terms.
 - "Why premiums and benefits are shifting": cost pressures push plans to adjust premiums, formularies, and supplemental extras (dental/vision/hearing) — which is exactly why a year-over-year check matters.
 - "How to see YOUR changes": lead into the /medicare-plan-changes tool.
 - {{> ad-inline }} mid-article.
 - CTA to /medicare-plan-changes.
 - Short FAQ. Do NOT invent statistics beyond the golden facts.`,
  },
  {
    file: 'src/pages/guide-partb.html', slug: 'guides/part-b-premium-and-your-cola', nav: 'guides',
    label: 'guide-partb',
    brief: `PAGE: guide article "How Medicare Part B eats into your Social Security COLA" (slug guides/part-b-premium-and-your-cola, nav guides, ogtype article).
~800-1100 words. Include:
 - h1 + lead; BreadcrumbList + Article JSON-LD.
 - "Why the two are linked": Part B is usually withheld directly from the Social Security check, so a raise and a premium increase hit the same deposit.
 - "The math, plainly": Net = (benefit × (1 + COLA)) − Part B premium. A worked example using a $2,000 benefit and the {{COLA_PROJECTED}}% estimate, showing gross raise vs net-after-Part-B (use round, illustrative numbers and clearly call them estimates — do NOT assert an official 2026/2027 Part B dollar amount; say the standard premium is set by CMS each fall).
 - "The hold-harmless provision" in plain terms (for many people, the dollar rise in Part B can't exceed the dollar rise in their Social Security, so the net benefit doesn't drop).
 - A brief, plain note on IRMAA (higher earners pay more for Part B/D) — one short paragraph, no invented thresholds.
 - {{> ad-inline }} mid-article.
 - Strong CTA to /cola-calculator (it does this subtraction for you).
 - Short FAQ.`,
  },
  {
    file: 'src/pages/404.html', slug: '404', nav: '',
    label: '404',
    brief: `PAGE: friendly 404 (slug 404, nav empty, ogtype website).
Keep it short and warm. Include:
 - A centered section with h1 "We couldn't find that page" and a plain, reassuring lead.
 - A grid--2 of card--link tiles to /cola-calculator and /medicare-plan-changes, plus text links to / (home), /key-dates, and /guides.
 - Add <meta name="robots" content="noindex"> is NOT possible from body; instead just keep content minimal. (The build handles head.)
 - No ads on this page.`,
  },
];

phase('Build pages');

const results = await parallel(
  PAGES.map((p) => () =>
    agent(
      `${CONTRACT}\n\n════════ YOUR ASSIGNMENT ════════\nWrite the file: ${p.file}\nslug: ${p.slug}\nnav: ${p.nav || '(leave empty)'}\n\n${p.brief}\n\nRemember: READ the reference pages first, then Write ${p.file}. Body sections only — no <head>/<html>/<body>. Use the tokens and golden facts verbatim. Return one line confirming the file was written.`,
      { label: `page:${p.label}`, phase: 'Build pages', agentType: 'general-purpose', effort: 'high' }
    ).then((out) => ({ file: p.file, ok: true, out: String(out || '').slice(0, 200) }))
     .catch((e) => ({ file: p.file, ok: false, out: String(e && e.message || e).slice(0, 200) }))
  )
);

log(`Built ${results.filter((r) => r && r.ok).length}/${PAGES.length} pages`);
return results;
