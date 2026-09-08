/* Sourcinno — comportements partagés.
   Le header et le footer sont écrits en dur dans chaque page (SEO) :
   ce fichier ne fabrique aucune navigation, il ne fait que l'animer.
   Sans JavaScript, le site reste entièrement lisible et navigable. */
(() => {
  "use strict";

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Menu mobile ------------------------------------------------- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    on(toggle, "click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    on(document, "keydown", (e) => { if (e.key === "Escape") close(); });
    nav.querySelectorAll("a").forEach((a) => on(a, "click", close));
    on(window, "resize", () => { if (window.innerWidth > 860) close(); });
  }

  /* --- Lien actif ---------------------------------------------------
     Décoration seulement : la navigation elle-même est dans le HTML. */
  function initActiveLink() {
    const here = normalize(window.location.pathname);
    document.querySelectorAll("#site-nav a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      const target = normalize(href);
      const match = target === "/" ? here === "/" : here === target || here.startsWith(target);
      if (match) a.setAttribute("aria-current", "page");
    });
  }

  function normalize(path) {
    let p = String(path || "/").split("?")[0].split("#")[0];
    p = p.replace(/index\.html$/, "");
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.endsWith("/")) p += "/";
    return p;
  }

  /* --- Header au défilement (effet verre dépoli) -------------------- */
  function initStickyHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const apply = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    apply();
    on(window, "scroll", apply, { passive: true });
  }

  /* --- Apparition au scroll ----------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* --- Année du copyright ------------------------------------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    initNav();
    initActiveLink();
    initStickyHeader();
    initReveal();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
