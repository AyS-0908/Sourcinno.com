// p67 Done When 3 (PLAN § 67): home page `/` against the owner's 2026-10-28 text. cdp.mjs = byte copy of the P66 helper
// (resolver: 127.0.0.1 and Google Fonts only; prefers-reduced-motion set explicitly on every page; touch under 861 px).
//  A. 1200/961/768/375/320 x scripts on/off x motion no-preference/reduce (20 cases), each on a fresh page after a scroll:
//     1. no element with a box (getClientRects non-empty) has a right edge past the emulated width (cards closed, then all open);
//     2. rendered text of `main` (innerText; `.visually-hidden` and the tabs panel copy `.hl__detail` set display:none, every
//        `details` opened) = target.txt, compared word by word after whitespace, NBSP and apostrophe normalisation;
//     3. « Enjeux » tree: root title then REVENUS, DÉPENSES, BFR in DOM order; 3 columns (tops equal, lefts rising) at >= 961, stacked below;
//        every ↗/↘ in an aria-hidden span followed by a .visually-hidden « hausse »/« baisse ».
//  B. P31 at 961 and 1100: stacked-card mode (scripts off; scripts on with touch): each timeline row bottom vs matching closed card bottom, |Δ| <= 8.
//  C. P56/P61 reserve: scripts on, mouse, 961/1100/1200: every tab shown, its panel content inside the panel; panel heights listed.
//  D. 375x553, scripts on, both motions, no scroll: « Votre enjeu » h2 inside the viewport and every opacity up its chain = 1.
// usage (product root): P48_PROFILES=<scratch> P67_NEW=http://127.0.0.1:4176 node .WIP/pass-loop-p67/evidence/render.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, NEW = process.env.P67_NEW || 'http://127.0.0.1:4176';
const norm = t => t.replace(/[  ]/g, ' ').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const TARGET = norm(readFileSync(join(HERE, 'target.txt'), 'utf8'));
const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
const info = text => log(`   info ${text}`);
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s: case abandoned')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }
const FONT = `document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`;

async function load(p, url, scroll = true) {
  await p.s('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(p.nojs ? `document.readyState==='complete'` : `document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(p.nojs ? 1500 : 700);
  if (scroll) { const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 400) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); await sleep(900); }
  return ready;
}

// Synchronous page functions (scripts-off pages cannot await: P30 Gotcha).
function pgOverflow(W) {
  const f = n => Math.round(n * 10) / 10, bad = [];
  for (const e of document.querySelectorAll('body *')) {
    const rs = e.getClientRects(); if (!rs.length) continue;
    const r = e.getBoundingClientRect(), right = r.right + scrollX;
    if (right > W + 0.5) bad.push(e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/)[0] : '') + ' ' + f(right));
  }
  return bad;
}
function pgOpen(on) {
  let st = document.getElementById('p67-text');
  if (on && !st) { st = document.createElement('style'); st.id = 'p67-text'; st.textContent = '.visually-hidden, .hl__detail { display: none !important; }'; document.head.appendChild(st); }
  if (!on && st) st.remove();
  document.querySelectorAll('main details').forEach(d => { d.open = on; });
  return document.querySelectorAll('main details[open]').length;
}
function pgTree() {
  const f = n => Math.round(n * 10) / 10, t = document.querySelector('#enjeux .vtree');
  const order = [...t.querySelectorAll('.vtree__title, .vtree__label')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
  const br = [...t.querySelectorAll('.vtree__branch')].map(e => { const r = e.getBoundingClientRect(); return { top: f(r.top + scrollY), left: f(r.left), w: f(r.width) }; });
  const arrows = [...t.querySelectorAll('[aria-hidden="true"]')].map(a => a.textContent.trim() + '>' + (a.nextElementSibling && a.nextElementSibling.classList.contains('visually-hidden') ? a.nextElementSibling.textContent.trim() : '?'));
  const root = t.querySelector('.vtree__title').getBoundingClientRect();
  return { order, br, arrows, rootBottom: f(root.bottom + scrollY) };
}
function pgRows() {
  const f = n => Math.round(n * 10) / 10;
  const tl = [...document.querySelectorAll('#experience .timeline > li')].map(e => f(e.getBoundingClientRect().bottom + scrollY));
  const cards = [...document.querySelectorAll('#experience .hl__items > details')].map(e => f(e.getBoundingClientRect().bottom + scrollY));
  const col = s => f(document.querySelector(s).getBoundingClientRect().height);
  return { tl, cards, tlH: col('#experience .timeline'), cardsH: col('#experience .hl__items'), tabs: document.querySelector('#experience .hl').classList.contains('is-hover'), open: document.querySelectorAll('#experience details[open]').length };
}

async function homeCase(b, W, nojs, reduce) {
  const label = `/ ${W} scripts ${nojs ? 'off' : 'on'} motion ${reduce ? 'reduce' : 'no-preference'}`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const p = await b.page(W, { height: 900, nojs, reduce }); const ready = await load(p, NEW + '/');
    const inter = await p.ev(FONT).catch(() => false);
    if (!inter && attempt === 1) { await p.close(); continue; }
    check(ready && inter, `${label}: ready ${ready}, Inter ${inter} (attempt ${attempt})`);
    const ov1 = await p.ev(`(${pgOverflow})(${W})`);
    const tree = await p.ev(`(${pgTree})()`);
    const opened = await p.ev(`(${pgOpen})(true)`); await sleep(300);
    const ov2 = await p.ev(`(${pgOverflow})(${W})`);
    const text = norm(await p.ev(`document.querySelector('main').innerText`));
    await p.ev(`(${pgOpen})(false)`);
    check(ov1.length === 0 && ov2.length === 0, `${label}: right edges past ${W}: cards closed ${ov1.length}${ov1.length ? ' ' + JSON.stringify(ov1.slice(0, 5)) : ''}, ${opened} details open ${ov2.length}${ov2.length ? ' ' + JSON.stringify(ov2.slice(0, 5)) : ''}`);
    if (text === TARGET) check(true, `${label}: main text = target (${TARGET.split(' ').length} words)`);
    else { const a = text.split(' '), t = TARGET.split(' '); let k = 0; while (k < a.length && a[k] === t[k]) k++; check(false, `${label}: main text differs at word ${k}: target « ${t.slice(Math.max(0, k - 4), k + 6).join(' ')} » rendered « ${a.slice(Math.max(0, k - 4), k + 6).join(' ')} »`); writeFileSync(join(HERE, `text-${W}-${nojs ? 'off' : 'on'}-${reduce ? 'r' : 'm'}.txt`), text.replace(/ /g, '\n')); }
    const cols = W >= 961, br = tree.br;
    const layout = cols ? br.every(x => Math.abs(x.top - br[0].top) <= 1) && br.every((x, k) => !k || x.left > br[k - 1].left)
      : br.every(x => Math.abs(x.left - br[0].left) <= 1) && br.every((x, k) => !k || x.top > br[k - 1].top);
    const ARW = ['↗>hausse', '↗>hausse', '↗>hausse', '↘>baisse', '↘>baisse', '↘>baisse', '↘>baisse', '↘>baisse', '↘>baisse', '↗>hausse'];
    check(JSON.stringify(tree.order) === JSON.stringify(['CRÉATION DE VALEUR', '↗ hausse REVENUS', '↘ baisse DÉPENSES', '↘ baisse BFR']) && layout && br.every(x => x.top > tree.rootBottom) && JSON.stringify(tree.arrows) === JSON.stringify(ARW),
      `${label}: tree DOM order ${JSON.stringify(tree.order)}; ${cols ? 'columns' : 'stacked'} tops ${br.map(x => x.top).join('/')} lefts ${br.map(x => x.left).join('/')} widths ${br.map(x => x.w).join('/')} (root bottom ${tree.rootBottom}); arrows ${tree.arrows.length} ${tree.arrows.every((x, k) => x === ARW[k]) ? 'each aria-hidden + hidden word' : JSON.stringify(tree.arrows)}`);
    check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
    await p.close(); return;
  }
  check(false, `${label}: Inter never loaded in two attempts`);
}

async function rows(b) {
  for (const W of [961, 1100]) for (const [nojs, touch] of [[true, false], [false, true]]) {
    const p = await b.page(W, { height: 900, nojs, touch }); await load(p, NEW + '/');
    const r = await p.ev(`(${pgRows})()`); await p.close();
    const d = r.tl.map((x, k) => Math.round((r.cards[k] - x) * 10) / 10), dc = Math.round((r.cardsH - r.tlH) * 10) / 10;
    check(!r.tabs && r.open === 0 && d.length === 5 && d.every(x => Math.abs(x) <= 8) && Math.abs(dc) <= 8, `P31 ${W} scripts ${nojs ? 'off' : 'on, touch'}: tabs ${r.tabs}, open ${r.open}; row bottoms card − timeline ${d.join('/')} px; columns ${r.tlH} / ${r.cardsH} (Δ ${dc})`);
  }
}

async function reserve(b) {
  for (const W of [961, 1100, 1200]) {
    const p = await b.page(W, { height: 900 }); await load(p, NEW + '/');
    const tabs = await p.ev(`document.querySelector('#experience .hl').classList.contains('is-hover')`);
    const res = [];
    for (let k = 0; k < 5; k++) {
      await p.ev(`(document.querySelectorAll('#experience .hl__items > details > summary')[${k}].click(), 1)`); await sleep(500);
      res.push(await p.ev(`(() => { const f = n => Math.round(n * 10) / 10, pn = document.querySelector('#experience .hl__detail'), r = pn.getBoundingClientRect(); const last = [...pn.querySelectorAll('*')].reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0); const lis = pn.querySelectorAll('.bullets li').length; return { k: ${k}, h: f(r.height), slack: f(r.bottom - last), lis, head: pn.querySelector('.hl__head') ? pn.querySelector('.hl__head').textContent.replace(/\\s+/g, ' ').trim() : '' }; })()`));
    }
    const ov = await p.ev(`(${pgOverflow})(${W})`);
    const hl = await p.ev(`getComputedStyle(document.querySelector('#experience .hl')).getPropertyValue('--hl-min')`);
    await p.close();
    check(tabs && res.every(x => x.slack >= -0.5) && new Set(res.map(x => x.h)).size === 1 && ov.length === 0, `tabs ${W}: mode ${tabs}, --hl-min ${hl}; per tab height/slack/bullets ${res.map(x => `${x.h}/${x.slack}/${x.lis}`).join(' · ')}; heads ${JSON.stringify(res.map(x => x.head))}; right edges past ${W}: ${ov.length}`);
  }
}

async function firstScreen(b) {
  for (const reduce of [false, true]) {
    const p = await b.page(375, { height: 553, reduce }); await load(p, NEW + '/', false); await sleep(1500);
    const r = await p.ev(`(() => { const h = document.querySelector('#services h2'), x = h.getBoundingClientRect(); let o = 1, e = h; while (e) { o *= +getComputedStyle(e).opacity; e = e.parentElement; } return { top: Math.round(x.top), bottom: Math.round(x.bottom), o, y: scrollY, text: h.textContent }; })()`);
    await p.close();
    check(r.y === 0 && r.top >= 0 && r.bottom <= 553 && r.o === 1, `375x553 motion ${reduce ? 'reduce' : 'no-preference'}, no scroll: « ${r.text} » top ${r.top} bottom ${r.bottom} in 553, opacity chain ${r.o}`);
  }
}

log(`RENDER p67: ${NEW}/ — 5 widths x scripts on/off x 2 motions; P31 rows 961/1100; tabs reserve 961/1100/1200; first screen 375x553`);
const b = await browser();
try {
  log('== A. text, overflow, tree');
  for (const W of [1200, 961, 768, 375, 320]) for (const nojs of [false, true]) for (const reduce of [false, true]) await guard(`/ ${W}`, () => homeCase(b, W, nojs, reduce));
  log('== B. P31 equal rows'); await guard('rows', () => rows(b));
  log('== C. tabs reserve'); await guard('reserve', () => reserve(b));
  log('== D. first screen'); await guard('first', () => firstScreen(b));
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
log(`RENDER: ${total} checks, failing ${bad}`);
writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
