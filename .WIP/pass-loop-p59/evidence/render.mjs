// p59 Done When 4: Publications rendered in headless Chrome, against product 8ec4147 (the Pass base).
// browser() = ./cdp.mjs (the P62 file, copied unchanged). The P62 render.mjs was the model: its box probe (document
// coordinates, 0.1 px, « no box » for an element without client rects, settle loop) is kept; the rest is Publications only.
//  - boxes: every element of the body (script/style/noscript/link/template skipped), with its tag, id and first class;
//  - chips: the three tag buttons built by blog.js, clicked one after the other by a real mouse event: the posts left
//    visible (own box, not hidden) are exactly those of that tag (IA 6, Venture Building 4, Startup 1), the chip pressed;
//  - scripts off: the eleven articles of #blog-list each have a summary with a box inside the viewport once scrolled to,
//    checkVisibility true and an opacity product of 1;
//  - script errors (Runtime.exceptionThrown) at both widths.
// usage (product root): baseline from a scratch copy of 8ec4147 served on 4174, then the tree on 4173:
//   P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P59_BASELINE=write node .WIP/pass-loop-p59/evidence/render.mjs
//   P48_PROFILES=<scratch> node .WIP/pass-loop-p59/evidence/render.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P59_BASELINE === 'write', BASEFILE = join(HERE, 'baseline.json'), ROUTE = '/publications/';
const WANT = { IA: 6, 'Venture Building': 4, Startup: 1 };
const out = []; let bad = 0, total = 0;
const log = (s) => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }

function pgBoxes() {
  const f = (n) => Math.round(n * 10) / 10, o = [];
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName)) continue;
    const name = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : '');
    if (!e.getClientRects().length) { o.push(name + ' no box'); continue; }
    const r = e.getBoundingClientRect(); o.push(`${name} ${f(r.left + scrollX)} ${f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return o;
}
function pgFont() { return document.fonts.check('700 16px Inter') && [...document.fonts].some((x) => x.family.includes('Inter') && x.status === 'loaded'); }
function pgChips() { return [...document.querySelectorAll('.filters .chip')].map((c) => { const r = c.getBoundingClientRect(); return { text: c.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, pressed: c.getAttribute('aria-pressed') }; }); }
function pgShown() { return [...document.querySelectorAll('#blog-list > [data-tag]')].filter((p) => !p.hidden && p.getClientRects().length).map((p) => p.dataset.tag); }
function pgNoJs() {
  const items = [...document.querySelectorAll('#blog-list > details')], res = [];
  for (const d of items) {
    const s = d.querySelector('summary'); s.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = s.getBoundingClientRect(); let op = 1; for (let e = s; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const t = document.elementFromPoint(r.left + 20, r.top + r.height / 2);
    res.push({ h3: s.querySelector('h3').textContent.slice(0, 30), ok: r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && op > 0.999 && s.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && !!t && s.contains(t), op, top: Math.round(r.top) });
  }
  return { count: items.length, chips: document.querySelectorAll('.filters .chip').length, res };
}
async function load(p, url) {
  await p.s('Page.navigate', { url }); let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(p.nojs ? `document.readyState==='complete'` : `document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(p.nojs ? 1500 : 700);
  if (!p.nojs) { const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); await sleep(900); }
  return ready;
}
async function settled(p, expr) { let a = JSON.stringify(await p.ev(expr)); for (let i = 0; i < 12; i++) { await sleep(300); const b = JSON.stringify(await p.ev(expr)); if (a === b) break; a = b; } return JSON.parse(a); }
async function click(p, x, y) { for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await p.s('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); await sleep(250); }

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null, fresh = {};
if (!WRITE && !base) check(false, 'baseline.json missing: nothing to compare with 8ec4147');

async function scriptsOn(b, W) {
  const label = `${ROUTE} ${W}`, p = await b.page(W, { height: 900 }), ready = await load(p, BASE + ROUTE), font = await p.ev(`(${pgFont})()`);
  check(ready && font, `${label}: page ready ${ready}, Inter loaded ${font}`);
  const boxes = await settled(p, `(${pgBoxes})()`);
  if (WRITE) { fresh[W] = boxes; log(`        baseline ${W}: ${boxes.length} elements`); }
  else if (base) {
    const want = base[W] || [], d = [];
    for (let i = 0; i < Math.max(want.length, boxes.length) && d.length < 6; i++) if (want[i] !== boxes[i]) d.push(`#${i} 8ec4147 « ${want[i]} » now « ${boxes[i]} »`);
    check(d.length === 0, `${label}: boxes of every element = 8ec4147 (${boxes.length} / ${want.length} elements)${d.length ? ' — ' + d.join(' | ') : ''}`);
  }
  const chips = await p.ev(`(${pgChips})()`);
  check(chips.map((c) => c.text).join('|') === 'IA|Venture Building|Startup' && chips[0].pressed === 'true', `${label}: chips ${chips.map((c) => `${c.text} (pressed ${c.pressed})`).join(', ')}`);
  for (const c of [...chips.slice(1), chips[0]]) {
    await p.ev(`(document.querySelector('.filters').scrollIntoView({block:'center',behavior:'instant'}),1)`); await sleep(200);
    const now = (await p.ev(`(${pgChips})()`)).find((x) => x.text === c.text); await click(p, now.x, now.y);
    const shown = await p.ev(`(${pgShown})()`), pressed = (await p.ev(`(${pgChips})()`)).filter((x) => x.pressed === 'true').map((x) => x.text);
    check(shown.length === WANT[c.text] && shown.every((t) => t === c.text) && pressed.join() === c.text, `${label}: click on « ${c.text} »: ${shown.length} post(s) shown, tags ${[...new Set(shown)].join(', ') || 'none'}, pressed ${pressed.join(', ')} (expected ${WANT[c.text]} « ${c.text} »)`);
  }
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
async function scriptsOff(b, W) {
  const label = `${ROUTE} ${W} scripts disabled`, p = await b.page(W, { height: 900, nojs: true }); const ready = await load(p, BASE + ROUTE);
  const r = await p.ev(`(${pgNoJs})()`), badR = r.res.filter((x) => !x.ok);
  check(ready && r.count === 11 && r.chips === 0 && badR.length === 0, `${label}: ${r.count} articles, ${r.chips} chips, summaries visible by their own box ${r.count - badR.length} of ${r.count}${badR.length ? ' — ' + JSON.stringify(badR.slice(0, 3)) : ''}`);
  await p.close();
}

log(`RENDER p59 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of 8ec4147)' : ''}`);
const b = await browser();
try {
  for (const W of [1200, 375]) await guard(`${W}`, () => scriptsOn(b, W));
  for (const W of [1200, 375]) await guard(`${W} nojs`, () => scriptsOff(b, W));
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
if (WRITE) writeFileSync(BASEFILE, JSON.stringify(fresh) + '\n');
log(`RENDER ${BASE}: ${total} checks, failing ${bad}`);
writeFileSync(join(HERE, WRITE ? 'render-8ec4147.txt' : 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
