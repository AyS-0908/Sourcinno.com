// p55 Done When 2–5: the heroes rendered in headless Chrome. browser() = P51 helper (resolver NOTFOUND for every host
// except 127.0.0.1 and Google Fonts; prefers-reduced-motion set explicitly). The contrast measure is the one of
// .WIP/mockup-v12/prove.mjs and probe-live.mjs (text hidden, box captured, worst pixel behind the text), retargeted:
//  - captured INSIDE the viewport (no captureBeyondViewport: that resizes the window to 1 px and back, AGENTS Gotcha);
//  - the gate is the plan's measure: the worst pixel anywhere in the box around the whole text (as probe-live.mjs);
//    the worst pixel inside the line boxes alone (where glyphs really sit) is printed beside it, for information;
//  - the home title is measured twice: white over the whole title, the accent word with its own colour.
// A text or a picture is called « on screen » from pixels: the capture with the text shown differs from the capture
// with the text hidden inside its line boxes; the picture area holds many colours far from the hero's navy.
// JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow: every element's right edge against the
// emulated width (P34 Gotcha). Captures are refused when the title font is not Inter (P54 Gotcha).
// Compared with product 19fef04 through baseline.json: plain-page hero boxes, heights of everything below the hero,
// background picture of the two home service cards, hosts asked outside 127.0.0.1 and Google Fonts.
// usage (product root):
//   red run + baseline, on a scratch copy of 19fef04 served on 4174:
//     P48_PROFILES=<scratch> P48_BASE=http://127.0.0.1:4174 P55_BASELINE=write node .WIP/pass-loop-p55/evidence/render.mjs
//   a mutated scratch copy (keeps neither render.txt nor captures): add P55_NO_LOG=1 and P48_BASE
//   the tree:  P48_PROFILES=<scratch> [P55_SHOTS=<scratch dir for the captures that are not kept>] node .WIP/pass-loop-p55/evidence/render.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { browser, BASE, outside, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';

const HERE = import.meta.dirname, WRITE = process.env.P55_BASELINE === 'write', SHOTS = process.env.P55_SHOTS || '', QUIET = !!process.env.P55_NO_LOG;
const BASEFILE = join(HERE, 'baseline.json');
const PHOTO = [['/', 'home', 520], ['/service-strategie-transformation/', 'strategie', 400], ['/service-ia-business/', 'ia', 400], ['/service-venture-building/', 'venture', 400]];
const PLAIN = ['/404.html', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/portfolio/', '/publications/'];
const WIDTHS = [1920, 1200, 961, 861, 860, 375, 320], VH = 1100, NAVY = [18, 37, 63];
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const out = []; let bad = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); };
const f = n => (Math.round(n * 10) / 10).toString(), near = (a, b, t = 1) => Math.abs(a - b) <= t;

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
const rgba = s => { const m = s.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m[3] ?? 1]; };
// Calls fn(r, g, b, i) for every captured pixel inside the given boxes; returns how many box pixels fell outside the capture.
function each(img, clip, rects, fn) {
  let oob = 0;
  for (const r of rects) for (let y = Math.floor(r.y); y < Math.ceil(r.b); y++) for (let x = Math.floor(r.x); x < Math.ceil(r.r); x++) {
    const px = x - clip.x, py = y - clip.y; if (px < 0 || py < 0 || px >= img.w || py >= img.h) { oob++; continue; }
    const i = (py * img.w + px) * img.bpp; fn(img.px[i], img.px[i + 1], img.px[i + 2], i);
  }
  return oob;
}
function worst(img, clip, rects, [tr, tg, tb, ta]) {
  let min = 99, at = null, n = 0;
  const oob = each(img, clip, rects, (r, g, b) => { n++; const L1 = lum(ta * tr + (1 - ta) * r, ta * tg + (1 - ta) * g, ta * tb + (1 - ta) * b), L2 = lum(r, g, b), c = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); if (c < min) { min = c; at = [r, g, b]; } });
  return { min, at, n, oob };
}
// Pixels of the text really painted: shown capture against hidden capture, inside the line boxes.
function painted(shown, hidden, clip, rects) { let n = 0; each(shown, clip, rects, (r, g, b, i) => { if (Math.abs(r - hidden.px[i]) + Math.abs(g - hidden.px[i + 1]) + Math.abs(b - hidden.px[i + 2]) > 90) n++; }); return n; }
// Picture really painted: share of the area far from the hero's navy, and how many colours it holds (5 bits a channel).
function spread(img, clip, rect) { const seen = new Set(); let n = 0, far = 0; each(img, clip, [rect], (r, g, b) => { n++; if (Math.max(Math.abs(r - NAVY[0]), Math.abs(g - NAVY[1]), Math.abs(b - NAVY[2])) > 40) far++; seen.add((r >> 3) << 10 | (g >> 3) << 5 | (b >> 3)); }); return { n, far: n ? far / n : 0, colours: seen.size }; }

// ---- in the page (functions sent as text; all synchronous) ----
function pageHero() {
  const h = document.querySelector('main .hero'); if (!h) return { none: true };
  const rects = el => { const g = document.createRange(); g.selectNodeContents(el); return [...g.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({ x: r.left, y: r.top, r: r.right, b: r.bottom })); };
  const box = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
  const vis = e => { for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); if (c.display === 'none' || c.visibility !== 'visible' || +c.opacity !== 1) return false; } return true; };
  const top = (e, rs) => { if (!rs.length) return false; const r = rs[0], t = document.elementFromPoint((r.x + r.r) / 2, (r.y + r.b) / 2); return !!t && e.contains(t); };
  const h1 = h.querySelector('h1'), sub = h.querySelector('.hero__sub'), sp = h1.querySelector('span'), img = h.querySelector('img.hero__bg'), ct = h.querySelector('.container');
  const words = []; const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) { const re = /\S+/g; let m; while ((m = re.exec(n.data))) { const g = document.createRange(); g.setStart(n, m.index); g.setEnd(n, m.index + m[0].length); const rs = [...g.getClientRects()].filter(r => r.width > 0); words.push({ w: m[0], lines: rs.length, x: Math.min(...rs.map(r => r.left)), r: Math.max(...rs.map(r => r.right)) }); } }
  const cs = getComputedStyle(h1), h1r = rects(h1), subr = sub ? rects(sub) : [];
  return {
    cls: h.className, hero: box(h), ct: box(ct), vw: innerWidth, vh: innerHeight, scrollY,
    h1: { box: box(h1), rects: h1r, color: cs.color, fs: cs.fontSize, ff: cs.fontFamily.split(',')[0].replace(/["']/g, ''), vis: vis(h1), top: top(h1, h1r), text: h1.textContent.replace(/\s+/g, ' ').trim() },
    accent: sp ? { rects: rects(sp), color: getComputedStyle(sp).color } : null,
    sub: sub ? { box: box(sub), rects: subr, color: getComputedStyle(sub).color, vis: vis(sub), top: top(sub, subr), text: sub.textContent.replace(/\s+/g, ' ').trim() } : null,
    img: img ? { box: box(img), ok: img.complete && img.naturalWidth > 0, nw: img.naturalWidth, nh: img.naturalHeight, src: new URL(img.currentSrc || img.src).pathname, alt: img.getAttribute('alt'), lazy: img.getAttribute('loading'), dims: img.getAttribute('width') + 'x' + img.getAttribute('height'), first: h.firstElementChild === img, vis: vis(img) } : null,
    words, inter: document.fonts.check('700 40px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded'),
  };
}
function pagePast(W) { const o = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.right > W + 0.5) o.push((e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')).slice(0, 50) + ' right ' + r.right.toFixed(1)); } return o; }
function pageBelow() {
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : '');
  const hero = document.querySelector('main .hero'), list = [document.querySelector('.site-header'), ...[...document.querySelectorAll('main > *')].filter(e => e !== hero), document.querySelector('.site-footer')].filter(Boolean);
  const bg = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundImage.replace(/https?:\/\/127\.0\.0\.1:\d+/g, '') : null; };
  return { parts: list.map(e => name(e) + ' ' + (Math.round(e.getBoundingClientRect().height * 10) / 10)), cards: { strategie: bg('.card--strategie'), ia: bg('.card--ia') } };
}
function pageHide(on) { let s = document.getElementById('p55-hide'); if (on && !s) { s = document.createElement('style'); s.id = 'p55-hide'; s.textContent = 'main .hero h1, main .hero .hero__sub { visibility: hidden !important; }'; document.head.append(s); } if (!on && s) s.remove(); return 1; }
const READY = `document.readyState==='complete'&&document.fonts.status==='loaded'&&[...document.querySelectorAll('main .hero img')].every(i=>i.complete)`;

async function load(p, route) {
  await p.s('Page.navigate', { url: BASE + route });
  let ready = false; for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(READY).catch(() => false); }
  await sleep(600); return ready;
}
async function shotPng(p, clip) {
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); return png(Buffer.from(got.data, 'base64'));
}
async function shotJpg(p, clip, file) {
  const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 86, clip: { ...clip, scale: 1 } }), sleep(20000).then(() => null)]);
  if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(file, Buffer.from(got.data, 'base64'));
}
// Text hidden then shown: both captures of the hero box, taken inside the viewport.
async function captures(p, g, W) {
  if (g.scrollY !== 0 || g.hero.b > g.vh + 0.5) { check(false, `hero not wholly on the first screen (bottom ${f(g.hero.b)} of ${g.vh}, scrollY ${g.scrollY}): not measured`); return null; }
  const clip = { x: 0, y: Math.floor(g.hero.y), width: W, height: Math.ceil(g.hero.b) - Math.floor(g.hero.y) };
  const shown = await shotPng(p, clip); await p.ev(`(${pageHide})(true)`); await sleep(120);
  const hidden = await shotPng(p, clip); await p.ev(`(${pageHide})(false)`); await sleep(60);
  if (shown.w !== W || hidden.w !== W || shown.h !== clip.height) { check(false, `capture ${shown.w}x${shown.h}, asked ${W}x${clip.height}: not measured`); return null; }
  return { clip, shown, hidden };
}
function contrast(c, parts, label) {
  const res = [];
  for (const [name, t] of parts) {
    if (!t || !t.rects.length) { check(false, `${label}: ${name} has no line box`); continue; }
    const u = { x: Math.min(...t.rects.map(r => r.x)), y: Math.min(...t.rects.map(r => r.y)), r: Math.max(...t.rects.map(r => r.r)), b: Math.max(...t.rects.map(r => r.b)) };
    const w = worst(c.hidden, c.clip, [u], rgba(t.color)), l = worst(c.hidden, c.clip, t.rects, rgba(t.color));
    res.push({ name, color: t.color, ...w, lines: l.min, ink: painted(c.shown, c.hidden, c.clip, t.rects) });
  }
  for (const r of res) check(r.min >= 4.5 && r.oob === 0, `${label}: ${r.name} ${r.color} against the worst pixel of its box rgb(${r.at}) = ${r.min.toFixed(2)}:1 (${r.n} pixels${r.oob ? `, ${r.oob} outside the capture` : ''}; inside the line boxes alone ${r.lines.toFixed(2)}:1)`);
  return res;
}

const base = !WRITE && existsSync(BASEFILE) ? JSON.parse(readFileSync(BASEFILE, 'utf8')) : null;
const fresh = { from: BASE, plain: {}, below: {}, hosts: {} };
if (!WRITE && !base) { check(false, 'baseline.json missing: nothing can be compared with 19fef04'); }
function compare(kind, key, value, text) {
  if (WRITE) { fresh[kind][key] = value; log(`        baseline ${kind} ${key}: ${JSON.stringify(value).slice(0, 140)}`); return; }
  if (!base) return;
  const want = base[kind][key];
  check(want !== undefined && JSON.stringify(want) === JSON.stringify(value), `${text} = 19fef04${want !== undefined && JSON.stringify(want) !== JSON.stringify(value) ? `\n        19fef04: ${JSON.stringify(want)}\n        now:     ${JSON.stringify(value)}` : want === undefined ? ' (no baseline entry)' : ''}`);
}
const hostsOf = urls => [...new Set(outside(urls).map(u => { try { return new URL(u).host; } catch { return u.slice(0, 40); } }))].sort();
// Heights below the hero: read until two reads 400 ms apart agree (an embed can still be settling).
async function below(p) { let a = await p.ev(`(${pageBelow})()`); for (let i = 0; i < 15; i++) { await sleep(400); const b = await p.ev(`(${pageBelow})()`); if (JSON.stringify(a) === JSON.stringify(b)) return b; a = b; } return a; }

async function photo(b, route, slug, want, W, { reduce = false, nojs = false } = {}) {
  const label = `${slug} ${W}${reduce ? ' reduced-motion' : ''}${nojs ? ' scripts-off' : ''}`;
  const p = await b.page(W, { height: VH, reduce, nojs }); const ready = await load(p, route);
  const g = await p.ev(`(${pageHero})()`);
  if (g.none || !g.img) { check(false, `${label}: ${g.none ? 'no hero' : 'no picture in the hero (img.hero__bg)'}${g.none ? '' : `, class « ${g.cls} », hero ${f(g.hero.w)}x${f(g.hero.h)}`}`); if (!g.none && (W === 1200 || W === 375) && !reduce) compare('below', `${route}|${W}|${nojs ? 'off' : 'on'}`, await below(p), `${label}: heights below the hero and the two home card pictures`); if (!nojs && !reduce) compare('hosts', route + '|' + W, hostsOf(p.requests), `${label}: hosts asked outside 127.0.0.1 and Google Fonts`); await p.close(); return; }
  check(ready && g.inter && g.h1.ff === 'Inter', `${label}: page ready ${ready}, Inter loaded ${g.inter}, title font ${g.h1.ff} ${g.h1.fs}`);
  check(g.img.ok && g.img.alt === '' && g.img.lazy === null && g.img.first && /^\d+x\d+$/.test(g.img.dims), `${label}: picture ${g.img.src} complete, natural ${g.img.nw}x${g.img.nh}, alt « ${g.img.alt} », width/height ${g.img.dims}, loading ${g.img.lazy}, first child of the hero ${g.img.first}`);
  const H = g.hero, I = g.img.box;
  if (W >= 861) check(near(I.x, H.x + 0.3 * H.w) && near(I.r, H.r) && near(I.y, H.y) && near(I.h, H.h), `${label}: hero ${f(H.w)}x${f(H.h)}; picture box x ${f(I.x)}–${f(I.r)} = ${f((I.w / H.w) * 100)} % of the hero on its right, ${f(I.h)} high`);
  else check(near(I.h, 230) && near(I.x, H.x) && near(I.w, H.w) && near(I.y, H.y) && g.h1.box.y > I.y + 100 && g.h1.box.y >= I.b - 53, `${label}: hero ${f(H.w)}x${f(H.h)}; picture block ${f(I.w)}x${f(I.h)} at the top, title starts ${f(g.h1.box.y - I.y)} px under its top (${f(I.b - g.h1.box.y)} px over its faded end)`);
  if (W === 1200) check(near(H.h, want, 2), `${label}: hero height ${f(H.h)} (expected ${want} ± 2)`);
  const cut = g.words.filter(w => w.lines !== 1 || w.r > g.h1.box.r + 0.5 || w.x < g.h1.box.x - 0.5);
  check(cut.length === 0 && g.h1.box.r <= g.ct.r + 0.5, `${label}: title « ${g.h1.text} » ${g.words.length} words, cut or out of the title box (${f(g.h1.box.w)} wide): ${cut.length}${cut.length ? ' ' + JSON.stringify(cut) : ''}; widest word ends ${f(Math.max(...g.words.map(w => w.r)))} of ${f(g.h1.box.r)}`);
  const c = await captures(p, g, W);
  if (c) {
    const res = contrast(c, [['title', g.h1], ...(g.accent ? [['accent word', g.accent]] : []), ['subtitle', g.sub]], label);
    const area = W >= 861 ? { x: H.x + 0.75 * H.w, r: H.r, y: H.y, b: H.b } : { x: I.x, r: I.r, y: I.y, b: I.y + 110 }, s = spread(c.hidden, c.clip, area);
    check(g.img.vis && s.far >= 0.1 && s.colours >= 40, `${label}: picture on screen: ${f(s.far * 100)} % of ${W >= 861 ? 'the right quarter of the hero' : 'the top 110 px of the block'} far from navy, ${s.colours} colours`);
    const inView = t => t.box.w > 0 && t.box.h > 0 && t.box.y >= 0 && t.box.b <= g.vh && t.box.x >= 0 && t.box.r <= W + 0.5;
    check(g.h1.vis && g.h1.top && inView(g.h1) && g.sub.vis && g.sub.top && inView(g.sub) && res.every(r => r.ink >= 50), `${label}: title box ${f(g.h1.box.w)}x${f(g.h1.box.h)} and subtitle box ${f(g.sub.box.w)}x${f(g.sub.box.h)} inside the screen, topmost at their first line, painted pixels ${res.map(r => r.name + ' ' + r.ink).join(', ')}`);
  }
  const o = await p.ev(`(${pagePast})(${W})`); check(o.length === 0, `${label}: elements past ${W} px: ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  if ((W === 1200 || W === 375) && !reduce) compare('below', `${route}|${W}|${nojs ? 'off' : 'on'}`, await below(p), `${label}: heights below the hero and the two home card pictures`);
  if (!nojs && !reduce) {
    const clip = { x: 0, y: 0, width: W, height: Math.min(VH, Math.ceil(H.b)) }, keep = (W === 1200 || W === 375) && !WRITE && !QUIET;
    if (!(g.inter && g.h1.ff === 'Inter')) check(false, `${label}: capture refused, title font is not Inter`);
    else if (keep) { await shotJpg(p, clip, join(HERE, `hero-${slug}-${W}.jpg`)); log(`        capture hero-${slug}-${W}.jpg ${clip.width}x${clip.height}`); }
    else if (SHOTS) await shotJpg(p, clip, join(SHOTS, `${WRITE ? 'base-' : ''}hero-${slug}-${W}.jpg`));
  }
  if (!nojs && !reduce) compare('hosts', route + '|' + W, hostsOf(p.requests), `${label}: hosts asked outside 127.0.0.1 and Google Fonts ${JSON.stringify(hostsOf(p.requests))}`);
  await p.close();
}
async function plain(b, route, W) {
  const label = `${route} ${W}`; const p = await b.page(W, { height: VH }); const ready = await load(p, route);
  const g = await p.ev(`(${pageHero})()`);
  if (g.none || !g.sub) { check(false, `${label}: ${g.none ? 'no hero' : 'no subtitle'}`); await p.close(); return; }
  check(ready && g.inter && g.h1.ff === 'Inter', `${label}: page ready ${ready}, Inter loaded ${g.inter}, title font ${g.h1.ff}`);
  check(!g.img, `${label}: no picture in this hero (class « ${g.cls} »)`);
  const c = await captures(p, g, W); if (c) contrast(c, [['subtitle', g.sub]], label);
  const H = g.hero; compare('plain', route + '|' + W, [f(H.x), f(H.y), f(H.w), f(H.h)], `${label}: hero box x ${f(H.x)} y ${f(H.y)} ${f(H.w)}x${f(H.h)}`);
  const o = await p.ev(`(${pagePast})(${W})`); check(o.length === 0, `${label}: elements past ${W} px: ${o.length}${o.length ? ' ' + JSON.stringify(o.slice(0, 5)) : ''}`);
  if (SHOTS && W !== 1200) await shotJpg(p, { x: 0, y: 0, width: W, height: Math.min(VH, Math.ceil(H.b)) }, join(SHOTS, `${WRITE ? 'base-' : ''}plain${route.replace(/\W+/g, '-')}${W}.jpg`));
  compare('hosts', route + '|' + W, hostsOf(p.requests), `${label}: hosts asked outside 127.0.0.1 and Google Fonts ${JSON.stringify(hostsOf(p.requests))}`);
  await p.close();
}

log(`RENDER p55 on ${BASE}${WRITE ? ' (BASELINE run on the scratch copy of 19fef04: comparisons are written, not checked)' : ''}`);
const b = await browser();
try {
  for (const [route, slug, want] of PHOTO) { log(`== ${route} — photo hero, scripts on, reduced motion off then on`); for (const W of WIDTHS) for (const reduce of [false, true]) await photo(b, route, slug, want, W, { reduce }); }
  log('== the six plain pages, scripts on'); for (const route of PLAIN) for (const W of [1200, 375, 320]) await plain(b, route, W);
  log('== scripts disabled, the four photo pages'); for (const [route, slug, want] of PHOTO) for (const W of [1200, 375]) await photo(b, route, slug, want, W, { nojs: true });
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await b.close(); }
if (WRITE) { writeFileSync(BASEFILE, JSON.stringify(fresh, null, 1) + '\n'); log(`baseline.json written: ${Object.keys(fresh.plain).length} plain hero boxes, ${Object.keys(fresh.below).length} « below the hero » lists, ${Object.keys(fresh.hosts).length} host lists`); }
log(`RENDER ${BASE}: failing checks ${bad}`);
if (!QUIET) writeFileSync(join(HERE, WRITE ? 'render-red-19fef04.txt' : 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
