// p68 Done When 3 (PLAN § 68): the three service pages and the home page, NEW tree against TARGET TEXT (target.mjs) and against
// the BASE b332007 (`git -c core.autocrlf=false archive b332007`). cdp.mjs = byte copy of 03f98a4 (P67) helper: resolver
// 127.0.0.1 + Google Fonts only, prefers-reduced-motion set explicitly on every page, touch under 861 px.
//  A. 4 pages x 1200/961/768/375/320 x scripts on/off x motion no-preference/reduce (80 cases), NEW and BASE each on a fresh
//     page after a scroll: 1. `main > section` texts (innerText; `.visually-hidden` and `.hl__detail` display:none, every
//     `details` opened; whitespace, NBSP, apostrophes normalised) = expected, section by section: a section named in `whole` =
//     the owner's text, every other = the BASE text with `subs` applied (each old string found in the BASE page);
//     2. no element with a box has a right edge past the emulated width (details closed, then open);
//     3. `#besoin` (Performance, Entreprise IA): 3 cards, 3 columns (tops equal, lefts rising) at >= 961, one column below;
//        h3 x 3 directly in the cards, h4 count; script errors 0.
//  B. home tabs NEW vs BASE: mouse at 961/1100/1200 (hover each tab: active row, panel text, height, --hl-min; then a real
//     Tab key from tab 1 to tab 5 and Enter: active row, focus, open count), touch at 1200 (no tabs mode, a tap opens the row).
//  C. computed-style hash of every `#experience` element and its ::before/::after (P40 method: property names sorted,
//     standard and custom hashed apart, settle loop), NEW vs BASE at 1200 mouse and at 375.
// usage (product root): P48_PROFILES=<scratch> P68_NEW=http://127.0.0.1:4176 P68_OLD=http://127.0.0.1:4177 node .WIP/pass-loop-p68/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
import { PAGES } from './target.mjs';

const HERE = import.meta.dirname, NEW = process.env.P68_NEW || 'http://127.0.0.1:4176', OLD = process.env.P68_OLD || 'http://127.0.0.1:4177';
const norm = t => t.replace(/[  ]/g, ' ').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
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
async function open(b, url, W, o) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const p = await b.page(W, { height: 900, ...o }); const ready = await load(p, url);
    const inter = await p.ev(FONT).catch(() => false);
    if (inter || attempt === 2) return { p, ready, inter, attempt };
    await p.close();
  }
}

// Synchronous page functions (scripts-off pages cannot await: P30 Gotcha).
// An element inside a horizontally clipping or scrolling ancestor (the Performance viewer row: overflow-x auto) cannot widen
// the page: it is counted apart (`inside`), and that ancestor is itself measured like any element.
function pgOverflow(W) {
  const f = n => Math.round(n * 10) / 10, bad = [];
  const clipped = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
  for (const e of document.querySelectorAll('body *')) {
    if (!e.getClientRects().length) continue;
    const right = e.getBoundingClientRect().right + scrollX;
    if (right > W + 0.5) bad.push((clipped(e) ? 'inside:' : '') + e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : '') + ' ' + f(right));
  }
  return bad;
}
const past = ov => ov.filter(x => !x.startsWith('inside:'));
function pgOpen(on) {
  let st = document.getElementById('p68-text');
  if (on && !st) { st = document.createElement('style'); st.id = 'p68-text'; st.textContent = '.visually-hidden, .hl__detail { display: none !important; }'; document.head.appendChild(st); }
  if (!on && st) st.remove();
  document.querySelectorAll('main details').forEach(d => { d.open = on; });
  return document.querySelectorAll('main details[open]').length;
}
function pgSections() { return [...document.querySelectorAll('main > section')].map((s, k) => ({ key: s.id || String(k), text: s.innerText })); }
function pgBesoin() {
  const f = n => Math.round(n * 10) / 10, s = document.getElementById('besoin');
  if (!s) return null;
  const cards = [...s.querySelectorAll('.grid > .card')].map(c => { const r = c.getBoundingClientRect(); return { top: f(r.top + scrollY), left: f(r.left), w: f(r.width), h3: c.querySelectorAll(':scope > h3').length, h4: c.querySelectorAll(':scope > h4').length, li: c.querySelectorAll('li').length }; });
  return { cards, cols: getComputedStyle(s.querySelector('.grid')).gridTemplateColumns };
}

async function pageCase(b, path, W, nojs, reduce) {
  const label = `${path} ${W} scripts ${nojs ? 'off' : 'on'} motion ${reduce ? 'reduce' : 'no-preference'}`, spec = PAGES[path];
  const got = {};
  for (const [name, base] of [['old', OLD], ['new', NEW]]) {
    const { p, ready, inter, attempt } = await open(b, base + path, W, { nojs, reduce });
    const r = { ready, inter, attempt };
    if (name === 'new') { r.ov1 = await p.ev(`(${pgOverflow})(${W})`); r.besoin = await p.ev(`(${pgBesoin})()`); }
    r.opened = await p.ev(`(${pgOpen})(true)`); await sleep(300);
    if (name === 'new') r.ov2 = await p.ev(`(${pgOverflow})(${W})`);
    r.sections = (await p.ev(`(${pgSections})()`)).map(x => ({ key: x.key, text: norm(x.text) }));
    r.errors = p.errors.slice();
    await p.close(); got[name] = r;
  }
  const { old: o, new: n } = got;
  check(o.ready && o.inter && n.ready && n.inter, `${label}: ready ${o.ready}/${n.ready}, Inter ${o.inter}/${n.inter} (base/new, attempts ${o.attempt}/${n.attempt})`);
  // Expected = base sections, owner text for the `whole` ones, `subs` applied to the others.
  const used = spec.subs.map(() => 0);
  const exp = o.sections.map(s => {
    if (spec.whole[s.key] !== undefined) return { key: s.key, text: norm(spec.whole[s.key]), whole: true };
    let t = s.text; spec.subs.forEach(([a, z], k) => { if (t.includes(norm(a))) { used[k] += t.split(norm(a)).length - 1; t = t.split(norm(a)).join(norm(z)); } });
    return { key: s.key, text: t };
  });
  const keysOk = JSON.stringify(exp.map(x => x.key)) === JSON.stringify(n.sections.map(x => x.key));
  const diffs = [];
  exp.forEach((e, k) => {
    const a = (n.sections[k] || { text: '' }).text;
    if (a === e.text) return;
    const aw = a.split(' '), tw = e.text.split(' '); let i = 0; while (i < aw.length && aw[i] === tw[i]) i++;
    diffs.push(`[${e.key}] at word ${i}: expected « ${tw.slice(Math.max(0, i - 4), i + 6).join(' ')} » rendered « ${aw.slice(Math.max(0, i - 4), i + 6).join(' ')} »`);
  });
  if (diffs.length) writeFileSync(join(HERE, `text-${path.replace(/\W+/g, '_')}-${W}-${nojs ? 'off' : 'on'}-${reduce ? 'r' : 'm'}.txt`), n.sections.map(x => `## ${x.key}\n${x.text}`).join('\n'));
  const words = exp.reduce((m, x) => m + x.text.split(' ').length, 0);
  check(keysOk && !diffs.length && used.every(x => x === 1),
    `${label}: sections ${n.sections.map(x => x.key).join(',')}; text = expected (${words} words; owner-whole ${exp.filter(x => x.whole).map(x => x.key).join(',') || '-'}; subs found once each ${JSON.stringify(used)})${diffs.length ? ' DIFF ' + diffs.join(' | ') : ''}`);
  const p1 = past(n.ov1), p2 = past(n.ov2), in1 = n.ov1.length - p1.length, in2 = n.ov2.length - p2.length;
  check(p1.length === 0 && p2.length === 0, `${label}: right edges past ${W}: closed ${p1.length}${p1.length ? ' ' + JSON.stringify(p1.slice(0, 5)) : ''}, ${n.opened} details open ${p2.length}${p2.length ? ' ' + JSON.stringify(p2.slice(0, 5)) : ''}; inside a clipping/scrolling ancestor ${in1}/${in2}${in1 ? ' ' + JSON.stringify(n.ov1.filter(x => x.startsWith('inside:')).slice(0, 4)) : ''}`);
  if (n.besoin) {
    const c = n.besoin.cards, cols = W >= 961;
    const lay = c.length === 3 && (cols ? c.every(x => Math.abs(x.top - c[0].top) <= 1) && c.every((x, k) => !k || x.left > c[k - 1].left)
      : c.every(x => Math.abs(x.left - c[0].left) <= 1) && c.every((x, k) => !k || x.top > c[k - 1].top));
    const h4 = path === '/service-ia-business/' ? [2, 0, 0] : [0, 0, 0], li = path === '/service-ia-business/' ? [6, 4, 5] : [5, 5, 5];
    check(lay && c.every(x => x.h3 === 1) && JSON.stringify(c.map(x => x.h4)) === JSON.stringify(h4) && JSON.stringify(c.map(x => x.li)) === JSON.stringify(li),
      `${label}: #besoin ${cols ? '3 columns' : 'one column'} (${n.besoin.cols}) tops ${c.map(x => x.top).join('/')} lefts ${c.map(x => x.left).join('/')} widths ${c.map(x => x.w).join('/')}; h3 ${c.map(x => x.h3).join('/')} h4 ${c.map(x => x.h4).join('/')} questions ${c.map(x => x.li).join('/')}`);
  }
  check(n.errors.length === 0, `${label}: script errors ${n.errors.length}${n.errors.length ? ' ' + JSON.stringify(n.errors.slice(0, 3)) : ''} (base ${o.errors.length})`);
}

// B. home tabs, same probe on BASE and NEW, results compared as JSON.
const SUM = `#experience .hl__items > details > summary`;
function pgTab() {
  const f = n => Math.round(n * 10) / 10, root = document.querySelector('#experience .hl'), pn = root.querySelector('.hl__detail');
  const ds = [...root.querySelectorAll('.hl__items > details')];
  return { mode: root.classList.contains('is-hover'), active: ds.findIndex(d => d.classList.contains('is-active')), focus: ds.findIndex(d => d.querySelector('summary') === document.activeElement), open: ds.filter(d => d.open).length,
    hl: getComputedStyle(root).getPropertyValue('--hl-min'), h: f(pn.getBoundingClientRect().height), text: pn.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) };
}
async function mouseTo(p, k) {
  const r = await p.ev(`(() => { const s = document.querySelectorAll('${SUM}')[${k}]; s.scrollIntoView({ block: 'center' }); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(150);
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y }); await sleep(450);
}
async function tabsProbe(b, base, W) {
  const res = { hover: [], keys: [] };
  const { p } = await open(b, base + '/', W, {});
  for (let k = 0; k < 5; k++) { await mouseTo(p, k); res.hover.push(await p.ev(`(${pgTab})()`)); }
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }); await sleep(200);
  await p.ev(`(document.querySelectorAll('${SUM}')[0].focus(), 1)`); await sleep(300);
  res.keys.push(await p.ev(`(${pgTab})()`));
  for (let k = 1; k < 5; k++) { await p.key('Tab'); await sleep(300); res.keys.push(await p.ev(`(${pgTab})()`)); }
  await p.key('Enter'); await sleep(300); res.enter = await p.ev(`(${pgTab})()`);
  res.errors = p.errors.length; await p.close();
  return res;
}
async function touchProbe(b, base) {
  const { p } = await open(b, base + '/', 1200, { touch: true });
  const before = await p.ev(`(${pgTab})()`);
  const r = await p.ev(`(() => { const s = document.querySelectorAll('${SUM}')[1]; s.scrollIntoView({ block: 'center' }); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(200);
  await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
  await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(500);
  const after = await p.ev(`(() => [...document.querySelectorAll('#experience .hl__items > details')].map(d => d.open))()`);
  const mq = await p.ev(`matchMedia('(hover: hover) and (pointer: fine)').matches`);
  await p.close();
  return { before: { mode: before.mode, active: before.active, open: before.open }, after, mq };
}
async function tabs(b) {
  for (const W of [961, 1100, 1200]) {
    const o = await tabsProbe(b, OLD, W), n = await tabsProbe(b, NEW, W);
    const same = JSON.stringify(o) === JSON.stringify(n);
    const sane = n.hover.every((x, k) => x.mode && x.active === k) && n.keys.every((x, k) => x.active === k && x.focus === k) && n.enter.open === 0 && n.errors === 0;
    check(same && sane, `tabs ${W} mouse: NEW ${same ? '=' : '≠'} BASE; hover active ${n.hover.map(x => x.active).join('')} --hl-min ${n.hover[0].hl} panel h ${n.hover.map(x => x.h).join('/')}; Tab focus/active ${n.keys.map(x => x.focus + '/' + x.active).join(' ')}; Enter open ${n.enter.open}; errors ${n.errors}${same ? '' : ' BASE ' + JSON.stringify(o).slice(0, 400) + ' NEW ' + JSON.stringify(n).slice(0, 400)}`);
  }
  const o = await touchProbe(b, OLD), n = await touchProbe(b, NEW);
  check(JSON.stringify(o) === JSON.stringify(n) && !n.before.mode && n.after[1] === true && n.after.filter(Boolean).length === 1, `tabs 1200 touch: NEW ${JSON.stringify(o) === JSON.stringify(n) ? '=' : '≠'} BASE; hover-fine ${n.mq}, tabs mode ${n.before.mode}, after a tap on row 2: open ${JSON.stringify(n.after)}`);
}

// C. computed style of #experience, P40 method.
function pgStyle() {
  const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
  const rows = [];
  for (const e of [document.querySelector('#experience'), ...document.querySelectorAll('#experience *')]) for (const ps of [null, '::before', '::after']) {
    const cs = getComputedStyle(e, ps), std = [], cus = [];
    for (let i = 0; i < cs.length; i++) { const n = cs[i]; (n.startsWith('--') ? cus : std).push(n + ':' + cs.getPropertyValue(n)); }
    std.sort(); cus.sort();
    rows.push(e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '') + (ps || '') + ' ' + h(std.join(';')) + ' ' + h(cus.join(';')));
  }
  return rows;
}
async function styleOf(b, base, W) {
  const { p } = await open(b, base + '/', W, {});
  let prev = null, cur = null;
  for (let i = 0; i < 6; i++) { cur = await p.ev(`(${pgStyle})()`); if (prev && JSON.stringify(prev) === JSON.stringify(cur)) break; prev = cur; await sleep(500); }
  await p.close(); return cur;
}
async function styles(b) {
  for (const W of [1200, 375]) {
    const o = await styleOf(b, OLD, W), n = await styleOf(b, NEW, W);
    const diff = n.filter((x, k) => x !== o[k]);
    check(o.length === n.length && diff.length === 0 && n.length > 0, `#experience computed style ${W} (${W >= 961 ? 'mouse, tabs mode' : 'touch'}): ${n.length} element/pseudo rows, ${diff.length} differ from BASE${diff.length ? ' ' + JSON.stringify(diff.slice(0, 4)) : ''}`);
  }
}

log(`RENDER p68: NEW ${NEW} vs BASE ${OLD} — 4 pages x 5 widths x scripts on/off x 2 motions; home tabs 961/1100/1200 + touch; #experience computed style 1200/375`);
const b = await browser();
try {
  for (const path of Object.keys(PAGES)) {
    log(`== A. ${path}`);
    for (const W of [1200, 961, 768, 375, 320]) for (const nojs of [false, true]) for (const reduce of [false, true]) await guard(`${path} ${W}`, () => pageCase(b, path, W, nojs, reduce));
  }
  log('== B. home tabs'); await guard('tabs', () => tabs(b));
  log('== C. #experience computed style'); await guard('styles', () => styles(b));
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
log(`RENDER: ${total} checks, failing ${bad}`);
writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
