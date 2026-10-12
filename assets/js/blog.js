(() => {
  // Filtres du blog Publications : une étiquette à la fois, la première choisie à l'ouverture. Les puces n'existent que si ce script s'exécute ; sans lui, tous les articles restent visibles.
  const list = document.getElementById('blog-list');
  if (!list) return;
  const posts = [...list.querySelectorAll('[data-tag]')];
  // Ordre fixe des puces, quel que soit l'ordre des articles ; une étiquette absente de la page n'a pas de puce.
  const present = new Set(posts.map((post) => post.dataset.tag));
  const order = ['IA', 'Venture Building', 'Startup'];
  const tags = [...order.filter((tag) => present.has(tag)), ...[...present].filter((tag) => !order.includes(tag))];
  if (tags.length < 2) return;
  const bar = document.createElement('div');
  bar.className = 'filters';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filtrer les articles par thème');
  const pick = (chip) => {
    for (const other of bar.children) {
      other.classList.toggle('is-active', other === chip);
      other.setAttribute('aria-pressed', String(other === chip));
    }
    for (const post of posts) post.hidden = post.dataset.tag !== chip.textContent;
  };
  for (const tag of tags) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => pick(chip));
    bar.append(chip);
  }
  list.before(bar);
  pick(bar.firstElementChild);
})();
