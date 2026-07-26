/* nav.js — mobile navigation toggle. Progressive enhancement only. */
(function () {
  function init() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu when a link is chosen (small screens).
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close when the page behind it is tapped. While open, the header plus the
    // panel can cover the whole viewport on a small screen and swallow every
    // pointer event, so "tap away to dismiss" has to work.
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (e.target.closest(".site-header")) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
