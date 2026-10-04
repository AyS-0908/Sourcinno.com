import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// ponytail: a tiny DOM fixture executes the shipped script; real browser checks own layout/AX.
const html = readFileSync(new URL('../portfolio/index.html', import.meta.url), 'utf8');
const text = s => s.replace(/<[^>]*>/g, '').trim();
const cards = [...html.matchAll(/<article\b[^>]*class="portfolio-card"[^>]*>([\s\S]*?)<\/article>/g)].map(([, body]) => {
  const headings = [...body.matchAll(/<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)].map(([, title, value]) => ({ textContent: text(title), nextElementSibling: { textContent: text(value) } }));
  const tags = body.match(/<div class="portfolio-tags">([\s\S]*?)<\/div>/)[1];
  return { hidden: false, textContent: text(body),
    querySelectorAll: () => headings,
    querySelector: selector => selector.includes('aria-current')
      ? { childNodes: [{ textContent: text(body.match(/<li aria-current="step">([^<]*)/)[1]) }] }
      : { textContent: text(tags.match(/<span>(.*?)<\/span>/)[1]) },
  };
});
const listeners = {};
const query = { value: '' };
const count = { textContent: '' };
const empty = { hidden: true };
const reset = { addEventListener: (type, fn) => { listeners.reset = fn; } };
const selects = ['sector', 'persona', 'stack', 'phase', 'model'].map(facet => ({ dataset: { facet }, value: '', options: [], append(option) { this.options.push(option); } }));
const form = { hidden: true, querySelectorAll: () => selects, addEventListener: (type, fn) => { listeners[type] = fn; } };
const document = { getElementById: id => ({ 'portfolio-filter': form, 'portfolio-query': query, 'portfolio-count': count, 'portfolio-empty': empty, 'portfolio-reset': reset })[id], querySelectorAll: () => cards };
vm.runInNewContext(readFileSync(new URL('../assets/js/portfolio.js', import.meta.url), 'utf8'), { document, Option: function(label, value) { this.label = label; this.value = value; } });
const visible = () => cards.flatMap((card, i) => card.hidden ? [] : [i]);
const filter = (term = '', facets = {}) => {
  query.value = term;
  selects.forEach(select => { select.value = facets[select.dataset.facet] || ''; });
  listeners.input();
  return visible();
};
assert.equal(form.hidden, false);
assert.deepEqual(visible(), [0, 1, 2, 3]);
assert.equal(count.textContent, '4 projets trouvés');
assert.deepEqual(filter('pRéPaReR'), [1]);
assert.deepEqual(filter('ETAPES OUBLIEES'), [0]);
assert.deepEqual(filter('', { sector: 'immobilier' }), [0]);
assert.deepEqual(filter('', { persona: 'b2b' }), [0, 1, 2]);
assert.deepEqual(filter('', { persona: 'persona a preciser' }), [3]);
assert.deepEqual(filter('', { stack: 'a definir pour le produit' }), [0]);
assert.deepEqual(filter('', { stack: 'excel' }), [2]);
assert.deepEqual(filter('', { phase: 'idee / maquette' }), [0]);
assert.deepEqual(filter('', { phase: 'dev / tests' }), [1, 2, 3]);
assert.deepEqual(filter('', { model: 'a confirmer' }), [0, 1, 2, 3]);
assert.deepEqual(filter('questionnaires', { sector: 'organisation', persona: 'b2b', stack: 'excel', phase: 'dev / tests', model: 'a confirmer' }), [2]);
assert.equal(count.textContent, '1 projet trouvé');
assert.deepEqual(filter('', { sector: 'immobilier', stack: 'excel' }), []);
assert.equal(empty.hidden, false);
assert.deepEqual(filter('<img src=x onerror=alert(1)>'), []);
listeners.reset();
assert.deepEqual(visible(), [0, 1, 2, 3]);
assert.equal(query.value, '');
assert.ok(selects.every(select => select.value === ''));
assert.equal(empty.hidden, true);
assert.deepEqual(selects[2].options.map(option => option.label), ['À définir pour le produit', 'Apps Script', 'Sheets', 'Excel', 'VBA', 'PowerShell', 'n8n', 'HTTP']);
let prevented = false;
listeners.submit({ preventDefault() { prevented = true; } });
assert.equal(prevented, true);
console.log('PASS: public-card search, all five facets/unknowns, AND, empty/literal query, reset, submit guard');