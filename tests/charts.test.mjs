import { test } from "node:test";
import assert from "node:assert/strict";
import { verticalBars, planCountChart, colaHistoryChart } from "../scripts/lib/svgcharts.mjs";

const bars = (n) =>
  Array.from({ length: n }, (_, i) => ({ label: `L${i}`, value: i + 1, valueText: `${i + 1}` }));
const chart = (n, o = {}) =>
  verticalBars({ ariaLabel: "a", caption: "c", series: bars(n), ...o });
const viewBoxW = (html) => Number(/viewBox="0 0 (\d+) /.exec(html)[1]);
const declaredW = (html) => Number(/--bc-chart-w:(\d+)px/.exec(html)[1]);

/* The defect: label text is sized in user units, so its rendered size is
   containerWidth / viewBoxWidth. A fixed 720-unit box made legibility depend on
   where the chart was placed — the two-bar charts sit in a two-column grid and
   rendered their labels at 7.6px on a desktop, smaller than on a phone. */
test("the viewBox grows with the bar count instead of being fixed", () => {
  const w2 = viewBoxW(chart(2));
  const w5 = viewBoxW(chart(5));
  const w8 = viewBoxW(chart(8));
  assert.ok(w2 < w5 && w5 < w8, `expected widths to grow: ${w2}, ${w5}, ${w8}`);
});

test("a two-bar chart is narrow enough to render near 1:1 in a grid column", () => {
  // The two-column grid gives roughly 300-330px. Rendering near 1:1 is what
  // keeps the 17px label at 17px rather than shrinking it to 7.6px.
  const w = viewBoxW(chart(2));
  assert.ok(w > 250 && w < 340, `two-bar viewBox should sit near a grid column width, got ${w}`);
});

test("the five-bar COLA chart is unchanged at 720", () => {
  assert.equal(viewBoxW(chart(5)), 720);
});

test("each chart declares its own width for CSS to cap scaling at 1:1", () => {
  for (const n of [2, 3, 5, 8]) {
    const html = chart(n);
    assert.equal(declaredW(html), viewBoxW(html), `--bc-chart-w must match the viewBox for ${n} bars`);
  }
});

/* These guards locate bars by regex, so the regex IS the contract. Two rules
   keep a presentational edit from being misreported as a geometry failure:

   1. Match the attributes independently of the order they are written in.
      The old pattern required class, then x, then width, in exactly that
      sequence.
   2. Assert the match COUNT before using the matches. A pattern that matches
      nothing made the loop body never run and the test pass green — so
      renaming a CSS class silently switched the guard off rather than
      failing. Its sibling, which used .exec(...)[1], threw
      "Cannot read properties of null" instead, blaming bar density for what
      was actually a rename. */
const BAR_RE = /<rect\b(?=[^>]*\bclass="bc-bar)(?=[^>]*\bx="([\d.]+)")(?=[^>]*\bwidth="([\d.]+)")[^>]*>/g;

function barsIn(html, n) {
  const bars = [...html.matchAll(BAR_RE)].map((m) => ({ x: Number(m[1]), w: Number(m[2]) }));
  assert.equal(
    bars.length, n,
    `expected ${n} bar rects, matched ${bars.length} — the chart markup contract moved ` +
    `(class="bc-bar", x and width on a <rect>); fix the selector here rather than reading ` +
    `this as a geometry failure`
  );
  return bars;
}

test("bars stay inside the plot area at every count", () => {
  for (const n of [1, 2, 3, 5, 8, 12]) {
    const html = chart(n);
    const W = viewBoxW(html);
    for (const { x, w } of barsIn(html, n)) {
      assert.ok(x >= 0, `bar starts left of the box at n=${n}: x=${x}`);
      assert.ok(x + w <= W, `bar overflows the box at n=${n}: ${x}+${w} > ${W}`);
    }
  }
});

test("the bar selector survives attribute reordering, so styling edits do not silence it", () => {
  // The contract is "a <rect> in the bc-bar class carrying x and width",
  // not the order an author happened to write those attributes in.
  const reordered = '<rect width="10.0" class="bc-bar" y="1.0" x="2.0" height="3.0"></rect>';
  const hit = [...reordered.matchAll(BAR_RE)];
  assert.equal(hit.length, 1, "reordered attributes must still match");
  assert.equal(Number(hit[0][1]), 2);
  assert.equal(Number(hit[0][2]), 10);
});

test("bar density is the same whatever the bar count", () => {
  // Same slot per bar => a two-bar chart looks like two bars of a longer chart,
  // rather than two bars stretched across a box built for five.
  // Within rounding: the viewBox is rounded to whole units, which nudges the
  // slot by a hundredth of a unit.
  const widthOf = (n) => barsIn(chart(n), n)[0].w;
  for (const n of [3, 5, 8]) {
    assert.ok(
      Math.abs(widthOf(2) - widthOf(n)) < 0.5,
      `bar width should not depend on bar count: ${widthOf(2)} vs ${widthOf(n)} at n=${n}`
    );
  }
});

test("the real chart helpers carry the width declaration through", () => {
  const plan = planCountChart({
    ariaWhat: "Plans", caption: "c", fromYear: 2026, fromValue: 34, toYear: 2027, toValue: 32,
  });
  assert.equal(declaredW(plan), viewBoxW(plan));

  const cola = colaHistoryChart(
    [{ year: 2024, colaPct: 3.2, status: "official" }, { year: 2025, colaPct: 2.5, status: "official" }],
    2025, 2026
  );
  assert.equal(declaredW(cola), viewBoxW(cola));
});

test("the accessible data table survives — it is the primary path on small screens", () => {
  const html = chart(3);
  assert.match(html, /<table class="visually-hidden">/);
  assert.equal((html.match(/<tr><th scope="row">/g) || []).length, 3);
  assert.match(html, /role="img"/);
});

/* Every other interpolation in svgcharts.mjs runs through esc(); the visible
   <figcaption> did not, while the very same `caption` string was escaped for
   the screen-reader table's <caption> two lines above. Captions are authored
   in build.mjs and page front-matter today, but an ampersand or an angle
   bracket in one of them silently emitted raw markup into the document — and
   nothing exercised the escape helper at all. */
test("the visible figcaption is escaped, like every other interpolation", () => {
  const html = chart(2, { caption: 'Plans & "extras" <b>2027</b>' });
  assert.match(html, /<figcaption>Plans &amp; &quot;extras&quot; &lt;b&gt;2027&lt;\/b&gt;<\/figcaption>/);
  assert.doesNotMatch(html, /<figcaption>[^<]*<b>/);
});

test("the screen-reader caption and the visible caption escape identically", () => {
  const raw = "Cost & coverage <2027>";
  const html = chart(2, { caption: raw });
  const table = /<caption>([\s\S]*?)<\/caption>/.exec(html);
  const fig = /<figcaption>([\s\S]*?)<\/figcaption>/.exec(html);
  assert.ok(table && fig, "both captions must be present");
  assert.equal(fig[1], table[1]);
});
