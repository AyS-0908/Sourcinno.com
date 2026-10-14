// p62 Done When 2, 3, 5, 6, 7: the home « Démarche » as text, rendered in headless Chrome.
// The Pass 61 render (.WIP/pass-loop-p61/evidence/render.mjs) retargeted to #demarche, tab and hover parts dropped;
// browser() = ./cdp.mjs (the P61 file, unchanged).
// What « visible », « moves » and « contrast » mean here:
//  - visible: each text node of #demarche, its parent scrolled to the centre of a 900 px window, has line boxes inside the
//    viewport, its parent passes checkVisibility (opacity and visibility), the product of the opacities of its ancestors
//    is 1, and the element topmost at its first line is that parent (or inside it) — never a computed style alone;
//  - stage layout: the tops of the four li.dm-step (one row of four at 1200, two rows of two at 960, four rows at 375);
//  - « moves »: boxes (document coordinates, 0.1 px) of every element outside #demarche against baseline.json; what follows
//    #demarche is measured from its bottom edge, so « equal » = above unchanged and below shifted by exactly the height
//    change of #demarche; an element without a box is listed as « no box »;
//  - contrast: a tall window holds the whole section; text made transparent, the section captured INSIDE the viewport
//    (clip in document coordinates), each text colour against the worst pixel inside its own line boxes; « painted »
//    counts the pixels that differ between text shown and text hidden. The four stage numbers (::before, white on
//    teal-dark) are read on the 18x18 px square at the centre of their 36 px disc.
// Compared with product 0ab4687 through baseline.json (written on a scratch copy served on another port).
// usage (product root):
//   red run + baseline, scratch copy of 0ab4687 on 4174:
//     P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P62_BASELINE=write node .WIP/pass-loop-p62/evidence/render.mjs
//   the tree: P48_PROFILES=<scratch> node .WIP/pass-loop-p62/evidence/render.mjs
//   P62_PART=text,view,... narrows a run (PARTIAL, said top and bottom). P62_MOCK = the mockup page (default 4174).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P62_BASELINE === 'write';
const PARTS = (process.env.P62_PART || 'text,view,width,outside,xp,others,shots').split(','), PARTIAL = !!process.env.P62_PART;
const OUTFILE = process.env.P62_OUT || (PARTIAL ? '' : WRITE ? 'render-red-0ab4687.txt' : 'render.txt');
const BASEFILE = join(HERE, 'baseline.json'), HOME = '/';
const MOCK = process.env.P62_MOCK || 'http://127.0.0.1:4174/.WIP/mockup-v12/';
const TREE = process.env.P62_TREE || join(HERE, '..', '..', '..'); // product root holding index.html
const MOCKFILE = process.env.P62_MOCKFILE || join(TREE, '..', 'previews', 'v12', 'index.html');
const OTHERS = ['/service-strategie-transformation/', '/service-ia-business/', '/service-venture-building/', '/portfolio/', '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
const ROWS = { 1200: 1, 960: 2, 375: 4 }, XP = { 1200: 906.9, 961: 898.5, 960: 1394, 375: 1569.2 }; // XP: Pass 61, measured at 0ab4687

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

// ---- Done When 2, from the files: tags removed, entities decoded, white space collapsed ----
const strip = s => s.replace(/<[^>]*>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
function sectionOf(file, open) {
  const src = readFileSync(file, 'utf8'), i = src.indexOf(open); if (i < 0) return null;
  const j = src.indexOf('</section>', i); const line = n => src.slice(0, n).split('\n').length;
  return { html: src.slice(i, j + 10), from: line(i), to: line(j) };
}

// ---- in the page (functions sent as text; all synchronous) ----
function pgText(sel) {
  const X = document.querySelector(sel); if (!X) return null; const tw = document.createTreeWalker(X, NodeFilter.SHOW_TEXT), t = [];
  for (let n; (n = tw.nextNode());) t.push(n.data);
  const text = t.join(' ').replace(/\s+/g, ' ').trim();
  return { text, details: X.querySelectorAll('details').length, closed: X.querySelectorAll('details:not([open])').length, emoji: (text.match(/[\p{Extended_Pictographic}️]/gu) || []).length, steps: X.querySelectorAll('.dm-step').length, deliv: X.querySelectorAll('.dm-deliv__grid > li').length };
}
function pgVis() {
  const X = document.getElementById('demarche'), cw = document.documentElement.clientWidth, tw = document.createTreeWalker(X, NodeFilter.SHOW_TEXT), res = [];
  for (let n; (n = tw.nextNode());) {
    if (!n.data.trim()) continue; const pe = n.parentElement; pe.scrollIntoView({ block: 'center', behavior: 'instant' });
    const g = document.createRange(); g.selectNodeContents(n); const rects = [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0);
    let op = 1; for (let e = pe; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const r0 = rects[0], t = r0 ? document.elementFromPoint(r0.left + Math.min(r0.width / 2, 12), r0.top + r0.height / 2) : null;
    const inV = rects.length > 0 && rects.every(r => r.left >= -0.5 && r.right <= cw + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5);
    const top = !!t && X.contains(t) && (t === pe || pe.contains(t) || t.contains(pe));
    const vis = pe.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    res.push({ text: n.data.trim().slice(0, 40), ok: inV && top && vis && op > 0.999, inV, top, vis, op: Math.round(op * 1000) / 1000, lines: rects.length });
  }
  return res;
}
function pgLayout() {
  const X = document.getElementById('demarche'), f = n => Math.round(n * 10) / 10, cw = document.documentElement.clientWidth;
  const steps = [...X.querySelectorAll('.dm-step')].map(e => e.getBoundingClientRect()), deliv = [...X.querySelectorAll('.dm-deliv__grid > li')].map(e => e.getBoundingClientRect());
  const rows = a => { const m = new Map(); for (const r of a) { const k = Math.round(r.top); m.set(k, (m.get(k) || 0) + 1); } return [...m.values()]; };
  const h2 = X.querySelector('h2'), xb = X.getBoundingClientRect();
  return { steps: rows(steps), deliv: rows(deliv), lefts: steps.map(r => f(r.left)), visible: X.classList.contains('is-visible'), secH: f(xb.height), iw: innerWidth, cw,
    inter: document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded'), ff: getComputedStyle(h2).fontFamily.split(',')[0].replace(/["']/g, '') };
}
function pgOpacity() { let op = 1; for (let e = document.getElementById('demarche'); e; e = e.parentElement) op *= +getComputedStyle(e).opacity; return op; }
function pgPast() { const W = document.documentElement.clientWidth, o = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + r.right.toFixed(1)); } return o; }
function pgRuns() {
  const X = document.getElementById('demarche'), runs = [], tw = document.createTreeWalker(X, NodeFilter.SHOW_TEXT); let boxless = 0;
  for (let n; (n = tw.nextNode());) {
    if (!n.data.trim()) continue; const pe = n.parentElement, g = document.createRange(); g.selectNodeContents(n);
    const rects = [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({ x: r.left, y: r.top, r: r.right, b: r.bottom })), cs = getComputedStyle(pe);
    if (!rects.length) { boxless++; continue; }
    runs.push({ key: pe.tagName.toLowerCase() + (typeof pe.className === 'string' && pe.className ? '.' + pe.className.split(/\s+/)[0] : '') + ' ' + cs.color, color: cs.color, rects });
  }
  for (const li of X.querySelectorAll('.dm-step')) { const c = getComputedStyle(li, '::before'); if (c.content === 'none') continue; const r = li.getBoundingClientRect(), half = parseFloat(c.width) / 2; const cx = r.left + parseFloat(c.left) + half, cy = r.top + parseFloat(c.top) + half; runs.push({ key: 'li.dm-step::before (number) ' + c.color, color: c.color, rects: [{ x: cx - 9, y: cy - 9, r: cx + 9, b: cy + 9 }] }); }
  const b = X.getBoundingClientRect();
  return { runs, boxless, clip: { x: 0, y: Math.floor(b.top) - 4, r: document.documentElement.clientWidth, b: Math.ceil(b.bottom) + 4 }, vh: innerHeight, cw: document.documentElement.clientWidth };
}
function pgHide(on) { let s = document.getElementById('p62-hide'); if (on && !s) { s = document.createElement('style'); s.id = 'p62-hide'; s.textContent = '#demarche, #demarche *, #demarche *::before { -webkit-text-fill-color: transparent !important; }'; document.head.append(s); } if (!on && s) s.remove(); return 1; }
function pgBoxes() {
  const X = document.getElementById('demarche'), f = n => Math.round(n * 10) / 10, out = [], xb = X.getBoundingClientRect();
  const closed = e => { const d = e.closest('details:not([open])'); return !!d && e !== d && !e.closest('summary'); };
  const tech = e => /^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName);
  for (const e of document.body.querySelectorAll('*')) {
    if (tech(e) || closed(e) || X.contains(e) || e.contains(X)) continue;
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
// scripts on: the section scrolled into view, then wait (from Node) for is-visible and an opacity product of 1
async function reach(p) {
  await p.ev(`(document.getElementById('demarche').scrollIntoView({block:'start',behavior:'instant'}),1)`);
  let op = 0, vis = false; for (let i = 0; i < 40; i++) { await sleep(100); op = await p.ev(`(${pgOpacity})()`); vis = await p.ev(`document.getElementById('demarche').classList.contains('is-visible')`); if (op > 0.999 && (p.nojs || vis)) break; }
  await sleep(200); return { op, vis };
}
async function shotPng(p, clip) {
  const [sx, sy] = await p.ev('[scrollX, scrollY]');
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', clip: { x: clip.x + sx, y: clip.y + sy, width: clip.r - clip.x, height: clip.b - clip.y, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); return png(Buffer.from(got.data, 'base64'));
}
const inside = c => c.x >= 0 && c.y >= 0 && c.r <= c.cw && c.b <= c.vh;
const fontOk = st => st.inter && st.ff === 'Inter';

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null;
const fresh = { from: BASE, outside: {}, demarche: {}, sections: {} };
if (!WRITE && !base && PARTS.some(x => ['outside', 'others'].includes(x))) check(false, 'baseline.json missing: nothing can be compared with 0ab4687');
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${Array.isArray(value) ? value.length + ' entries' : JSON.stringify(value)}`); return true; }
  if (!base) return false;
  const want = base[kind][key]; let why = '';
  if (want === undefined) why = ' (no baseline entry)';
  else if (JSON.stringify(want) !== JSON.stringify(value)) { if (Array.isArray(want)) { const d = []; for (let i = 0; i < Math.max(want.length, value.length) && d.length < 6; i++) if (want[i] !== value[i]) d.push(`#${i} 0ab4687 « ${want[i]} » now « ${value[i]} »`); why = `\n        0ab4687 ${want.length} entries, now ${value.length}; first differences: ${d.join(' | ')}`; } else why = `\n        0ab4687: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}`; }
  return check(!why, `${text} = 0ab4687 (${Array.isArray(value) ? value.length + ' entries' : 'value'})${why}`);
}

// ---- Done When 2 ----
async function textCase(b) {
  if (!WRITE) {
    const site = sectionOf(join(TREE, 'index.html'), '<section class="section reveal" id="demarche">'), mock = sectionOf(MOCKFILE, '<section class="section m-demarche">');
    if (!check(!!site && !!mock, `files: #demarche in ${join(TREE, 'index.html')} ${site ? `:${site.from}–${site.to}` : 'NOT FOUND'}; mockup section ${mock ? `:${mock.from}–${mock.to}` : 'NOT FOUND'} of ${MOCKFILE}`)) return;
    const a = strip(site.html), z = strip(mock.html); let k = 0; while (k < a.length && a[k] === z[k]) k++;
    check(a === z, `files: text of #demarche (tags removed, white space collapsed) equals the mockup section's: ${a.length} / ${z.length} characters${a === z ? '' : `; first difference at ${k}: site « ${a.slice(k, k + 60)} » mockup « ${z.slice(k, k + 60)} »`}`);
    check(site.html.includes('d’arbitrage') && !/<details/.test(site.html) && !/m-demarche/.test(site.html), `files: typographic apostrophe of « d’arbitrage » kept ${site.html.includes('d’arbitrage')}; details tags ${(site.html.match(/<details/g) || []).length}; class m-demarche ported ${/m-demarche/.test(site.html)}`);
  }
  const p = await b.page(1200, { height: 1100 }); await load(p, BASE + HOME); const t = await p.ev(`(${pgText})('#demarche')`); await p.close();
  const q = await b.page(1200, { height: 1100 }); await load(q, MOCK); const m = await q.ev(`(${pgText})('.m-demarche')`); await q.close();
  if (!check(!!t && !!m, `rendered: #demarche found ${!!t}, mockup .m-demarche found ${!!m} (${MOCK})`)) return;
  let k = 0; while (k < t.text.length && t.text[k] === m.text[k]) k++;
  check(t.text === m.text, `rendered: text nodes of #demarche joined = the mockup section's (${t.text.length} / ${m.text.length} characters)${t.text === m.text ? '' : `; first difference at ${k}: site « ${t.text.slice(k, k + 60)} » mockup « ${m.text.slice(k, k + 60)} »`}`);
  check(t.details === 0 && t.emoji === 0 && t.steps === 4 && t.deliv === 4, `rendered: #demarche holds ${t.details} details (${t.closed} closed, i.e. dépliants), ${t.emoji} emoji, ${t.steps} li.dm-step, ${t.deliv} « Livrables types » groups (expected 0, 0, 4, 4)`);
}

// ---- Done When 3 ----
async function viewCase(b, W, nojs) {
  const label = `home ${W}${nojs ? ' scripts disabled' : ''}`;
  const p = await b.page(W, { height: 900, nojs }); const ready = await load(p, BASE + HOME, { reveal: false }); const r = await reach(p);
  const st = await p.ev(`(${pgLayout})()`);
  log(` -- ${label}: innerWidth ${st.iw}, layout width ${st.cw}; #demarche ${st.secH} high, is-visible ${r.vis}, opacity product ${r.op}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}`);
  check(r.op > 0.999 && (nojs || r.vis), `${label}: section reached: ${nojs ? 'no script' : `is-visible ${r.vis}`}, opacity of #demarche and its ancestors ${r.op}`);
  const v = await p.ev(`(${pgVis})()`), badV = v.filter(x => !x.ok);
  check(v.length > 30 && badV.length === 0, `${label}: text nodes visible by their own box once scrolled to (900 px window): ${v.length - badV.length} of ${v.length}${badV.length ? ' — ' + badV.slice(0, 5).map(x => `« ${x.text} » inView ${x.inV} topmost ${x.top} visible ${x.vis} opacity ${x.op}`).join(' | ') : ''}`);
  check(st.steps.length === ROWS[W] && st.steps.every(n => n === 4 / ROWS[W]), `${label}: stages per row ${JSON.stringify(st.steps)} (expected ${ROWS[W]} row(s) of ${4 / ROWS[W]}); lefts ${st.lefts.join(', ')}; « Livrables types » groups per row ${JSON.stringify(st.deliv)}`);
  const o = await p.ev(`(${pgPast})()`); check(o.length === 0, `${label}: elements past the layout width ${st.cw} px: ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  if (!nojs) check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
  // contrast: a window tall enough to hold the whole section
  const H = W < 641 ? 2600 : W < 961 ? 1800 : 1500;
  const c = await b.page(W, { height: H, nojs }); await load(c, BASE + HOME, { reveal: false }); await reach(c);
  await c.ev(`(()=>{const X=document.getElementById('demarche');scrollTo(0,X.getBoundingClientRect().top+scrollY-100);return 1})()`); await sleep(nojs ? 300 : 900);
  const g = await c.ev(`(${pgRuns})()`), clip = { ...g.clip, cw: g.cw, vh: g.vh };
  if (!check(inside(clip) && g.runs.length > 0, `${label}: contrast window ${W}x${H}: section clip ${JSON.stringify(g.clip)} inside the viewport ${inside(clip)}, ${g.runs.length} pieces of text (${g.boxless} without a box)`)) { await c.close(); return; }
  const shown = await shotPng(c, clip); await c.ev(`(${pgHide})(true)`); await sleep(150); const hidden = await shotPng(c, clip); await c.ev(`(${pgHide})(false)`);
  if (!check(shown.w === clip.r - clip.x && hidden.h === clip.b - clip.y, `${label}: capture ${shown.w}x${shown.h}, asked ${clip.r - clip.x}x${clip.b - clip.y}`)) { await c.close(); return; }
  const groups = new Map();
  for (const run of g.runs) {
    const t = rgba(run.color); let min = 99, at = null, ink = 0, n = 0;
    const oob = each(hidden, clip, run.rects, i2 => { n++; const R0 = hidden.px[i2], G0 = hidden.px[i2 + 1], B0 = hidden.px[i2 + 2], cr = ratio(lum(t[3] * t[0] + (1 - t[3]) * R0, t[3] * t[1] + (1 - t[3]) * G0, t[3] * t[2] + (1 - t[3]) * B0), lum(R0, G0, B0)); if (cr < min) { min = cr; at = [R0, G0, B0]; } if (Math.abs(shown.px[i2] - R0) + Math.abs(shown.px[i2 + 1] - G0) + Math.abs(shown.px[i2 + 2] - B0) > 90) ink++; });
    const e = groups.get(run.key) || { min: 99, at: null, runs: 0, px: 0, oob: 0, inkMin: 1e9 }; if (min < e.min) { e.min = min; e.at = at; } e.runs++; e.px += n; e.oob += oob; e.inkMin = Math.min(e.inkMin, ink); groups.set(run.key, e);
  }
  for (const [key, e] of [...groups].sort()) check(e.min >= 4.5 && e.oob === 0 && e.inkMin > 0, `${label}: text « ${key} » against the worst pixel behind it rgb(${e.at}) = ${e.min.toFixed(2)}:1 (${e.runs} pieces, ${e.px} pixels${e.oob ? `, ${e.oob} outside the capture` : ''}; fewest painted pixels in one piece ${e.inkMin})`);
  await c.close();
}
async function widthCase(b, W) {
  const p = await b.page(W, { height: 900 }); await load(p, BASE + HOME); await reach(p); const st = await p.ev(`(${pgLayout})()`), o = await p.ev(`(${pgPast})()`);
  check(o.length === 0, `home ${W}: elements past the layout width ${st.cw} px (innerWidth ${st.iw}): ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}; stages per row ${JSON.stringify(st.steps)}`);
  await p.close();
}

// ---- Done When 5 ----
async function outsideCase(b, W) {
  const label = `home ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, BASE + HOME); const st = await p.ev(`(${pgLayout})()`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}; #demarche ${st.secH} high`);
  if (WRITE) fresh.demarche[W] = +st.secH; else if (base && base.demarche[W] !== undefined) log(`        #demarche height at ${W}: 0ab4687 ${base.demarche[W]}, now ${st.secH} (change ${f(+st.secH - base.demarche[W])} px): the page grows or shrinks by that alone when the list below is equal`);
  compare('outside', `${W}`, await settled(p, `(${pgBoxes})()`), `${label}: boxes of everything outside #demarche (above in document coordinates, below measured from its bottom edge)`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
async function xpCase(b, W) {
  const p = await b.page(W, { height: 1100 }); await load(p, BASE + HOME); const h = await settled(p, `Math.round(document.getElementById('experience').getBoundingClientRect().height*10)/10`);
  check(h === XP[W], `home ${W}: #experience ${h} px high (Pass 61 at 0ab4687: ${XP[W]})`); await p.close();
}
async function otherPage(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, BASE + route);
  check(ready, `${label}: page ready ${ready}`);
  compare('sections', `${route}|${W}`, await settled(p, `(${pgSections})()`), `${label}: heights of header, each main block and footer`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 7: the three kept captures (inside the viewport, refused when the heading font is not Inter) ----
async function capture(b, W) {
  const H = W < 641 ? 2600 : W < 961 ? 1800 : 1500, file = `demarche-${W}.jpg`;
  const p = await b.page(W, { height: H }); await load(p, BASE + HOME, { reveal: false }); await reach(p); const st = await p.ev(`(${pgLayout})()`);
  if (!fontOk(st)) { check(false, `capture ${file}: refused, heading font is not Inter`); await p.close(); return; }
  await p.ev(`(()=>{const X=document.getElementById('demarche');scrollTo(0,X.getBoundingClientRect().top+scrollY-100);return 1})()`); await sleep(900);
  const g = await p.ev(`(()=>{const r=document.getElementById('demarche').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight}})()`);
  if (check(g.y >= 0 && g.y + g.height <= g.vh, `capture ${file}: #demarche ${g.width}x${g.height} wholly inside the ${g.vh} px viewport`)) {
    const [sx, sy] = await p.ev('[scrollX, scrollY]');
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(join(process.env.P62_SHOTS || HERE, file), Buffer.from(got.data, 'base64')); log(`        capture ${file} ${g.width}x${g.height}`);
  }
  await p.close();
}

log(`RENDER p62 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of 0ab4687: comparisons are written, not checked; Done When 2–3 checks run and are expected to FAIL)' : ''}${PARTIAL ? ` — PARTIAL RUN, parts: ${PARTS.join(', ')}` : ''}`);
const b = await browser();
try {
  if (PARTS.includes('text')) { log('== home — the text of Démarche (Done When 2)'); await guard('text', () => textCase(b)); }
  if (PARTS.includes('view')) { log('== home — Démarche readable at once (Done When 3)'); for (const W of [1200, 960, 375]) for (const nojs of [false, true]) await guard(`home ${W}${nojs ? ' nojs' : ''}`, () => viewCase(b, W, nojs)); }
  if (PARTS.includes('width')) { log('== home — layout width at the other breakpoints (Done When 3, prompt C)'); for (const W of [961, 641]) await guard(`home ${W} width`, () => widthCase(b, W)); }
  if (PARTS.includes('outside')) { log('== home — everything outside #demarche (Done When 5)'); for (const W of [1200, 375]) await guard(`home ${W} outside`, () => outsideCase(b, W)); }
  if (PARTS.includes('xp') && !WRITE) { log('== home — #experience heights (prompt A)'); for (const W of [1200, 961, 960, 375]) await guard(`home ${W} experience`, () => xpCase(b, W)); }
  if (PARTS.includes('others')) { log('== the nine other shell pages (Done When 5)'); for (const route of OTHERS) for (const W of [1200, 375]) await guard(`${route} ${W}`, () => otherPage(b, route, W)); }
  if (PARTS.includes('shots') && !WRITE) { log('== kept captures (Done When 7)'); for (const W of [1200, 960, 375]) await guard(`capture ${W}`, () => capture(b, W)); }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
if (WRITE && !PARTIAL) { writeFileSync(BASEFILE, JSON.stringify(fresh, null, 0).replace(/\],"/g, '],\n"') + '\n'); log(`baseline.json written: ${Object.keys(fresh.outside).length} « outside » lists, ${Object.keys(fresh.sections).length} « sections » lists, #demarche heights ${JSON.stringify(fresh.demarche)}`); }
log(`RENDER ${BASE}: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (${PARTS.join(', ')}): not the full render` : ''}`);
if (OUTFILE) writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
