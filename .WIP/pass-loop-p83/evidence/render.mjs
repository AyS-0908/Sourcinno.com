// Pass 83 renders and measures, headless Chrome through cdp.mjs (P61 helper, durable 78726b6), no dependency.
// Servers (127.0.0.1): 4173 real folder (gallery, no card), 4174 rehearsal worktree (fixture cards),
// 4175 worktree of c9745dc (commit 1 = before the gallery). Previews: file:// of catalog.py preview.
// usage: node render.mjs <mode> ; modes: outside | preview | renders | empty | more | gate | all
// Every page sets prefers-reduced-motion explicitly (AGENTS Gotcha: headless default = reduce).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const EV = import.meta.dirname;
const REAL = process.env.P83_AFTER || 'http://127.0.0.1:4173', REH = 'http://127.0.0.1:4176', BEFORE = 'http://127.0.0.1:4175';
const TMP = process.env.TEMP.replace(/\\/g, '/');
const PREVIEW = { lumen: `file:///${TMP}/p83-prev-lumen/preview.html`, zephyr: `file:///${TMP}/p83-prev-zephyr/preview.html` };
const out = [];
const log = (...a) => { const l = a.join(' '); out.push(l); console.log(l); };
const b = await browser();

async function open(url, width, opts = {}) {
  const p = await b.page(width, { height: opts.height || (width < 861 ? 812 : 900), reduce: opts.reduce ?? false, nojs: opts.nojs, touch: opts.touch ?? false });
  await p.s('Page.navigate', { url });
  // load + fonts + the 2.5 s reveal-wait timer (scripts on); scripts off: wait from Node (P30 Gotcha)
  await sleep(opts.nojs ? 2500 : 3200);
  if (!opts.nojs) await p.ev('document.fonts.ready.then(() => document.fonts.check("16px Inter"))').then((f) => { p.inter = f; });
  else p.inter = await p.ev('document.fonts.check("16px Inter")');
  return p;
}

// Sorted computed style (standard and custom apart), element + ::before + ::after.
const SER = `(el) => { const part = (pe) => { const cs = getComputedStyle(el, pe); const n = []; for (let i = 0; i < cs.length; i++) n.push(cs[i]); n.sort();
  const o = {}; for (const k of n) o[k] = cs.getPropertyValue(k).split(location.origin).join('ORIGIN'); return o; };
  return { el: part(null), before: part('::before'), after: part('::after') }; }`;
function diff(a, b, skip = new Set()) {
  const d = [];
  for (const part of ['el', 'before', 'after']) {
    const keys = new Set([...Object.keys(a[part]), ...Object.keys(b[part])]);
    for (const k of [...keys].sort()) if (!skip.has(k) && a[part][k] !== b[part][k]) d.push(`${part === 'el' ? '' : part + ' '}${k}: ${a[part][k]} -> ${b[part][k]}`);
  }
  return d;
}

async function outside() {
  log('## OUTSIDE: computed style before (c9745dc, :4175) vs after (working tree, :4173), sorted, custom apart');
  const targets = [['/', 'first .btn--primary', '.btn--primary'], ['/', 'first .card', '.card'],
    ['/service-venture-building/', '#experience first .card', '#experience .card'], ['/service-venture-building/', 'contact band .btn--primary', '.cta-band .btn--primary']];
  let total = 0;
  for (const w of [1200, 375]) for (const [path, name, sel] of targets) {
    const r = [];
    for (const base of [BEFORE, REAL]) {
      const p = await open(base + path, w, { reduce: true });
      r.push(await p.ev(`(${SER})(document.querySelector(${JSON.stringify(sel)}))`));
      await p.close();
    }
    const d = diff(r[0], r[1]);
    total += d.length;
    log(`${w} ${path} ${name}: ${Object.keys(r[0].el).length} props + pseudo, ${d.length} difference(s)${d.length ? ': ' + d.join(' | ') : ''}`);
  }
  log(`OUTSIDE total differences: ${total}`);
}

async function preview() {
  log('## PREVIEW: fixture card in the site (:4176) vs catalog.py preview.html, every element of the <article>, sorted');
  // Geometry follows the container width and the font: listed apart, not as differences.
  const GEO = new Set(['width', 'height', 'inline-size', 'block-size', 'perspective-origin', 'transform-origin', 'min-block-size', 'min-height']);
  const WALK = `(art) => { const ser = ${SER}; const res = []; const walk = (el, path) => { res.push([path, el.localName + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''), ser(el)]);
    [...el.children].forEach((c, i) => walk(c, path + '>' + c.localName + ':' + i)); }; walk(art, 'article'); return res; }`;
  for (const w of [1200, 375]) for (const [key, idx] of [['lumen', 0], ['zephyr', 1]]) {
    const site = await open(REH + '/service-venture-building/', w);
    const a = await site.ev(`(${WALK})(document.querySelectorAll('.catalogue-list > article')[${idx}])`);
    const pv = await open(PREVIEW[key], w);
    const bb = await pv.ev(`(${WALK})(document.querySelector('article'))`);
    const byProp = new Map(); let geo = 0;
    if (a.length !== bb.length) log(`${w} ${key}: element count differs ${a.length} vs ${bb.length}`);
    for (let i = 0; i < Math.min(a.length, bb.length); i++) {
      for (const line of diff(bb[i][2], a[i][2])) {
        const prop = line.split(':')[0];
        if (GEO.has(prop.replace(/^(before|after) /, ''))) { geo++; continue; }
        if (!byProp.has(prop)) byProp.set(prop, []);
        byProp.get(prop).push(`${a[i][1]} ${line.slice(prop.length + 2)}`);
      }
    }
    log(`${w} ${key}: ${a.length} elements, site Inter=${site.inter}, preview Inter=${pv.inter}; ${byProp.size} differing propert(ies) (preview -> site), geometry lines set apart: ${geo}`);
    for (const [prop, l] of byProp) log(`  ${prop} ×${l.length}: ${[...new Set(l)].slice(0, 4).join(' | ')}`);
    await site.close(); await pv.close();
  }
}

async function capture(p, sel, file, pad = 0) {
  const r = await p.ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'start' }); const b = e.getBoundingClientRect(); return { x: 0, y: b.top + scrollY - ${pad}, w: innerWidth, h: b.height + ${pad * 2} }; })()`);
  await sleep(1200);
  // back to the top before the shot: the sticky header then sits at the top of the document, not over the clip
  await p.ev(`window.scrollTo(0, 0)`); await sleep(400);
  const tiles = [];
  for (let y = 0; y < r.h; y += 2500) {
    const h = Math.min(2500, r.h - y);
    const shot = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: r.y + y, width: r.w, height: h, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!shot) { log(`capture ${file}: tile at ${y} timed out`); break; }
    const name = r.h > 2500 ? file.replace('.png', `-${tiles.length + 1}.png`) : file;
    writeFileSync(join(EV, name), Buffer.from(shot.data, 'base64')); tiles.push(name);
  }
  log(`capture ${tiles.join(', ')} (${r.w}×${Math.round(r.h)} px, document y ${Math.round(r.y)})`);
}

const STATE = `(() => { const list = document.querySelector('.catalogue-list'); const vis = (e) => e.getClientRects().length > 0 && e.getBoundingClientRect().height > 0;
  const cards = [...list.querySelectorAll(':scope > .card')]; const empty = list.querySelector('.catalogue-empty');
  return { cards: cards.length, visible: cards.filter(vis).length, empty: empty ? (vis(empty) ? 'visible ' + Math.round(empty.getBoundingClientRect().height) + 'px' : 'no box') : 'absent',
    hrefs: [...list.querySelectorAll('a[data-idea]')].map((a) => a.getAttribute('href').slice(0, 60)), more: document.querySelector('.catalogue-more button')?.textContent || 'none',
    overflow: [...document.querySelectorAll('body *')].filter((e) => e.getClientRects().length && e.getBoundingClientRect().right > innerWidth + 0.5 && !e.closest('svg[width="0"]')).map((e) => e.localName + '.' + e.className).slice(0, 5) }; })()`;

async function renders() {
  log('## RENDERS: rehearsal (:4176), two fixture cards');
  for (const w of [1200, 375]) {
    const p = await open(REH + '/service-venture-building/', w, { reduce: false });
    const s = await p.ev(STATE);
    log(`${w} JS on, reduced-motion no-preference, Inter=${p.inter}: cards ${s.cards}, visible ${s.visible}, empty sentence ${s.empty}, more ${s.more}, overflow ${JSON.stringify(s.overflow)}, errors ${JSON.stringify(p.errors)}`);
    log(`  hrefs: ${s.hrefs.join(' | ')}`);
    await capture(p, '#catalogue', `catalogue-${w}.png`);
    await p.close();
  }
  for (const w of [375, 1200]) {
    const p = await open(REH + '/service-venture-building/', w, { nojs: true });
    const s = await p.ev(STATE);
    log(`${w} JS OFF: cards ${s.cards}, visible ${s.visible}, empty sentence ${s.empty}, more ${s.more}, hrefs ${JSON.stringify(s.hrefs)}, overflow ${JSON.stringify(s.overflow)}`);
    if (w === 375) await capture(p, '#catalogue', 'catalogue-375-nojs.png');
    await p.close();
  }
  for (const w of [320]) {
    const p = await open(REH + '/service-venture-building/', w);
    const s = await p.ev(STATE);
    log(`${w} JS on: overflow ${JSON.stringify(s.overflow)}`);
    await p.close();
  }
  // Keyboard: real Tab events from the top until both kinds of buttons are reached.
  const p = await open(REH + '/service-venture-building/', 1200, { reduce: true });
  const seen = [];
  for (let i = 1; i <= 120 && seen.length < 2; i++) {
    await p.key('Tab');
    const a = await p.ev(`(() => { const e = document.activeElement; return e && e.matches('a[data-idea]') ? [e.className, e.textContent.trim(), e.getAttribute('href').slice(0, 45), matchMedia('(prefers-reduced-motion: reduce)').matches, getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth] : null; })()`);
    if (a && !seen.find((x) => x[1] === a[0])) seen.push([i, a[0], a[1], a[2], a[3], a[4]]);
  }
  for (const s of seen) log(`keyboard: Tab #${s[0]} reaches a.${s[1].replace(/ /g, '.')} « ${s[2]} », href ${s[3]}…, reduced-motion reduce=${s[4]}, outline ${s[5]}`);
  if (seen.length < 2) log(`keyboard: only ${seen.length} kind(s) of button reached in 120 Tab`);
  await p.close();
}

async function empty() {
  log('## EMPTY STATE: four combinations on screen');
  for (const [base, label] of [[REAL, 'no card'], [REH, 'cards']]) for (const nojs of [false, true]) {
    const p = await open(base + '/service-venture-building/', 375, { nojs });
    await p.ev(`document.querySelector('#catalogue').scrollIntoView()`); await sleep(300);
    const s = await p.ev(STATE);
    const inView = await p.ev(`(() => { const e = document.querySelector('.catalogue-empty'); if (!e || !e.getClientRects().length) return 'no box'; const r = e.getBoundingClientRect(); return (r.top >= 0 && r.bottom <= innerHeight ? 'in viewport' : 'outside viewport') + ' ' + Math.round(r.top) + '..' + Math.round(r.bottom) + ', opacity chain ' + (() => { let o = 1; for (let x = e; x; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; })(); })()`);
    log(`${label}, JS ${nojs ? 'off' : 'on'}: empty sentence ${s.empty} (${inView}), cards ${s.cards}`);
    if (label === 'no card') await capture(p, '#catalogue', `catalogue-empty-375${nojs ? '-nojs' : ''}.png`);
    await p.close();
  }
}

async function more() {
  log('## AFFICHER PLUS: static copy of the page holding 7 <article>s (:4176/tools/p83-sept/)');
  for (const nojs of [false, true]) {
    const p = await open(REH + '/tools/p83-sept/', 1200, { nojs, reduce: true });
    const s = await p.ev(STATE);
    log(`JS ${nojs ? 'off' : 'on'}: cards ${s.cards}, visible ${s.visible}, button ${s.more}`);
    if (!nojs) {
      // keyboard: focus the button by Tab, press Enter
      let found = false;
      for (let i = 0; i < 200 && !found; i++) { await p.key('Tab'); found = await p.ev(`document.activeElement?.matches('.catalogue-more button') || false`); }
      log(`  Tab reaches « Afficher plus »: ${found}`);
      await p.key('Enter'); await sleep(300);
      const t = await p.ev(`(() => { const a = document.activeElement; const cards = [...document.querySelectorAll('.catalogue-list > .card')]; return { focus: a.localName + '.' + a.className + ' tabindex=' + a.getAttribute('tabindex') + ' in card #' + (cards.indexOf(a.closest('.card')) + 1), text: a.textContent.trim(), visible: cards.filter((c) => c.getClientRects().length).length, button: document.querySelector('.catalogue-more') ? 'still there' : 'removed', inView: (() => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })() }; })()`);
      log(`  after Enter: ${JSON.stringify(t)}`);
    }
    await p.close();
  }
}

async function gate() {
  log('## GATE: real folder (:4173), restored page');
  for (const w of [1200, 375]) {
    const p = await open(REAL + '/service-venture-building/', w);
    const g = await p.ev(`(() => ({ menu: [...document.querySelectorAll('.site-header a[href="/service-venture-building/"]')].map((a) => a.textContent.trim()), footer: [...document.querySelectorAll('.site-footer a[href="/service-venture-building/"]')].map((a) => a.textContent.trim()), h1: document.querySelector('h1')?.textContent.trim(), sections: [...document.querySelectorAll('main > section')].map((s) => (s.id || s.getAttribute('aria-label')) + (s.classList.contains('section--alt') ? '(alt)' : '')).join(' '), errors: 0 }))()`);
    log(`${w}: h1 « ${g.h1} », menu ${JSON.stringify(g.menu)}, footer ${JSON.stringify(g.footer)}, sections ${g.sections}, script errors ${JSON.stringify(p.errors)}, Inter=${p.inter}`);
    const shot = await p.s('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(EV, `page-top-${w}.png`), Buffer.from(shot.data, 'base64'));
    await capture(p, '.site-footer', `page-footer-${w}.png`);
    log(`capture page-top-${w}.png (first screen)`);
    await p.close();
  }
  for (const [w, h] of [[375, 553], [375, 635], [360, 640], [320, 568]]) {
    const p = await open(REAL + '/service-venture-building/', w, { height: h });
    const r = await p.ev(`(() => { const chain = (e) => { let o = 1; for (let x = e; x; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; }; const h1 = document.querySelector('h1'); const r = h1.getBoundingClientRect(); return { scrollY, h1: Math.round(r.top) + '..' + Math.round(r.bottom), inView: r.top >= 0 && r.bottom <= innerHeight, opacity: chain(h1) }; })()`);
    log(`first screen ${w}×${h}, no scroll: h1 ${r.h1} in viewport ${r.inView}, opacity chain ${r.opacity}, scrollY ${r.scrollY}`);
    await p.close();
  }
}

const mode = process.argv[2] || 'all';
const modes = { outside, preview, renders, empty, more, gate };
for (const m of mode === 'all' ? Object.keys(modes) : [mode]) await modes[m]();
writeFileSync(join(EV, `render-${mode}.txt`), out.join('\n') + '\n');
await b.close();
process.exit(0);
