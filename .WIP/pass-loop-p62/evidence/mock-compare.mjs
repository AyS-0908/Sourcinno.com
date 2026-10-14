// p62 Done When 4, AGENTS Gotcha « a mockup stacked on the live stylesheet »: computed styles of the mocked Démarche
// section against the port, element by element, pseudo-elements included, at 1920, 1200, 960 and 375 px. The Pass 61 script
// (.WIP/pass-loop-p61/evidence/mock-compare.mjs) retargeted, tab parts dropped. Recipe = Pass 40 method: property names
// sorted, custom properties apart (left out), values read after the section is scrolled to and settled.
//  mock = the approved page (root previews/v12/index.html, byte-identical to .WIP/mockup-v12/index.html) placed in a scratch
//         copy of 0ab4687, so it runs on the stylesheet the port replaces: P62_MOCK, default http://127.0.0.1:4174/.WIP/mockup-v12/
//  port = the tree: P48_BASE + /
// Compared: section.m-demarche (mock) and section#demarche (port) and everything in them.
// Not compared: used lengths that only repeat the layout (GEOM); the boxes (width x height) are compared apart.
// usage (product root): P48_PROFILES=<scratch> node .WIP/pass-loop-p62/evidence/mock-compare.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, sleep } from './cdp.mjs';
const MOCK = process.env.P62_MOCK || 'http://127.0.0.1:4174/.WIP/mockup-v12/', PORT = BASE + '/';
const out = []; const log = s => { out.push(s); console.log(s); };

function pgStyles(rootSel) {
  const GEOM = /^(width|height|block-size|inline-size|top|right|bottom|left|inset.*|perspective-origin|transform-origin|grid-template-(rows|columns)|min-height|margin-(top|right|bottom|left)|margin-(block|inline)-(start|end)|d|cx|cy|x|y|r)$/;
  const root = document.querySelector(rootSel); if (!root) return null;
  const read = (e, pseudo) => { const cs = getComputedStyle(e, pseudo), o = {}; for (const name of [...cs].sort()) { if (name.startsWith('--') || GEOM.test(name)) continue; o[name] = cs.getPropertyValue(name); } return o; };
  const label = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  const r1 = n => Math.round(n * 10) / 10, list = [];
  for (const e of [root, ...root.querySelectorAll('*')]) for (const ps of [null, '::before', '::after']) {
    if (ps && getComputedStyle(e, ps).content === 'none') { list.push({ who: label(e) + ps, none: true }); continue; }
    const cs = ps ? getComputedStyle(e, ps) : null;
    list.push({ who: label(e) + (ps || ''), st: read(e, ps), box: ps ? [r1(parseFloat(cs.width) || 0), r1(parseFloat(cs.height) || 0)] : [r1(e.getBoundingClientRect().width), r1(e.getBoundingClientRect().height)] });
  }
  const b = root.getBoundingClientRect(), steps = [...root.querySelectorAll('.dm-step')];
  return { list, w: r1(b.width), h: r1(b.height), cw: document.documentElement.clientWidth, rows: new Set(steps.map(t => Math.round(t.getBoundingClientRect().top))).size, steps: steps.map(t => r1(t.getBoundingClientRect().width) + 'x' + r1(t.getBoundingClientRect().height)).join(' ') };
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
  for (const W of [1920, 1200, 960, 375]) {
    const m = await read(b, MOCK, '.m-demarche', W), t = await read(b, PORT, '#demarche', W);
    if (!m || !t) { log(`== ${W} px: section not found (mock ${!!m}, port ${!!t}): NOT COMPARED`); total++; continue; }
    log(`== ${W} px (layout width ${t.cw}): mock section ${m.w}x${m.h}, stages ${m.steps} on ${m.rows} row(s)`);
    log(`   ${' '.repeat(String(W).length)}                     port section ${t.w}x${t.h}, stages ${t.steps} on ${t.rows} row(s)`);
    if (m.list.length !== t.list.length) { log(`   elements and pseudo-elements: mock ${m.list.length}, port ${t.list.length}: NOT COMPARABLE position by position`); total++; continue; }
    const byProp = new Map(); let same = 0; const tagOff = [], boxOff = [];
    for (let i = 0; i < t.list.length; i++) {
      const a = m.list[i], z = t.list[i]; if (a.who !== z.who) tagOff.push(`${a.who} / ${z.who}`);
      if (!!a.none !== !!z.none) { const k = 'pseudo-element present'; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock ${a.none ? 'none' : 'present'}, port ${z.none ? 'none' : 'present'}`); continue; }
      if (a.none) { same++; continue; }
      let d = 0; for (const k of new Set([...Object.keys(a.st), ...Object.keys(z.st)])) if (a.st[k] !== z.st[k]) { d++; (byProp.get(k) || byProp.set(k, []).get(k)).push(`${z.who}: mock « ${a.st[k]} » port « ${z.st[k]} »`); }
      if (!d) same++;
      if (a.box[0] !== z.box[0] || a.box[1] !== z.box[1]) boxOff.push(`${z.who} mock ${a.box.join('x')} port ${z.box.join('x')}`);
    }
    log(`   ${t.list.length} elements and pseudo-elements compared (${Object.keys(t.list.find(x => x.st).st).length} properties each), identical ${same}, different label at the same position ${tagOff.length}${tagOff.length ? ' — ' + tagOff.slice(0, 3).join(' | ') : ''}`);
    for (const [k, v] of [...byProp].sort()) { total += v.length; log(`   DIFF ${k}: ${v.length} place(s) — ${[...new Set(v)].slice(0, 4).join(' | ')}${v.length > 4 ? ' | …' : ''}`); }
    if (!byProp.size) log('   no computed-style difference');
    log(`   boxes (width x height, pseudo-elements included) that differ: ${boxOff.length}${boxOff.length ? ' — ' + boxOff.slice(0, 8).join(' | ') : ''}`);
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
log(`MOCK-COMPARE: ${total} computed-style difference(s) in all`);
writeFileSync(join(import.meta.dirname, 'mock-compare.txt'), out.join('\n') + '\n');
setTimeout(() => process.exit(0), 500);
