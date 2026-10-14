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
      if (!match) return;
      a.setAttribute("aria-current", "page");
      /* Une page de service : c est le titre "Services" du menu qui doit se
         marquer aussi, sinon rien n indique ou l on se trouve tant que le
         menu est ferme. */
      const drop = a.closest(".nav-drop");
      if (drop) drop.querySelector("summary").setAttribute("aria-current", "page");
    });
  }

  /* Le <details> se ferme tout seul au clavier (Echap) et quand on choisit un
     lien ; il ne se ferme pas au clic a cote, d ou ces trois lignes. */
  function initDropdowns() {
    const drops = [...document.querySelectorAll(".nav-drop")];
    if (!drops.length) return;
    const closeAll = (except) => drops.forEach((d) => { if (d !== except) d.open = false; });
    drops.forEach((d) => {
      on(d, "toggle", () => { if (d.open) closeAll(d); });
      d.querySelectorAll("a").forEach((a) => on(a, "click", () => { d.open = false; }));
    });
    on(document, "click", (e) => { if (!e.target.closest(".nav-drop")) closeAll(null); });
    on(document, "keydown", (e) => { if (e.key === "Escape") closeAll(null); });
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

  /* --- Apparition au scroll -----------------------------------------
     La coquille (tools/shell/header.html) pose .reveal-wait sur <html> et
     la retire apres 2,5 s si ce fichier n a pas pris le relais. Deja retiree :
     les sections sont affichees, on ne les remasque pas. */
  function initReveal() {
    const root = document.documentElement;
    if (!root.classList.contains("reveal-wait")) return;
    const items = document.querySelectorAll(".reveal");
    if (items.length && !reduced && "IntersectionObserver" in window) {
      root.classList.add("reveal-on");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      items.forEach((el) => io.observe(el));
    }
    root.classList.remove("reveal-wait");
  }

  /* --- Liste à aperçu (pages services « Livrables », accueil « +25 ans d'expérience ») ---
     Ordinateur avec souris, 961 px et plus : survoler une ligne ou l'atteindre
     au clavier affiche son détail à côté de la liste. Écran tactile, fenêtre
     plus étroite ou sans ce fichier : le dépliant natif reste. Le détail est
     une copie du contenu de la ligne : aucun texte ne dépend du survol.
     data-hoverlist="tabs" (accueil) : les titres en ligne, le détail dessous. */
  function initHoverList() {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 961px)");
    document.querySelectorAll("[data-hoverlist]").forEach((root) => {
      const panel = root.querySelector(".hl__detail");
      const tabs = root.getAttribute("data-hoverlist") === "tabs";
      /* Les lignes de la liste seulement, enfants directs : un dépliant imbriqué n'en devient jamais une. */
      const items = [...root.querySelectorAll(".hl__items > li > details, .hl__items > details")];
      if (!panel || !items.length) return;
      let current = items[0];

      const fill = (d) => {
        panel.textContent = "";
        if (tabs) {
          /* Onglets : l'onglet ne montre qu'un mot du titre ; le titre entier et le sous-titre sont repris en tête du détail. */
          const head = document.createElement("div");
          head.className = "hl__head";
          [...d.querySelector("summary").children].forEach((c) => head.appendChild(c.cloneNode(true)));
          panel.appendChild(head);
        }
        [...d.children].forEach((c) => { if (c.tagName !== "SUMMARY") panel.appendChild(c.cloneNode(true)); });
      };
      /* Le détail reste calé en haut ; la liste réserve la hauteur du plus long
         détail : changer de ligne ne déplace rien sur la page. */
      const reserve = () => {
        if (!mq.matches) return;
        let max = 0;
        root.style.removeProperty("--hl-min");
        panel.classList.remove("is-swap");
        items.forEach((d) => { fill(d); max = Math.max(max, Math.ceil(panel.getBoundingClientRect().height)); });
        fill(current);
        root.style.setProperty("--hl-min", max + "px");
      };
      /* byUser : l'entrée animée ne joue que sur un geste du visiteur, jamais
         au chargement ni au redimensionnement. */
      const show = (d, byUser) => {
        if (d === current && panel.childNodes.length) return;
        current = d;
        items.forEach((x) => x.classList.toggle("is-active", x === d));
        panel.classList.toggle("is-swap", !!byUser);
        fill(d);
      };
      const apply = () => {
        root.classList.toggle("is-hover", mq.matches);
        panel.textContent = "";
        if (mq.matches) {
          /* La section est bien plus haute en mode aperçu : l'apparition au défilement
             attendrait 8 % de cette hauteur à l'écran et laisserait le premier écran
             vide sous le héros. Elle est donc montrée dès que le mode s'active.
             Pas en onglets : la section n'y grandit pas, elle garde son apparition au défilement. */
          const section = tabs ? null : root.closest(".reveal");
          if (section) section.classList.add("is-visible");
          items.forEach((d) => { d.open = false; });
          show(current);
          reserve();
        } else {
          items.forEach((d) => d.classList.remove("is-active"));
          root.style.removeProperty("--hl-min");
        }
      };

      items.forEach((d) => {
        const s = d.querySelector("summary");
        on(s, "pointerenter", () => { if (mq.matches) show(d, true); });
        on(s, "focus", () => { if (mq.matches) show(d, true); });
        /* En mode aperçu une ligne ne s'ouvre jamais : clic et Entrée affichent son détail. */
        on(s, "click", (e) => { if (mq.matches) { e.preventDefault(); show(d, true); } });
      });
      on(mq, "change", apply);
      on(window, "resize", reserve);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
      apply();
    });
  }

  /* --- Visionneuse (Stratégie « Réflexion ») ---------------------------
     Les images restent dans la page, en ligne, une seule à la fois dans le
     cadre ; ‹ / › et le doigt font défiler la ligne. Sans ce fichier, aucun
     bouton et aucune ligne : les images l'une sous l'autre. */
  function initViewer() {
    document.querySelectorAll("[data-viewer]").forEach((row) => {
      const slides = [...row.children].filter((c) => c.tagName === "FIGURE");
      if (slides.length < 2 || typeof row.scrollTo !== "function") return;
      const nav = document.createElement("div");
      nav.className = "viewer__nav";
      const button = (text, label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "viewer__btn";
        b.textContent = text;
        b.setAttribute("aria-label", label);
        return b;
      };
      const prev = button("‹", "Image précédente");
      const next = button("›", "Image suivante");
      const pos = document.createElement("span");
      pos.className = "viewer__pos";
      pos.setAttribute("aria-live", "polite");
      nav.append(prev, pos, next);
      let index = 0;

      const update = (i) => {
        index = Math.max(0, Math.min(slides.length - 1, i));
        pos.textContent = index + 1 + " / " + slides.length;
        const focused = document.activeElement;
        prev.disabled = index === 0;
        next.disabled = index === slides.length - 1;
        /* Le bouton qui vient de se désactiver avait le focus : il passe à l'autre. */
        if (focused === prev && prev.disabled) next.focus();
        if (focused === next && next.disabled) prev.focus();
      };
      const go = (i) => {
        update(i);
        row.scrollTo({ left: index * row.clientWidth, behavior: reduced ? "auto" : "smooth" });
      };
      on(prev, "click", () => go(index - 1));
      on(next, "click", () => go(index + 1));
      /* Doigt, pavé tactile ou Tab sur le lien de l'image cachée : la position suit, une fois la ligne arrêtée. */
      let timer = 0;
      on(row, "scroll", () => {
        clearTimeout(timer);
        timer = setTimeout(() => update(Math.round(row.scrollLeft / row.clientWidth)), 120);
      }, { passive: true });
      on(window, "resize", () => row.scrollTo({ left: index * row.clientWidth, behavior: "auto" }));

      row.classList.add("is-on");
      row.after(nav);
      update(0);
    });
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
    initDropdowns();
    initStickyHeader();
    initReveal();
    initHoverList();
    initYear();
    initViewer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
