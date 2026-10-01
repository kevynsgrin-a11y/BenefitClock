/* open-enrollment.js — the interactive half of /open-enrollment/.
 *
 * Ported from the Bolt comp's src/main.ts (vanilla, no framework), adapted to
 * this site: only the week-toggle accordion and checklist checkboxes exist
 * here (the header nav and FAQ are the site's own). Checkbox state persists in
 * localStorage under one key so a reader can come back mid-season and find
 * their progress — nothing leaves the browser.
 */
const KEY = 'benefitdial-oehub-checks';

function loadChecks() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

function initWeekToggles(saved) {
  document.querySelectorAll('.oeh-week__toggle').forEach((btn) => {
    const items = document.getElementById(btn.getAttribute('aria-controls'));
    if (!items) return;

    const apply = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      items.hidden = !open;
      btn.closest('.oeh-week').classList.toggle('oeh-week--open', open);
    };
    btn.addEventListener('click', () => {
      apply(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Weeks with already-checked items start expanded, so returning readers
    // land on their progress instead of a wall of closed panels.
    const hasProgress = items.querySelector('input[data-item]');
    if (hasProgress && saved[hasProgress.dataset.item]) apply(true);
  });
}

function initCheckboxes(saved) {
  document.querySelectorAll('.oeh-check input[data-item]').forEach((box) => {
    const id = box.dataset.item;
    const setState = (on) => {
      box.checked = on;
      box.closest('.oeh-check').classList.toggle('oeh-check--done', on);
    };
    setState(!!saved[id]);
    box.addEventListener('change', () => {
      setState(box.checked);
      const next = loadChecks();
      if (box.checked) next[id] = 1; else delete next[id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: checks still work, just not saved */ }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = loadChecks();
  initWeekToggles(saved);
  initCheckboxes(saved);
});
