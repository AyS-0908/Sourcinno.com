/* Sourcinno — banniere de consentement et mesure d audience (PRD §5).
 *
 * REGLE : aucun script de mesure n est charge tant que le visiteur n a pas
 * accepte. Le refus est un choix valide et definitif ; il est memorise pour
 * ne pas reposer la question a chaque page. Rien n est envoye avant.
 *
 * Le fournisseur se choisit dans config.js (PLAUSIBLE_DOMAIN ou
 * GA_MEASUREMENT_ID). Les deux vides -> aucune banniere n est affichee,
 * puisqu il n y a rien a consentir. */
(() => {
  "use strict";

  const CFG = window.SOURCINNO_CONFIG || {};
  const PLAUSIBLE = (CFG.PLAUSIBLE_DOMAIN || "").trim();
  const GA = (CFG.GA_MEASUREMENT_ID || "").trim();
  const KEY = "sourcinno.consent";
  const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

  /* Aucun outil configure : rien a demander, rien a charger. */
  if (!PLAUSIBLE && !GA) return;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.at !== "number") return null;
      if (Date.now() - saved.at > SIX_MONTHS) return null; // on repose la question
      return saved.choice === "oui" ? "oui" : "non";
    } catch (err) {
      return null; // navigation privee, stockage bloque : on redemandera
    }
  }

  function write(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
    } catch (err) {
      /* Le stockage peut etre refuse. Le choix vaut alors pour cette visite
         seulement : c est le comportement le plus prudent. */
    }
  }

  function loadTrackers() {
    if (PLAUSIBLE) {
      const s = document.createElement("script");
      s.defer = true;
      s.dataset.domain = PLAUSIBLE;
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }
    if (GA) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", GA, { anonymize_ip: true });
    }
  }

  function showBanner() {
    const box = document.createElement("aside");
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-label", "Mesure d’audience");
    box.innerHTML =
      '<p>Ce site aimerait mesurer sa fréquentation, pour savoir quelles pages ' +
      'sont utiles. Aucune donnée n’est collectée si vous refusez, et le site ' +
      'fonctionne exactement pareil. ' +
      '<a href="/politique-confidentialite/">En savoir plus</a>.</p>' +
      '<div class="consent__actions">' +
      '<button class="btn btn--primary btn--sm" type="button" data-consent="oui">Accepter</button>' +
      '<button class="btn btn--secondary btn--sm" type="button" data-consent="non">Refuser</button>' +
      "</div>";

    box.addEventListener("click", (event) => {
      const choice = event.target && event.target.dataset && event.target.dataset.consent;
      if (!choice) return;
      write(choice);
      box.remove();
      if (choice === "oui") loadTrackers();
    });

    document.body.appendChild(box);
  }

  function init() {
    const saved = read();
    if (saved === "oui") { loadTrackers(); return; }
    if (saved === "non") return;
    showBanner();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
