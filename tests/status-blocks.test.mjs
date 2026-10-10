import { test } from "node:test";
import assert from "node:assert/strict";
import { applyStatusBlocks, statusBlocks } from "../scripts/lib/status-blocks.mjs";

const page =
  "A {{#projected}}expected{{/projected}}{{#official}}announced{{/official}} B." +
  " Tail{{#projected}} (estimate){{/projected}}.";

test("keeps only the projected branch while the cycle is projected", () => {
  assert.equal(applyStatusBlocks(page, "projected"), "A expected B. Tail (estimate).");
});

test("keeps only the official branch once the cycle is official", () => {
  assert.equal(applyStatusBlocks(page, "official"), "A announced B. Tail.");
});

test("text without blocks passes through untouched, token braces included", () => {
  const s = "Plain {{TOKEN}} text";
  assert.equal(applyStatusBlocks(s, "projected"), s);
  assert.equal(applyStatusBlocks(s, "official"), s);
});

test("blocks may span lines and contain tokens", () => {
  const s = "{{#official}}\n  The {{CYCLE_YEAR}} COLA\n{{/official}}";
  assert.equal(applyStatusBlocks(s, "official"), "\n  The {{CYCLE_YEAR}} COLA\n");
  assert.equal(applyStatusBlocks(s, "projected"), "");
});

test("an unknown cycle status is a build failure, not a silent default", () => {
  assert.throws(() => applyStatusBlocks(page, undefined), /Unknown COLA cycle status/);
  assert.throws(() => applyStatusBlocks(page, "confirmed"), /Unknown COLA cycle status/);
});

test("an unclosed block fails instead of shipping a literal marker", () => {
  assert.throws(() => applyStatusBlocks("{{#official}}no end", "official"), /status block marker/);
  assert.throws(() => applyStatusBlocks("no start{{/official}}", "official"), /status block marker/);
});

test("a nested block fails instead of leaving a stray marker", () => {
  const nested = "{{#projected}}a{{#official}}b{{/official}}c{{/projected}}";
  assert.throws(() => applyStatusBlocks(nested, "projected"), /status block marker/);
});

test("a misspelled block name fails", () => {
  assert.throws(() => applyStatusBlocks("{{#oficial}}x{{/oficial}}", "official"), /status block marker/);
});

test("statusBlocks lists the copy each state carries, for review", () => {
  assert.deepEqual(statusBlocks(page), {
    projected: ["expected", " (estimate)"],
    official: ["announced"],
  });
});
