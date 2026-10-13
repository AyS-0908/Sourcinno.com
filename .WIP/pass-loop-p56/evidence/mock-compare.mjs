// p56, AGENTS Gotcha « a mockup stacked on the live stylesheet »: computed styles of the mocked Stratégie block against the
// port, element by element, pseudo-elements included, at 1920, 1200 and 961 px (hover mode, on load: first row of each
// list active). Recipe = Pass 40 method: property names sorted, custom properties apart, values read after a settle wait.
//  mock = the approved page (root previews/v12: index.html + mock.js) placed in a scratch copy of cb0bfbf, so it runs on
//         the stylesheet and script it was approved on: P56_MOCK, default http://127.0.0.1:4174/.WIP/mockup-v12/
//  port = the tree: P48_BASE + /service-strategie-transformation/
// Not compared: used lengths that only repeat the layout (width, height, inset, margins resolved from auto, origins), listed in GEOM.
// usage (product root): P48_PROFILES=<scratch> node .WIP/pass-loop-p56/evidence/mock-compare.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, sleep } from './cdp.mjs';
const MOCK = process.env.P56_MOCK || 'http://127.0.0.1:4174/.WIP/mockup-v12/', PORT = BASE + '/service-strategie-transformation/';
const out = []; const log = s => { out.push(s); console.log(s); };

function pgStyles(rootSel) {
  const GEOM = /^(width|height|block-size|inline-size|top|right|bottom|left|inset.*|perspective-origin|transform-origin|grid-template-(rows|columns)|min-height|margin-(top|right|bottom|left)|margin-(block|inline)-(start|end)|d|cx|cy|x|y|r)$/;
  const root = document.querySelector(rootSel); if (!root) return null;
  const read = (e, pseudo) => { const cs = getComputedStyle(e, pseudo), o = {}; for (const name of [...cs].sort()) { if (name.startsWith('--') || GEOM.test(name)) continue; o[name] = cs.getPropertyValue(name); } return o; };
  const label = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  const list = [];
  for (const e of [root, ...root.querySelectorAll('*')]) for (const ps of [null, '::before', '::after']) {
    if (ps && getComputedStyle(e, ps).content === 'none') { list.push({ who: label(e) + ps, none: true }); continue; }
    list.push({ who: label(e) + (ps || ''), st: read(e, ps), box: ps ? null : [Math.round(e.getBoundingClientRect().width * 10) / 10, Math.round(e.getBoundingClientRect().height * 10) / 10] });
  }
  const b = root.getBoundingClientRect();
  return { list, hover: root.querySelectorAll('.hl.is-hover').length, active: root.querySelectorAll('.is-active').length, w: b.width, h: Math.round(b.height * 10) / 10, cw: document.documentElement.clientWidth };
}
async function read(b, url, sel, W) {
  const p = await b.page(W, { height: 1400 }); await p.s('Page.navigate', { url });
  for (let i = 0; i < 120; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
  await sleep(700); const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); }
  await p.ev(`(document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'start',behavior:'instant'}),1)`); await sleep(1500);
  const g = await p.ev(`(${pgStyles})(${JSON.stringify(sel)})`); await p.close(); return g;
}
// class names differ by design (m-besoin, hl…): compare by position, name the element by the port's label
const strip = who => who.replace(/\.(hl__items|hl__detail|hl|is-hover|is-active|is-swap|m-besoin|reveal|is-visible)(?=\.|:|$)/g, '');
const b = await browser(); let total = 0;
try {
  for (const W of [1920, 1200, 961]) {
    const m = await read(b, MOCK, '.m-besoin .service-phases', W), t = await read(b, PORT, '#besoin .service-phases', W);
    log(`== ${W} px (layout width ${t.cw}): mock block ${m.w}x${m.h}, ${m.hover} lists in hover mode, ${m.active} active rows; port block ${t.w}x${t.h}, ${t.hover} lists in hover mode, ${t.active} active rows`);
    if (m.list.length !== t.list.length) { log(`   elements and pseudo-elements: mock ${m.list.length}, port ${t.list.length}: NOT COMPARABLE position by position`); total++; continue; }
    const byProp = new Map(); let same = 0, tagOff = 0, boxOff = [];
    for (let i = 0; i < t.list.length; i++) {
      const a = m.list[i], z = t.list[i]; if (strip(a.who) !== strip(z.who)) tagOff++;
      if (!!a.none !== !!z.none) { const k = 'pseudo-element present'; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock ${a.none ? 'none' : 'present'}, port ${z.none ? 'none' : 'present'}`); continue; }
      if (a.none) { same++; continue; }
      let d = 0; for (const k of new Set([...Object.keys(a.st), ...Object.keys(z.st)])) if (a.st[k] !== z.st[k]) { d++; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock « ${a.st[k]} » port « ${z.st[k]} »`); }
      if (!d) same++;
      if (a.box && (a.box[0] !== z.box[0] || a.box[1] !== z.box[1])) boxOff.push(`${z.who} mock ${a.box.join('x')} port ${z.box.join('x')}`);
    }
    log(`   ${t.list.length} elements and pseudo-elements compared (${Object.keys(t.list.find(x => x.st).st).length} properties each), identical ${same}, different label at the same position ${tagOff}`);
    for (const [k, v] of [...byProp].sort()) { total += v.length; log(`   DIFF ${k}: ${v.length} place(s) — ${[...new Set(v)].slice(0, 3).join(' | ')}${v.length > 3 ? ' | …' : ''}`); }
    if (!byProp.size) log('   no computed-style difference');
    log(`   boxes (width x height) that differ: ${boxOff.length}${boxOff.length ? ' — ' + boxOff.slice(0, 6).join(' | ') : ''}`);
  }
} finally { await b.close(); }
log(`MOCK-COMPARE: ${total} computed-style difference(s) in all`);
writeFileSync(join(import.meta.dirname, 'mock-compare.txt'), out.join('\n') + '\n');
