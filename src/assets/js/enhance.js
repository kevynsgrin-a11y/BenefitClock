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

  function init() {
    reveal();
    countUp();
    textSize();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
