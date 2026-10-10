/* Status-aware copy.

   A sentence about the COLA cycle is true in one of two states: the cycle's row
   in src/data/cola-history.csv is still status=projected ("expected on …",
   "early estimate") or it has been promoted to status=official ("announced on
   …"). Writing both versions next to each other makes announcement day a data
   edit rather than a copy edit:

     {{#projected}}The 3.5% figure is an early estimate.{{/projected}}
     {{#official}}The 3.4% figure is official.{{/official}}

   Exactly one branch survives, chosen by the cycle row's status. Blocks do not
   nest. A marker that is unbalanced, nested, or misspelled fails the build
   rather than reaching a reader as literal "{{#official}}" text. */

const BLOCK = /\{\{#(projected|official)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
const STRAY = /\{\{[#/][A-Za-z_]*\}\}/g;

export function applyStatusBlocks(html, cycleStatus) {
  if (cycleStatus !== "projected" && cycleStatus !== "official") {
    throw new Error(`Unknown COLA cycle status ${JSON.stringify(cycleStatus)}; expected "projected" or "official".`);
  }
  const out = html.replace(BLOCK, (m, which, body) => (which === cycleStatus ? body : ""));
  const stray = [...new Set(out.match(STRAY) || [])];
  if (stray.length) {
    throw new Error(`Unbalanced, nested or unknown status block marker(s) in template: ${stray.join(", ")}`);
  }
  return out;
}

/* The copy a page carries for each state, for review. Used by the flip dry
   run to list every sentence that only exists after the official COLA lands. */
export function statusBlocks(html) {
  const found = { projected: [], official: [] };
  for (const m of html.matchAll(BLOCK)) found[m[1]].push(m[2]);
  return found;
}
