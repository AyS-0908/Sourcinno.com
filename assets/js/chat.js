/* Sourcinno — assistant flottant (PRD §3 et MOCKUPS §7).
 *
 * Deux modes, selon CHAT_API_URL dans config.js :
 *   vide   -> assistant scripte, hors ligne. Il repond sur le parcours, les
 *             trois offres, les publications et la prise de contact, a partir
 *             des memes elements que le site. Aucune cle, aucun cout, aucune
 *             donnee envoyee ailleurs.
 *   rempli -> la question est envoyee en POST JSON a cette adresse, qui doit
 *             repondre {"reponse": "..."}. Le mode scripte sert alors de repli
 *             si l appel echoue.
 *
 * L assistant ne devine jamais : hors de ce qu il sait, il le dit et renvoie
 * vers la page contact. Un assistant qui invente une reference ou un tarif
 * ferait plus de degats qu il n en evite. */
(() => {
  "use strict";

  const CFG = window.SOURCINNO_CONFIG || {};
  const API = (CFG.CHAT_API_URL || "").trim();

  const CONTACT =
    'Le plus simple est d’en parler : <a href="/contact/">le formulaire est ici</a>, ' +
    'ou directement <a href="mailto:aymard@de-scorbiac.fr">aymard@de-scorbiac.fr</a>.';

  /* Base de connaissances. Chaque entree : des mots-cles, et une reponse.
     Tout provient du contenu du site ; rien n est invente ici. */
  const KB = [
    {
      keys: ["offre", "offres", "service", "services", "proposez", "prestation", "accompagnement"],
      answer:
        "Trois offres, toutes centrées sur l’organisation et les processus :<br>" +
        '&bull; <a href="/offre-strategie-organisation-processus/">Stratégie, Organisation &amp; Processus</a> — aligner la vision et l’exécution.<br>' +
        '&bull; <a href="/offre-ia-business/">IA for Business</a> — installer l’IA là où elle fait gagner du temps.<br>' +
        '&bull; <a href="/offre-venture-building/">Venture Building &amp; Portfolio</a> — structurer la création de nouvelles activités.',
    },
    {
      keys: ["processus", "organisation", "pmo", "strategie", "stratégie", "kpi", "indicateur", "gouvernance"],
      answer:
        "C’est le cœur du métier : diagnostic de l’organisation, cartographie des processus tels qu’ils sont réellement exécutés, feuille de route priorisée, mise en place d’un PMO et d’indicateurs qui mesurent l’avancement plutôt que l’agitation. " +
        '<a href="/offre-strategie-organisation-processus/">Le détail est ici</a>.',
    },
    {
      keys: ["ia", "intelligence artificielle", "llm", "agentic", "agent", "automatis", "nocode", "no-code", "chatgpt"],
      answer:
        "L’approche est pragmatique : former les équipes sur vos propres cas d’usage, repérer les tâches répétitives, construire un prototype en quelques jours, puis décider — industrialiser, ajuster, ou arrêter. " +
        '<a href="/offre-ia-business/">Voir l’offre IA for Business</a>.',
    },
    {
      keys: ["venture", "startup", "startups", "incubation", "portefeuille", "portfolio", "levee", "levée", "fonds", "innovation"],
      answer:
        "Venture Building : idéation et sélection d’opportunités sur votre secteur, business plan, validation du marché, incubation jalonnée, recherche de partenaires et de financements, et pilotage du portefeuille avec un PMO dédié. " +
        '<a href="/offre-venture-building/">Voir l’offre</a>.',
    },
    {
      keys: ["mazars", "lab", "mazars’ lab", "mazars lab"],
      answer:
        "Chez Mazars (2008–2013), Aymard de Scorbiac a dirigé des projets de transformation, avec les processus comme levier principal — trente projets mondiaux au total. " +
        "Puis, au Mazars’ Lab (2013–2016), il a créé et dirigé le lab d’innovation, où quatre startups ont été accélérées.",
    },
    {
      keys: ["accenture"],
      answer:
        "Chez Accenture (1999–2008) : dix-sept missions de conseil en stratégie et en organisation, en France et à l’international.",
    },
    {
      keys: ["fabereo"],
      answer:
        "Fabereo (2016–2018) : co-fondateur, avec une levée de fonds de 500 K€.",
    },
    {
      keys: ["parcours", "experience", "expérience", "cv", "carriere", "carrière", "qui etes", "qui êtes", "qui est"],
      answer:
        "Aymard de Scorbiac, consultant indépendant à Paris, environ vingt-cinq ans entre conseil, transformation et innovation :<br>" +
        "Accenture (1999–2008), Mazars (2008–2013), Mazars’ Lab (2013–2016), Fabereo (2016–2018), et Sourcinno depuis 2019. " +
        "Formation : EM Lyon, master 1996–1999. Français natif, anglais courant.",
    },
    {
      keys: ["livre", "engagez", "essai", "pib", "bci", "publication", "publications", "article", "articles", "blog"],
      answer:
        "Deux textes longs : l’essai « Du PIB au BCI », sur la mesure de la richesse, et le livre « Engagez-vous 2.0 », sur l’engagement. " +
        'Les réflexions courtes paraissent sur LinkedIn. <a href="/publications/">Tout est regroupé ici</a>.',
    },
    {
      keys: ["linkedin", "reseau", "réseau", "suivre"],
      answer:
        'Le profil LinkedIn est <a href="https://www.linkedin.com/in/aymarddescorbiac" target="_blank" rel="noopener">ici</a> — c’est là que paraissent les publications les plus fréquentes.',
    },
    {
      keys: ["prototype", "prototypes", "demo", "démo", "realisation", "réalisation"],
      answer:
        "Le portfolio de prototypes est en cours de publication sur le site. " +
        'En attendant, une démonstration se montre volontiers en direct : <a href="/contact/">demandez-la ici</a>.',
    },
    {
      keys: ["contact", "contacter", "rendez-vous", "rdv", "joindre", "telephone", "téléphone", "email", "mail", "appeler"],
      answer:
        "Par email : <a href=\"mailto:aymard@de-scorbiac.fr\">aymard@de-scorbiac.fr</a>. Par téléphone : " +
        '<a href="tel:+33608755877">+33 6 08 75 58 77</a>. Ou via ' +
        '<a href="/contact/">le formulaire</a> — réponse sous 48 heures ouvrées, ' +
        "puis un échange de trente minutes, sans engagement.",
    },
    {
      keys: ["paris", "france", "base", "basee", "situe", "localise", "bureau", "distance", "deplace", "international"],
      answer:
        "Basé à Paris, en France. Les missions passées ont couvert l’Europe, l’Afrique et l’Amérique.",
    },
    {
      keys: ["client", "clients", "reference", "référence", "secteur", "secteurs", "pme"],
      answer:
        "Les interlocuteurs habituels sont des dirigeants de PME et d’ETI, des fondateurs de startups et des investisseurs, dans les services et la technologie. " +
        'Quelques organisations avec lesquelles il y a eu innovation sont citées <a href="/#references">sur la page d’accueil</a>.',
    },
  ];

  const SUGGESTIONS = [
    "Quelles sont vos offres ?",
    "Parlez-moi de votre expérience chez Mazars",
    "Comment vous contacter ?",
  ];

  const FALLBACK =
    "Je ne sais répondre que sur le parcours d’Aymard, les trois offres, les publications et la prise de contact. " +
    "Pour le reste, mieux vaut lui poser la question directement. " + CONTACT;

  const norm = (s) =>
    String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* L ORDRE DE KB EST L ORDRE DE SPECIFICITE : la premiere entree dont un
     mot-cle apparait gagne. Les noms propres (Mazars, Accenture, Fabereo)
     sont donc places AVANT l entree generique "parcours", sans quoi
     "votre experience chez Mazars" repondrait sur le parcours entier.
     Le mot-cle doit former un mot entier : sinon "ia" repondrait a
     "financiare" et "base" a "database". */
  function matches(q, key) {
    const k = norm(key).replace(/[^a-z0-9 ’'-]/g, "");
    return new RegExp("(^|[^a-z0-9])" + k + "([^a-z0-9]|$)").test(q);
  }

  function answerFor(question) {
    const q = norm(question);
    if (!q.trim()) return FALLBACK;
    for (const entry of KB) {
      if (entry.keys.some((key) => matches(q, key))) return entry.answer;
    }
    return FALLBACK;
  }

  /* ---------- interface ---------- */
  let panel = null;
  let log = null;

  function bubble(who, html) {
    const el = document.createElement("div");
    el.className = "chat-msg chat-msg--" + who;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  async function reply(question) {
    if (!API) return bubble("bot", answerFor(question));
    const pending = bubble("bot", "…");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      pending.innerHTML = data && data.reponse ? String(data.reponse) : answerFor(question);
    } catch (err) {
      pending.innerHTML = answerFor(question); // repli sur l assistant scripte
    }
    log.scrollTop = log.scrollHeight;
  }

  function ask(question) {
    bubble("me", question.replace(/[<>]/g, ""));
    reply(question);
  }

  function build() {
    panel = document.createElement("section");
    panel.className = "chat-panel";
    panel.setAttribute("aria-label", "Assistant Sourcinno");
    panel.innerHTML =
      '<div class="chat-panel__head">' +
      "<p>Assistant Sourcinno<small>Parcours, offres et publications</small></p>" +
      '<button class="chat-panel__close" type="button" aria-label="Fermer l’assistant">&times;</button>' +
      "</div>" +
      '<div class="chat-log" role="log" aria-live="polite"></div>' +
      '<div class="chat-suggestions"></div>' +
      '<form class="chat-form">' +
      '<label class="visually-hidden" for="chat-input">Votre question</label>' +
      '<input type="text" id="chat-input" autocomplete="off" placeholder="Posez votre question…">' +
      '<button class="btn btn--primary btn--sm" type="submit">Envoyer</button>' +
      "</form>";

    log = panel.querySelector(".chat-log");
    bubble("bot",
      "Bonjour. Je réponds aux questions sur le parcours d’Aymard de Scorbiac, " +
      "ses trois offres et ses publications. Que cherchez-vous ?");

    const suggestions = panel.querySelector(".chat-suggestions");
    SUGGESTIONS.forEach((text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = text;
      b.addEventListener("click", () => ask(text));
      suggestions.appendChild(b);
    });

    const form = panel.querySelector(".chat-form");
    const input = panel.querySelector("#chat-input");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      input.value = "";
      ask(value);
    });

    document.body.appendChild(panel);
    return panel;
  }

  function init() {
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "chat-launcher";
    launcher.setAttribute("aria-label", "Ouvrir l’assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5a8 8 0 1 1 17-6z"/><path d="M8.5 11h7M8.5 14.5h4"/></svg>';

    const close = () => {
      if (panel) panel.remove();
      panel = null;
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-label", "Ouvrir l’assistant");
    };

    launcher.addEventListener("click", () => {
      if (panel) return close();
      build();
      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Fermer l’assistant");
      panel.querySelector(".chat-panel__close").addEventListener("click", close);
      const input = panel.querySelector("#chat-input");
      if (input) input.focus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel) close();
    });

    document.body.appendChild(launcher);
    /* expose pour la verification automatisee : repondre est une fonction pure */
    window.__sourcinnoAnswer = answerFor;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
