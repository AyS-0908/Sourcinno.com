// p61, AGENTS Gotcha « a mockup stacked on the live stylesheet »: computed styles of the mocked « +25 ans d'expérience »
// block against the port, element by element, pseudo-elements included, at 1920, 1200 and 961 px (tabs mode, on load:
// first tab active). The Pass 56 script retargeted. Recipe = Pass 40 method: property names sorted, custom properties
// apart, values read after a settle wait.
//  mock = the approved page (root previews/v12: index.html + mock.js) placed in a scratch copy of cb0bfbf (the tree before
//         Pass 56, so the page runs on the stylesheet and script it was approved on): P61_MOCK, default
//         http://127.0.0.1:4175/.WIP/mockup-v12/
//  port = the tree: P48_BASE + /
// Compared: the two-column grid of the section (timeline + panel) and everything in it.
// Not compared: used lengths that only repeat the layout (width, height, inset, margins resolved from auto, origins), listed
// in GEOM; the boxes (width x height) are compared apart.
// usage (product root): P48_PROFILES=<scratch> node .WIP/pass-loop-p61/evidence/mock-compare.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, sleep } from './cdp.mjs';
const MOCK = process.env.P61_MOCK || 'http://127.0.0.1:4175/.WIP/mockup-v12/', PORT = BASE + '/';
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
  const b = root.getBoundingClientRect(), pn = root.querySelector('.hl__detail'), tabs = [...root.querySelectorAll('.hl__items > details')];
  return { list, hover: root.querySelectorAll('.hl.is-hover').length, active: root.querySelectorAll('.is-active').length, w: b.width, h: Math.round(b.height * 10) / 10, cw: document.documentElement.clientWidth,
    min: root.querySelector('.hl').style.getPropertyValue('--hl-min'), panel: pn ? Math.round(pn.getBoundingClientRect().width * 10) / 10 + 'x' + Math.round(pn.getBoundingClientRect().height * 10) / 10 : '?', tabs: tabs.map(t => Math.round(t.getBoundingClientRect().width * 10) / 10 + 'x' + Math.round(t.getBoundingClientRect().height * 10) / 10).join(' '), lines: new Set(tabs.map(t => Math.round(t.getBoundingClientRect().top))).size };
}
async function read(b, url, sel, W) {
  const p = await b.page(W, { height: 1400 }); await p.s('Page.navigate', { url });
  for (let i = 0; i < 120; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
  await sleep(700); const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); }
  await p.ev(`(document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'start',behavior:'instant'}),1)`); await sleep(1500);
  const g = await p.ev(`(${pgStyles})(${JSON.stringify(sel)})`); await p.close(); return g;
}
const b = await browser(); let total = 0;
try {
  for (const W of [1920, 1200, 961]) {
    const m = await read(b, MOCK, '[data-xp="t"] .m-experience .grid--2', W), t = await read(b, PORT, '#experience .grid--2', W);
    log(`== ${W} px (layout width ${t.cw}): mock block ${m.w}x${m.h}, tabs mode ${m.hover}, active tabs ${m.active}, tabs ${m.tabs} on ${m.lines} line(s), panel ${m.panel}, reserve ${m.min}`);
    log(`   ${' '.repeat(String(W).length)}                              port block ${t.w}x${t.h}, tabs mode ${t.hover}, active tabs ${t.active}, tabs ${t.tabs} on ${t.lines} line(s), panel ${t.panel}, reserve ${t.min}`);
    if (m.list.length !== t.list.length) { log(`   elements and pseudo-elements: mock ${m.list.length}, port ${t.list.length}: NOT COMPARABLE position by position`); total++; continue; }
    const byProp = new Map(); let same = 0, tagOff = 0, boxOff = [];
    for (let i = 0; i < t.list.length; i++) {
      const a = m.list[i], z = t.list[i]; if (a.who !== z.who) tagOff++;
      if (!!a.none !== !!z.none) { const k = 'pseudo-element present'; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock ${a.none ? 'none' : 'present'}, port ${z.none ? 'none' : 'present'}`); continue; }
      if (a.none) { same++; continue; }
      let d = 0; for (const k of new Set([...Object.keys(a.st), ...Object.keys(z.st)])) if (a.st[k] !== z.st[k]) { d++; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock « ${a.st[k]} » port « ${z.st[k]} »`); }
      if (!d) same++;
      if (a.box && (a.box[0] !== z.box[0] || a.box[1] !== z.box[1])) boxOff.push(`${z.who} mock ${a.box.join('x')} port ${z.box.join('x')}`);
    }
    log(`   ${t.list.length} elements and pseudo-elements compared (${Object.keys(t.list.find(x => x.st).st).length} properties each), identical ${same}, different label at the same position ${tagOff}`);
    for (const [k, v] of [...byProp].sort()) { total += v.length; log(`   DIFF ${k}: ${v.length} place(s) — ${[...new Set(v)].slice(0, 4).join(' | ')}${v.length > 4 ? ' | …' : ''}`); }
    if (!byProp.size) log('   no computed-style difference');
    log(`   boxes (width x height) that differ: ${boxOff.length}${boxOff.length ? ' — ' + boxOff.slice(0, 8).join(' | ') : ''}`);
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
log(`MOCK-COMPARE: ${total} computed-style difference(s) in all`);
writeFileSync(join(import.meta.dirname, 'mock-compare.txt'), out.join('\n') + '\n');
setTimeout(() => process.exit(0), 500);
