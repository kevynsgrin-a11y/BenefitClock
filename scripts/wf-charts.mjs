export const meta = {
  name: 'benefitdial-charts-propagate',
  description: 'Insert the new inline-SVG charts into the guide + methodology pages',
  phases: [{ title: 'Insert charts' }],
};

const SHARED = `
BenefitDial now has a dependency-free inline-SVG chart system. The build replaces these tokens
with fully-styled, accessible <figure class="bc-chart">…</figure> charts at build time:
  {{CHART_COLA_HISTORY}}  → a bar chart of the annual Social Security COLA (2023 8.7%, 2024 3.2%,
                            2025 2.5%, 2026 2.8%, 2027 3.6% [estimate]).
  {{CHART_PLANS_MAPD}}    → a 2-bar chart: average MA-PD plans 34 (2025) → 32 (2026).
  {{CHART_PLANS_PDP}}     → a 2-bar chart: stand-alone Part D plans 474 (2025) → 367 (2026).

Your job: insert the RIGHT chart token(s) into ONE existing page, at the most natural spot, with a
short one-sentence lead-in, WITHOUT restructuring the page or duplicating content. Rules:
- READ the page first. Find the section that already discusses those numbers and place the chart
  right after the relevant paragraph (or replace a plain data table if one exists and the chart
  makes it redundant — but keep any surrounding prose).
- Write the token EXACTLY as shown (e.g. {{CHART_COLA_HISTORY}}) on its own line. Do NOT paste raw SVG.
- Match the page's existing voice and heading style. Keep it factual; label 2027 as an estimate.
- Do not touch front-matter, JSON-LD, or unrelated sections. Make the smallest sensible edit.
- Use the Edit tool. Return one line confirming what you inserted and where.
`;

const PAGES = [
  {
    file: 'src/pages/guide-cola.html',
    label: 'guide-cola',
    what: `Insert {{CHART_COLA_HISTORY}} into this "2027 COLA explained" article. Best placement: right after the "short history" section/table of recent COLAs (or after the paragraph that lists recent COLA percentages), with a lead-in like "Here is how recent COLAs compare:". If there is a plain history table that the chart now duplicates, you may keep the table OR replace it with the chart — your call for the cleaner result, but do not remove factual prose.`,
  },
  {
    file: 'src/pages/guide-medicare-changes.html',
    label: 'guide-changes',
    what: `Insert BOTH {{CHART_PLANS_MAPD}} and {{CHART_PLANS_PDP}} into the "fewer plans" section of this "What changed across Medicare for 2027" article. Place them where the 34→32 MA-PD and 474→367 PDP numbers are discussed. Wrap the two tokens in a two-column grid so they sit side by side:
<div class="grid grid--2">
  <div>{{CHART_PLANS_MAPD}}</div>
  <div>{{CHART_PLANS_PDP}}</div>
</div>
If a plain figure/table already shows those same counts, replace it with this chart grid; otherwise add the grid right after the paragraph that cites those numbers.`,
  },
  {
    file: 'src/pages/how-it-works.html',
    label: 'how-it-works',
    what: `Insert {{CHART_COLA_HISTORY}} into the methodology page, right after the worked-example table that derives the 2026 COLA (2.8%) from CPI-W, with a one-sentence lead-in such as "And here is how that 2.8% fits into recent history:". Keep the existing worked-example table.`,
  },
];

phase('Insert charts');

const results = await parallel(
  PAGES.map((p) => () =>
    agent(
      `${SHARED}\n\n════════ YOUR PAGE ════════\nEdit: ${p.file}\n\n${p.what}`,
      { label: `chart:${p.label}`, phase: 'Insert charts', agentType: 'general-purpose', effort: 'medium' }
    ).then((out) => ({ file: p.file, ok: true, out: String(out || '').slice(0, 160) }))
     .catch((e) => ({ file: p.file, ok: false, out: String(e && e.message || e).slice(0, 160) }))
  )
);

log(`Inserted charts into ${results.filter((r) => r && r.ok).length}/${PAGES.length} pages`);
return results;
