/* Sourcinno — rendu des collections pilotees par JSON.
 * Portfolio de prototypes (PRD §4.1 E) et Publications (PRD §4.3).
 * Le contenu vit dans assets/data/*.json : ajouter une entree suffit,
 * aucun code a toucher. Un processus n8n peut ecrire dans publications.json.
 *
 * Sans JavaScript, chaque page affiche un texte de repli deja present dans
 * le HTML, avec les coordonnees de contact : rien n est jamais vide. */
(() => {
  "use strict";

  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const TYPE_LABEL = {
    livre: "Livre",
    essai: "Essai",
    article: "Article",
    video: "Vidéo",
    linkedin: "LinkedIn",
  };

  async function load(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.items;
    return Array.isArray(items) ? items : [];
  }

  /* --- Filtres ------------------------------------------------------ */
  function buildFilters(host, values, onPick) {
    if (!host) return;
    host.innerHTML = "";
    if (values.length < 2) return;
    const all = ["Tous", ...values];
    all.forEach((value, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip" + (index === 0 ? " is-active" : "");
      button.textContent = value;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.addEventListener("click", () => {
        host.querySelectorAll(".chip").forEach((c) => {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");
        onPick(index === 0 ? null : value);
      });
      host.appendChild(button);
    });
  }

  function announce(host, text) {
    const live = host.parentElement && host.parentElement.querySelector("[data-count]");
    if (live) live.textContent = text;
  }

  /* --- Prototypes --------------------------------------------------- */
  function prototypeCard(item) {
    const tech = (Array.isArray(item.tech) ? item.tech : [item.tech]).filter(Boolean);
    const media = item.image
      ? `<img src="${esc(item.image)}" alt="${esc(item.titre)}" loading="lazy">`
      : "";
    const link = item.url
      ? `<p class="card__foot"><a class="link-arrow" href="${esc(item.url)}" target="_blank" rel="noopener">Voir le prototype</a></p>`
      : "";
    const meta = [item.secteur, item.annee].filter(Boolean).join(" &middot; ");
    return `<article class="card">
      ${media}
      <h3>${esc(item.titre)}</h3>
      ${meta ? `<p class="card__meta">${meta}</p>` : ""}
      <p>${esc(item.description)}</p>
      <p class="tags">${tech.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</p>
      ${link}
    </article>`;
  }

  async function initPrototypes(host) {
    let items;
    try {
      items = await load("/assets/data/prototypes.json");
    } catch (err) {
      return; // le repli deja present dans le HTML reste affiche
    }
    if (!items.length) return;

    const filters = document.querySelector("[data-prototype-filters]");
    const techs = [...new Set(items.flatMap((i) => (Array.isArray(i.tech) ? i.tech : [i.tech])).filter(Boolean))].sort();

    const draw = (tech) => {
      const shown = tech
        ? items.filter((i) => (Array.isArray(i.tech) ? i.tech : [i.tech]).includes(tech))
        : items;
      host.innerHTML = shown.map(prototypeCard).join("");
      announce(host, `${shown.length} prototype${shown.length > 1 ? "s" : ""} affiché${shown.length > 1 ? "s" : ""}.`);
    };

    buildFilters(filters, techs, draw);
    draw(null);
    const fallback = document.querySelector("[data-prototype-fallback]");
    if (fallback) fallback.hidden = true;
  }

  /* --- Publications -------------------------------------------------- */
  function publicationCard(item) {
    const label = TYPE_LABEL[item.type] || item.type || "Publication";
    const media = item.image
      ? `<img src="${esc(item.image)}" alt="${esc(item.titre)}" loading="lazy">`
      : "";
    const link = item.url
      ? `<p class="card__foot"><a class="link-arrow" href="${esc(item.url)}" target="_blank" rel="noopener">Consulter</a></p>`
      : "";
    const date = item.date ? `<p class="card__meta">${esc(item.date)}</p>` : "";
    return `<article class="card">
      ${media}
      <p class="tags"><span class="tag">${esc(label)}</span></p>
      <h3>${esc(item.titre)}</h3>
      ${date}
      <p>${esc(item.description || "")}</p>
      ${link}
    </article>`;
  }

  async function initPublications(host) {
    let items;
    try {
      items = await load("/assets/data/publications.json");
    } catch (err) {
      return;
    }
    if (!items.length) return;

    const filters = document.querySelector("[data-publication-filters]");
    const types = [...new Set(items.map((i) => TYPE_LABEL[i.type] || i.type).filter(Boolean))];

    const draw = (label) => {
      const shown = label
        ? items.filter((i) => (TYPE_LABEL[i.type] || i.type) === label)
        : items;
      host.innerHTML = shown.map(publicationCard).join("");
      announce(host, `${shown.length} publication${shown.length > 1 ? "s" : ""} affichée${shown.length > 1 ? "s" : ""}.`);
    };

    buildFilters(filters, types, draw);
    draw(null);
    const fallback = document.querySelector("[data-publication-fallback]");
    if (fallback) fallback.hidden = true;
  }

  function init() {
    const protos = document.querySelector("[data-prototype-grid]");
    if (protos) initPrototypes(protos);
    const pubs = document.querySelector("[data-publication-grid]");
    if (pubs) initPublications(pubs);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
