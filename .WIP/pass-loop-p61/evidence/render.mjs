// p61 Done When 2–7: the home « +25 ans d'expérience » tabs, rendered in headless Chrome.
// The Pass 56 render (.WIP/pass-loop-p56/evidence/render.mjs) retargeted to #experience; browser() = ./cdp.mjs (same file).
// What « visible », « moves » and « contrast » mean here:
//  - the panel is visible by its own box inside the viewport, topmost 24 px inside its corner, under the lowest tab
//    (never by a style); its head and list are read as text AND as boxes inside the panel;
//  - « nothing moves »: the box of every element of the page (document coordinates, 0.1 px) equals the boxes read on load,
//    except the sticky header and what is INSIDE the panel (its content changes); the panel's own box is in the list;
//    an element without a box (display none) is listed as « no box », so one that appears or disappears is seen;
//  - contrast: text made transparent, the area captured INSIDE the viewport (clip in document coordinates), each text
//    colour compared with the worst pixel inside its own line boxes; « painted » counts the pixels that differ between
//    text shown and text hidden. Left out, said on the line: the start of a title hidden in a tab (.hl__lead, 1 px clip)
//    and text without a box (the subtitle, display none in a tab);
//  - focus ring: the tab captured focused then blurred; the pixels that differ are the ring.
// Compared with product 6311e63 through baseline.json (written on a scratch copy served on another port):
//  « xp » = boxes of #experience and of everything in it that 6311e63 holds, relative to #experience (left out: the new
//  wrapper div.hl__items, the five span.hl__lead and the empty div.hl__detail); « outside » = boxes of everything outside
//  #experience (what follows it measured from its bottom edge); « sections » = heights of header, each main child and
//  footer on the nine other shell pages; « timeline » = heights of the five timeline steps.
// usage (product root):
//   red run + baseline, scratch copy of 6311e63 on 4174:
//     P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P61_BASELINE=write node .WIP/pass-loop-p61/evidence/render.mjs
//   a mutated scratch copy: P48_BASE=... P61_OUT=render-mutation.txt P61_PART=hover node ...   (PARTIAL, says so)
//   the tree: P48_PROFILES=<scratch> node .WIP/pass-loop-p61/evidence/render.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { browser, BASE, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P61_BASELINE === 'write';
// P61_PART (parts) and P61_W (hover widths) narrow a run; a narrowed run says PARTIAL top and bottom.
const PARTS = (process.env.P61_PART || 'hover,plain,outside,reveal,extra,others,shots').split(','), PARTIAL = !!(process.env.P61_PART || process.env.P61_W);
const HOVER_W = (process.env.P61_W || '1920,1200,961').split(',').map(Number);
const OUTFILE = process.env.P61_OUT || (PARTIAL ? '' : WRITE ? 'render-red-6311e63.txt' : 'render.txt');
const BASEFILE = join(HERE, 'baseline.json'), HOME = '/', N = 5;
const TITLES = ['Complémentarité des RÔLES', 'Adaptabilité aux INTERLOCUTEURS', 'Inter-dépendance des PROBLÉMATIQUES', 'Connaissance FONCTIONNELLE', 'Connexion à la TECHNOLOGIE'];
const LABELS = ['RÔLES', 'INTERLOCUTEURS', 'PROBLÉMATIQUES', 'FONCTIONNELLE', 'TECHNOLOGIE'];
const OTHERS = ['/service-strategie-transformation/', '/service-ia-business/', '/service-venture-building/', '/portfolio/', '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
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
// every case raced against a timeout (a headless page sometimes stops answering): the run goes on, the case fails
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
const ROWS = `[...document.querySelectorAll('#experience .experience-panel details')]`;
const R = i => `${ROWS}[${i}]`, S = i => `${R(i)}.querySelector('summary')`;
function pgBoxes(mode) {
  const X = document.getElementById('experience'), f = n => Math.round(n * 10) / 10, out = [], xb = X.getBoundingClientRect();
  const closed = e => { const d = e.closest('details:not([open])'); return !!d && e !== d && !e.closest('summary'); };
  const tech = e => /^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/.test(e.tagName);
  if (mode === 'xp') { // only what 6311e63 holds
    for (const e of [X, ...X.querySelectorAll('*')]) { if (tech(e) || closed(e) || e.closest('.hl__detail') || e.matches('.hl__items, .hl__lead')) continue; if (!e.getClientRects().length) { out.push(e.tagName.toLowerCase() + ' no box'); continue; } const r = e.getBoundingClientRect(); out.push(`${e.tagName.toLowerCase()} ${f(r.left - xb.left)} ${f(r.top - xb.top)} ${f(r.width)} ${f(r.height)}`); }
    return out;
  }
  for (const e of document.body.querySelectorAll('*')) {
    if (tech(e) || closed(e)) continue;
    const pn = e.closest('.hl__detail'); if (pn && pn !== e) continue; // the panel's own box stays in the list
    if (mode === 'page' && e.closest('.site-header')) continue;
    if (mode === 'outside' && (X.contains(e) || e.contains(X))) continue;
    if (!e.getClientRects().length) { out.push(e.tagName.toLowerCase() + ' no box'); continue; } // display none: its zero box would only repeat the scroll position
    const r = e.getBoundingClientRect(), after = mode === 'outside' && (X.compareDocumentPosition(e) & 4);
    out.push(`${e.tagName.toLowerCase()}${e.classList.contains('hl__detail') ? '.hl__detail' : ''} ${f(r.left + scrollX)} ${after ? 'X+' + f(r.top - xb.bottom) : f(r.top + scrollY)} ${f(r.width)} ${f(r.height)}`);
  }
  return out;
}
function pgT() {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim(), X = document.getElementById('experience'), root = X.querySelector('.experience-panel');
  const list = root.querySelector('.hl__items'), panel = root.querySelector('.hl__detail'), cw = document.documentElement.clientWidth;
  const cards = [...root.querySelectorAll('details')].map(d => {
    const s = d.querySelector('summary'), h3 = s.querySelector('h3'), lead = h3.querySelector('.hl__lead'), sub = s.querySelector('.disclosure__subtitle'), r = s.getBoundingClientRect();
    const label = [...h3.childNodes].filter(n => n.nodeType === 3 && n.data.trim()).pop(), g = document.createRange(); if (label) g.selectNodeContents(label);
    const lr = lead ? lead.getBoundingClientRect() : null, hr = h3.getBoundingClientRect();
    return { active: d.classList.contains('is-active'), open: d.open, top: r.top, bottom: r.bottom, w: r.width, h: r.height, wm: getComputedStyle(h3).writingMode, title: norm(h3.textContent), label: label ? norm(label.data) : '', lines: label ? g.getClientRects().length : 0,
      sub: norm(sub.textContent), subShown: sub.getClientRects().length > 0, own: norm(d.querySelector('.bullets').textContent),
      lead: lead ? { w: lr.width, h: lr.height, pos: getComputedStyle(lead).position, inside: lr.left >= hr.left - 0.5 && lr.right <= hr.right + 0.5 } : null, h3fits: h3.scrollWidth <= h3.clientWidth + 1 };
  });
  let pn = null;
  if (panel) {
    const pr = panel.getBoundingClientRect(), t = document.elementFromPoint(pr.left + 24, pr.top + 24), head = panel.querySelector('.hl__head'), h3 = head && head.querySelector('h3'), lead = h3 && h3.querySelector('.hl__lead'), sub = head && head.querySelector('.disclosure__subtitle'), ul = panel.querySelector('.bullets');
    const tw = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let first = null;
    for (let n; (n = tw.nextNode());) if (n.data.trim()) { const g = document.createRange(); g.selectNodeContents(n); first = g.getClientRects()[0]; break; }
    const seen = e => { if (!e) return false; const r = e.getBoundingClientRect(); return e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && r.width > 20 && r.height > 8 && r.left >= pr.left - 0.5 && r.right <= pr.right + 0.5 && r.top >= pr.top - 0.5 && r.bottom <= pr.bottom + 0.5; };
    pn = { top: pr.top, left: pr.left, w: pr.width, h: pr.height, bottom: pr.bottom, display: getComputedStyle(panel).display, live: panel.getAttribute('aria-live'),
      inView: pr.width > 50 && pr.height > 50 && pr.top >= 0 && pr.bottom <= innerHeight && pr.left >= 0 && pr.right <= cw + 0.5, topmost: !!t && panel.contains(t), text: norm(panel.textContent), firstLine: first ? first.top - pr.top : null,
      title: h3 ? norm(h3.textContent) : '', sub: sub ? norm(sub.textContent) : '', list: ul ? norm(ul.textContent) : '', seen: [seen(h3), seen(lead), seen(sub), seen(ul)], lis: ul ? [...ul.children].filter(seen).length + '/' + ul.children.length : '0/0',
      hooks: panel.querySelectorAll('[id],[name],[data-hoverlist],details,summary,script,[class*="js-"]').length, swap: panel.classList.contains('is-swap') };
  }
  const tops = [...new Set(cards.map(c => Math.round(c.top)))], h2 = X.querySelector('h2'), xb = X.getBoundingClientRect();
  return { hover: root.classList.contains('is-hover'), tabsAttr: root.getAttribute('data-hoverlist'), min: root.style.getPropertyValue('--hl-min'), wrapper: !!list, leads: root.querySelectorAll('.hl__lead').length, cards, rows: tops.length, tabsBottom: Math.max(...cards.map(c => c.bottom)), panel: pn,
    visible: X.classList.contains('is-visible'), secTop: xb.top, secH: xb.height, sy: scrollY, timeline: [...X.querySelectorAll('.timeline > li')].map(li => Math.round(li.getBoundingClientRect().height * 10) / 10),
    iw: innerWidth, cw, vh: innerHeight, fine: matchMedia('(hover: hover) and (pointer: fine)').matches, none: matchMedia('(hover: none)').matches, wide: matchMedia('(min-width: 961px)').matches,
    inter: document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded'), ff: getComputedStyle(h2).fontFamily.split(',')[0].replace(/["']/g, '') };
}
function pgPast() { const W = document.documentElement.clientWidth, o = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + r.right.toFixed(1)); } return o; }
function pgRuns(i) {
  const root = document.querySelector('#experience .experience-panel'), row = [...root.querySelectorAll('details')][i], panel = root.querySelector('.hl__detail'), runs = []; let clipped = 0, boxless = 0;
  for (const [where, el] of [['tab', row.querySelector('summary')], ['panel', panel]]) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) {
      if (!n.data.trim()) continue; const pe = n.parentElement;
      if (where === 'tab' && pe.closest('.hl__lead')) { clipped++; continue; }
      const g = document.createRange(); g.selectNodeContents(n);
      const rects = [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({ x: r.left, y: r.top, r: r.right, b: r.bottom })), cs = getComputedStyle(pe);
      if (!rects.length) { boxless++; continue; }
      runs.push({ key: where + ' ' + pe.tagName.toLowerCase() + (typeof pe.className === 'string' && pe.className ? '.' + pe.className.split(/\s+/)[0] : '') + ' ' + cs.color, color: cs.color, rects });
    }
  }
  const a = row.getBoundingClientRect(), b = panel.getBoundingClientRect();
  return { runs, clipped, boxless, clip: { x: Math.max(0, Math.floor(Math.min(a.left, b.left)) - 8), y: Math.floor(Math.min(a.top, b.top)) - 8, r: Math.ceil(Math.max(a.right, b.right)) + 8, b: Math.ceil(Math.max(a.bottom, b.bottom)) + 8 }, vh: innerHeight, cw: document.documentElement.clientWidth };
}
function pgHide(on) { let s = document.getElementById('p61-hide'); if (on && !s) { s = document.createElement('style'); s.id = 'p61-hide'; s.textContent = '#experience .hl summary, #experience .hl summary *, #experience .hl__detail, #experience .hl__detail * { -webkit-text-fill-color: transparent !important; }'; document.head.append(s); } if (!on && s) s.remove(); return 1; }
function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return [document.querySelector('.site-header'), ...document.querySelectorAll('main > *'), document.querySelector('.site-footer')].filter(Boolean).map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)); }
// Animations and transitions over 50 ms whose target is inside #experience (under reduced motion the site forces 0.01 ms).
const ANIM = `document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return t&&document.getElementById('experience').contains(t)&&(a.playState==='running'||a.playState==='pending')&&a.effect.getComputedTiming().activeDuration>50}).length`;
const OPEN = expr => `(()=>{const d=${expr},c=d.querySelector('.bullets'),r=c.getBoundingClientRect();return {open:d.open,vis:c.checkVisibility()&&r.height>0}})()`;

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
const fresh = { from: BASE, xp: {}, outside: {}, sections: {}, timeline: {} };
if (!WRITE && !base && PARTS.some(x => ['hover', 'plain', 'outside', 'extra', 'others'].includes(x))) check(false, 'baseline.json missing: nothing can be compared with 6311e63');
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${Array.isArray(value) ? value.length + ' entries' : JSON.stringify(value)}`); return true; }
  if (!base) return false;
  const want = base[kind][key]; let why = '';
  if (want === undefined) why = ' (no baseline entry)';
  else if (JSON.stringify(want) !== JSON.stringify(value)) { if (Array.isArray(want)) { const d = []; for (let i = 0; i < Math.max(want.length, value.length) && d.length < 6; i++) if (want[i] !== value[i]) d.push(`#${i} 6311e63 « ${want[i]} » now « ${value[i]} »`); why = `\n        6311e63 ${want.length} entries, now ${value.length}; first differences: ${d.join(' | ')}`; } else why = `\n        6311e63: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}`; }
  return check(!why, `${text} = 6311e63 (${Array.isArray(value) ? value.length + ' entries' : 'value'})${why}`);
}
const media = st => `innerWidth ${st.iw}, layout width (clientWidth) ${st.cw}, fine pointer with hover ${st.fine}, (hover: none) ${st.none}, 961 px and more ${st.wide}`;
const fontOk = st => st.inter && st.ff === 'Inter';
// the panel shows tab i: whole title, subtitle and list, as text and as boxes inside the panel
const shows = (st, i) => { const c = st.cards[i], pn = st.panel; return !!pn && pn.title === TITLES[i] && c.title === TITLES[i] && pn.sub === c.sub && pn.sub.length > 5 && pn.list === c.own && pn.list.length > 20 && pn.seen.every(Boolean) && pn.lis.split('/')[0] === pn.lis.split('/')[1]; };

// ---- Done When 2 and 5: tabs ----
async function hoverCase(b, W, reduce) {
  const label = `home ${W}${reduce ? ' reduced-motion' : ''}`;
  const p = await b.page(W, { height: 1400, reduce }); const ready = await load(p, HOME);
  let st = await p.ev(`(${pgT})()`);
  log(` -- ${label}: ${media(st)}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}`);
  compare('timeline', `${W}`, st.timeline, `${label}: heights of the five timeline steps (${st.timeline.join(', ')})`);
  if (!check(st.hover && st.tabsAttr === 'tabs' && !!st.panel && st.cards.length === N, `${label}: tabs on (hover mode ${st.hover}, data-hoverlist « ${st.tabsAttr} », panel present ${!!st.panel}, tabs ${st.cards.length} of ${N})`)) { await p.close(); return; }
  await p.ev(`(document.querySelector('#experience .experience-panel').scrollIntoView({block:'center',behavior:'instant'}),1)`); await sleep(300);
  st = await p.ev(`(${pgT})()`); let pn = st.panel;
  check(st.cards[0].active && st.cards.filter(c => c.active).length === 1 && st.cards.every(c => !c.open) && shows(st, 0) && pn.inView && pn.topmost && pn.top >= st.tabsBottom - 0.5 && !pn.swap,
    `${label}: on load tab 1 active alone, no card open, its whole title « ${pn.title} », subtitle and list (${pn.lis} lines) shown in the panel ${f(pn.w)}x${f(pn.h)}, in the viewport, topmost, ${f(pn.top - st.tabsBottom)} px under the tabs, first line ${f(pn.firstLine)} px under its edge, no entrance animation; reserve --hl-min « ${st.min} »`);
  check(pn.hooks === 0 && pn.live === 'polite', `${label}: the copied detail holds ${pn.hooks} id, name, hover list, dépliant, summary or script; aria-live « ${pn.live} »`);
  check(st.rows === (W >= 1200 ? 1 : 2) && st.cards.every((c, i) => c.wm === 'horizontal-tb' && c.lines === 1 && c.label === LABELS[i] && !c.subShown && c.lead && c.lead.w <= 1.5),
    `${label}: five tabs on ${st.rows} line(s) (expected ${W >= 1200 ? 1 : 2}), each label horizontal on one line: ${st.cards.map(c => `${c.label} ${f(c.w)}x${f(c.h)} ${c.wm} ${c.lines} line`).join(' | ')}; start of the title clipped to ${st.cards.map(c => c.lead ? f(c.lead.w) : '?').join('/')} px, subtitle shown in a tab ${st.cards.filter(c => c.subShown).length}`);
  const ref = await settled(p, `(${pgBoxes})('page')`);
  // the mouse on each tab
  const groups = new Map(); let animMax = 0, animRows = 0, clipped = 0, boxless = 0; const sizes = [];
  for (let i = 0; i < N; i++) {
    const top = await hover(p, S(i), 0), an = await p.ev(ANIM); await sleep(450); animMax = Math.max(animMax, an); if (an) animRows++;
    st = await p.ev(`(${pgT})()`); pn = st.panel; sizes.push(`${f(st.secH)}/${f(pn.w)}x${f(pn.h)}`);
    const now = await p.ev(`(${pgBoxes})('page')`); const diff = []; for (let j = 0; j < Math.max(ref.length, now.length); j++) if (ref[j] !== now[j]) diff.push(`« ${ref[j]} » → « ${now[j]} »`);
    check(top && st.cards[i].active && st.cards.filter(c => c.active).length === 1 && st.cards.every(c => !c.open) && shows(st, i) && pn.inView && pn.topmost && pn.top >= st.tabsBottom - 0.5,
      `${label}: mouse on tab ${i + 1} ${LABELS[i]}: active alone, not opened, panel shows « ${pn.title} » + subtitle + list (${pn.lis} lines, boxes inside the panel ${pn.seen.join('/')}), panel ${f(pn.w)}x${f(pn.h)} in the viewport, topmost, ${f(pn.top - st.tabsBottom)} px under the tabs`);
    check(diff.length === 0 && now.length > 100, `${label}: mouse on tab ${i + 1}: boxes changed since load ${diff.length} of ${now.length}${diff.length ? ' — ' + diff.slice(0, 4).join(' | ') : ''}`);
    // contrast of the active tab and of the panel
    const g = await p.ev(`(${pgRuns})(${i})`); const clip = { ...g.clip, cw: g.cw, vh: g.vh }; clipped += g.clipped; boxless += g.boxless;
    if (!inside(clip)) { check(false, `${label}: tab ${i + 1}: tab and panel not wholly inside the viewport (${JSON.stringify(g.clip)} of ${g.cw}x${g.vh}): contrast not measured`); continue; }
    const shown = await shotPng(p, clip); await p.ev(`(${pgHide})(true)`); await sleep(80); const hidden = await shotPng(p, clip); await p.ev(`(${pgHide})(false)`);
    if (shown.w !== clip.r - clip.x || hidden.h !== clip.b - clip.y) { check(false, `${label}: tab ${i + 1}: capture ${shown.w}x${shown.h}, asked ${clip.r - clip.x}x${clip.b - clip.y}: contrast not measured`); continue; }
    for (const run of g.runs) {
      const t = rgba(run.color); let min = 99, at = null, ink = 0, n = 0;
      const oob = each(hidden, clip, run.rects, i2 => { n++; const R0 = hidden.px[i2], G0 = hidden.px[i2 + 1], B0 = hidden.px[i2 + 2], c = ratio(lum(t[3] * t[0] + (1 - t[3]) * R0, t[3] * t[1] + (1 - t[3]) * G0, t[3] * t[2] + (1 - t[3]) * B0), lum(R0, G0, B0)); if (c < min) { min = c; at = [R0, G0, B0]; } if (Math.abs(shown.px[i2] - R0) + Math.abs(shown.px[i2 + 1] - G0) + Math.abs(shown.px[i2 + 2] - B0) > 90) ink++; });
      const e = groups.get(run.key) || { min: 99, at: null, runs: 0, px: 0, oob: 0, inkMin: 1e9 }; if (min < e.min) { e.min = min; e.at = at; } e.runs++; e.px += n; e.oob += oob; e.inkMin = Math.min(e.inkMin, ink); groups.set(run.key, e);
    }
  }
  check(new Set(sizes).size === 1, `${label}: section height / panel size over the five tabs: ${[...new Set(sizes)].join(' | ')}`);
  for (const [key, e] of [...groups].sort()) check(e.min >= 4.5 && e.oob === 0 && e.inkMin > 0, `${label}: text « ${key} » against the worst pixel behind it rgb(${e.at}) = ${e.min.toFixed(2)}:1 (${e.runs} pieces of text over the ${N} tabs, ${e.px} pixels${e.oob ? `, ${e.oob} outside the capture` : ''}; fewest painted pixels in one piece ${e.inkMin})`);
  log(`        not measured for contrast: ${clipped} pieces of text clipped to 1 px in a tab (.hl__lead, shown in the panel head and measured there) and ${boxless} without a box (the subtitle inside a tab, display none)`);
  if (reduce) check(animMax === 0, `${label}: animations or transitions over 50 ms in #experience right after each of the ${N} mouse moves: ${animMax} at most`);
  else check(animMax > 0, `${label}: the same probe without reduced motion sees them: ${animMax} at most, on ${animRows} of ${N} moves (0 would mean a blind probe)`);
  // a click with the mouse never opens a card in tabs mode
  await click(p, S(1)); st = await p.ev(`(${pgT})()`);
  check(st.cards.every(c => !c.open) && st.cards[1].active && shows(st, 1), `${label}: mouse click on tab 2: not opened, active, its detail shown; cards open ${st.cards.filter(c => c.open).length}`);
  // keyboard: pointer away first (a scroll would bring a tab under a still mouse), real Tab, Enter
  await away(p); await sleep(200); await focusStart(p);
  for (let i = 0; i < N; i++) {
    const tabs = await tabTo(p, S(i)); if (tabs < 0) { check(false, `${label}: Tab never reaches tab ${i + 1}`); break; }
    await sleep(350); const fv = await p.ev(`document.activeElement.matches(':focus-visible')`); st = await p.ev(`(${pgT})()`); const okShow = st.cards[i].active && shows(st, i) && st.panel.h > 50;
    await p.key('Enter'); await sleep(350); const st2 = await p.ev(`(${pgT})()`), fv2 = await p.ev(`document.activeElement===${S(i)}&&document.activeElement.matches(':focus-visible')`);
    // the ring, from pixels: focused, then blurred
    const c = await p.ev(`(()=>{const e=${S(i)};let r=e.getBoundingClientRect();if(r.top<120||r.bottom>innerHeight-20){e.scrollIntoView({block:'center',behavior:'instant'});r=e.getBoundingClientRect();}return {x:Math.max(0,Math.floor(r.left)-10),y:Math.floor(r.top)-10,r:Math.ceil(r.right)+10,b:Math.ceil(r.bottom)+10,cw:document.documentElement.clientWidth,vh:innerHeight}})()`);
    await sleep(120); let ring = { n: 0, median: 0 };
    if (inside(c)) { const a = await shotPng(p, c); await p.ev(`(document.activeElement.blur(),1)`); await sleep(120); const z = await shotPng(p, c); const rs = []; for (let k = 0; k < a.px.length; k += a.bpp) if (Math.abs(a.px[k] - z.px[k]) + Math.abs(a.px[k + 1] - z.px[k + 1]) + Math.abs(a.px[k + 2] - z.px[k + 2]) > 60) rs.push(ratio(lum(a.px[k], a.px[k + 1], a.px[k + 2]), lum(z.px[k], z.px[k + 1], z.px[k + 2]))); rs.sort((x, y) => x - y); ring = { n: rs.length, median: rs.length ? rs[rs.length >> 1] : 0 }; await p.ev(`(${S(i)}.focus(),1)`); }
    check(tabs >= 1 && fv && okShow && st2.cards.every(x => !x.open) && st2.cards[i].active && shows(st2, i) && fv2 && ring.n >= 200 && ring.median >= 3,
      `${label}: keyboard: ${tabs} Tab → tab ${i + 1} ${LABELS[i]} focused (:focus-visible ${fv}), active, its whole title, subtitle and list shown (${okShow}); Enter keeps it (cards open ${st2.cards.filter(x => x.open).length}, focus kept ${fv2}); focus ring ${ring.n} pixels, median ${ring.median.toFixed(2)}:1 against the same pixels without it`);
  }
  const o = await p.ev(`(${pgPast})()`); check(o.length === 0, `${label}: elements past the layout width ${st.cw} px (innerWidth ${st.iw}): ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 3: today's cards ----
async function plainCase(b, c) {
  const label = `home ${c.text}`, act = c.touch || c.W < 861 ? tap : click, actName = act === tap ? 'tap' : 'click';
  const p = await b.page(c.W, { height: 1100, nojs: !!c.nojs, ...(c.touch ? { touch: true } : {}) }); const ready = await load(p, HOME);
  const st = await p.ev(`(${pgT})()`);
  log(` -- ${label}: ${media(st)}`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}, heading font ${st.ff}`);
  check(!st.hover && (!st.panel || (st.panel.display === 'none' && st.panel.text === '')) && st.cards.length === N && st.cards.every(x => !x.active && !x.open), `${label}: no tabs (hover mode ${st.hover}, panel ${st.panel ? 'display ' + st.panel.display + ', text length ' + st.panel.text.length : 'absent'}, cards active ${st.cards.filter(x => x.active).length}, open ${st.cards.filter(x => x.open).length} of ${N}); new markup: wrapper ${st.wrapper}, title starts marked ${st.leads}`);
  check(st.cards.every((x, i) => x.title === TITLES[i] && x.subShown && x.h3fits && (WRITE || (x.lead && x.lead.w > 40 && x.lead.pos === 'static' && x.lead.inside))), `${label}: every card shows its whole title and its subtitle: ${st.cards.map(x => `« ${x.title} » start ${x.lead ? f(x.lead.w) + ' px ' + x.lead.pos : 'not marked'}`).join(' | ')}`);
  compare('xp', `${c.key}|closed`, await settled(p, `(${pgBoxes})('xp')`), `${label}: boxes of #experience and of everything 6311e63 holds in it, cards closed`);
  let okAct = 0, okKey = 0; const tabsList = [], badRows = [];
  for (let i = 0; i < N; i++) {
    const t1 = await act(p, S(i)), o1 = await p.ev(OPEN(R(i)));
    if (i === 0) compare('xp', `${c.key}|open1`, await settled(p, `(${pgBoxes})('xp')`), `${label}: boxes of #experience and of everything 6311e63 holds in it, first card open`);
    const t2 = await act(p, S(i)), o2 = await p.ev(OPEN(R(i)));
    if (t1 && t2 && o1.open && o1.vis && !o2.open && !o2.vis) okAct++; else badRows.push(`${actName} card ${i + 1}: ${JSON.stringify([t1, o1, t2, o2])}`);
  }
  await p.ev(`(document.activeElement&&document.activeElement.blur(),1)`); await focusStart(p);
  for (let i = 0; i < N; i++) {
    const tabs = await tabTo(p, S(i)); tabsList.push(tabs); if (tabs < 0) { badRows.push(`Tab never reaches card ${i + 1}`); break; }
    await p.key('Enter'); await sleep(300); const o1 = await p.ev(OPEN(R(i))); await p.key('Enter'); await sleep(300); const o2 = await p.ev(OPEN(R(i)));
    if (tabs >= 1 && o1.open && o1.vis && !o2.open && !o2.vis) okKey++; else badRows.push(`Enter card ${i + 1}: ${JSON.stringify([tabs, o1, o2])}`);
  }
  check(okAct === N && okKey === N, `${label}: each card opens (list visible) and closes by ${actName}: ${okAct} of ${N}; by real Tab then Enter, Enter: ${okKey} of ${N} (Tab presses ${tabsList.join(', ')})${badRows.length ? ' — ' + badRows.slice(0, 4).join(' | ') : ''}`);
  const o = await p.ev(`(${pgPast})()`); check(o.length === 0, `${label}: elements past the layout width ${st.cw} px: ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  if (!c.nojs) check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}

// ---- Done When 4 ----
async function outsideCase(b, W) {
  const label = `home ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, HOME); const st = await p.ev(`(${pgT})()`);
  check(ready && fontOk(st), `${label}: page ready ${ready}, Inter loaded ${st.inter}; tabs on ${st.hover}; #experience ${f(st.secH)} high`);
  compare('outside', `${W}`, await settled(p, `(${pgBoxes})('outside')`), `${label}: boxes of everything outside #experience (what follows it measured from its bottom edge)`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
async function otherPage(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: 1100 }); const ready = await load(p, route);
  const hl = await p.ev(`document.querySelectorAll('.hl--tabs, [data-hoverlist="tabs"]').length + '/' + document.querySelectorAll('.hl.is-hover').length`);
  check(ready && hl.startsWith('0/'), `${label}: page ready ${ready}; tabs blocks / lists in hover mode on this page ${hl}`);
  compare('sections', `${route}|${W}`, await settled(p, `(${pgSections})()`), `${label}: heights of header, each main block and footer`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}${p.errors.length ? ' ' + JSON.stringify(p.errors.slice(0, 3)) : ''}`);
  await p.close();
}
// Planner decision 2: with a mouse the section still waits for the scroll (read with motion allowed: under « reduce » the site hides nothing)
async function revealCase(b, W, H) {
  const label = `home ${W}x${H}, loaded without scrolling`; const p = await b.page(W, { height: H }); await load(p, HOME, { reveal: false }); await sleep(1500);
  const a = await p.ev(`(${pgT})()`), op = await p.ev(`getComputedStyle(document.getElementById('experience')).opacity`), on = await p.ev(`document.documentElement.className`);
  check((WRITE || a.hover) && !a.visible && a.secTop > a.vh && a.sy === 0 && +op === 0, `${label}: tabs on ${a.hover}; #experience starts ${f(a.secTop)} px down (window ${a.vh}), scrollY ${a.sy}: marked visible ${a.visible}, opacity ${op} (html class « ${on} »)`);
  await p.ev(`(document.getElementById('experience').scrollIntoView({block:'start',behavior:'instant'}),1)`); await sleep(1300);
  const z = await p.ev(`(${pgT})()`), op2 = await p.ev(`getComputedStyle(document.getElementById('experience')).opacity`);
  check(z.visible && +op2 === 1, `${label}: after scrolling to it: marked visible ${z.visible}, opacity ${op2}; section ${f(z.secH)} high`);
  await p.close();
}

// ---- once, outside the Done When list ----
async function widen(b) {
  const label = `home 960 → 1200 → 960`; const p = await b.page(960, { height: 1100 }); await load(p, HOME);
  await click(p, S(1)); const o = await p.ev(OPEN(R(1)));
  await p.s('Emulation.setDeviceMetricsOverride', { width: 1200, height: 1100, deviceScaleFactor: 1, mobile: false }); await sleep(900);
  let st = await p.ev(`(${pgT})()`); const past = await p.ev(`(${pgPast})()`);
  check(o.open && st.hover && !!st.min && st.panel && st.panel.text.length > 20 && !st.panel.swap && st.cards.every(x => !x.open) && st.cards.filter(x => x.active).length === 1 && past.length === 0,
    `${label}: card 2 opened at 960 (${o.open}); widened to 1200: tabs on ${st.hover}, cards left open ${st.cards.filter(x => x.open).length}, active tabs ${st.cards.filter(x => x.active).length}, reserve ${st.min}, entrance animation replayed ${!!(st.panel && st.panel.swap)}, elements past the layout width ${past.length}`);
  await p.s('Emulation.setDeviceMetricsOverride', { width: 960, height: 1100, deviceScaleFactor: 1, mobile: false }); await sleep(900);
  st = await p.ev(`(${pgT})()`);
  check(!st.hover && st.panel && st.panel.display === 'none' && st.panel.text === '' && !st.min && st.cards.every(x => !x.open && !x.active), `${label}: back to 960: tabs on ${st.hover}, cards open ${st.cards.filter(x => x.open).length}, active ${st.cards.filter(x => x.active).length}, panel emptied and hidden, reserve removed`);
  await p.ev('(scrollTo(0,0),1)'); await sleep(300);
  // never written by a baseline run: on 6311e63 the card opened above is still open here
  if (!WRITE) compare('xp', `960-fine|closed`, await settled(p, `(${pgBoxes})('xp')`), `${label}: back to 960, boxes of #experience, cards closed`);
  check(p.errors.length === 0, `${label}: script errors ${p.errors.length}`);
  await p.close();
}

// ---- Done When 7: the three kept captures (inside the viewport, refused when the heading font is not Inter) ----
async function capture(b, W, row, kind) {
  const p = await b.page(W, { height: W < 861 ? 3000 : 1500 }); await load(p, HOME); const st = await p.ev(`(${pgT})()`), file = `experience-${W}-${kind}.jpg`;
  if (!fontOk(st)) { check(false, `capture ${file}: refused, heading font is not Inter`); await p.close(); return; }
  await p.ev(`(()=>{const X=document.getElementById('experience');scrollTo(0,X.getBoundingClientRect().top+scrollY-110);return 1})()`); await sleep(400);
  const d = await p.ev(`(()=>{const e=${S(row)},r=e.getBoundingClientRect();return {x:r.x+Math.min(r.width/2,140),y:r.y+r.height/2}})()`);
  if (W >= 961) { await mouse(p, 'mouseMoved', { x: d.x - 4, y: d.y - 4 }); await mouse(p, 'mouseMoved', d); }
  else { await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y }] }); await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  await sleep(900);
  const g = await p.ev(`(()=>{const r=document.getElementById('experience').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight,state:${ROWS}.map(d=>d.open?'open':d.classList.contains('is-active')?'active':'-').join(' ')}})()`);
  const fits = g.y >= 0 && g.y + g.height <= g.vh, want = [0, 1, 2, 3, 4].map(i => i === row ? (W >= 961 ? 'active' : 'open') : '-').join(' ');
  if (check(fits && g.state === want, `capture ${file}: #experience ${g.width}x${g.height} wholly inside the ${g.vh} px viewport; cards: ${g.state}`)) {
    const [sx, sy] = await p.ev('[scrollX, scrollY]');
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(join(process.env.P61_SHOTS || HERE, file), Buffer.from(got.data, 'base64')); log(`        capture ${file} ${g.width}x${g.height}`);
  }
  await p.close();
}

log(`RENDER p61 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of 6311e63: comparisons are written, not checked)' : ''}${PARTIAL ? ` — PARTIAL RUN, parts: ${PARTS.join(', ')}` : ''}`);
const b = await browser();
try {
  if (PARTS.includes('hover')) { log('== home — tabs (Done When 2 and 5)'); for (const W of HOVER_W) for (const reduce of [false, true]) await guard(`home ${W}${reduce ? ' reduced-motion' : ''}`, () => hoverCase(b, W, reduce)); }
  if (PARTS.includes('plain')) { log(`== home — today's cards (Done When 3)`); for (const c of CASES) await guard(`home ${c.text}`, () => plainCase(b, c)); }
  if (PARTS.includes('outside')) { log('== home — everything outside #experience (Done When 4)'); for (const W of [1200, 375]) await guard(`home ${W} outside`, () => outsideCase(b, W)); }
  if (PARTS.includes('reveal')) { log('== home — the section still waits for the scroll with a mouse (Done When 4, Planner decision 2)'); for (const [W, H] of [[1200, 900], [1920, 1080]]) await guard(`home ${W}x${H} reveal`, () => revealCase(b, W, H)); }
  if (PARTS.includes('extra')) { log('== home — once, outside the Done When list'); await guard('home widen', () => widen(b)); }
  if (PARTS.includes('others')) { log('== the nine other shell pages (Done When 4)'); for (const route of OTHERS) for (const W of [1200, 375]) await guard(`${route} ${W}`, () => otherPage(b, route, W)); }
  if (PARTS.includes('shots') && !WRITE) { log('== kept captures (Done When 7)'); await guard('capture 1200', () => capture(b, 1200, 3, 'tab')); await guard('capture 961', () => capture(b, 961, 2, 'tab')); await guard('capture 375', () => capture(b, 375, 1, 'open')); }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
if (WRITE && !PARTIAL) { writeFileSync(BASEFILE, JSON.stringify(fresh, null, 0).replace(/\],"/g, '],\n"') + '\n'); log(`baseline.json written: ${Object.keys(fresh.xp).length} « xp » lists, ${Object.keys(fresh.outside).length} « outside » lists, ${Object.keys(fresh.sections).length} « sections » lists, ${Object.keys(fresh.timeline).length} « timeline » lists`); }
log(`RENDER ${BASE}: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (${PARTS.join(', ')}): not the full render` : ''}`);
if (OUTFILE) writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
