import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Integration check: real event handlers, a disposable DOM and SDK transport.
const element = () => ({ hidden: false, open: false, handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });

// video.js: launchers, nothing created before a click, each click embeds its own id; the frame title is the
// caption's visible text (its hidden « (nouvel onglet) » span removed from a copy), else the launcher's label.
const player = readFileSync(new URL('../assets/js/video.js', import.meta.url), 'utf8');
const frames = [];
const caption = (parts) => ({
  parts,
  get textContent() { return this.parts.map(p => p.text).join(''); },
  cloneNode: () => caption(parts.map(p => ({ ...p }))),
  querySelectorAll(selector) {
    assert.equal(selector, '.visually-hidden');
    return this.parts.filter(p => p.hidden).map(p => ({ remove: () => { this.parts = this.parts.filter(q => q !== p); } }));
  },
});
const captions = [];
const launcher = (id, title, figure = true) => Object.assign(element(), {
  dataset: { video: id },
  getAttribute: () => `Lire la vidéo « ${title} »`,
  closest: () => {
    if (!figure) return null;
    const c = caption([{ text: ` Vidéo « ${title} »` }, { text: ' (nouvel onglet)', hidden: true }, { text: ' ' }]);
    captions.push(c);
    return { querySelector: () => c };
  },
  replaceWith(node) { this.replacedBy = node; },
});
const one = launcher('hDFiKEFv5kA', 'AI for BUSINESS'), two = launcher('QtzlMHaUGyM', 'corpangels Corporates — July23');
const bareLaunch = launcher('GEh_2faSLb0', 'Du PIB au BCI', false);
vm.runInContext(player, vm.createContext({
  document: {
    querySelectorAll: selector => (selector === 'button[data-video]' ? [one, two, bareLaunch] : []),
    createElement: () => { const f = { setAttribute(name, value) { this[name] = value; }, focus() { this.focused = true; } }; frames.push(f); return f; },
  },
}));
assert.equal(frames.length, 0);
two.handlers.click();
one.handlers.click();
assert.equal(frames.length, 2);
assert.equal(frames[0].src, 'https://www.youtube-nocookie.com/embed/QtzlMHaUGyM?autoplay=1&playsinline=1');
assert.equal(frames[1].src, 'https://www.youtube-nocookie.com/embed/hDFiKEFv5kA?autoplay=1&playsinline=1');
assert.equal(two.replacedBy, frames[0]);
assert.equal(one.replacedBy, frames[1]);
assert.equal(frames[0].title, 'Vidéo « corpangels Corporates — July23 »');
assert.equal(frames[1].title, 'Vidéo « AI for BUSINESS »');
assert.ok(captions.every(c => c.textContent.includes('(nouvel onglet)')), 'the page caption itself keeps its hidden notice');
bareLaunch.handlers.click();
assert.equal(frames[2].title, 'Lire la vidéo « Du PIB au BCI »');
assert.ok(frames.every(f => f.referrerPolicy === 'origin' && f.focused && f.allowfullscreen === '' && /autoplay/.test(f.allow)));

// ia-embeds.js: the Typebot chat only, from the pinned local copy (tools/check.mjs checks its SHA-256).
const SPECIFIER = '/assets/js/vendor/typebot-js-0.10.11/web.js';
const source = readFileSync(new URL('../assets/js/ia-embeds.js', import.meta.url), 'utf8');
assert.deepEqual([...source.matchAll(/\bimport\(\s*(['"`])(.*?)\1\s*\)/g)].map(m => m[2]), [SPECIFIER]);
const chat = element(), status = element();
let calls = 0, fail = true, options;
const imports = [];
const mount = element();
const sdk = new vm.SyntheticModule(['default'], function () {
  this.setExport('default', { initStandard(config) { calls++; options = config; } });
});
await sdk.link(() => {});
await sdk.evaluate();
const load = async specifier => { imports.push(specifier); if (fail) throw Error('blocked'); return sdk; };
const getComputedStyle = () => ({ getPropertyValue: name => ({ '--white': '#ffffff', '--grey-50': '#f5f8fc', '--navy': '#1a365d', '--teal-dark': '#247a78', '--font-body': 'Arial' })[name] });
const context = vm.createContext({
  document: {
    querySelector: selector => ({ '[data-chat]': chat, '[data-chat-status]': status, 'typebot-standard': mount })[selector],
  },
  getComputedStyle,
});
new vm.Script(source, { importModuleDynamically: load }).runInContext(context);
assert.equal(imports.length, 0);
chat.open = true;
await chat.handlers.toggle();
assert.equal(calls, 0);
assert.match(status.textContent, /indisponible/);
fail = false;
chat.open = false;
await chat.handlers.toggle();
chat.open = true;
await chat.handlers.toggle();
assert.equal(calls, 1);
assert.equal(options.typebot, 'paiement-produit-num-rique-o8lsepu');
assert.equal(options.previewTheme.general.background.content, '#ffffff');
assert.equal(options.previewTheme.chat.buttons.backgroundColor, '#247a78');
assert.equal(options.isPreview, undefined);
await chat.handlers.toggle();
assert.equal(calls, 1);
assert.deepEqual(imports, [SPECIFIER, SPECIFIER]);

// A page without [data-chat-status]: a blocked SDK throws nothing, the retry still opens the chat.
const bare = element(), bareMount = element();
bareMount.hidden = true;
fail = true;
new vm.Script(source, { importModuleDynamically: load }).runInContext(vm.createContext({
  document: { querySelector: selector => ({ '[data-chat]': bare, 'typebot-standard': bareMount })[selector] ?? null },
  getComputedStyle,
}));
bare.open = true;
await bare.handlers.toggle();
fail = false;
bare.open = false;
await bare.handlers.toggle();
bare.open = true;
await bare.handlers.toggle();
assert.equal(calls, 2);
assert.equal(bareMount.hidden, false);
// Opened once: closing and reopening starts no second conversation (pins the second status guard).
bare.open = false;
await bare.handlers.toggle();
bare.open = true;
await bare.handlers.toggle();
assert.equal(calls, 2);
console.log('PASS: video.js click-only, each launcher embeds its own id (youtube-nocookie, focused), frame title = visible caption without « (nouvel onglet) », else the launcher label; chat click-only loading from the local pinned copy, light published bot, blocked SDK retry, no duplicate conversation, no status line needed.');
