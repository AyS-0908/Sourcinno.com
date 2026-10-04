/* ponytail: filter existing articles in place; native controls own keyboard/focus. */
(() => {
  const form = document.getElementById('portfolio-filter');
  const query = document.getElementById('portfolio-query');
  const count = document.getElementById('portfolio-count');
  const empty = document.getElementById('portfolio-empty');
  const selects = [...form.querySelectorAll('select')];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const records = [...document.querySelectorAll('.portfolio-card')].map(card => {
    const field = title => [...card.querySelectorAll('.portfolio-back h3')].find(heading => heading.textContent === title).nextElementSibling.textContent;
    return {
      card, text: normalize(card.textContent),
      sector: [card.querySelector('.portfolio-tags span').textContent],
      persona: [field('Persona').split(' · ')[0]],
      stack: field('Stack').split(' · '),
      phase: [card.querySelector('.portfolio-timeline [aria-current="step"]').childNodes[0].textContent],
      model: [field('Modèle économique')],
    };
  });
  for (const select of selects) {
    const labels = new Set(records.flatMap(record => record[select.dataset.facet]));
    for (const label of labels) select.append(new Option(label, normalize(label)));
  }
  function update() {
    const term = normalize(query.value);
    let found = 0;
    for (const record of records) {
      const matches = record.text.includes(term) && selects.every(select => !select.value || record[select.dataset.facet].some(label => normalize(label) === select.value));
      record.card.hidden = !matches;
      if (matches) found++;
    }
    count.textContent = found === 1 ? '1 projet trouvé' : `${found} projets trouvés`;
    empty.hidden = found !== 0;
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.getElementById('portfolio-reset').addEventListener('click', () => {
    query.value = '';
    selects.forEach(select => { select.value = ''; });
    update();
  });
  update();
  form.hidden = false;
})();