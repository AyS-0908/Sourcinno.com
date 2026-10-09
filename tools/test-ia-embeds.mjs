import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Integration check: real event handlers, a disposable DOM and SDK transport.
const element = () => ({ hidden: false, open: false, handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });

// video.js: two launchers, nothing created before a click, each click embeds its own id.
const player = readFileSync(new URL('../assets/js/video.js', import.meta.url), 'utf8');
const frames = [];
const launcher = (id, title) => Object.assign(element(), {
  dataset: { video: id },
  getAttribute: () => `Lire la vidéo « ${title} »`,
  closest: () => ({ querySelector: () => ({ textContent: ` Vidéo « ${title} » ` }) }),
  replaceWith(node) { this.replacedBy = node; },
});
const one = launcher('hDFiKEFv5kA', 'AI for BUSINESS'), two = launcher('QtzlMHaUGyM', 'corpangels Corporates — July23');
vm.runInContext(player, vm.createContext({
  document: {
    querySelectorAll: selector => (selector === 'button[data-video]' ? [one, two] : []),
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
assert.ok(frames.every(f => f.referrerPolicy === 'origin' && f.focused && f.allowfullscreen === '' && /autoplay/.test(f.allow)));

// ia-embeds.js: the Typebot chat only.
const source = readFileSync(new URL('../assets/js/ia-embeds.js', import.meta.url), 'utf8');
const chat = element(), status = element();
let calls = 0, imports = 0, fail = true, options;
const mount = element();
const sdk = new vm.SyntheticModule(['default'], function () {
  this.setExport('default', { initStandard(config) { calls++; options = config; } });
});
await sdk.link(() => {});
await sdk.evaluate();
const context = vm.createContext({
  document: {
    querySelector: selector => ({ '[data-chat]': chat, '[data-chat-status]': status, 'typebot-standard': mount })[selector],
  },
  getComputedStyle: () => ({ getPropertyValue: name => ({ '--white': '#ffffff', '--grey-50': '#f5f8fc', '--navy': '#1a365d', '--teal-dark': '#247a78', '--font-body': 'Arial' })[name] }),
});
new vm.Script(source, { importModuleDynamically: async () => { imports++; if (fail) throw Error('blocked'); return sdk; } }).runInContext(context);
assert.equal(imports, 0);
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
assert.equal(imports, 2);
console.log('PASS: video.js click-only, two launchers embed their own id (youtube-nocookie, focused); chat click-only loading, light published bot, blocked SDK retry, no duplicate conversation.');
