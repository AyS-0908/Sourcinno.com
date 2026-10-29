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

  /* --- Liste à aperçu (accueil « +25 ans d'expérience », en onglets ; P56-P61) ---
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

  /* --- « Votre enjeu » (accueil, Pass 72, maquette v13 option A) -------
     Deux traits courbes des deux offres vers « Création de valeur » ; le
     bouton ouvre le schéma dessous, relié par trois traits. Les traits sont
     un SVG créé ici et dessiné d'après la place réelle des blocs : redessiné
     au redimensionnement, au chargement de la police et pendant l'entrée des
     branches. Sans ce fichier : pas de SVG, le schéma reste affiché. */
  function initValueTree() {
    const NS = "http://www.w3.org/2000/svg";
    document.querySelectorAll(".vx").forEach((vx) => {
      const btn = vx.querySelector(".vx-node");
      const tree = btn && document.getElementById(btn.getAttribute("aria-controls"));
      if (!tree) return;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "vx-lines");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      vx.prepend(svg);

      const box = (el, o) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - o.left, t: r.top - o.top, b: r.bottom - o.top, h: r.height, cx: r.left - o.left + r.width / 2 };
      };
      /* Ligne brisée aux angles arrondis (rayon r), en chemin SVG. */
      const rounded = (pts, r) => {
        let d = "M" + pts[0][0] + " " + pts[0][1];
        for (let i = 1; i < pts.length - 1; i++) {
          const p = pts[i - 1], c = pts[i], n = pts[i + 1];
          const l1 = Math.hypot(c[0] - p[0], c[1] - p[1]), l2 = Math.hypot(n[0] - c[0], n[1] - c[1]);
          const k = Math.min(r, l1 / 2, l2 / 2);
          if (k < 0.5) { d += " L" + c[0] + " " + c[1]; continue; }
          const a = [c[0] - (c[0] - p[0]) / l1 * k, c[1] - (c[1] - p[1]) / l1 * k];
          const b = [c[0] + (n[0] - c[0]) / l2 * k, c[1] + (n[1] - c[1]) / l2 * k];
          d += " L" + a[0] + " " + a[1] + " Q" + c[0] + " " + c[1] + " " + b[0] + " " + b[1];
        }
        const z = pts[pts.length - 1];
        return d + " L" + z[0] + " " + z[1];
      };
      /* Du bas d'un bloc au haut du suivant : descente droite jusqu'à yS (dégage ce qui est à côté), puis une courbe. */
      const fan = (x1, y1, x2, y2, yS) => {
        if (Math.abs(x1 - x2) < 1) return "M" + x1 + " " + y1 + " L" + x2 + " " + y2;
        const k = (y2 - yS) * 0.6;
        return "M" + x1 + " " + y1 + " L" + x1 + " " + yS + " C" + x1 + " " + (yS + k) + " " + x2 + " " + (y2 - k) + " " + x2 + " " + y2;
      };
      /* Blocs empilés : un trait dans la marge gauche, un court trait vers chaque bloc. */
      const ay = (e) => e.t + Math.min(e.h / 2, 40);
      const gutter = (f, t) => {
        const gx = Math.min(f.l, t.l) - 14;
        return rounded([[f.l, ay(f)], [gx, ay(f)], [gx, ay(t)], [t.l, ay(t)]], 10);
      };
      const inRow = (a) => a.length > 1 && a.every((x) => Math.abs(x.t - a[0].t) < 4);

      const draw = (animate) => {
        const o = vx.getBoundingClientRect();
        if (!o.width) return;
        const cards = [...vx.querySelectorAll(":scope > .card--service")].map((e) => box(e, o));
        const node = box(btn, o);
        const br = tree.hidden ? [] : [...tree.querySelectorAll(".vx-branch")].map((e) => box(e, o));
        const edges = [];
        const below = cards.every((c) => node.t >= c.b - 1);
        cards.forEach((c, i) => {
          edges.push(["in" + i, below && inRow(cards) ? fan(c.cx, c.b, node.cx, node.t, c.b) : gutter(c, node)]);
        });
        if (br.length) {
          const yS = Math.max(node.b, ...cards.filter((c) => c.b <= br[0].t).map((c) => c.b));
          br.forEach((b, i) => edges.push(["out" + i, inRow(br) ? fan(node.cx, node.b, b.cx, b.t, yS) : gutter(node, b)]));
        }
        const old = {};
        [...svg.children].forEach((e) => { old[e.dataset.k] = e; });
        edges.forEach(([k, d]) => {
          let p = old[k], c = old["dot-" + k];
          const end = d.match(/(-?[\d.]+) (-?[\d.]+)$/);
          if (!p) {
            p = document.createElementNS(NS, "path"); p.dataset.k = k; p.setAttribute("pathLength", "1"); svg.appendChild(p);
            c = document.createElementNS(NS, "circle"); c.dataset.k = "dot-" + k; c.setAttribute("r", "4"); svg.appendChild(c);
            if (animate && k.startsWith("out")) { p.classList.add("draw"); c.classList.add("draw"); }
          }
          p.setAttribute("d", d);
          c.setAttribute("cx", end[1]); c.setAttribute("cy", end[2]);
          delete old[k]; delete old["dot-" + k];
        });
        Object.values(old).forEach((e) => e.remove());
      };
      /* Pendant l'entrée des branches (elles bougent), un dessin par image pendant ms. */
      const follow = (ms) => {
        const end = performance.now() + ms;
        const tick = (now) => { draw(false); if (now < end) requestAnimationFrame(tick); };
        tick(performance.now());
      };

      tree.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      vx.classList.add("is-live");
      on(btn, "click", () => {
        const open = tree.hidden;
        tree.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        tree.classList.remove("is-entering");
        if (open && !reduced) { void tree.offsetWidth; tree.classList.add("is-entering"); }
        draw(open && !reduced);
        if (open && !reduced) follow(750);
      });
      /* Fin d'entrée des branches : un dernier dessin, même si aucune image n'a été peinte entre-temps (onglet en arrière-plan). */
      on(tree, "animationend", () => draw(false));
      if (window.ResizeObserver) new ResizeObserver(() => draw(false)).observe(vx);
      on(window, "resize", () => draw(false));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(false));
      draw(false);
    });
  }

  /* --- Frise à onglets .mA : « Méthodologie type » (accueil, Pass 72, quatre
     étapes) et « Votre besoin > Vos questions » (Performance, Entreprise IA,
     Pass 73, trois blocs). Onglets : une étape à la fois ; clic, flèches
     gauche/droite (en boucle), Début, Fin ; un seul onglet atteignable par Tab.
     À partir de 861 px chaque étape réserve la hauteur de la plus haute :
     changer d'étape ne déplace pas la page. Sans ce fichier : pas de frise,
     les étapes l'une sous l'autre. */
  function initStepTabs() {
    const wide = window.matchMedia("(min-width: 861px)");
    document.querySelectorAll(".mA").forEach((root) => {
      const rail = root.querySelector(".mA-rail");
      const tabs = rail ? [...rail.querySelectorAll("[role=tab]")] : [];
      const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
      if (!tabs.length || panels.some((p) => !p)) return;
      let current = 0;
      panels.forEach((p, i) => {
        p.setAttribute("role", "tabpanel");
        p.setAttribute("aria-labelledby", tabs[i].id);
        p.tabIndex = 0;
      });

      const reserve = () => {
        panels.forEach((p) => p.style.removeProperty("min-height"));
        if (!wide.matches) return;
        let max = 0;
        panels.forEach((p) => {
          const was = p.hidden;
          p.hidden = false;
          max = Math.max(max, Math.ceil(p.getBoundingClientRect().height));
          p.hidden = was;
        });
        panels.forEach((p) => { p.style.minHeight = max + "px"; });
      };
      const select = (i, focus, byUser) => {
        current = i;
        tabs.forEach((t, j) => {
          t.setAttribute("aria-selected", String(i === j));
          t.tabIndex = i === j ? 0 : -1;
          t.classList.toggle("is-done", j < i);
          panels[j].hidden = i !== j;
          panels[j].classList.remove("is-entering");
        });
        rail.style.setProperty("--p", i / (tabs.length - 1));
        if (byUser && !reduced) { void panels[i].offsetWidth; panels[i].classList.add("is-entering"); }
        if (focus) tabs[i].focus();
      };
      tabs.forEach((t, i) => {
        on(t, "click", () => select(i, false, true));
        on(t, "keydown", (e) => {
          const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
          if (n === undefined) return;
          e.preventDefault();
          select((n + tabs.length) % tabs.length, true, true);
        });
      });

      rail.hidden = false;
      root.classList.add("is-live");
      select(current, false, false);
      reserve();
      on(window, "resize", reserve);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
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
    initValueTree();
    initStepTabs();
    initYear();
    initViewer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
