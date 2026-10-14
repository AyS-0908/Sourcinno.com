// p63 Done When 2, 3, 4, 5, 6: Stratégie « Réflexion » in a simple viewer, rendered in headless Chrome.
// Built from the Pass 62 render (.WIP/pass-loop-p62/evidence/render.mjs: load, settle, PNG reader, contrast, boxes, sections)
// and the Pass 61 one (.WIP/pass-loop-p61/evidence/render.mjs: real mouse, real touch tap, real Tab, focus ring from pixels).
// browser() = ./cdp.mjs (the P62 file + browser-level send/on, for the new tabs a link opens).
// What the words mean here:
//  - picture « whole »: the image's own box lies inside the viewer row's box and inside the viewport, and the element topmost at
//    its centre is that image; « not visible »: its box lies outside the row's box (the row clips it) — never a computed style;
//  - « nothing below moves »: boxes (document coordinates, 0.1 px) of every element after the viewer row, on picture 1 and on picture 2;
//  - « past the width »: each element's box, cut by its clipping ancestors (overflow not visible, body and html excepted: body clips
//    horizontal overflow, AGENTS Gotcha), against the layout width; elements without a box are skipped;
//  - swipe: real touch events (Input.dispatchTouchEvent start / moves / end) on the row, touch emulation on;
//  - contrast: viewer texts made transparent, row + buttons captured inside the viewport (clip in document coordinates), each text colour
//    against the worst pixel inside its own line boxes; « painted » = pixels that differ between text shown and hidden;
//  - focus ring: the button captured focused (real keyboard) then blurred; the pixels that differ are the ring.
// Compared with product 9ed5495 through baseline.json (written by a run on a scratch copy of 9ed5495 served on another port).
// usage (product root):
//   red run + baseline:  P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P63_BASELINE=write node .WIP/pass-loop-p63/evidence/render.mjs
//   the tree:            P48_PROFILES=<scratch> node .WIP/pass-loop-p63/evidence/render.mjs
//   P63_PART=view,links,nojs,outside,others,shots narrows a run (PARTIAL, said top and bottom); P63_OUT names the output file.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P63_BASELINE === 'write';
const PARTS = (process.env.P63_PART || 'view,links,nojs,outside,others,shots').split(','), PARTIAL = !!process.env.P63_PART;
const OUTFILE = process.env.P63_OUT || (PARTIAL ? '' : WRITE ? 'render-red-9ed5495.txt' : 'render.txt');
const BASEFILE = join(HERE, 'baseline.json'), PAGE = '/service-strategie-transformation/';
const OTHERS = ['/', '/service-ia-business/', '/service-venture-building/', '/portfolio/', '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
const PNGS = ['/assets/img/strategy-original.png', '/assets/img/transformation-original.png'];
const LINKS = [{ href: PNGS[0], label: 'Stratégie (nouvel onglet)' }, { href: PNGS[1], label: 'Business model (nouvel onglet)' }];
const CASES = [
  { W: 1200, touch: false, reduce: false, text: '1200 mouse' },
  { W: 1200, touch: false, reduce: true, text: '1200 mouse, reduced motion' },
  { W: 1200, touch: true, reduce: false, text: '1200 touch' },
  { W: 961, touch: false, reduce: false, text: '961 mouse' },
  { W: 960, touch: false, reduce: false, text: '960 mouse' },
  { W: 375, touch: true, reduce: false, text: '375 touch' },
  { W: 375, touch: true, reduce: true, text: '375 touch, reduced motion' },
];

const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
const f = n => (Math.round(n * 10) / 10).toString();
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s: case abandoned')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }

function png(buf) {
  let o = 8, w, h, ct, depth; const idat = [];
  while (o < buf.length) { const len = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len); if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ct = d[9]; } if (type === 'IDAT') idat.push(d); o += 12 + len; }
  if (depth !== 8 || (ct !== 2 && ct !== 6)) throw Error(`png depth ${depth} type ${ct}`);
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const fl = raw[y * (stride + 1)]; for (let x = 0; x < stride; x++) { const v = raw[y * (stride + 1) + 1 + x], a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0; let p; if (fl === 0) p = v; else if (fl === 1) p = v + a; else if (fl === 2) p = v + b; else if (fl === 3) p = v + ((a + b) >> 1); else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); p = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); } px[y * stride + x] = p & 255; } }
  return { w, h, bpp, px };
}
const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (L1, L2) => (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
const rgba = s => { const m = s.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m[3] ?? 1]; };
function each(img, clip, rects, fn) {
  let oob = 0;
  for (const r of rects) for (let y = Math.floor(r.y); y < Math.ceil(r.b); y++) for (let x = Math.floor(r.x); x < Math.ceil(r.r); x++) {
    const px = x - clip.x, py = y - clip.y; if (px < 0 || py < 0 || px >= img.w || py >= img.h) { oob++; continue; }
    fn((py * img.w + px) * img.bpp);
  }
  return oob;
}

// ---- in the page (functions sent as text; all synchronous) ----
const ROW = `document.querySelector('#reflexion [data-viewer]')`, NEXT = `document.querySelectorAll('#reflexion .viewer__btn')[1]`, PREV = `document.querySelectorAll('#reflexion .viewer__btn')[0]`;
function pgState() {
  const X = document.getElementById('reflexion'), row = X.querySelector('[data-viewer]'), nav = X.querySelector('.viewer__nav'), f = n => Math.round(n * 10) / 10;
  const cw = document.documentElement.clientWidth, vb = row ? row.getBoundingClientRect() : null;
  const pics = [...X.querySelectorAll('figure img')].map(im => {
    const r = im.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const inRow = !!vb && r.left >= vb.left - 0.5 && r.right <= vb.right + 0.5 && r.top >= vb.top - 0.5 && r.bottom <= vb.bottom + 0.5;
    const inView = r.left >= -0.5 && r.right <= cw + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5;
    const top = inView && document.elementFromPoint(cx, cy) === im;
    const outRow = !!vb && (r.right <= vb.left + 0.5 || r.left >= vb.right - 0.5);
    return { whole: inRow && inView && top, inRow, inView, top, out: outRow, x: f(r.left), y: f(r.top), w: f(r.width), h: f(r.height), loaded: im.complete && im.naturalWidth > 0 };
  });
  const figs = [...X.querySelectorAll('figure')].map(e => f(e.getBoundingClientRect().height));
  const btns = nav ? [...nav.querySelectorAll('button')].map(b => ({ name: b.getAttribute('aria-label'), text: b.textContent.trim(), disabled: b.disabled, type: b.getAttribute('type') })) : [];
  const pos = nav && nav.querySelector('.viewer__pos'), h2 = X.querySelector('h2');
  const op = (() => { let o = 1; for (let e = X; e; e = e.parentElement) o *= +getComputedStyle(e).opacity; return Math.round(o * 1000) / 1000; })();
  return { on: !!row && row.classList.contains('is-on'), nav: !!nav, pics, figs, btns, pos: pos ? pos.textContent.trim() : null, live: pos ? pos.getAttribute('aria-live') : null,
    row: vb && { l: f(vb.left), r: f(vb.right), w: f(vb.width), h: f(vb.height) }, sl: row ? f(row.scrollLeft) : null, cw, iw: innerWidth, vh: innerHeight, visible: X.classList.contains('is-visible'), op,
    focus: document.activeElement === (nav && nav.querySelectorAll('button')[0]) ? 'prev' : document.activeElement === (nav && nav.querySelectorAll('button')[1]) ? 'next' : document.activeElement ? document.activeElement.tagName.toLowerCase() : null,
    inter: document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded'), ff: getComputedStyle(h2).fontFamily.split(',')[0].replace(/["']/g, '') };
}
function pgAfter() {
  const X = document.getElementById('reflexion'), row = X.querySelector('[data-viewer]') || X.querySelector('.grid'), f = n => Math.round(n * 10) / 10, o = [];
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName) || row.contains(e) || !(row.compareDocumentPosition(e) & 4)) continue;
    if (!e.getClientRects().length) { o.push(e.tagName.toLowerCase() + ' no box'); continue; }
    const r = e.getBoundingClientRect(); o.push(`${e.tagName.toLowerCase()} ${f(r.left + scrollX)} ${f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return o;
}
function pgPast() {
  const W = document.documentElement.clientWidth, o = []; let clipped = 0;
  for (const e of document.querySelectorAll('body *')) {
    const r0 = e.getBoundingClientRect(); if (r0.width === 0 && r0.height === 0) continue;
    let right = r0.right, left = r0.left;
    for (let a = e.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible') { const ra = a.getBoundingClientRect(); right = Math.min(right, ra.right); left = Math.max(left, ra.left); } }
    if (right < r0.right - 0.5) clipped++;
    if (right <= left) continue; // wholly cut away by a clipping ancestor: not painted
    if (right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + right.toFixed(1));
  }
  return { o, clipped };
}
function pgRuns() {
  const X = document.getElementById('reflexion'), row = X.querySelector('[data-viewer]'), nav = X.querySelector('.viewer__nav'), runs = [];
  const vr = row.getBoundingClientRect(), nr = nav.getBoundingClientRect();
  for (const root of [row, nav]) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) {
      if (!n.data.trim()) continue; const pe = n.parentElement, g = document.createRange(); g.selectNodeContents(n);
      const rects = [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0 && r.left >= vr.left - 0.5 && r.right <= vr.right + 0.5).map(r => ({ x: r.left, y: r.top, r: r.right, b: r.bottom }));
      if (!rects.length) continue; const cs = getComputedStyle(pe);
      runs.push({ key: pe.tagName.toLowerCase() + (pe.className ? '.' + String(pe.className).split(/\s+/)[0] : '') + (pe.disabled ? ' (disabled)' : '') + ' « ' + n.data.trim().slice(0, 20) + ' » ' + cs.color, color: cs.color, rects });
    }
  }
  const t = Math.min(vr.top, nr.top), b = Math.max(vr.bottom, nr.bottom);
  return { runs, clip: { x: 0, y: Math.floor(t) - 4, r: document.documentElement.clientWidth, b: Math.ceil(b) + 4 }, vh: innerHeight, cw: document.documentElement.clientWidth };
}
function pgHide(on) { let s = document.getElementById('p63-hide'); if (on && !s) { s = document.createElement('style'); s.id = 'p63-hide'; s.textContent = '#reflexion .viewer__nav, #reflexion .viewer__nav *, #reflexion figcaption { -webkit-text-fill-color: transparent !important; }'; document.head.append(s); } if (!on && s) s.remove(); return 1; }
// every box of #reflexion and its content (scripts disabled), document coordinates
function pgSection() { const X = document.getElementById('reflexion'), f = n => Math.round(n * 10) / 10; return [X, ...X.querySelectorAll('*')].map(e => { if (!e.getClientRects().length) return e.tagName.toLowerCase() + ' no box'; const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${f(r.left + scrollX)} ${f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`; }); }
// everything outside #reflexion: above in document coordinates, below measured from its bottom edge (P62 method)
function pgBoxes() {
  const X = document.getElementById('reflexion'), f = n => Math.round(n * 10) / 10, out = [], xb = X.getBoundingClientRect();
  const closed = e => { const d = e.closest('details:not([open])'); return !!d && e !== d && !e.closest('summary'); };
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName) || closed(e) || X.contains(e) || e.contains(X)) continue;
    if (!e.getClientRects().length) { out.push(e.tagName.toLowerCase() + ' no box'); continue; }
    const r = e.getBoundingClientRect(), after = X.compareDocumentPosition(e) & 4;
    out.push(`${e.tagName.toLowerCase()} ${f(r.left + scrollX)} ${after ? 'X+' + f(r.top - xb.bottom) : f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return out;
}
function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return [document.querySelector('.site-header'), ...document.querySelectorAll('main > *'), document.querySelector('.site-footer')].filter(Boolean).map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)); }

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
const state = p => settled(p, `(${pgState})()`);
// the keyboard scrolls only the focused button into view: the row is put back in the middle of the window (focus kept) before reading
const seen = async p => { await p.ev(`(()=>{const r=${ROW};r.scrollIntoView({block:'center',behavior:'instant'});return 1})()`); await sleep(200); return state(p); };
// the row scrolled to the middle of the window; then wait (from Node) for the reveal and for the pictures' files
async function reach(p) {
  await p.ev(`(()=>{const r=${ROW}||document.querySelector('#reflexion .grid');r.scrollIntoView({block:'center',behavior:'instant'});return 1})()`);
  let st; for (let i = 0; i < 60; i++) { await sleep(100); st = await p.ev(`(${pgState})()`); if (st.op > 0.999 && (p.nojs || st.visible) && st.pics.every(x => x.loaded)) break; }
  await sleep(300); return state(p);
}
const center = expr => `(()=>{const e=${expr};const r=e.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)e.scrollIntoView({block:'center',behavior:'instant'});const q=e.getBoundingClientRect(),x=q.x+q.width/2,y=q.y+q.height/2;return {x,y,top:e.contains(document.elementFromPoint(x,y))}})()`;
async function aim(p, expr) { await p.ev(center(expr)); await sleep(120); return p.ev(center(expr)); }
const mouse = (p, type, d, extra = {}) => p.s('Input.dispatchMouseEvent', { type, x: d.x, y: d.y, ...extra });
async function click(p, expr, wait = 0) { const d = await aim(p, expr); await mouse(p, 'mouseMoved', d); await mouse(p, 'mousePressed', d, { button: 'left', clickCount: 1 }); await mouse(p, 'mouseReleased', d, { button: 'left', clickCount: 1 }); if (wait) await sleep(wait); return d.top; }
async function tap(p, expr, wait = 0) { const d = await aim(p, expr); await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y }] }); await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); if (wait) await sleep(wait); return d.top; }
const away = p => mouse(p, 'mouseMoved', { x: 3, y: 3 });
// a real finger: touch start in the row, eight moves of `dx` in all, touch end
async function swipe(p, dx) {
  const d = await aim(p, ROW); const y = d.y, x0 = d.x - dx / 2;
  await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= 8; i++) { await p.s('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / 8, y }] }); await sleep(16); }
  await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function tabTo(p, expr, max = 200, mods = 0) { for (let i = 0; i <= max; i++) { if (await p.ev(`document.activeElement===${expr}`)) return i; await p.key('Tab', mods); } return -1; }
async function shotPng(p, clip) {
  const [sx, sy] = await p.ev('[scrollX, scrollY]');
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', clip: { x: clip.x + sx, y: clip.y + sy, width: clip.r - clip.x, height: clip.b - clip.y, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); return png(Buffer.from(got.data, 'base64'));
}
const inside = c => c.x >= 0 && c.y >= 0 && c.r <= c.cw && c.b <= c.vh;
const fontOk = st => st.inter && st.ff === 'Inter';
const shows = (st, i) => st.pics[i].whole && st.pics[1 - i].out && st.pos === `${i + 1} / 2` && st.btns.length === 2 && st.btns[0].disabled === (i === 0) && st.btns[1].disabled === (i === 1);
const desc = st => `pos « ${st.pos} », scrollLeft ${st.sl}, picture 1 ${st.pics[0].whole ? 'whole' : st.pics[0].out ? 'outside the row' : JSON.stringify(st.pics[0])}, picture 2 ${st.pics[1].whole ? 'whole' : st.pics[1].out ? 'outside the row' : JSON.stringify(st.pics[1])}, buttons disabled ${st.btns.map(b => b.disabled).join('/')}, focus ${st.focus}`;

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null;
const fresh = { from: BASE, outside: {}, nojs: {}, sections: {} };
if (!WRITE && !base && PARTS.some(x => ['outside', 'others', 'nojs'].includes(x))) check(false, 'baseline.json missing: nothing can be compared with 9ed5495');
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${Array.isArray(value) ? value.length + ' entries' : JSON.stringify(value)}`); return true; }
  if (!base) return false;
  const want = base[kind][key]; let why = '';
  if (want === undefined) why = ' (no baseline entry)';
  else if (JSON.stringify(want) !== JSON.stringify(value)) { if (Array.isArray(want)) { const d = []; for (let i = 0; i < Math.max(want.length, value.length) && d.length < 6; i++) if (want[i] !== value[i]) d.push(`#${i} 9ed5495 « ${want[i]} » now « ${value[i]} »`); why = `\n        9ed5495 ${want.length} entries, now ${value.length}; first differences: ${d.join(' | ')}`; } else why = `\n        9ed5495: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}`; }
  return check(!why, `${text} = 9ed5495 (${Array.isArray(value) ? value.length + ' entries' : 'value'})${why}`);
}

// ---- Done When 2 ----
async function viewCase(b, c) {
  const label = `Stratégie ${c.text}`, act = c.touch ? tap : click, actName = c.touch ? 'tap' : 'click';
  const p = await b.page(c.W, { height: 900, touch: c.touch, reduce: c.reduce }); const ready = await load(p, BASE + PAGE, { reveal: false });
  let st = await reach(p);
  log(` -- ${label}: innerWidth ${st.iw}, layout width ${st.cw}; viewer row ${JSON.stringify(st.row)}; figure heights ${st.figs.join(' / ')}; pictures ${st.pics.map(x => x.w + 'x' + x.h).join(' / ')}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}; section is-visible ${st.visible}, opacity product ${st.op}; pictures loaded ${st.pics.map(x => x.loaded).join('/')}`);
  if (!check(st.on && st.nav && st.btns.length === 2, `${label}: viewer present: row.is-on ${st.on}, nav ${st.nav}, ${st.btns.length} buttons`)) { check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`); await p.close(); return; }
  check(st.btns[0].name === 'Image précédente' && st.btns[1].name === 'Image suivante' && st.btns[0].text === '‹' && st.btns[1].text === '›' && st.btns.every(x => x.type === 'button') && st.live === 'polite',
    `${label}: buttons ${JSON.stringify(st.btns.map(x => [x.text, x.name, x.type]))}, position aria-live ${st.live}`);
  check(st.figs.length === 2 && st.figs[0] === st.figs[1], `${label}: both figures the same height (decision 3): ${st.figs.join(' / ')} px`);
  check(shows(st, 0), `${label}: on arrival picture 1 whole, picture 2 not visible: ${desc(st)}`);
  // nothing below moves, and the disabled « ‹ » does nothing
  // spy on the row's scrollTo (headless Chrome ends a smooth scroll at once: the behaviour asked is what can be read)
  await p.ev(`(()=>{const r=${ROW};r.__calls=[];const o=r.scrollTo.bind(r);r.scrollTo=a=>{r.__calls.push(a&&a.behavior);o(a)};return 1})()`);
  const after1 = await settled(p, `(${pgAfter})()`);
  await act(p, PREV, 50); const s0 = await state(p);
  check(shows(s0, 0) && s0.sl === st.sl, `${label}: ${actName} on the disabled « ‹ » changes nothing: ${desc(s0)}`);
  // « › » by mouse or finger
  await act(p, NEXT, 0); const quick = await p.ev(`${ROW}.scrollLeft`); st = await state(p);
  check(shows(st, 1), `${label}: ${actName} « › » shows picture 2: ${desc(st)}`);
  const calls = await p.ev(`${ROW}.__calls`), want = c.reduce ? 'auto' : 'smooth';
  check(calls.length >= 1 && calls.every(x => x === want) && (!c.reduce || Math.abs(quick - st.sl) < 1), `${label}: the ${actName} asks the row for behaviour ${JSON.stringify(calls)} (expected « ${want} »); scrollLeft read right after it ${f(quick)}, final ${st.sl}`);
  const after2 = await settled(p, `(${pgAfter})()`); let k = 0; while (k < after1.length && after1[k] === after2[k]) k++;
  check(after1.length > 20 && JSON.stringify(after1) === JSON.stringify(after2), `${label}: ${after1.length} boxes after the viewer row equal on picture 1 and picture 2${k < Math.max(after1.length, after2.length) ? `; first difference #${k}: « ${after1[k]} » / « ${after2[k]} »` : ''}`);
  await act(p, NEXT, 50); const s2 = await state(p);
  check(shows(s2, 1) && s2.sl === st.sl, `${label}: ${actName} on the disabled « › » changes nothing: ${desc(s2)}`);
  await act(p, PREV, 0); st = await state(p);
  check(shows(st, 0), `${label}: ${actName} « ‹ » brings back picture 1: ${desc(st)}`);
  // real keyboard: from the first link after the section, Shift+Tab back to « › », Enter, Enter
  await away(p); await p.ev(`(document.querySelector('#reflexion ~ section a, #reflexion ~ section button').focus(),1)`);
  const n = await tabTo(p, NEXT, 20, 8); await sleep(150); const fv = await p.ev(`document.activeElement.matches(':focus-visible')`);
  await p.key('Enter'); st = await seen(p);
  check(n >= 1 && fv && shows(st, 1) && st.focus === 'prev', `${label}: keyboard: ${n} Shift+Tab → « › » (:focus-visible ${fv}), Enter shows picture 2: ${desc(st)} (the disabled « › » hands the focus to « ‹ »)`);
  // the focus ring of « ‹ », from pixels (focused by the keyboard path above)
  const rc = await p.ev(`(()=>{const r=${PREV}.getBoundingClientRect();return {x:Math.floor(r.left)-10,y:Math.floor(r.top)-10,r:Math.ceil(r.right)+10,b:Math.ceil(r.bottom)+10,cw:document.documentElement.clientWidth,vh:innerHeight}})()`);
  let ring = { n: 0, median: 0 };
  if (inside(rc)) { const a = await shotPng(p, rc); await p.ev(`(document.activeElement.blur(),1)`); await sleep(150); const z = await shotPng(p, rc); const rs = []; for (let i = 0; i < a.px.length; i += a.bpp) if (Math.abs(a.px[i] - z.px[i]) + Math.abs(a.px[i + 1] - z.px[i + 1]) + Math.abs(a.px[i + 2] - z.px[i + 2]) > 60) rs.push(ratio(lum(a.px[i], a.px[i + 1], a.px[i + 2]), lum(z.px[i], z.px[i + 1], z.px[i + 2]))); rs.sort((x, y) => x - y); ring = { n: rs.length, median: rs.length ? rs[rs.length >> 1] : 0 }; await p.ev(`(${PREV}.focus(),1)`); await sleep(100); }
  check(ring.n >= 100 && ring.median >= 3, `${label}: focus ring of « ‹ »: ${ring.n} pixels differ focused / blurred, median ${ring.median.toFixed(2)}:1 (clip inside the viewport ${inside(rc)})`);
  const fv2 = await p.ev(`document.activeElement===${PREV}`);
  await p.key('Enter'); st = await seen(p);
  check(fv2 && shows(st, 0) && st.focus === 'next', `${label}: keyboard: Enter on « ‹ » brings back picture 1: ${desc(st)}`);
  // swipe with a finger (touch cases)
  if (c.touch) {
    await swipe(p, -Math.round(st.row.w * 0.6)); st = await state(p);
    check(shows(st, 1), `${label}: swipe to the left (real touch events, ${Math.round(st.row.w * 0.6)} px) shows picture 2: ${desc(st)}`);
    await swipe(p, Math.round(st.row.w * 0.6)); st = await state(p);
    check(shows(st, 0), `${label}: swipe to the right brings back picture 1: ${desc(st)}`);
  }
  const past = await p.ev(`(${pgPast})()`); check(past.o.length === 0, `${label}: elements past the layout width ${st.cw} px: ${past.o.length}${past.o.length ? ' ' + JSON.stringify(past.o.slice(0, 5)) : ''} (${past.clipped} boxes cut by a clipping ancestor, counted at their painted part)`);
  // contrast of the viewer texts, on picture 1 then picture 2
  for (const i of [0, 1]) {
    if (i === 1) { await act(p, NEXT, 0); await state(p); }
    await p.ev(`(()=>{const r=${ROW};r.scrollIntoView({block:'center',behavior:'instant'});return 1})()`); await sleep(300);
    const g = await p.ev(`(${pgRuns})()`), clip = { ...g.clip, cw: g.cw, vh: g.vh };
    if (!check(inside(clip) && g.runs.length >= 3, `${label}: contrast, picture ${i + 1}: clip ${JSON.stringify(g.clip)} inside the viewport ${inside(clip)}, ${g.runs.length} pieces of text`)) continue;
    const shown = await shotPng(p, clip); await p.ev(`(${pgHide})(true)`); await sleep(150); const hidden = await shotPng(p, clip); await p.ev(`(${pgHide})(false)`);
    const groups = new Map();
    for (const run of g.runs) {
      const t = rgba(run.color); let min = 99, at = null, ink = 0, nn = 0;
      const oob = each(hidden, clip, run.rects, i2 => { nn++; const R0 = hidden.px[i2], G0 = hidden.px[i2 + 1], B0 = hidden.px[i2 + 2], cr = ratio(lum(t[3] * t[0] + (1 - t[3]) * R0, t[3] * t[1] + (1 - t[3]) * G0, t[3] * t[2] + (1 - t[3]) * B0), lum(R0, G0, B0)); if (cr < min) { min = cr; at = [R0, G0, B0]; } if (Math.abs(shown.px[i2] - R0) + Math.abs(shown.px[i2 + 1] - G0) + Math.abs(shown.px[i2 + 2] - B0) > 90) ink++; });
      const e = groups.get(run.key) || { min: 99, at: null, px: 0, oob: 0, ink: 0 }; if (min < e.min) { e.min = min; e.at = at; } e.px += nn; e.oob += oob; e.ink += ink; groups.set(run.key, e);
    }
    for (const [key, e] of [...groups].sort()) check(e.min >= 4.5 && e.oob === 0 && e.ink > 0, `${label}: picture ${i + 1}: text ${key} against the worst pixel behind it rgb(${e.at}) = ${e.min.toFixed(2)}:1 (${e.px} pixels${e.oob ? `, ${e.oob} outside the capture` : ''}; painted ${e.ink})`);
  }
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 3: the links ----
async function linksCase(b, W, touch) {
  const label = `Stratégie ${W} ${touch ? 'touch' : 'mouse'} links`;
  const opened = []; const off = b.on(m => { if ((m.method === 'Target.targetCreated' || m.method === 'Target.targetInfoChanged') && m.params.targetInfo.type === 'page') opened.push(m.params.targetInfo); });
  await b.send('Target.setDiscoverTargets', { discover: true });
  const p = await b.page(W, { height: 900, touch }); await load(p, BASE + PAGE, { reveal: false }); let st = await reach(p);
  const attrs = await p.ev(`[...document.querySelectorAll('#reflexion figure a')].map(a=>({href:a.getAttribute('href'),target:a.getAttribute('target'),rel:a.getAttribute('rel'),label:a.getAttribute('aria-label')}))`);
  check(attrs.length === 2 && attrs.every((a, i) => a.href === LINKS[i].href && a.target === '_blank' && a.rel === 'noopener' && a.label === LINKS[i].label), `${label}: link attributes ${JSON.stringify(attrs)}`);
  const newTab = async (gesture, i) => {
    const from = opened.length; await gesture(); let hit = null;
    for (let k = 0; k < 40 && !hit; k++) { await sleep(150); hit = opened.slice(from).find(t => t.url.endsWith(PNGS[i])); }
    const ids = [...new Set(opened.slice(from).map(t => t.targetId))]; for (const id of ids) await b.send('Target.closeTarget', { targetId: id }).catch(() => 0);
    return hit ? hit.url.replace(/^https?:\/\/[^/]+/, '') : `none (${opened.slice(from).map(t => t.url).join(', ') || 'no new tab'})`;
  };
  if (!st.on) check(false, `${label}: no viewer (row.is-on false): picture 2 cannot be shown by « › »`);
  const pointer = touch ? tap : click, name = touch ? 'tap' : 'click';
  const u1 = await newTab(() => pointer(p, `document.querySelectorAll('#reflexion figure a')[0]`), 0);
  check(u1 === PNGS[0], `${label}: ${name} on picture 1 opens a new tab at ${u1}`);
  if (st.on) { await pointer(p, NEXT); st = await state(p); }
  const u2 = await newTab(() => pointer(p, `document.querySelectorAll('#reflexion figure a')[1]`), 1);
  check(u2 === PNGS[1] && (!st.on || shows(st, 1)), `${label}: ${name} on picture 2 (shown by « › »: ${st.on ? desc(st) : 'no viewer'}) opens a new tab at ${u2}`);
  // keyboard: back to picture 1, real Tab from the page header to the link of picture 1, Enter; Tab to the link of picture 2, Enter
  if (st.on) { await pointer(p, PREV); await state(p); }
  await away(p); await p.ev(`(document.querySelector('.site-header a').focus(),1)`);
  const n1 = await tabTo(p, `document.querySelectorAll('#reflexion figure a')[0]`); await sleep(400); const k1 = await state(p);
  const v1 = await newTab(() => p.key('Enter'), 0);
  check(n1 > 0 && k1.pics[0].whole && v1 === PNGS[0], `${label}: keyboard: ${n1} Tab → link of picture 1 (picture 1 whole ${k1.pics[0].whole}), Enter opens a new tab at ${v1}`);
  await p.key('Tab'); const k2 = await state(p); const isL2 = await p.ev(`document.activeElement===document.querySelectorAll('#reflexion figure a')[1]`);
  const v2 = await newTab(() => p.key('Enter'), 1);
  check(isL2 && k2.pics[1].whole && (!k2.on || k2.pos === '2 / 2') && v2 === PNGS[1], `${label}: keyboard: Tab → link of picture 2 (focused ${isL2}; the row follows the focus: ${k2.on ? desc(k2) : 'no viewer'}), Enter opens a new tab at ${v2}`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  off(); await b.send('Target.setDiscoverTargets', { discover: false }); await p.close();
}

// ---- Done When 3: scripts disabled ----
async function nojsCase(b, W) {
  const label = `Stratégie ${W} scripts disabled`;
  const p = await b.page(W, { height: 900, nojs: true }); const ready = await load(p, BASE + PAGE, { reveal: false });
  const boxes = await settled(p, `(${pgSection})()`);
  compare('nojs', `${W}`, boxes, `${label}: every box of #reflexion and its content`);
  const vis = [];
  for (const i of [0, 1]) { await p.ev(`(document.querySelectorAll('#reflexion figure img')[${i}].scrollIntoView({block:'center',behavior:'instant'}),1)`); await sleep(300); const st = await p.ev(`(${pgState})()`); vis.push(st.pics[i]); }
  const st = await p.ev(`(${pgState})()`);
  check(ready && fontOk(st) && !st.on && !st.nav && vis.every(x => x.inView && x.top && x.loaded), `${label}: page ready ${ready}, Inter ${st.inter}; no viewer (is-on ${st.on}, nav ${st.nav}); each picture scrolled to: in the viewport and topmost at its centre ${vis.map(x => x.inView && x.top).join('/')}, loaded ${vis.map(x => x.loaded).join('/')}, sizes ${vis.map(x => x.w + 'x' + x.h).join(' / ')}`);
  await p.close();
}

// ---- Done When 4 ----
async function outsideCase(b, W) {
  const label = `Stratégie ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, BASE + PAGE);
  const st = await state(p); check(ready && fontOk(st), `${label}: page ready ${ready}, Inter ${st.inter}; #reflexion viewer ${st.on}`);
  compare('outside', `${W}`, await settled(p, `(${pgBoxes})()`), `${label}: boxes of everything outside #reflexion (above in document coordinates, below measured from its bottom edge)`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
async function otherPage(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, BASE + route);
  check(ready, `${label}: page ready ${ready}`);
  compare('sections', `${route}|${W}`, await settled(p, `(${pgSections})()`), `${label}: heights of header, each main block and footer`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 6: the three kept captures (inside the viewport, refused when the heading font is not Inter) ----
async function capture(b, W, i) {
  const file = `reflexion-${W}${W === 1200 ? '-' + (i + 1) : ''}.jpg`;
  const p = await b.page(W, { height: 1400, touch: W < 861 }); await load(p, BASE + PAGE, { reveal: false }); let st = await reach(p);
  if (!fontOk(st)) { check(false, `capture ${file}: refused, heading font is not Inter`); await p.close(); return; }
  if (i === 1) { await click(p, NEXT); st = await state(p); }
  await p.ev(`(()=>{const X=document.getElementById('reflexion');scrollTo(0,X.getBoundingClientRect().top+scrollY-100);return 1})()`); await sleep(600); // below the sticky header
  const g = await p.ev(`(()=>{const r=document.getElementById('reflexion').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight}})()`);
  if (check(g.y >= 0 && g.y + g.height <= g.vh && shows(st, i), `capture ${file}: #reflexion ${g.width}x${g.height} wholly inside the ${g.vh} px viewport, picture ${i + 1} shown (${desc(st)})`)) {
    const [sx, sy] = await p.ev('[scrollX, scrollY]');
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(join(process.env.P63_SHOTS || HERE, file), Buffer.from(got.data, 'base64')); log(`        capture ${file} ${g.width}x${g.height}`);
  }
  await p.close();
}

log(`RENDER p63 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of 9ed5495: comparisons are written, not checked; the viewer checks run and are expected to FAIL)' : ''}${PARTIAL ? ` — PARTIAL RUN, parts: ${PARTS.join(', ')}` : ''}`);
const b = await browser();
try {
  if (PARTS.includes('view')) { log('== Stratégie — the viewer (Done When 2)'); for (const c of CASES) await guard(c.text, () => viewCase(b, c)); }
  if (PARTS.includes('links')) { log('== Stratégie — the links to the originals (Done When 3)'); for (const [W, t] of [[1200, false], [375, true]]) await guard(`links ${W}`, () => linksCase(b, W, t)); }
  if (PARTS.includes('nojs')) { log('== Stratégie — scripts disabled (Done When 3)'); for (const W of [1200, 375]) await guard(`nojs ${W}`, () => nojsCase(b, W)); }
  if (PARTS.includes('outside')) { log('== Stratégie — everything outside #reflexion (Done When 4)'); for (const W of [1200, 375]) await guard(`outside ${W}`, () => outsideCase(b, W)); }
  if (PARTS.includes('others')) { log('== the nine other shell pages (Done When 4)'); for (const route of OTHERS) for (const W of [1200, 375]) await guard(`${route} ${W}`, () => otherPage(b, route, W)); }
  if (PARTS.includes('shots') && !WRITE) { log('== kept captures (Done When 6)'); for (const [W, i] of [[1200, 0], [1200, 1], [375, 0]]) await guard(`capture ${W} ${i + 1}`, () => capture(b, W, i)); }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
if (WRITE && !PARTIAL) { writeFileSync(BASEFILE, JSON.stringify(fresh, null, 0).replace(/\],"/g, '],\n"') + '\n'); log(`baseline.json written: ${Object.keys(fresh.outside).length} « outside » lists, ${Object.keys(fresh.nojs).length} « nojs » lists, ${Object.keys(fresh.sections).length} « sections » lists`); }
log(`RENDER ${BASE}: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (${PARTS.join(', ')}): not the full render` : ''}`);
if (OUTFILE) writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
