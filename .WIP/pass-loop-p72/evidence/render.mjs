// Pass 72 render checks (DW2: AUTO-3..6, AUTO-9) in headless Chrome. NEW = working tree, BASE = b9df13a export (texts).
// usage (from the product): P72_NEW=http://127.0.0.1:4181 P72_BASE=http://127.0.0.1:4182 P48_PROFILES=<scratch> node .WIP/pass-loop-p72/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const NEW = process.env.P72_NEW || 'http://127.0.0.1:4181';
const BASE = process.env.P72_BASE || 'http://127.0.0.1:4182';
const out = []; let bad = 0, total = 0;
const log = (s) => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
const WORDS = (s) => s.replace(/[«»"()·:,…?!→×+.]/g, ' ').replace(/’/g, "'").split(/\s+/).filter((w) => w && !/^\d+$/.test(w));
// DOM text of the given roots, .visually-hidden / aria-hidden / extra selector removed (hidden elements included).
const TEXT = (sels, drop = '') => `(() => [${sels.map((s) => `'${s}'`).join(',')}].map(sel => { const c = document.querySelector(sel).cloneNode(true); c.querySelectorAll('.visually-hidden, [aria-hidden=true]${drop ? ', ' + drop : ''}').forEach(x => x.remove()); const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); const t = []; while (w.nextNode()) t.push(w.currentNode.textContent); return t.join(' '); }).join(' '))()`;
const OVERFLOW = (W) => `(() => { const bad = []; for (const e of document.querySelectorAll('main *')) { if (e.closest('[hidden]') || e.closest('.visually-hidden')) continue; const cs = getComputedStyle(e); if (cs.position === 'absolute' && cs.clip === 'rect(0px, 0px, 0px, 0px)') continue; if (!e.getClientRects().length) continue; let clipped = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'auto' || o === 'clip' || o === 'scroll') { const ar = a.getBoundingClientRect(); if (ar.right <= ${W} + 0.5 && ar.left >= -0.5) { clipped = true; break; } } } if (clipped) continue; const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.right > ${W} + 0.5 || r.left < -0.5) bad.push(e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); } return bad; })()`;
// Every end dot of the lines: within 2 px of the box it points to (in: the node; outN: branch N).
const DOTS = `(() => { const vx = document.querySelector('#services .vx'); const o = vx.getBoundingClientRect(); const node = vx.querySelector('.vx-node').getBoundingClientRect(); const br = [...vx.querySelectorAll('.vx-branch')].map(e => e.getBoundingClientRect()); const far = (x, y, r) => { const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom); if (dx || dy) return Math.hypot(dx, dy); return Math.min(x - r.left, r.right - x, y - r.top, r.bottom - y); }; return [...vx.querySelectorAll('.vx-lines circle')].map(c => { const k = c.dataset.k.replace('dot-', ''); const x = o.left + +c.getAttribute('cx'), y = o.top + +c.getAttribute('cy'); const r = k.startsWith('in') ? node : br[+k.slice(3)]; return { k, d: Math.round(far(x, y, r) * 10) / 10 }; }); })()`;

async function load(b, url, W, opts = {}) {
  const p = await b.page(W, { height: opts.height || 900, ...opts });
  await p.s('Page.navigate', { url }); await sleep(1500);
  if (!p.nojs) await p.ev('document.fonts.ready.then(() => true)');
  return p;
}
async function click(p, sel) {
  await p.ev(`document.querySelector('${sel}').scrollIntoView({ block: 'center' })`); await sleep(250);
  const c = await p.ev(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await p.s('Input.dispatchMouseEvent', { type, x: c[0], y: c[1], button: 'left', clickCount: 1 });
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
  await sleep(150);
}
async function key(p, k, mods = 0) {
  const codes = { Enter: 13, ' ': 32, ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, Tab: 9 };
  await p.s('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k === ' ' ? 'Space' : k, windowsVirtualKeyCode: codes[k], modifiers: mods, text: k === 'Enter' ? '\r' : k === ' ' ? ' ' : undefined });
  await p.s('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k === ' ' ? 'Space' : k, windowsVirtualKeyCode: codes[k], modifiers: mods });
  await sleep(150);
}
const PANELS = `[...document.querySelectorAll('#demarche .mA-panel')].map(x => x.hidden ? 0 : 1).join('')`;
const ACTIVE = `(() => { const a = document.activeElement; return { id: a.id || a.className, fv: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth }; })()`;

const b = await browser();
try {
  // Reference words: BASE #services + #enjeux (minus its title « Enjeux ») + #demarche.
  const pb = await load(b, BASE + '/', 1200);
  const baseE = WORDS(await pb.ev(TEXT(['#services', '#enjeux'])));
  const iE = baseE.indexOf('Enjeux'); baseE.splice(iE, 1);
  const baseM = WORDS(await pb.ev(TEXT(['#demarche'])));
  await pb.close();
  log(`BASE words: Enjeux ${baseE.length} (title « Enjeux » removed at word ${iE}), Méthodologie ${baseM.length}`);

  for (const W of [1200, 961, 768, 375, 320]) {
    for (const nojs of [false, true]) {
      for (const reduce of [false, true]) {
        log(`\n== ${W} px · scripts ${nojs ? 'off' : 'on'} · motion ${reduce ? 'reduce' : 'no-preference'}`);
        const p = await load(b, NEW + '/', W, { nojs, reduce });
        if (!nojs) check(await p.ev('document.fonts.check("700 16px Inter")'), 'Inter loaded');
        // AUTO-3 texts
        const e = WORDS(await p.ev(TEXT(['#services']))), m = WORDS(await p.ev(TEXT(['#demarche'], '.mA-rail')));
        const rail = WORDS(await p.ev(`[...document.querySelectorAll('#demarche .mA-name')].map(x => x.textContent).join(' ')`));
        const same = (a, r) => a.length === r.length && a.every((w, i) => w === r[i]);
        const diff = (a, r) => { const i = a.findIndex((w, j) => w !== r[j]); return i < 0 ? `length ${a.length} vs ${r.length}` : `first difference at word ${i}: « ${a.slice(i, i + 4).join(' ')} » vs « ${r.slice(i, i + 4).join(' ')} »`; };
        check(same(e, baseE), `#services words = BASE #services + #enjeux minus « Enjeux », same order (${e.length})${same(e, baseE) ? '' : ': ' + diff(e, baseE)}`);
        check(same(m, baseM), `#demarche words (rail apart) = BASE #demarche, same order (${m.length})${same(m, baseM) ? '' : ': ' + diff(m, baseM)}`);
        check(rail.every((w) => baseM.includes(w)), `rail words ⊂ step words (${rail.join(' ')})`);
        check(await p.ev(`!document.getElementById('enjeux')`), 'no #enjeux section');
        if (nojs) {
          const v = await p.ev(`({ svg: document.querySelectorAll('#services .vx-lines').length + [...document.querySelectorAll('#services .vx svg')].filter(x => x.getClientRects().length).length, tree: !document.querySelector('#creation-valeur').hidden, branches: [...document.querySelectorAll('.vx-branch')].filter(x => x.getBoundingClientRect().height > 40).length, chev: document.querySelector('.vx-node__chev').getClientRects().length, panels: [...document.querySelectorAll('.mA-panel')].filter(x => x.getClientRects().length && x.getBoundingClientRect().height > 40).length, rail: document.querySelector('.mA-rail').getClientRects().length, roles: document.querySelectorAll('[role=tabpanel]').length, live: document.querySelectorAll('.is-live').length })`);
          check(v.svg === 0 && v.tree && v.branches === 3 && v.chev === 0, `scripts off: no .vx-lines and no SVG with a box in .vx, tree shown (3 branches), no chevron ${JSON.stringify(v)}`);
          check(v.panels === 4 && v.rail === 0 && v.roles === 0 && v.live === 0, 'scripts off: 4 steps shown, no rail, no tabpanel role');
          const of = await p.ev(OVERFLOW(W));
          check(!of.length, `nothing past ${W} px${of.length ? ': ' + of.slice(0, 6).join('; ') : ''}`);
          await p.close();
          continue;
        }
        // AUTO-4 tree
        const s0 = await p.ev(`({ exp: document.querySelector('.vx-node').getAttribute('aria-expanded'), hidden: document.querySelector('#creation-valeur').hidden, paths: document.querySelectorAll('.vx-lines path').length })`);
        check(s0.exp === 'false' && s0.hidden && s0.paths === 2, `tree closed at load, 2 lines ${JSON.stringify(s0)}`);
        check((await p.ev(DOTS)).every((d) => d.d <= 2), `closed: line ends on the node ${JSON.stringify(await p.ev(DOTS))}`);
        const of0 = await p.ev(OVERFLOW(W));
        check(!of0.length, `nothing past ${W} px, tree closed${of0.length ? ': ' + of0.slice(0, 6).join('; ') : ''}`);
        await click(p, '.vx-node'); await sleep(reduce ? 200 : 1000);
        if (reduce) {
          await click(p, '#mA-t2'); await sleep(100);
          const long = await p.ev(`document.getAnimations().filter(a => { const t = a.effect && a.effect.getComputedTiming(); return t && (t.duration > 50 || t.delay > 50) && a.playState === 'running'; }).map(a => a.animationName || a.transitionProperty)`);
          const live = await p.ev(`document.querySelectorAll('.vx-lines .draw, .is-entering').length`);
          check(!long.length && !live, `reduce: open + tab switch, no running animation over 50 ms, no .draw / .is-entering${long.length ? ' ' + long.join() : ''} (${live})`);
          await click(p, '#mA-t1');
        }
        const s1 = await p.ev(`(() => { const n = document.querySelector('.vx-node').getBoundingClientRect(); const bs = [...document.querySelectorAll('.vx-branch')].map(x => x.getBoundingClientRect()); return { exp: document.querySelector('.vx-node').getAttribute('aria-expanded'), n: bs.filter(r => r.height > 40).length, below: bs.every(r => r.top >= n.bottom), paths: document.querySelectorAll('.vx-lines path').length }; })()`);
        check(s1.exp === 'true' && s1.n === 3 && s1.below && s1.paths === 5, `mouse click opens: 3 branches below the node, 5 lines ${JSON.stringify(s1)}`);
        const d1 = await p.ev(DOTS);
        check(d1.length === 5 && d1.every((d) => d.d <= 2), `open: every line end on its box ${JSON.stringify(d1)}`);
        const of1 = await p.ev(OVERFLOW(W));
        check(!of1.length, `nothing past ${W} px, tree open${of1.length ? ': ' + of1.slice(0, 6).join('; ') : ''}`);
        const W2 = { 1200: 768, 961: 1200, 768: 1200, 375: 320, 320: 375 }[W];
        const before = await p.ev(`[...document.querySelectorAll('.vx-lines path')].map(x => x.getAttribute('d')).join('|')`);
        await p.s('Emulation.setDeviceMetricsOverride', { width: W2, height: 900, deviceScaleFactor: 1, mobile: W2 < 861 }); await sleep(500);
        const after = await p.ev(`[...document.querySelectorAll('.vx-lines path')].map(x => x.getAttribute('d')).join('|')`);
        const d2 = await p.ev(DOTS);
        check(after !== before && d2.length === 5 && d2.every((d) => d.d <= 2), `resized to ${W2}: lines redrawn, every end on its box ${JSON.stringify(d2)}`);
        await p.s('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 861 }); await sleep(500);
        check((await p.ev(DOTS)).every((d) => d.d <= 2), `back to ${W}: every end on its box`);
        await click(p, '.vx-node'); await sleep(300);
        check(await p.ev(`document.querySelector('#creation-valeur').hidden && document.querySelector('.vx-node').getAttribute('aria-expanded') === 'false' && document.querySelectorAll('.vx-lines path').length === 2`), 'second click closes, 2 lines');
        // keyboard: a real Tab from the second offer's link reaches the node
        await p.ev(`document.querySelector('.vx-src--2 .btn').focus()`);
        await key(p, 'Tab');
        const a1 = await p.ev(ACTIVE);
        check(a1.id === 'vx-node' && a1.fv && a1.outline.startsWith('solid'), `real Tab → node, :focus-visible, outline ${JSON.stringify(a1)}`);
        await key(p, 'Enter'); await sleep(reduce ? 100 : 800);
        const k1 = await p.ev(`!document.querySelector('#creation-valeur').hidden && document.querySelectorAll('.vx-lines path').length === 5`);
        await key(p, 'Enter'); await sleep(200);
        const k2 = await p.ev(`document.querySelector('#creation-valeur').hidden`);
        check(k1 && k2, `Enter opens (${k1}), Enter closes (${k2})`);
        // AUTO-5 tabs
        check(await p.ev(`[...document.querySelectorAll('#demarche [role=tab]')].filter(t => t.tabIndex === 0).length === 1 && document.querySelectorAll('[role=tabpanel]').length === 4 && !document.querySelector('.mA-rail').hidden && ${PANELS} === '1000'`), 'tabs live: one tab in the Tab order, 4 tabpanels, step 1 shown');
        const shift = [];
        const nextTop = `Math.round((document.querySelector('#demarche').nextElementSibling.getBoundingClientRect().top + scrollY) * 10) / 10`;
        for (const i of [1, 2, 3, 4]) { await click(p, `#mA-t${i}`); await sleep(100); shift.push(await p.ev(nextTop)); }
        const span = Math.max(...shift) - Math.min(...shift);
        if (W >= 961) check(span < 1, `page below does not move across the four steps (${shift.join(' / ')}, Δ ${span.toFixed(1)} px)`);
        else log(`   note no reserve under 861 px (Coder decision): section after #demarche at ${shift.join(' / ')} (Δ ${span.toFixed(1)} px)`);
        await click(p, '#mA-t3'); await sleep(200);
        check(await p.ev(`${PANELS} === '0010' && document.getElementById('mA-t3').getAttribute('aria-selected') === 'true' && document.getElementById('mA-t3').tabIndex === 0`), 'click on step 3 shows its panel only');
        const of2 = await p.ev(OVERFLOW(W));
        check(!of2.length, `nothing past ${W} px, step 3${of2.length ? ': ' + of2.slice(0, 6).join('; ') : ''}`);
        // a real Tab from the last tabbable element before the rail reaches the selected tab
        await p.ev(`(() => { const all = [...document.querySelectorAll('a[href], button, summary, input, select, textarea, [tabindex]')].filter(e => e.tabIndex >= 0 && e.getClientRects().length && !e.closest('[hidden]') && !(e.closest('details:not([open])') && e.tagName !== 'SUMMARY')); const t = document.getElementById('mA-t3'); const prev = all.filter(e => e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING).pop(); prev.focus(); return prev.outerHTML.slice(0, 60); })()`);
        await key(p, 'Tab');
        const a2 = await p.ev(ACTIVE);
        check(a2.id === 'mA-t3' && a2.fv && !a2.outline.startsWith('none'), `real Tab → selected tab, :focus-visible, outline ${JSON.stringify(a2)}`);
        const seq = [];
        for (const k of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'Home', 'End']) { await key(p, k); seq.push(await p.ev(`document.activeElement.id + ':' + ${PANELS} + ':' + document.activeElement.matches(':focus-visible')`)); }
        check(seq.join(' ') === 'mA-t4:0001:true mA-t1:1000:true mA-t4:0001:true mA-t1:1000:true mA-t4:0001:true', `→ → ← Home End: ${seq.join(' ')}`);
        if (p.errors.length) check(false, 'script errors: ' + p.errors.join(' | '));
        const ext = p.requests.filter((u) => !u.startsWith(NEW) && !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u) && !u.startsWith('data:'));
        check(!ext.length, `no request outside 127.0.0.1 and Google Fonts${ext.length ? ': ' + ext.slice(0, 4).join(' ') : ''}`);
        await p.close();
      }
    }
  }

  // AUTO-6 first screen 375×553 (touch, no scroll)
  for (const reduce of [false, true]) {
    const p = await load(b, NEW + '/', 375, { height: 553, reduce, touch: true });
    const r = await p.ev(`(() => { const h = document.querySelector('#services h2'); const r = h.getBoundingClientRect(); let op = 1; for (let x = h; x; x = x.parentElement) op *= +getComputedStyle(x).opacity; return { top: Math.round(r.top), bottom: Math.round(r.bottom), op, scroll: scrollY }; })()`);
    check(r.top >= 0 && r.bottom <= 553 && r.op === 1 && r.scroll === 0, `375×553 ${reduce ? 'reduce' : 'motion'}: « Votre enjeu » inside the window at load, opacity 1 ${JSON.stringify(r)}`);
    await p.close();
  }

  // AUTO-9 every shell page loading site.js: no script error; home tabs still in hover mode at 1200 (mouse)
  for (const path of ['/', '/404.html', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/publications/', '/service-ia-business/', '/service-performance/', '/service-venture-building/']) {
    for (const W of [1200, 375]) {
      const p = await load(b, NEW + path, W);
      const extra = path === '/' && W === 1200 ? await p.ev(`document.querySelector('#experience .hl--tabs').classList.contains('is-hover')`) : true;
      check(!p.errors.length && extra, `${path} ${W}: script errors ${p.errors.length}${path === '/' && W === 1200 ? ', #experience tabs is-hover ' + extra : ''}${p.errors.length ? ' ' + p.errors.join(' | ') : ''}`);
      await p.close();
    }
  }
} finally { await b.close(); }
log(`\n${total - bad}/${total} ok, ${bad} FAIL`);
writeFileSync(join(import.meta.dirname, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
