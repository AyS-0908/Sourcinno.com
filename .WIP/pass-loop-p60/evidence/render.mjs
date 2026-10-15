// p60 Done When 3, 4, 5, 6: the Portfolio as a section of Venture Building, rendered in headless Chrome.
// Built from the Pass 63 render (.WIP/pass-loop-p63/evidence/render.mjs: load, settle, click, real Tab, touch tap, boxes against a
// baseline, « no box », width probe, captures). browser() = ./cdp.mjs (the P63 file, unchanged).
// What the words mean here:
//  - « box » / « no box »: the element has client rects (non-empty) or none (display: none, hidden); never a 0x0 box at the origin;
//  - « on screen »: the element scrolled to the middle of the window, its own box intersects the viewport and the element topmost at
//    the centre of that intersection lies inside it (the sticky header excluded by aiming at the centre);
//  - « above »: every element of main before #portfolio (before #reflexion on the Pass base), document coordinates, 0.1 px;
//  - « after »: every element of main from #reflexion on, measured from #reflexion's top edge;
//  - « past the width »: as Pass 63 (each box cut by its clipping ancestors, body and html excepted) against the layout width;
//  - menu one row: the li of .site-nav__list have equal vertical centres (0.5 px) and increasing left edges.
// Compared with product c5db875 through baseline.json (written by a run on a scratch copy of c5db875 served on another port).
// usage (product root):
//   red run + baseline:  P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P60_BASELINE=write node .WIP/pass-loop-p60/evidence/render.mjs
//   the tree:            P48_PROFILES=<scratch> node .WIP/pass-loop-p60/evidence/render.mjs
//   P60_PART=vb,nojs,stub,landing,others,menu,footer,shots narrows a run (PARTIAL, said top and bottom); P60_OUT names the output file.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P60_BASELINE === 'write';
const PARTS = (process.env.P60_PART || 'vb,nojs,stub,landing,others,menu,footer,shots').split(','), PARTIAL = !!process.env.P60_PART;
const OUTFILE = process.env.P60_OUT || (PARTIAL ? '' : WRITE ? 'render-red-c5db875.txt' : 'render.txt');
const BASEFILE = join(HERE, 'baseline.json'), VB = '/service-venture-building/', TARGET = '/service-venture-building/#portfolio';
const SHELL = ['/', '/service-strategie-transformation/', '/service-ia-business/', VB, '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
const TITLES = ['CRM TENANTS', 'GO VIRAL', 'QUICK DIAG', 'N8N ORCHESTRATOR'];

const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s: case abandoned')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }

// ---- in the page (functions sent as text; all synchronous) ----
function pgSec() {
  const X = document.getElementById('portfolio'), boxOf = e => !e ? 'absent' : e.getClientRects().length ? 'box' : 'no box';
  const order = [...document.querySelectorAll('main > section')].map(s => s.id || '(no id)');
  const menu = [...document.querySelectorAll('.site-nav a, .site-footer a')].filter(a => /portfolio/i.test(a.textContent) || /\/portfolio\//.test(a.getAttribute('href') || '')).map(a => a.closest('header') ? 'header' : 'footer');
  if (!X) return { present: false, order, menu };
  const cards = [...X.querySelectorAll('.portfolio-card')], more = document.getElementById('portfolio-more'), btn = more && more.querySelector('button');
  const op = (() => { let o = 1; for (let e = X; e; e = e.parentElement) o *= +getComputedStyle(e).opacity; return Math.round(o * 1000) / 1000; })();
  const act = document.activeElement, ci = cards.findIndex(c => c.contains(act));
  const lv = [...X.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName.toLowerCase());
  return { present: true, order, menu, cls: X.className, refl: (document.getElementById('reflexion') || {}).className, h2: (X.querySelector('h2') || {}).textContent, h1s: document.querySelectorAll('h1').length,
    levels: { h2: lv.filter(x => x === 'h2').length, h3: lv.filter(x => x === 'h3').length, h4: lv.filter(x => x === 'h4').length, other: lv.filter(x => !['h2', 'h3', 'h4'].includes(x)).length, first: lv[0] },
    titles: cards.map(c => { const h = c.querySelector('h3'); return h ? h.textContent.trim() + (h.id && c.getAttribute('aria-labelledby') === h.id ? '' : ' (labelledby mismatch)') : '(no h3)'; }),
    cards: cards.map(boxOf), btn: btn ? { box: boxOf(btn), text: btn.textContent.trim(), type: btn.getAttribute('type'), hiddenAttr: more.hidden } : null,
    form: boxOf(document.getElementById('portfolio-filter')), count: (document.getElementById('portfolio-count') || {}).textContent, op, visible: X.classList.contains('is-visible'),
    focus: ci >= 0 ? `card ${ci + 1} ${act.tagName.toLowerCase()}` : act === btn ? 'button' : act ? act.tagName.toLowerCase() + (act.id ? '#' + act.id : '') : null,
    inter: document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded') };
}
// the element scrolled to the middle of the window: its box meets the viewport and is topmost at the centre of that meeting
const onScreenFn = `(e=>{if(!e||!e.getClientRects().length)return{on:false,why:'no box'};e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect(),l=Math.max(0,r.left),t=Math.max(0,r.top),R=Math.min(document.documentElement.clientWidth,r.right),B=Math.min(innerHeight,r.bottom);if(R<=l||B<=t)return{on:false,why:'outside the viewport'};const x=(l+R)/2,y=(t+B)/2,h=document.elementFromPoint(x,y);return{on:!!h&&e.contains(h),why:h?h.tagName.toLowerCase()+'.'+String(h.className).split(' ')[0]:'nothing',w:Math.round(r.width),h:Math.round(r.height)}})`;
function pgAbove() {
  const A = document.getElementById('portfolio') || document.getElementById('reflexion'), f = n => Math.round(n * 10) / 10, o = [];
  for (const e of document.querySelector('main').querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName) || e.contains(A) || !(A.compareDocumentPosition(e) & 2)) continue;
    if (!e.getClientRects().length) { o.push(e.tagName.toLowerCase() + ' no box'); continue; }
    const r = e.getBoundingClientRect(); o.push(`${e.tagName.toLowerCase()} ${f(r.left + scrollX)} ${f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return o;
}
function pgAfter() {
  const R = document.getElementById('reflexion'), f = n => Math.round(n * 10) / 10, o = [], top = R.getBoundingClientRect().top;
  for (const e of [R, ...document.querySelector('main').querySelectorAll('*')]) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName) || (e !== R && !(R.compareDocumentPosition(e) & 4) && !R.contains(e))) continue;
    if (!e.getClientRects().length) { o.push(e.tagName.toLowerCase() + ' no box'); continue; }
    const r = e.getBoundingClientRect(); o.push(`${e.tagName.toLowerCase()} ${f(r.left + scrollX)} R+${f(r.top - top)} ${f(r.width)} ${f(r.height)}`);
  }
  return o;
}
function pgBg() { return [...document.querySelectorAll('main > section')].map(s => (s.id || s.getAttribute('aria-label') || '(no id)') + ' ' + getComputedStyle(s).backgroundColor); }
function pgPast() {
  const W = document.documentElement.clientWidth, o = []; let clipped = 0;
  for (const e of document.querySelectorAll('body *')) {
    const r0 = e.getBoundingClientRect(); if (r0.width === 0 && r0.height === 0) continue;
    let right = r0.right, left = r0.left;
    for (let a = e.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible') { const ra = a.getBoundingClientRect(); right = Math.min(right, ra.right); left = Math.max(left, ra.left); } }
    if (right < r0.right - 0.5) clipped++;
    if (right <= left) continue;
    if (right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + right.toFixed(1));
  }
  return { o, clipped };
}
function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return { main: [...document.querySelectorAll('main > *')].map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)), header: f(document.querySelector('.site-header').getBoundingClientRect().height), footer: f(document.querySelector('.site-footer').getBoundingClientRect().height) }; }
// the four cards (all visible, scripts off): box sizes and the computed style of title, first back label, front label, text, tags
function pgCards() {
  const P = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'marginTop', 'marginBottom', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'textTransform', 'minHeight', 'backgroundColor'];
  const cs = e => e ? P.map(k => getComputedStyle(e)[k]).join('|') : 'absent', f = n => Math.round(n * 10) / 10;
  return [...document.querySelectorAll('.portfolio-card')].map(c => ({
    box: c.getClientRects().length ? `${f(c.getBoundingClientRect().width)}x${f(c.getBoundingClientRect().height)}` : 'no box',
    title: cs(c.querySelector('h2, h3')), back: cs(c.querySelector('.portfolio-back > :first-child')), front: cs(c.querySelector('.portfolio-copy > .portfolio-tags + *')),
    p: cs(c.querySelector('.portfolio-copy p')), tag: cs(c.querySelector('.portfolio-tags span')), grid: (() => { const g = c.parentElement.getBoundingClientRect(); return `${f(g.width)}` })() }));
}
function pgMenu() {
  const f = n => Math.round(n * 10) / 10, li = [...document.querySelectorAll('.site-nav__list > li')].map(e => e.getBoundingClientRect()), logo = document.querySelector('.site-logo').getBoundingClientRect();
  const toggle = document.querySelector('.nav-toggle');
  return { n: li.length, names: [...document.querySelectorAll('.site-nav__list > li')].map(e => (e.querySelector('summary, a') || e).textContent.trim()), cy: li.map(r => f(r.top + r.height / 2)), left: li.map(r => f(r.left)), right: li.length ? f(li.at(-1).right) : 0,
    gap: li.length ? f(li[0].left - logo.right) : null, logo: `${f(logo.width)}x${f(logo.height)}`, burger: getComputedStyle(toggle).display !== 'none', cw: document.documentElement.clientWidth };
}
function pgFooter() {
  return [...document.querySelectorAll('.site-footer li, .site-footer p, .site-footer h2')].map(e => { const g = document.createRange(); g.selectNodeContents(e); const tops = new Set([...g.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top))); return e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '|' + tops.size + ' line(s)|' + Math.round(e.getBoundingClientRect().width); });
}

// ---- driving the page ----
async function load(p, url, { reveal = true } = {}) {
  await p.s('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(p.nojs ? `document.readyState==='complete'` : `document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(p.nojs ? 1500 : 700);
  if (reveal) { const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); await sleep(900); }
  return ready;
}
async function settled(p, expr) { let a = JSON.stringify(await p.ev(expr)); for (let i = 0; i < 12; i++) { await sleep(300); const b = JSON.stringify(await p.ev(expr)); if (a === b) break; a = b; } return JSON.parse(a); }
const sec = p => settled(p, `(${pgSec})()`);
async function reach(p) {
  await p.ev(`(()=>{const h=document.querySelector('#portfolio h2')||document.getElementById('reflexion');h.scrollIntoView({block:'center',behavior:'instant'});return 1})()`);
  let st; for (let i = 0; i < 60; i++) { await sleep(100); st = await p.ev(`(${pgSec})()`); if (!st.present || (st.op > 0.999 && (p.nojs || st.visible))) break; }
  await sleep(300); return sec(p);
}
const onScreen = (p, expr) => p.ev(`${onScreenFn}(${expr})`);
const CARD = i => `document.querySelectorAll('#portfolio .portfolio-card')[${i}]`, BTN = `document.querySelector('#portfolio-more button')`;
const center = expr => `(()=>{const e=${expr};const r=e.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight)e.scrollIntoView({block:'center',behavior:'instant'});const q=e.getBoundingClientRect(),x=q.x+q.width/2,y=q.y+q.height/2;return {x,y,top:e.contains(document.elementFromPoint(x,y))}})()`;
async function aim(p, expr) { await p.ev(center(expr)); await sleep(120); return p.ev(center(expr)); }
const mouse = (p, type, d, extra = {}) => p.s('Input.dispatchMouseEvent', { type, x: d.x, y: d.y, ...extra });
async function click(p, expr, wait = 300) { const d = await aim(p, expr); await mouse(p, 'mouseMoved', d); await mouse(p, 'mousePressed', d, { button: 'left', clickCount: 1 }); await mouse(p, 'mouseReleased', d, { button: 'left', clickCount: 1 }); await sleep(wait); return d.top; }
async function tap(p, expr, wait = 300) { const d = await aim(p, expr); await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y }] }); await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(wait); return d.top; }
async function tabTo(p, expr, max = 200) { for (let i = 0; i <= max; i++) { if (await p.ev(`document.activeElement===${expr}`)) return i; await p.key('Tab'); } return -1; }
const errs = (label, p) => check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
const fontOk = st => st.inter;

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null;
const fresh = { from: BASE, above: {}, after: {}, bg: {}, sections: {}, cards: {}, footer: {}, menu: {} };
if (!WRITE && !base) check(false, 'baseline.json missing: nothing can be compared with c5db875');
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${Array.isArray(value) ? value.length + ' entries' : JSON.stringify(value).slice(0, 300)}`); return true; }
  if (!base) return false;
  const want = base[kind][key]; let why = '';
  if (want === undefined) why = ' (no baseline entry)';
  else if (JSON.stringify(want) !== JSON.stringify(value)) { if (Array.isArray(want)) { const d = []; for (let i = 0; i < Math.max(want.length, value.length) && d.length < 6; i++) if (JSON.stringify(want[i]) !== JSON.stringify(value[i])) d.push(`#${i} c5db875 « ${JSON.stringify(want[i])} » now « ${JSON.stringify(value[i])} »`); why = `\n        c5db875 ${want.length} entries, now ${value.length}; first differences: ${d.join(' | ')}`; } else why = `\n        c5db875: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}`; }
  return check(!why, `${text} = c5db875 (${Array.isArray(value) ? value.length + ' entries' : 'value'})${why}`);
}
const loadState = st => `cards ${st.cards.join('/')}, button ${st.btn ? st.btn.box + ' « ' + st.btn.text + ' »' : 'absent'}, form ${st.form}, count « ${st.count} », focus ${st.focus}`;

// ---- Done When 3: Venture Building, scripts on ----
async function vbCase(b, W, touch) {
  const label = `Venture Building ${W} ${touch ? 'touch' : 'mouse'}`, act = touch ? tap : click, actName = touch ? 'tap' : 'click';
  const open = async () => { const p = await b.page(W, { height: 900, touch }); const ready = await load(p, BASE + VB, { reveal: false }); return { p, ready, st: await reach(p) }; };
  let { p, ready, st } = await open();
  log(` -- ${label}: main sections ${st.order.join(' > ')}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}; section is-visible ${st.visible}, opacity product ${st.op}`);
  if (!check(st.present, `${label}: section #portfolio present`)) { errs(label, p); await p.close(); return; }
  const k = st.order.indexOf('portfolio');
  check(st.order[k - 1] === 'experience' && st.order[k + 1] === 'reflexion' && /\bsection--alt\b/.test(st.cls) && /\breveal\b/.test(st.cls) && !/section--alt/.test(st.refl), `${label}: #experience > #portfolio > #reflexion; #portfolio class « ${st.cls} », #reflexion class « ${st.refl} » (alt off)`);
  check(st.h2 === 'Portfolio' && st.h1s === 1 && st.levels.first === 'h2' && st.levels.h2 === 1 && st.levels.h3 === 4 && st.levels.h4 === 40 && st.levels.other === 0 && JSON.stringify(st.titles) === JSON.stringify(TITLES),
    `${label}: headings: one h1 in the page; in the section h2 « ${st.h2} », ${st.levels.h3} h3 (${st.titles.join(', ')}), ${st.levels.h4} h4, other ${st.levels.other}`);
  check(JSON.stringify(st.cards) === JSON.stringify(['box', 'box', 'no box', 'no box']) && st.btn && st.btn.box === 'box' && st.btn.text === 'Afficher plus (2)' && st.btn.type === 'button' && st.form === 'box', `${label}: on load ${loadState(st)}`);
  const s0 = [await onScreen(p, CARD(0)), await onScreen(p, CARD(1)), await onScreen(p, BTN)];
  check(s0.every(x => x.on), `${label}: on load cards 1, 2 and the button on screen: ${JSON.stringify(s0)}`);
  // the pointer
  await act(p, BTN); st = await sec(p);
  const s1 = [await onScreen(p, CARD(2)), await onScreen(p, CARD(3))];
  check(st.cards.every(x => x === 'box') && st.btn.box === 'no box' && s1.every(x => x.on), `${label}: ${actName} on « Afficher plus »: ${loadState(st)}; cards 3, 4 on screen ${JSON.stringify(s1)}`);
  const past = await p.ev(`(${pgPast})()`); check(past.o.length === 0, `${label}: four cards shown, elements past the layout width: ${past.o.length}${past.o.length ? ' ' + JSON.stringify(past.o.slice(0, 5)) : ''} (${past.clipped} boxes cut by a clipping ancestor)`);
  errs(label, p); await p.close();
  // the keyboard: real Tab from the header's first link to the button, Enter
  ({ p, st } = await open());
  await p.ev(`(document.querySelector('.site-header a').focus(),1)`);
  const n = await tabTo(p, BTN); await sleep(150); const fv = n >= 0 && await p.ev(`document.activeElement.matches(':focus-visible')`);
  await p.key('Enter'); await sleep(300); st = await sec(p);
  check(n > 0 && fv && st.cards.every(x => x === 'box') && st.btn.box === 'no box', `${label}: keyboard: ${n} Tab → « Afficher plus » (:focus-visible ${fv}), Enter: ${loadState(st)}`);
  check(st.focus === 'card 3 summary', `${label}: keyboard: after Enter the focus is on the first card shown (${st.focus})`);
  errs(label + ' keyboard', p); await p.close();
  // a search term matching a hidden card (QUICK DIAG, card 3)
  ({ p, st } = await open());
  await act(p, `document.getElementById('portfolio-query')`); await p.s('Input.insertText', { text: 'questionnaires' }); await sleep(400); st = await sec(p);
  const s3 = await onScreen(p, CARD(2));
  check(JSON.stringify(st.cards) === JSON.stringify(['no box', 'no box', 'box', 'no box']) && st.btn.box === 'no box' && s3.on, `${label}: typed « questionnaires »: ${loadState(st)}; card 3 on screen ${JSON.stringify(s3)}`);
  await act(p, `document.getElementById('portfolio-reset')`); st = await sec(p);
  check(st.cards.every(x => x === 'box') && st.btn.box === 'no box', `${label}: « Réinitialiser » after the search (declared: four cards, the button does not come back): ${loadState(st)}`);
  errs(label + ' search', p); await p.close();
}
// boxes above #portfolio and below it, section backgrounds (page revealed by a full scroll, window 1100 high); runs on the Pass base too
async function vbBoxes(b, W, touch) {
  const label = `Venture Building ${W} ${touch ? 'touch' : 'mouse'}`;
  const p = await b.page(W, { height: 1100, touch }); await load(p, BASE + VB);
  compare('above', `${W}`, await settled(p, `(${pgAbove})()`), `${label}: boxes of every element of main before #portfolio (document coordinates)`);
  compare('after', `${W}`, await settled(p, `(${pgAfter})()`), `${label}: boxes of #reflexion and everything after it in main (from #reflexion's top)`);
  const bg = await p.ev(`(${pgBg})()`);
  if (WRITE) compare('bg', `${W}`, bg, `${label}: section backgrounds`);
  else log(`        backgrounds now: ${bg.join(' | ')}\n        c5db875:         ${(base && base.bg[W] || []).join(' | ')}`);
  errs(label + ' boxes', p); await p.close();
}

// ---- Done When 3: scripts disabled; and the cards against /portfolio/ of c5db875 ----
async function nojsCase(b, W) {
  const label = `Venture Building ${W} scripts disabled`;
  const p = await b.page(W, { height: 900, nojs: true });
  if (WRITE) { await load(p, BASE + '/portfolio/', { reveal: false }); compare('cards', `${W}`, await settled(p, `(${pgCards})()`), `/portfolio/ ${W} scripts disabled: four cards`); }
  const ready = await load(p, BASE + VB, { reveal: false });
  const st = await settled(p, `(${pgSec})()`);
  if (!check(ready && st.present, `${label}: page ready ${ready}, section #portfolio present ${st.present}`)) { await p.close(); return; }
  if (!WRITE) compare('cards', `${W}`, await settled(p, `(${pgCards})()`), `${label}: the four cards (box size, computed style of title, back label, front label, text, tag; grid width) against /portfolio/`);
  const on = []; for (const i of [0, 1, 2, 3]) on.push(await onScreen(p, CARD(i)));
  check(st.cards.every(x => x === 'box') && on.every(x => x.on) && st.btn && st.btn.box === 'no box' && st.form === 'no box', `${label}: ${loadState(st)}; each card on screen ${JSON.stringify(on.map(x => x.on))}`);
  for (const i of [0, 1, 2, 3]) {
    await click(p, `${CARD(i)}.querySelector('summary')`, 0); await sleep(300);
    const o = await p.ev(`(()=>{const c=${CARD(i)};return {open:c.querySelector('details').open,back:c.querySelector('.portfolio-back').getClientRects().length>0,front:c.querySelector('.portfolio-front').getClientRects().length>0}})()`);
    const v = await onScreen(p, `${CARD(i)}.querySelector('.portfolio-back')`);
    check(o.open && o.back && !o.front && v.on, `${label}: card ${i + 1}: a click on its « i » opens the back (open ${o.open}, back box ${o.back}, front box ${o.front}, back on screen ${v.on})`);
  }
  await p.close();
}

// ---- Done When 4: the stub (read, not followed) ----
async function stubCase() {
  const r = await fetch(BASE + '/portfolio/'), html = await r.text();
  const refresh = (html.match(/<meta http-equiv="refresh" content="([^"]*)"/i) || [])[1], cont = (html.match(/<a class="btn btn--primary" href="([^"]*)">Continuer<\/a>/) || [])[1];
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1], robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1];
  check(r.status === 200 && refresh === `0; url=${TARGET}` && cont === TARGET && canon === 'https://www.sourcinno.com/service-venture-building/' && robots === 'noindex, follow' && !/site-header|site-footer/.test(html),
    `/portfolio/: HTTP ${r.status}, refresh « ${refresh} », « Continuer » → ${cont}, canonical ${canon}, robots « ${robots} », no header/footer ${!/site-header|site-footer/.test(html)}`);
}

// ---- review A-001: arriving by /portfolio/ (refresh to #portfolio), the h2 lands below the sticky header ----
async function landingCase(b, W, H, nojs) {
  const label = `/portfolio/ landing ${W}x${H}${nojs ? ' scripts disabled' : ''}`;
  const p = await b.page(W, { height: H, nojs, touch: W < 861 }); await p.s('Page.navigate', { url: BASE + '/portfolio/' });
  let at = ''; for (let i = 0; i < 80 && !at.endsWith('#portfolio'); i++) { await sleep(100); at = await p.ev('location.pathname + location.hash').catch(() => ''); }
  await sleep(2700); // past the 2.5 s reveal-wait of the header script
  const g = await p.ev(`(()=>{const h=document.querySelector('#portfolio h2'),hd=document.querySelector('.site-header').getBoundingClientRect();if(!h)return null;const r=h.getBoundingClientRect(),x=r.left+Math.min(r.width,60)/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);return {top:Math.round(r.top*10)/10,bottom:Math.round(r.bottom*10)/10,header:Math.round(hd.bottom*10)/10,hit:!!e&&h.contains(e),scrollY:Math.round(scrollY)}})()`);
  check(at === VB + '#portfolio' && g && g.top >= g.header && g.bottom <= H && g.hit, `${label}: landed at ${at}; h2 « Portfolio » ${g ? `${g.top}–${g.bottom} px, header bottom ${g.header} px, topmost at its centre ${g.hit}, scrollY ${g.scrollY}` : 'absent'}`);
  if (!nojs) errs(label, p); await p.close();
}

// ---- Done When 4: the shell pages ----
async function otherPage(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, BASE + route);
  const st = await p.ev(`(${pgSec})()`), sc = await settled(p, `(${pgSections})()`);
  check(ready && st.menu.length === 0, `${label}: page ready ${ready}; « Portfolio » links in header/footer: ${st.menu.length ? st.menu.join(', ') : 'none'}`);
  const main = sc.main.filter(x => !x.startsWith('section#portfolio')), key = `${route}|${W}`;
  if (WRITE) compare('sections', key, sc, `${label}: heights`);
  else if (base && base.sections[key]) {
    const was = base.sections[key]; total++; const same = JSON.stringify(was.main) === JSON.stringify(main); if (!same) bad++;
    log(`   ${same ? 'ok  ' : 'FAIL'} ${label}: heights of the ${main.length} main blocks${sc.main.length !== main.length ? ' (without #portfolio)' : ''} = c5db875${same ? '' : `\n        c5db875: ${was.main.join(' | ')}\n        now:     ${main.join(' | ')}`}`);
    log(`        header ${was.header} → ${sc.header} px, footer ${was.footer} → ${sc.footer} px${was.footer !== sc.footer ? ' (the footer « Pages » column lost one entry)' : ''}`);
  } else check(false, `${label}: no baseline entry`);
  errs(label, p); await p.close();
}
async function menuCase(b, route, W) {
  const label = `${route} ${W} menu`; const p = await b.page(W, { height: 900, touch: false }); await load(p, BASE + route, { reveal: false });
  const m = await settled(p, `(${pgMenu})()`);
  const row = m.n > 0 && m.cy.every(y => Math.abs(y - m.cy[0]) <= 0.5) && m.left.every((x, i) => !i || x > m.left[i - 1]) && m.right <= m.cw + 0.5;
  check(!m.burger && row && m.n === 5 && !m.names.includes('Portfolio'), `${label}: ${m.n} items ${JSON.stringify(m.names)}, centres ${m.cy.join('/')}, left edges ${m.left.join('/')}, last right edge ${m.right} (layout ${m.cw}); logo ${m.logo}, gap logo → first item ${m.gap} px`);
  if (WRITE) fresh.menu[`${route}|${W}`] = m.gap; else log(`        gap logo → first item: c5db875 ${base && base.menu[`${route}|${W}`]} px, now ${m.gap} px`);
  errs(label, p); await p.close();
}
async function footerCase(b) {
  const p = await b.page(320, { height: 900 }); await load(p, BASE + '/');
  const lines = await settled(p, `(${pgFooter})()`);
  if (WRITE) compare('footer', '320', lines, '/ 320 footer line breaks');
  else compare('footer', '320', lines, `/ 320 footer: text, line count and width of each li/p/h2 (c5db875 without its « Portfolio » entry)`);
  errs('/ 320 footer', p); await p.close();
}

// ---- Done When 6: the three kept captures ----
async function capture(b, W, more) {
  const file = `portfolio-${W}${more ? '-plus' : ''}.jpg`;
  const p = await b.page(W, { height: 3000, touch: W < 861 }); await load(p, BASE + VB, { reveal: false }); let st = await reach(p);
  if (!st.present || !fontOk(st)) { check(false, `capture ${file}: refused (section ${st.present}, Inter ${st.inter})`); await p.close(); return; }
  if (more) { await click(p, BTN); st = await sec(p); }
  await p.ev(`(()=>{const X=document.getElementById('portfolio');scrollTo(0,X.getBoundingClientRect().top+scrollY-100);return 1})()`); await sleep(600);
  const g = await p.ev(`(()=>{const r=document.getElementById('portfolio').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight}})()`);
  const want = more ? st.cards.every(x => x === 'box') && st.btn.box === 'no box' : st.cards.filter(x => x === 'box').length === 2 && st.btn.box === 'box';
  if (check(g.y >= 0 && g.y + g.height <= g.vh && want, `capture ${file}: #portfolio ${g.width}x${g.height} wholly inside the ${g.vh} px viewport; ${loadState(st)}`)) {
    const [sx, sy] = await p.ev('[scrollX, scrollY]');
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(join(process.env.P60_SHOTS || HERE, file), Buffer.from(got.data, 'base64')); log(`        capture ${file} ${g.width}x${g.height}`);
  }
  await p.close();
}

log(`RENDER p60 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of c5db875: comparisons are written, not checked; the section, menu and stub checks run and are expected to FAIL)' : ''}${PARTIAL ? ` — PARTIAL RUN, parts: ${PARTS.join(', ')}` : ''}`);
const b = await browser();
try {
  if (PARTS.includes('vb')) { log('== Venture Building, scripts on (Done When 3)'); for (const [W, t] of [[1200, false], [375, true]]) { await guard(`vb ${W}`, () => vbCase(b, W, t)); await guard(`vb boxes ${W}`, () => vbBoxes(b, W, t)); } }
  if (PARTS.includes('nojs')) { log('== Venture Building, scripts disabled (Done When 3)'); for (const W of [1200, 375]) await guard(`nojs ${W}`, () => nojsCase(b, W)); }
  if (PARTS.includes('stub')) { log('== /portfolio/ (Done When 4)'); await guard('stub', () => stubCase()); }
  if (PARTS.includes('landing') && !WRITE) { log('== arriving by /portfolio/ (review A-001)'); for (const [W, H] of [[1200, 900], [375, 740]]) for (const nj of [false, true]) await guard(`landing ${W} ${nj}`, () => landingCase(b, W, H, nj)); }
  if (PARTS.includes('others')) { log('== the nine shell pages (Done When 4)'); for (const route of SHELL) for (const W of [1200, 375]) await guard(`${route} ${W}`, () => otherPage(b, route, W)); }
  if (PARTS.includes('menu')) { log('== desktop menu on one row (Done When 4)'); for (const W of [861, 961, 1200]) for (const route of SHELL) await guard(`${route} ${W} menu`, () => menuCase(b, route, W)); }
  if (PARTS.includes('footer')) { log('== footer line breaks at 320 px (AGENTS Gotcha)'); await guard('footer', () => footerCase(b)); }
  if (PARTS.includes('shots') && !WRITE) { log('== kept captures (Done When 6)'); for (const [W, m] of [[1200, false], [1200, true], [375, false]]) await guard(`capture ${W} ${m}`, () => capture(b, W, m)); }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
if (WRITE && !PARTIAL) {
  // c5db875's footer carries the « Portfolio » entry: the tree is compared without it
  fresh.footer['320'] = fresh.footer['320'].filter(x => !x.startsWith('Portfolio|'));
  writeFileSync(BASEFILE, JSON.stringify(fresh, null, 0).replace(/\],"/g, '],\n"') + '\n'); log(`baseline.json written (footer list without its « Portfolio » entry)`);
}
log(`RENDER ${BASE}: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (${PARTS.join(', ')}): not the full render` : ''}`);
if (OUTFILE) writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
