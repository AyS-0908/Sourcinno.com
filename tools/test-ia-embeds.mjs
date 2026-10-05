import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Integration check: real event handlers, a disposable DOM and SDK transport.
const source = readFileSync(new URL('../assets/js/ia-embeds.js', import.meta.url), 'utf8');
const element = () => ({ hidden: false, open: false, handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });
const video = element(), chat = element(), status = element();
let frame, calls = 0, imports = 0, fail = true, options;
const mount = element();
const sdk = new vm.SyntheticModule(['default'], function () {
  this.setExport('default', { initStandard(config) { calls++; options = config; } });
});
await sdk.link(() => {});
await sdk.evaluate();
const context = vm.createContext({
  document: {
    querySelector: selector => ({ '[data-video-launch]': video, '[data-chat]': chat, '[data-chat-status]': status, 'typebot-standard': mount })[selector],
    createElement: () => (frame = { setAttribute(name, value) { this[name] = value; }, focus() { this.focused = true; } }),
  },
  getComputedStyle: () => ({ getPropertyValue: name => ({ '--white': '#ffffff', '--grey-50': '#f5f8fc', '--navy': '#1a365d', '--teal-dark': '#247a78', '--font-body': 'Arial' })[name] }),
});
video.replaceWith = () => {};
new vm.Script(source, { importModuleDynamically: async () => { imports++; if (fail) throw Error('blocked'); return sdk; } }).runInContext(context);
assert.equal(imports, 0);
assert.equal(frame, undefined);
video.handlers.click();
assert.match(frame.src, /youtube-nocookie\.com\/embed\/hDFiKEFv5kA\?autoplay=1&playsinline=1/);
assert.equal(frame.referrerPolicy, 'origin');
assert.equal(frame.focused, true);
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
console.log('PASS: click-only loading, inline video, light published bot, blocked SDK retry, no duplicate conversation.');
