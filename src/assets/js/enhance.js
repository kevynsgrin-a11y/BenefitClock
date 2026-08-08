(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function reveal() {
    if (reduce || !hasIO) return;
    var vh = innerHeight;
    var els = document.querySelectorAll('[data-reveal]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8%' });
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.9) {
        el.classList.add('reveal--armed');
        io.observe(el);
      }
    });
  }

  function countUp() {
    var els = document.querySelectorAll('[data-countup]');
    els.forEach(function (el) {
      var final = parseInt(el.getAttribute('data-countup'), 10) || 0;
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      if (reduce || !hasIO) return;
      el.textContent = pre + '0' + suf;
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          obs.unobserve(el);
          var start = null;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / 900, 1);
            el.textContent = pre + Math.round(p * final) + suf;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = pre + final + suf;
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.15 });
      io.observe(el);
    });
  }

  function textSize() {
    var root = document.documentElement;
    try {
      var saved = localStorage.getItem('bc-textsize') || '';
      root.dataset.textsize = saved;
    } catch (e) {}
    function sync(v) {
      document.querySelectorAll('[data-textsize-set]').forEach(function (b) {
        b.setAttribute('aria-pressed', (b.getAttribute('data-textsize-set') || '') === v ? 'true' : 'false');
      });
    }
    sync(root.dataset.textsize || '');
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-textsize-set]');
      if (!btn) return;
      var v = btn.getAttribute('data-textsize-set') || '';
      root.dataset.textsize = v;
      try { localStorage.setItem('bc-textsize', v); } catch (e) {}
      sync(v);
    });
  }

  /* Publish the sticky header's real height as --bc-header-h. The stylesheet
     uses it for scroll-padding-top (so the skip link and every in-page anchor
     stop landing behind the header) and to cap the mobile menu panel, which is
     absolutely positioned inside the header and otherwise runs off-screen.
     The CSS fallback (4.25rem) covers the no-JS case. */
  function headerHeight() {
    var hdr = document.querySelector('.site-header');
    if (!hdr) return;
    function set() {
      document.documentElement.style.setProperty('--bc-header-h', hdr.offsetHeight + 'px');
    }
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(hdr);
    else addEventListener('resize', set);
  }

  /* Horizontally scrollable regions (wide data tables, and charts that are
     given a legible minimum width on phones) need three things the markup
     cannot provide on its own: a visible affordance, a tab stop so keyboard
     users can scroll them at all, and a name. Apply all three only while the
     content genuinely overflows. */
  function scrollables() {
    var els = document.querySelectorAll('.table-scroll, .bc-chart');
    els.forEach(function (el) {
      if (el.closest('[aria-hidden="true"]')) return;   // never focus hidden content
      function sync() {
        var slack = el.scrollWidth - el.clientWidth;
        var over = slack > 2;
        el.classList.toggle('is-scrollable', over);
        el.classList.toggle('at-start', el.scrollLeft <= 1);
        el.classList.toggle('at-end', el.scrollLeft >= slack - 1);
        /* Applied AND withdrawn. These three attributes are a promise that the
           region scrolls; when the viewport widens or rows are removed and it
           no longer does, leaving them behind puts a tab stop in the order
           whose accessible name says "scrollable sideways" and which cannot
           scroll. Only ever remove what this function added — a `tabindex` or
           `role` authored in the markup is not ours to strip. */
        if (over) {
          if (el.getAttribute('tabindex') === null) {
            el.setAttribute('tabindex', '0');
            el.setAttribute('data-scroll-affordance', '');
            if (!el.getAttribute('role')) el.setAttribute('role', 'region');
            if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
              var cap = el.querySelector('caption, figcaption');
              var name = cap ? cap.textContent.trim() : 'Table';
              el.setAttribute('aria-label', name + ' — scrollable sideways');
            }
          }
        } else if (el.hasAttribute('data-scroll-affordance')) {
          el.removeAttribute('tabindex');
          el.removeAttribute('role');
          el.removeAttribute('aria-label');
          el.removeAttribute('data-scroll-affordance');
        }
      }
      sync();
      el.addEventListener('scroll', sync, { passive: true });
      if ('ResizeObserver' in window) {
        var ro = new ResizeObserver(sync);
        ro.observe(el);
        var inner = el.firstElementChild;
        if (inner) ro.observe(inner);        // rows injected later change scrollWidth
      } else {
        addEventListener('resize', sync);
      }
    });
  }

  function init() {
    headerHeight();
    reveal();
    countUp();
    textSize();
    scrollables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
