// p56 Done When 2–5: the « Livrables » hover list of Stratégie and Entreprise IA, rendered in headless Chrome.
// browser() = ./cdp.mjs (P51 helper + touch at any width + Runtime.exceptionThrown; resolver NOTFOUND for every host
// except 127.0.0.1 and Google Fonts; prefers-reduced-motion set explicitly on every page).
// What « visible », « moves » and « contrast » mean here:
//  - a detail is visible by its own box inside the viewport and by being topmost 24 px inside its corner (never by a style);
//  - « nothing moves »: the box of every element of the page (document coordinates, 0.1 px) equals the boxes read on load,
//    except the sticky header (its document position follows the scroll), the detail panel itself (its content changes;
//    it is checked to stay inside its card) and the content of closed dépliants (Chrome gives them boxes: AGENTS Gotcha);
//  - contrast: the text is made transparent, the area captured INSIDE the viewport (no captureBeyondViewport: it resizes
//    the window and fires the script's listeners), and each text colour is compared with the worst pixel inside its own
//    line boxes; « painted » counts the pixels that differ between text shown and text hidden (the text is really drawn);
//  - focus ring: the row captured focused then blurred; the pixels that differ are the ring, their contrast is the ratio
//    between ring pixel and the same pixel without the ring.
// Compared with product cb0bfbf through baseline.json (written on a scratch copy served on another port):
//  « besoin » = boxes of #besoin and of everything in it, relative to #besoin; « outside » = boxes of everything outside
//  #besoin (what follows it is measured from its bottom edge: in hover mode the section's own height changes);
//  « sections » = heights of header, each main child and footer on the eight other shell pages; « first » = first screen.
// usage (product root):
//   red run + baseline, on a scratch copy of cb0bfbf served on 4174:
//     P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P56_BASELINE=write node .WIP/pass-loop-p56/evidence/render.mjs
//   a mutated scratch copy: P48_BASE=... P56_OUT=render-mutation.txt P56_PART=hover node ...   (PARTIAL, says so)
//   the tree: P48_PROFILES=<scratch> node .WIP/pass-loop-p56/evidence/render.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P56_BASELINE === 'write';
// P56_PART (parts), P56_PAGE (strategie | ia) and P56_W (hover widths) narrow a run; a narrowed run says PARTIAL top and bottom.
const PARTS = (process.env.P56_PART || 'hover,plain,outside,extra,others,shots').split(','), PARTIAL = !!(process.env.P56_PART || process.env.P56_PAGE || process.env.P56_W);
const HOVER_W = (process.env.P56_W || '1920,1200,961').split(',').map(Number);
const OUTFILE = process.env.P56_OUT || (PARTIAL ? '' : WRITE ? 'render-red-cb0bfbf.txt' : 'render.txt');
const BASEFILE = join(HERE, 'baseline.json');
// route, name, rows, hover lists
const PAGES = [['/service-strategie-transformation/', 'strategie', 7, 2], ['/service-ia-business/', 'ia', 3, 1]];
const OTHERS = ['/', '/service-venture-building/', '/portfolio/', '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
const CASES = [
  { key: '960-fine', W: 960, text: '960 px, fine pointer' },
  { key: '1200-touch', W: 1200, touch: true, text: '1200 px, touch screen' },
  { key: '375', W: 375, text: '375 px (touch)' },
  { key: '1200-nojs', W: 1200, nojs: true, text: '1200 px, scripts disabled' },
  { key: '375-nojs', W: 375, nojs: true, text: '375 px, scripts disabled (touch)' },
];

const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
const f = n => (Math.round(n * 10) / 10).toString();

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
// fn(i) for every captured pixel inside the given viewport boxes; returns how many box pixels fell outside the capture.
function each(img, clip, rects, fn) {
  let oob = 0;
  for (const r of rects) for (let y = Math.floor(r.y); y < Math.ceil(r.b); y++) for (let x = Math.floor(r.x); x < Math.ceil(r.r); x++) {
    const px = x - clip.x, py = y - clip.y; if (px < 0 || py < 0 || px >= img.w || py >= img.h) { oob++; continue; }
    fn((py * img.w + px) * img.bpp);
  }
  return oob;
}

// ---- in the page (functions sent as text; all synchronous) ----
const ROWS = `[...document.querySelectorAll('#besoin .service-question-list > li > details')]`;
const R = i => `${ROWS}[${i}]`, S = i => `${R(i)}.querySelector('summary')`;
const EXTRA = `document.querySelector('#besoin .service-rollout > details')`;
function pgBoxes(mode) {
  const B = document.getElementById('besoin'), f = n => Math.round(n * 10) / 10, out = [], bb = B ? B.getBoundingClientRect() : null;
  const skip = e => { if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName) || e.closest('.hl__detail')) return true; const d = e.closest('details:not([open])'); return !!d && e !== d && !e.closest('summary'); };
  if (mode === 'besoin') { for (const e of [B, ...B.querySelectorAll('*')]) { if (skip(e)) continue; const r = e.getBoundingClientRect(); out.push(`${e.tagName.toLowerCase()} ${f(r.left - bb.left)} ${f(r.top - bb.top)} ${f(r.width)} ${f(r.height)}`); } return out; }
  for (const e of document.body.querySelectorAll('*')) {
    if (skip(e)) continue;
    if (mode === 'page' && e.closest('.site-header')) continue;
    if (mode === 'outside' && (B.contains(e) || e.contains(B))) continue;
    const r = e.getBoundingClientRect(), after = mode === 'outside' && (B.compareDocumentPosition(e) & 4);
    out.push(`${e.tagName.toLowerCase()} ${f(r.left + scrollX)} ${after ? 'B+' + f(r.top - bb.bottom) : f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return out;
}
function pgHL() {
  const norm = s => s.replace(/\s+/g, ' ').trim(), all = [...document.querySelectorAll('#besoin [data-hoverlist]')];
  const roots = all.map(root => {
    const list = root.querySelector('.hl__items'), panel = root.querySelector('.hl__detail');
    const lr = list.getBoundingClientRect(), pr = panel.getBoundingClientRect(), t = document.elementFromPoint(pr.left + 24, pr.top + 24);
    const tw = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let first = null;
    for (let n; (n = tw.nextNode());) if (n.data.trim()) { const g = document.createRange(); g.selectNodeContents(n); first = g.getClientRects()[0]; break; }
    return { hover: root.classList.contains('is-hover'), min: root.style.getPropertyValue('--hl-min'), live: panel.getAttribute('aria-live'), listTop: lr.top, listH: lr.height, rootBottom: root.getBoundingClientRect().bottom,
      panel: { top: pr.top, w: pr.width, h: pr.height, bottom: pr.bottom, display: getComputedStyle(panel).display, inView: pr.width > 50 && pr.height > 50 && pr.top >= 0 && pr.top < innerHeight && pr.left >= 0 && pr.right <= document.documentElement.clientWidth + 0.5, topmost: !!t && panel.contains(t), text: norm(panel.textContent), firstLine: first ? first.top - pr.top : null, hooks: panel.querySelectorAll('[id],[name],[data-hoverlist],details,script').length, swap: panel.classList.contains('is-swap') } };
  });
  const rows = [...document.querySelectorAll('#besoin .service-question-list > li > details')].map(d => ({ root: all.indexOf(d.closest('[data-hoverlist]')), own: norm([...d.children].filter(c => c.tagName !== 'SUMMARY').map(c => c.textContent).join(' ')), active: d.classList.contains('is-active'), open: d.open, n: norm(d.querySelector('.service-question__number').textContent) }));
  const h2 = document.querySelector('#besoin h2');
  return { roots, rows, iw: innerWidth, cw: document.documentElement.clientWidth, vh: innerHeight, fine: matchMedia('(hover: hover) and (pointer: fine)').matches, none: matchMedia('(hover: none)').matches, wide: matchMedia('(min-width: 961px)').matches,
    inter: document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded'), ff: getComputedStyle(h2).fontFamily.split(',')[0].replace(/["']/g, '') };
}
function pgPast() { const W = document.documentElement.clientWidth, o = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + r.right.toFixed(1)); } return o; }
function pgRuns(rootIdx, rowIdx) {
  const root = document.querySelectorAll('#besoin [data-hoverlist]')[rootIdx], row = [...document.querySelectorAll('#besoin .service-question-list > li > details')][rowIdx], panel = root.querySelector('.hl__detail'), runs = [];
  for (const [where, el] of [['row', row.querySelector('summary')], ['detail', panel]]) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) {
      if (!n.data.trim()) continue; const g = document.createRange(); g.selectNodeContents(n);
      const rects = [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({ x: r.left, y: r.top, r: r.right, b: r.bottom })), pe = n.parentElement, cs = getComputedStyle(pe);
      runs.push({ key: where + ' ' + pe.tagName.toLowerCase() + (typeof pe.className === 'string' && pe.className ? '.' + pe.className.split(/\s+/)[0] : '') + ' ' + cs.color, color: cs.color, rects });
    }
  }
  const a = row.getBoundingClientRect(), b = panel.getBoundingClientRect();
  return { runs, clip: { x: Math.max(0, Math.floor(Math.min(a.left, b.left)) - 8), y: Math.floor(Math.min(a.top, b.top)) - 8, r: Math.ceil(Math.max(a.right, b.right)) + 8, b: Math.ceil(Math.max(a.bottom, b.bottom)) + 8 }, vh: innerHeight, cw: document.documentElement.clientWidth };
}
function pgHide(on) { let s = document.getElementById('p56-hide'); if (on && !s) { s = document.createElement('style'); s.id = 'p56-hide'; s.textContent = '#besoin .hl summary, #besoin .hl summary *, #besoin .hl__detail, #besoin .hl__detail * { -webkit-text-fill-color: transparent !important; }'; document.head.append(s); } if (!on && s) s.remove(); return 1; }
function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return [document.querySelector('.site-header'), ...document.querySelectorAll('main > *'), document.querySelector('.site-footer')].filter(Boolean).map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)); }
function pgFirst() { const f = n => Math.round(n * 10) / 10, h = document.querySelector('#besoin h2'), hid = []; for (let n = h; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); if (+c.opacity !== 1 || c.visibility !== 'visible') hid.push(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + ' opacity ' + c.opacity); } const r = h.getBoundingClientRect(), B = document.getElementById('besoin').getBoundingClientRect(); return { titleOnScreen: r.top < innerHeight && r.bottom > 0, titleTop: f(r.top), sectionTop: f(B.top), sectionHeight: f(B.height), hiddenBy: hid }; }
// Animations and transitions over 50 ms whose target is inside #besoin (under reduced motion the site forces 0.01 ms).
const ANIM = `document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return t&&document.getElementById('besoin').contains(t)&&(a.playState==='running'||a.playState==='pending')&&a.effect.getComputedTiming().activeDuration>50}).length`;
const OPEN = expr => `(()=>{const d=${expr},c=d.querySelector('.service-detail'),r=c.getBoundingClientRect();return {open:d.open,vis:c.checkVisibility()&&r.height>0}})()`;

// ---- driving the page ----
async function load(p, route, { reveal = true } = {}) {
  await p.s('Page.navigate', { url: BASE + route });
  let ready = false; for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(700);
  if (reveal) { // every .reveal block shown and every lazy picture asked: walk down the page, come back to the top
    const h = await p.ev('document.documentElement.scrollHeight');
    for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); }
    await p.ev('(scrollTo(0,0),1)'); await sleep(900);
  }
  return ready;
}
async function settled(p, expr) { let a = JSON.stringify(await p.ev(expr)); for (let i = 0; i < 12; i++) { await sleep(300); const b = JSON.stringify(await p.ev(expr)); if (a === b) break; a = b; } return JSON.parse(a); }
const center = expr => `(()=>{const e=${expr};e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect(),x=r.x+Math.min(r.width/2,140),y=r.y+r.height/2;return {x,y,top:e.contains(document.elementFromPoint(x,y))}})()`;
async function aim(p, expr) { await p.ev(center(expr)); await sleep(180); return p.ev(center(expr)); }
const mouse = (p, type, d, extra = {}) => p.s('Input.dispatchMouseEvent', { type, x: d.x, y: d.y, ...extra });
async function hover(p, expr, wait = 450) { const d = await aim(p, expr); await mouse(p, 'mouseMoved', { x: d.x - 4, y: d.y - 4 }); await mouse(p, 'mouseMoved', d); if (wait) await sleep(wait); return d.top; }
async function click(p, expr) { const d = await aim(p, expr); await mouse(p, 'mouseMoved', d); await mouse(p, 'mousePressed', d, { button: 'left', clickCount: 1 }); await mouse(p, 'mouseReleased', d, { button: 'left', clickCount: 1 }); await sleep(350); return d.top; }
async function tap(p, expr) { const d = await aim(p, expr); await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y }] }); await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(500); return d.top; }
const away = p => mouse(p, 'mouseMoved', { x: 3, y: 3 });
// Real Tab presses until the element holds the focus; -1 when it is never reached.
async function tabTo(p, expr, max = 150) { for (let i = 0; i <= max; i++) { if (await p.ev(`document.activeElement===${expr}`)) return i; await p.key('Tab'); } return -1; }
const focusStart = p => p.ev(`(document.querySelector('.site-header a').focus(),1)`);
async function shotPng(p, clip) {
  // boxes are read in viewport coordinates and checked to lie inside the viewport; the capture clip is in document coordinates
  const [sx, sy] = await p.ev('[scrollX, scrollY]');
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', clip: { x: clip.x + sx, y: clip.y + sy, width: clip.r - clip.x, height: clip.b - clip.y, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); return png(Buffer.from(got.data, 'base64'));
}
const inside = c => c.x >= 0 && c.y >= 0 && c.r <= c.cw && c.b <= c.vh;

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null;
const fresh = { from: BASE, besoin: {}, outside: {}, sections: {}, first: {} };
if (!WRITE && !base && PARTS.some(x => ['plain', 'outside', 'extra', 'others'].includes(x))) check(false, 'baseline.json missing: nothing can be compared with cb0bfbf');
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${Array.isArray(value) ? value.length + ' entries' : JSON.stringify(value)}`); return true; }
  if (!base) return false;
  const want = base[kind][key]; let why = '';
  if (want === undefined) why = ' (no baseline entry)';
  else if (JSON.stringify(want) !== JSON.stringify(value)) { if (Array.isArray(want)) { const d = []; for (let i = 0; i < Math.max(want.length, value.length) && d.length < 6; i++) if (want[i] !== value[i]) d.push(`#${i} cb0bfbf « ${want[i]} » now « ${value[i]} »`); why = `\n        cb0bfbf ${want.length} entries, now ${value.length}; first differences: ${d.join(' | ')}`; } else why = `\n        cb0bfbf: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}`; }
  return check(!why, `${text} = cb0bfbf${why}`);
}
const media = st => `innerWidth ${st.iw}, layout width (clientWidth) ${st.cw}, fine pointer with hover ${st.fine}, (hover: none) ${st.none}, 961 px and more ${st.wide}`;
const fontOk = st => st.inter && st.ff === 'Inter';

// ---- Done When 2 and 5: hover mode ----
async function hoverCase(b, route, name, nrows, nlists, W, reduce) {
  const label = `${name} ${W}${reduce ? ' reduced-motion' : ''}`;
  const p = await b.page(W, { height: 1400, reduce }); const ready = await load(p, route);
  let st = await p.ev(`(${pgHL})()`);
  log(` -- ${label}: ${media(st)}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}`);
  const inHover = st.roots.filter(r => r.hover).length;
  if (!check(st.roots.length === nlists && inHover === nlists && st.rows.length === nrows, `${label}: hover mode on ${inHover} list(s) of ${nlists} expected (lists marked data-hoverlist: ${st.roots.length}; rows ${st.rows.length} of ${nrows})`)) { await p.close(); return; }
  // on load, before any mouse move or key
  for (let k = 0; k < nlists; k++) {
    await p.ev(`(document.querySelectorAll('#besoin [data-hoverlist]')[${k}].scrollIntoView({block:'center',behavior:'instant'}),1)`); await sleep(250);
    st = await p.ev(`(${pgHL})()`); const r = st.roots[k], mine = st.rows.filter(x => x.root === k), pn = r.panel;
    check(mine[0].active && mine.filter(x => x.active).length === 1 && mine.every(x => !x.open) && pn.text === mine[0].own && pn.text.length > 20 && pn.inView && pn.topmost && Math.abs(pn.top - r.listTop) <= 1 && pn.firstLine !== null && pn.firstLine <= 50 && pn.bottom <= r.rootBottom + 0.5 && !pn.swap,
      `${label}: on load, list ${k + 1}: row ${mine[0].n} active alone, no row open, its detail shown ${f(pn.w)}x${f(pn.h)} in the viewport and topmost, top ${f(pn.top - r.listTop)} px from the list's top, first line ${f(pn.firstLine)} px under the edge, no entrance animation; list ${f(r.listH)} high, reserve --hl-min « ${r.min} »`);
    check(pn.hooks === 0 && r.live === 'polite', `${label}: list ${k + 1}: the copied detail holds ${pn.hooks} id, name, nested hover list, dépliant or script; aria-live « ${r.live} »`);
  }
  const ref = await settled(p, `(${pgBoxes})('page')`);
  // the mouse on each row
  const groups = new Map(); let animMax = 0, animRows = 0, moved = 0;
  for (let i = 0; i < nrows; i++) {
    const top = await hover(p, S(i), 0), an = await p.ev(ANIM); await sleep(450); animMax = Math.max(animMax, an); if (an) animRows++;
    st = await p.ev(`(${pgHL})()`); const row = st.rows[i], r = st.roots[row.root], pn = r.panel, mine = st.rows.filter(x => x.root === row.root);
    const now = await p.ev(`(${pgBoxes})('page')`); const diff = []; for (let j = 0; j < Math.max(ref.length, now.length); j++) if (ref[j] !== now[j]) diff.push(`« ${ref[j]} » → « ${now[j]} »`);
    if (diff.length) moved++;
    check(top && row.active && mine.filter(x => x.active).length === 1 && !row.open && pn.text === row.own && pn.inView && pn.topmost && Math.abs(pn.top - r.listTop) <= 1 && pn.bottom <= r.rootBottom + 0.5,
      `${label}: mouse on row ${row.n}: active alone in its list, not opened, its own detail shown ${f(pn.w)}x${f(pn.h)} in the viewport and topmost, top ${f(pn.top - r.listTop)} px from the list's top, inside its card`);
    check(diff.length === 0 && now.length > 100, `${label}: mouse on row ${row.n}: boxes changed since load ${diff.length} of ${now.length}${diff.length ? ' — ' + diff.slice(0, 4).join(' | ') : ''}`);
    // contrast of the active row and of its detail
    const g = await p.ev(`(${pgRuns})(${row.root}, ${i})`); const clip = { ...g.clip, cw: g.cw, vh: g.vh };
    if (!inside(clip)) { check(false, `${label}: row ${row.n}: row and detail not wholly inside the viewport (${JSON.stringify(g.clip)} of ${g.cw}x${g.vh}): contrast not measured`); continue; }
    const shown = await shotPng(p, clip); await p.ev(`(${pgHide})(true)`); await sleep(80); const hidden = await shotPng(p, clip); await p.ev(`(${pgHide})(false)`);
    if (shown.w !== clip.r - clip.x || hidden.h !== clip.b - clip.y) { check(false, `${label}: row ${row.n}: capture ${shown.w}x${shown.h}, asked ${clip.r - clip.x}x${clip.b - clip.y}: contrast not measured`); continue; }
    for (const run of g.runs) {
      const t = rgba(run.color); let min = 99, at = null, ink = 0, n = 0;
      const oob = each(hidden, clip, run.rects, i2 => { n++; const R0 = hidden.px[i2], G0 = hidden.px[i2 + 1], B0 = hidden.px[i2 + 2], c = ratio(lum(t[3] * t[0] + (1 - t[3]) * R0, t[3] * t[1] + (1 - t[3]) * G0, t[3] * t[2] + (1 - t[3]) * B0), lum(R0, G0, B0)); if (c < min) { min = c; at = [R0, G0, B0]; } if (Math.abs(shown.px[i2] - R0) + Math.abs(shown.px[i2 + 1] - G0) + Math.abs(shown.px[i2 + 2] - B0) > 90) ink++; });
      const e = groups.get(run.key) || { min: 99, at: null, runs: 0, px: 0, oob: 0, inkMin: 1e9 }; if (min < e.min) { e.min = min; e.at = at; } e.runs++; e.px += n; e.oob += oob; e.inkMin = Math.min(e.inkMin, ink); groups.set(run.key, e);
    }
  }
  for (const [key, e] of [...groups].sort()) check(e.min >= 4.5 && e.oob === 0 && e.inkMin > 0, `${label}: text « ${key} » against the worst pixel behind it rgb(${e.at}) = ${e.min.toFixed(2)}:1 (${e.runs} pieces of text over the ${nrows} rows, ${e.px} pixels${e.oob ? `, ${e.oob} outside the capture` : ''}; fewest painted pixels in one piece ${e.inkMin})`);
  if (reduce) check(animMax === 0, `${label}: animations or transitions over 50 ms in #besoin right after each of the ${nrows} mouse moves: ${animMax} at most`);
  else check(animMax > 0, `${label}: the same probe without reduced motion sees them: ${animMax} at most, on ${animRows} of ${nrows} moves (0 would mean a blind probe)`);
  // a click with the mouse never opens a row in hover mode
  const cl = Math.min(1, nrows - 1); await click(p, S(cl)); st = await p.ev(`(${pgHL})()`);
  check(!st.rows[cl].open && st.rows[cl].active && st.roots[st.rows[cl].root].panel.text === st.rows[cl].own && st.rows.every(x => !x.open), `${label}: mouse click on row ${st.rows[cl].n}: not opened, active, its own detail shown; rows open ${st.rows.filter(x => x.open).length}`);
  // keyboard: pointer away first (a scroll would bring a row under a still mouse), real Tab, Enter
  await away(p); await sleep(200); await focusStart(p);
  for (let i = 0; i < nrows; i++) {
    const tabs = await tabTo(p, S(i)); if (tabs < 0) { check(false, `${label}: Tab never reaches row ${i + 1}`); break; }
    await sleep(350); const fv = await p.ev(`document.activeElement.matches(':focus-visible')`); st = await p.ev(`(${pgHL})()`); const row = st.rows[i], pn = st.roots[row.root].panel;
    await p.key('Enter'); await sleep(350); const st2 = await p.ev(`(${pgHL})()`), row2 = st2.rows[i], fv2 = await p.ev(`document.activeElement===${S(i)}&&document.activeElement.matches(':focus-visible')`);
    // the ring, from pixels: focused, then blurred
    const c = await p.ev(`(()=>{const e=${S(i)};let r=e.getBoundingClientRect();if(r.top<120||r.bottom>innerHeight-20){e.scrollIntoView({block:'center',behavior:'instant'});r=e.getBoundingClientRect();}return {x:Math.max(0,Math.floor(r.left)-10),y:Math.floor(r.top)-10,r:Math.ceil(r.right)+10,b:Math.ceil(r.bottom)+10,cw:document.documentElement.clientWidth,vh:innerHeight}})()`);
    await sleep(120); let ring = { n: 0, median: 0 };
    if (inside(c)) { const a = await shotPng(p, c); await p.ev(`(document.activeElement.blur(),1)`); await sleep(120); const z = await shotPng(p, c); const rs = []; for (let k = 0; k < a.px.length; k += a.bpp) if (Math.abs(a.px[k] - z.px[k]) + Math.abs(a.px[k + 1] - z.px[k + 1]) + Math.abs(a.px[k + 2] - z.px[k + 2]) > 60) rs.push(ratio(lum(a.px[k], a.px[k + 1], a.px[k + 2]), lum(z.px[k], z.px[k + 1], z.px[k + 2]))); rs.sort((x, y) => x - y); ring = { n: rs.length, median: rs.length ? rs[rs.length >> 1] : 0 }; }
    check(tabs >= 1 && fv && row.active && pn.text === row.own && pn.h > 50 && !row2.open && row2.active && st2.roots[row2.root].panel.text === row2.own && fv2 && ring.n >= 200 && ring.median >= 3,
      `${label}: keyboard: ${tabs} Tab → row ${row.n} focused (:focus-visible ${fv}), active, its own detail shown; Enter keeps it (opened ${row2.open}, focus kept ${fv2}); focus ring ${ring.n} pixels, median ${ring.median.toFixed(2)}:1 against the same pixels without it`);
  }
  // Entreprise IA: the « Données d'entrée » dépliant of phase 2 is not a row and stays a native dépliant
  if (await p.ev(`!!${EXTRA}`)) {
    await click(p, `${EXTRA}.querySelector('summary')`); const o1 = await p.ev(OPEN(EXTRA)); await click(p, `${EXTRA}.querySelector('summary')`); const o2 = await p.ev(OPEN(EXTRA));
    const cls = await p.ev(`${EXTRA}.className+'|'+!!${EXTRA}.closest('[data-hoverlist]')`);
    check(o1.open && o1.vis && !o2.open && cls === 'disclosure|false', `${label}: phase 2 dépliant « Données d'entrée »: a click opens it (${o1.open}, text visible ${o1.vis}), a click closes it (${!o2.open}); class and inside a hover list: ${cls}`);
  }
  const o = await p.ev(`(${pgPast})()`); check(o.length === 0, `${label}: elements past the layout width ${st.cw} px (innerWidth ${st.iw}): ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 3: no hover mode ----
async function plainCase(b, route, name, nrows, c) {
  const label = `${name} ${c.text}`, act = c.touch || c.W < 861 ? tap : click, actName = act === tap ? 'tap' : 'click';
  const p = await b.page(c.W, { height: 1100, nojs: !!c.nojs, ...(c.touch ? { touch: true } : {}) }); const ready = await load(p, route);
  const st = await p.ev(`(${pgHL})()`);
  log(` -- ${label}: ${media(st)}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}`);
  check(st.roots.every(r => !r.hover && r.panel.display === 'none') && st.rows.length === nrows && st.rows.every(x => !x.active && !x.open), `${label}: no hover mode (lists in hover mode ${st.roots.filter(r => r.hover).length} of ${st.roots.length}, detail panels shown ${st.roots.filter(r => r.panel.display !== 'none').length}, rows active ${st.rows.filter(x => x.active).length}, rows open ${st.rows.filter(x => x.open).length} of ${nrows})`);
  compare('besoin', `${route}|${c.key}|closed`, await settled(p, `(${pgBoxes})('besoin')`), `${label}: boxes of #besoin and of everything in it, rows closed`);
  let okAct = 0, okKey = 0; const tabsList = [], badRows = [];
  for (let i = 0; i < nrows; i++) {
    const t1 = await act(p, S(i)), o1 = await p.ev(OPEN(R(i)));
    if (i === 0) compare('besoin', `${route}|${c.key}|open1`, await settled(p, `(${pgBoxes})('besoin')`), `${label}: boxes of #besoin and of everything in it, first row open`);
    const t2 = await act(p, S(i)), o2 = await p.ev(OPEN(R(i)));
    if (t1 && t2 && o1.open && o1.vis && !o2.open && !o2.vis) okAct++; else badRows.push(`${actName} row ${i + 1}: ${JSON.stringify([t1, o1, t2, o2])}`);
  }
  await p.ev(`(document.activeElement&&document.activeElement.blur(),1)`); await focusStart(p);
  for (let i = 0; i < nrows; i++) {
    const tabs = await tabTo(p, S(i)); tabsList.push(tabs); if (tabs < 0) { badRows.push(`Tab never reaches row ${i + 1}`); break; }
    await p.key('Enter'); await sleep(300); const o1 = await p.ev(OPEN(R(i))); await p.key('Enter'); await sleep(300); const o2 = await p.ev(OPEN(R(i)));
    if (tabs >= 1 && o1.open && o1.vis && !o2.open && !o2.vis) okKey++; else badRows.push(`Enter row ${i + 1}: ${JSON.stringify([tabs, o1, o2])}`);
  }
  check(okAct === nrows && okKey === nrows, `${label}: each row opens (text visible) and closes by ${actName}: ${okAct} of ${nrows}; by real Tab then Enter, Enter: ${okKey} of ${nrows} (Tab presses ${tabsList.join(', ')})${badRows.length ? ' — ' + badRows.slice(0, 4).join(' | ') : ''}`);
  if (await p.ev(`!!${EXTRA}`)) { const s = `${EXTRA}.querySelector('summary')`; await act(p, s); const o1 = await p.ev(OPEN(EXTRA)); await act(p, s); const o2 = await p.ev(OPEN(EXTRA)); check(o1.open && o1.vis && !o2.open, `${label}: phase 2 dépliant « Données d'entrée » opens and closes by ${actName} (${o1.open}, ${!o2.open})`); }
  const o = await p.ev(`(${pgPast})()`); check(o.length === 0, `${label}: elements past the layout width ${st.cw} px: ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  if (!c.nojs) check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 4 ----
async function outsideCase(b, route, name, W) {
  const label = `${name} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, route); const st = await p.ev(`(${pgHL})()`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}; lists in hover mode ${st.roots.filter(r => r.hover).length}`);
  compare('outside', `${route}|${W}`, await settled(p, `(${pgBoxes})('outside')`), `${label}: boxes of everything outside #besoin (what follows it measured from its bottom edge)`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
async function otherPage(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, route);
  const hl = await p.ev(`document.querySelectorAll('[data-hoverlist], .hl').length`);
  check(ready && hl === 0, `${label}: page ready ${ready}; hover lists on this page ${hl}`);
  compare('sections', `${route}|${W}`, await settled(p, `(${pgSections})()`), `${label}: heights of header, each main block and footer`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- once, outside the Done When list ----
async function widen(b, route, name, nrows, nlists) {
  const label = `${name} 960 → 1200 → 960`; const p = await b.page(960, { height: 1100 }); await load(p, route);
  await click(p, S(1)); const o = await p.ev(OPEN(R(1)));
  await p.s('Emulation.setDeviceMetricsOverride', { width: 1200, height: 1100, deviceScaleFactor: 1, mobile: false }); await sleep(900);
  let st = await p.ev(`(${pgHL})()`); const past = await p.ev(`(${pgPast})()`);
  check(o.open && st.roots.length === nlists && st.roots.every(r => r.hover && r.min && r.panel.text.length > 20 && !r.panel.swap) && st.rows.every(x => !x.open) && st.rows.filter(x => x.active).length === nlists && past.length === 0,
    `${label}: row 2 opened at 960 (${o.open}); widened to 1200: lists in hover mode ${st.roots.filter(r => r.hover).length} of ${nlists}, rows left open ${st.rows.filter(x => x.open).length}, active rows ${st.rows.filter(x => x.active).length}, reserves ${st.roots.map(r => r.min).join(' / ')}, entrance animation replayed ${st.roots.some(r => r.panel.swap)}, elements past the layout width ${past.length}`);
  await p.s('Emulation.setDeviceMetricsOverride', { width: 960, height: 1100, deviceScaleFactor: 1, mobile: false }); await sleep(900);
  st = await p.ev(`(${pgHL})()`);
  check(st.roots.every(r => !r.hover && r.panel.display === 'none' && r.panel.text === '' && !r.min) && st.rows.every(x => !x.open && !x.active), `${label}: back to 960: lists in hover mode ${st.roots.filter(r => r.hover).length}, rows open ${st.rows.filter(x => x.open).length}, active ${st.rows.filter(x => x.active).length}, panels emptied and hidden, reserve removed`);
  await p.ev('(scrollTo(0,0),1)'); await sleep(300);
  // never written by a baseline run: on cb0bfbf the row opened above is still open here
  if (!WRITE) compare('besoin', `${route}|960-fine|closed`, await settled(p, `(${pgBoxes})('besoin')`), `${label}: back to 960, boxes of #besoin, rows closed`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}`);
  await p.close();
}
async function firstScreen(b, route, name) {
  for (const H of [600, 660, 700, 768, 900]) {
    const p = await b.page(1280, { height: H }); await load(p, route, { reveal: false }); await sleep(1500);
    const g = await p.ev(`(${pgFirst})()`), key = `${route}|1280x${H}`, short = { titleOnScreen: g.titleOnScreen, hidden: g.hiddenBy.length > 0 };
    if (WRITE) { fresh.first[key] = { ...short, sectionHeight: g.sectionHeight }; log(`        baseline first ${key}: ${JSON.stringify(fresh.first[key])}`); }
    else { const w = base && base.first[key]; log(`   info ${name} 1280x${H}, loaded without scrolling: section #besoin starts at ${g.sectionTop}, ${g.sectionHeight} high (cb0bfbf ${w ? w.sectionHeight : '?'}); title at ${g.titleTop}, on the first screen ${g.titleOnScreen}; hidden by ${g.hiddenBy.join(', ') || 'nothing'} — cb0bfbf: on the first screen ${w ? w.titleOnScreen : '?'}, hidden ${w ? w.hidden : '?'}${w && short.titleOnScreen && short.hidden && !w.hidden ? '  ← HIDDEN where cb0bfbf shows it' : w && w.hidden && !short.hidden ? '  (shown here, hidden on cb0bfbf)' : ''}`); }
    await p.close();
  }
}

// ---- Done When 7: the four kept captures (inside the viewport, refused when the heading font is not Inter) ----
async function shotJpg(p, clip, file) {
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { ...clip, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(file, Buffer.from(got.data, 'base64'));
}
async function capture(b, route, name, W, row, dir = HERE) {
  const p = await b.page(W, { height: W < 861 ? 3000 : 2400 }); await load(p, route); const st = await p.ev(`(${pgHL})()`);
  if (!fontOk(st)) { check(false, `capture ${name} ${W}: refused, heading font is not Inter`); await p.close(); return; }
  await p.ev(`(()=>{const B=document.getElementById('besoin');scrollTo(0,B.getBoundingClientRect().top+scrollY-130);return 1})()`); await sleep(400);
  const d = await p.ev(`(()=>{const e=${S(row)},r=e.getBoundingClientRect();return {x:r.x+Math.min(r.width/2,140),y:r.y+r.height/2}})()`);
  if (W >= 961) { await mouse(p, 'mouseMoved', { x: d.x - 4, y: d.y - 4 }); await mouse(p, 'mouseMoved', d); }
  else { await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y }] }); await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  await sleep(900);
  const g = await p.ev(`(()=>{const r=document.getElementById('besoin').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight,state:${ROWS}.map(d=>d.open?'open':d.classList.contains('is-active')?'active':'-').join(' ')}})()`);
  const fits = g.y >= 0 && g.y + g.height <= g.vh, file = `besoin-${name}-${W}-${W >= 961 ? 'hover' : 'open'}.jpg`;
  if (check(fits, `capture ${file}: #besoin ${g.width}x${g.height} wholly inside the ${g.vh} px viewport; rows: ${g.state}`)) { const [sx, sy] = await p.ev('[scrollX, scrollY]'); await shotJpg(p, { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height }, join(dir, file)); log(`        capture ${file} ${g.width}x${g.height}`); }
  await p.close();
}

log(`RENDER p56 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of cb0bfbf: comparisons are written, not checked)' : ''}${PARTIAL ? ` — PARTIAL RUN, parts: ${PARTS.join(', ')}` : ''}`);
const b = await browser();
try {
  for (const [route, name, nrows, nlists] of PAGES) {
    if (process.env.P56_PAGE && process.env.P56_PAGE !== name) continue;
    if (PARTS.includes('hover')) { log(`== ${route} — hover mode (Done When 2 and 5)`); for (const W of HOVER_W) for (const reduce of [false, true]) await hoverCase(b, route, name, nrows, nlists, W, reduce); }
    if (PARTS.includes('plain')) { log(`== ${route} — no hover mode (Done When 3)`); for (const c of CASES) await plainCase(b, route, name, nrows, c); }
    if (PARTS.includes('outside')) { log(`== ${route} — everything outside #besoin (Done When 4)`); for (const W of [1200, 375]) await outsideCase(b, route, name, W); }
    if (PARTS.includes('extra')) { log(`== ${route} — once, outside the Done When list`); await widen(b, route, name, nrows, nlists); await firstScreen(b, route, name); }
  }
  if (PARTS.includes('others')) { log('== the eight other shell pages (Done When 4)'); for (const route of OTHERS) for (const W of [1200, 375]) await otherPage(b, route, W); }
  if (PARTS.includes('shots') && !WRITE) { log('== kept captures (Done When 7)'); for (const [route, name, nrows] of PAGES) { await capture(b, route, name, 1200, nrows > 3 ? 5 : 1); await capture(b, route, name, 375, 1); if (process.env.P56_SHOTS) for (const W of [1920, 961]) await capture(b, route, name, W, nrows > 3 ? 5 : 1, process.env.P56_SHOTS); } }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await b.close(); }
if (WRITE && !PARTIAL) { writeFileSync(BASEFILE, JSON.stringify(fresh, null, 0).replace(/\],"/g, '],\n"') + '\n'); log(`baseline.json written: ${Object.keys(fresh.besoin).length} « besoin » lists, ${Object.keys(fresh.outside).length} « outside » lists, ${Object.keys(fresh.sections).length} « sections » lists, ${Object.keys(fresh.first).length} first screens`); }
log(`RENDER ${BASE}: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (${PARTS.join(', ')}): not the full render` : ''}`);
if (OUTFILE) writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
