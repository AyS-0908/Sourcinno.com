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
// The chat starts by itself when its section comes on screen: an IntersectionObserver stub records the callback and
// the target; the test fires it. Without the observer, the chat starts at once.
const section = { id: 'reflexion' };
const chat = Object.assign(element(), { closest: () => section }), status = element();
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
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r)); };
const observers = [];
class IntersectionObserver {
  constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; this.disconnected = 0; observers.push(this); }
  observe(target) { this.targets.push(target); }
  disconnect() { this.disconnected++; }
}
const see = async (io, isIntersecting = true) => { io.callback([{ isIntersecting, target: io.targets[0] }], io); await settle(); };
const run = (doc, withObserver = true) => {
  const global = { document: doc, getComputedStyle };
  if (withObserver) global.IntersectionObserver = IntersectionObserver;
  global.window = global;
  new vm.Script(source, { importModuleDynamically: load }).runInContext(vm.createContext(global));
};
run({ querySelector: selector => ({ '[data-chat]': chat, '[data-chat-status]': status, 'typebot-standard': mount })[selector] });
await settle();
assert.equal(observers.length, 1, 'one observer');
const io = observers[0];
assert.deepEqual(io.targets, [section], 'the observer watches the chat section');
assert.equal(imports.length, 0, 'nothing loaded before the section is seen');
await see(io, false);
assert.equal(imports.length, 0, 'a section leaving the screen loads nothing');
// Seen with the SDK blocked: one import, no conversation, the message, the observer kept for a later try.
await see(io);
assert.deepEqual(imports, [SPECIFIER]);
assert.equal(calls, 0);
assert.match(status.textContent, /indisponible/);
assert.equal(io.disconnected, 0);
// Seen again, SDK reachable: one conversation, the observer disconnected.
fail = false;
await see(io);
assert.equal(calls, 1);
assert.equal(imports.length, 2);
assert.equal(mount.hidden, false);
assert.equal(status.hidden, true);
assert.equal(io.disconnected, 1);
assert.equal(options.typebot, 'paiement-produit-num-rique-o8lsepu');
assert.equal(options.previewTheme.general.background.content, '#ffffff');
assert.equal(options.previewTheme.chat.buttons.backgroundColor, '#247a78');
assert.equal(options.isPreview, undefined);
// A second sight (a callback already queued): no second import, no second conversation.
await see(io);
assert.equal(calls, 1);
assert.deepEqual(imports, [SPECIFIER, SPECIFIER]);

// A page without [data-chat-status] and a browser without IntersectionObserver: the chat starts at once.
const bare = Object.assign(element(), { closest: () => null }), bareMount = element();
bareMount.hidden = true;
run({ querySelector: selector => ({ '[data-chat]': bare, 'typebot-standard': bareMount })[selector] ?? null }, false);
await settle();
assert.equal(observers.length, 1, 'no observer created without IntersectionObserver');
assert.equal(calls, 2);
assert.equal(bareMount.hidden, false);
assert.equal(imports.length, 3);

// A page without the chat: no observer, nothing loaded.
run({ querySelector: () => null });
await settle();
assert.equal(observers.length, 1);
assert.equal(imports.length, 3);
console.log('PASS: video.js click-only, each launcher embeds its own id (youtube-nocookie, focused), frame title = visible caption without « (nouvel onglet) », else the launcher label; chat started on view by an IntersectionObserver on its section (nothing loaded before, one conversation when seen, none twice; blocked SDK retried on the next sight, then the observer disconnected), at once without the observer, from the local pinned copy, light published bot, no status line needed.');
