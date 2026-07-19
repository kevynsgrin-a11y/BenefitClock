/* ==========================================================================
   svgcharts.mjs — tiny, dependency-free inline-SVG charts generated at build
   time. Accessible by construction: role="img" + aria-label on the <svg>, a
   visually-hidden data <table> for screen readers, and a visible <figcaption>.
   Styling comes from .bc-chart* classes in site.css (adapts to dark mode).
   ========================================================================== */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function niceMax(v) {
  if (v <= 5) return Math.ceil(v);
  if (v <= 10) return Math.ceil(v / 2) * 2;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / (mag / 2)) * (mag / 2);
}

/**
 * Vertical bar chart.
 * @param {object} o
 * @param {string} o.ariaLabel   Full sentence description for screen readers.
 * @param {string} o.caption     Visible caption under the chart.
 * @param {Array<{label:string,value:number,valueText:string,variant?:string,sub?:string}>} o.series
 * @param {number} [o.max]        Y-axis max (auto if omitted).
 * @param {number} [o.gridlines=4]
 * @param {string} [o.tableUnit=""] Header for the value column in the SR table.
 * @returns {string} HTML string (<figure>…</figure>)
 */
export function verticalBars(o) {
  const series = o.series;
  const n = series.length;
  const W = 720, H = 300;
  const padL = 16, padR = 16, padT = 42, padB = 58;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = o.max || niceMax(Math.max(...series.map((s) => s.value)));
  const y = (v) => padT + plotH - (v / maxVal) * plotH;

  const slot = plotW / n;
  const barW = Math.min(96, slot * 0.56);

  const grid = o.gridlines ?? 4;
  let gridlines = "";
  for (let i = 0; i <= grid; i++) {
    const gv = (maxVal / grid) * i;
    const gy = y(gv);
    gridlines += `<line class="bc-gridline" x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}"/>`;
  }

  let bars = "";
  series.forEach((s, i) => {
    const cx = padL + slot * i + slot / 2;
    const bx = cx - barW / 2;
    const by = y(s.value);
    const bh = padT + plotH - by;
    const variant = s.variant ? ` bc-bar--${s.variant}` : "";
    bars +=
      `<rect class="bc-bar${variant}" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0, bh).toFixed(1)}" rx="5"><title>${esc(s.label)}: ${esc(s.valueText)}</title></rect>` +
      `<text class="bc-bar-value" x="${cx.toFixed(1)}" y="${(by - 10).toFixed(1)}" text-anchor="middle">${esc(s.valueText)}</text>` +
      `<text class="bc-bar-label" x="${cx.toFixed(1)}" y="${(padT + plotH + 24).toFixed(1)}" text-anchor="middle">${esc(s.label)}</text>` +
      (s.sub ? `<text class="bc-bar-sub" x="${cx.toFixed(1)}" y="${(padT + plotH + 42).toFixed(1)}" text-anchor="middle">${esc(s.sub)}</text>` : "");
  });

  const baseline = `<line class="bc-axis" x1="${padL}" y1="${(padT + plotH).toFixed(1)}" x2="${W - padR}" y2="${(padT + plotH).toFixed(1)}"/>`;

  const rows = series.map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.valueText)}</td></tr>`).join("");
  const table = `<table class="visually-hidden"><caption>${esc(o.caption)}</caption><thead><tr><th scope="col">Item</th><th scope="col">${esc(o.tableUnit || "Value")}</th></tr></thead><tbody>${rows}</tbody></table>`;

  return (
    `<figure class="bc-chart">` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.ariaLabel)}" preserveAspectRatio="xMidYMid meet">` +
    gridlines + baseline + bars +
    `</svg>` +
    table +
    `<figcaption>${o.caption}</figcaption>` +
    `</figure>`
  );
}

/** COLA history chart from cola.json history rows. */
export function colaHistoryChart(history, confirmedYear, projectedYear) {
  const rows = history.filter((r) => typeof r.colaPct === "number");
  const series = rows.map((r) => ({
    label: String(r.year),
    value: r.colaPct,
    valueText: `${r.colaPct}%`,
    variant: r.status === "projected" ? "est" : r.year === confirmedYear ? "accent" : "default",
    sub: r.status === "projected" ? "est." : "",
  }));
  const projText = projectedYear ? ` The ${projectedYear} bar is an estimate until the official announcement.` : "";
  return verticalBars({
    ariaLabel: `Bar chart of the annual Social Security cost-of-living adjustment (COLA) by year: ${rows.map((r) => `${r.year} ${r.colaPct} percent`).join(", ")}.${projText}`,
    caption: `Annual Social Security COLA by year.${projText}`,
    tableUnit: "COLA",
    series,
    gridlines: 4,
  });
}

/** Two-bar "before → after" chart for a plan-count decline. */
export function planCountChart({ ariaWhat, caption, fromYear, fromValue, toYear, toValue, unitLabel }) {
  return verticalBars({
    ariaLabel: `${ariaWhat}: ${fromValue} in ${fromYear}, down to ${toValue} in ${toYear}.`,
    caption,
    tableUnit: unitLabel || "Count",
    max: niceMax(Math.max(fromValue, toValue)),
    gridlines: 4,
    series: [
      { label: String(fromYear), value: fromValue, valueText: String(fromValue), variant: "prev" },
      { label: String(toYear), value: toValue, valueText: String(toValue), variant: "accent", sub: `▼ ${fromValue - toValue}` },
    ],
  });
}
