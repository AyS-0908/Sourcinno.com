(() => {
  // Catalogue des idées (Venture Building) : les cartes viennent du skill gtm-catalog, entre ses repères.
  // Sans script : toutes les cartes visibles, boutons href="#" (la section Contact du bas de page reste la voie).
  const list = document.querySelector('.catalogue-list');
  if (!list) return;
  const SHOWN = 6;
  const email = window.SOURCINNO_CONFIG?.CONTACT_EMAIL || 'contact@sourcinno.com';
  const page = location.origin + location.pathname + '#catalogue';

  // Boutons : brouillon d'email, comme forms.js sendByMail. Le titre est lu en texte (data-idea), jamais en HTML.
  for (const link of list.querySelectorAll('a[data-idea]')) {
    const idea = link.dataset.idea;
    const access = link.classList.contains('btn--secondary');
    const subject = `Idée « ${idea} » — sourcinno.com`;
    const ask = access
      ? `Je souhaite découvrir la solution de l'idée « ${idea} ».`
      : `Je souhaite discuter de l'idée « ${idea} » (mission ou co-création).`;
    const body = `Bonjour,\n\n${ask}\n\nPage : ${page}\n\n--\nEnvoyé depuis sourcinno.com`;
    link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // « Afficher plus » au-delà de 6 cartes ; le focus va au titre de la première carte révélée.
  const cards = [...list.querySelectorAll(':scope > .card')];
  if (cards.length <= SHOWN) return;
  const rest = cards.slice(SHOWN);
  rest.forEach((card) => card.classList.add('is-folded'));
  const more = document.createElement('p');
  more.className = 'catalogue-more';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--secondary';
  button.textContent = `Afficher plus (${rest.length})`;
  button.addEventListener('click', () => {
    rest.forEach((card) => card.classList.remove('is-folded'));
    const title = rest[0].querySelector('.card__title') || rest[0];
    title.setAttribute('tabindex', '-1');
    title.focus();
    more.remove();
  });
  more.append(button);
  list.after(more);
})();
