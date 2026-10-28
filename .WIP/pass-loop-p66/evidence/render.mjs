// p66 Done When 4 (PLAN § 66): narrowed from the Pass 65 render (git show d7a0b2b:.WIP/pass-loop-p65/evidence/render.mjs: load, settled,
// pgSections, measure); cdp.mjs = byte copy of the P65 helper (resolver: 127.0.0.1 and Google Fonts only, prefers-reduced-motion set on every page).
// OLD = the 275d20f scratch copy (git -c core.autocrlf=false archive), NEW = the tree, same browser, same run.
//  A. section heights, 1200/375, scripts on/off, every shell route (old route → new route): header + every `main > *` equal to 275d20f
//     (strict on every route except the three whose text changed: contact, mentions, confidentialité — reported, not judged); footer reported.
//  B. the two old addresses land on /service-performance/, the stub's refresh target is it (one hop).
//  C. desktop menu one row at 861 and 961 px on /service-performance/.
//  D. a valid Contact submission records a mailto:contact@sourcinno.com draft; the option list.
// usage (product root): P48_PROFILES=<scratch> P66_OLD=http://127.0.0.1:4177 P66_NEW=http://127.0.0.1:4176 node .WIP/pass-loop-p66/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, OLD = process.env.P66_OLD || 'http://127.0.0.1:4177', NEW = process.env.P66_NEW || 'http://127.0.0.1:4176';
const ROUTES = [['/', '/'], ['/service-strategie-transformation/', '/service-performance/'], ['/service-ia-business/', '/service-ia-business/'],
  ['/service-venture-building/', '/service-venture-building/'], ['/publications/', '/publications/'], ['/contact/', '/contact/'],
  ['/mentions-legales/', '/mentions-legales/'], ['/politique-confidentialite/', '/politique-confidentialite/'], ['/404.html', '/404.html']];
const TEXT_CHANGED = new Set(['/contact/', '/mentions-legales/', '/politique-confidentialite/']);
const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
const info = text => log(`   info ${text}`);
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s: case abandoned')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }

function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return [document.querySelector('.site-header'), ...document.querySelectorAll('main > *'), document.querySelector('.site-footer')].filter(Boolean).map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)); }
const FONT = `document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`;

async function load(p, url, scroll = true) {
  await p.s('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(p.nojs ? `document.readyState==='complete'` : `document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(p.nojs ? 1500 : 700);
  if (scroll) { const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); await sleep(900); }
  return ready;
}
async function settled(p, expr) { let a = JSON.stringify(await p.ev(expr)); for (let i = 0; i < 12; i++) { await sleep(300); const b = JSON.stringify(await p.ev(expr)); if (a === b) break; a = b; } return JSON.parse(a); }
async function measure(b, base, route, W, nojs) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const p = await b.page(W, { height: 1100, nojs }); const ready = await load(p, base + route);
    const inter = await p.ev(FONT).catch(() => false), url = await p.ev('location.pathname');
    const sections = await settled(p, `(${pgSections})()`), errors = [...p.errors];
    await p.close();
    if (inter || attempt === 2) return { ready, inter, url, sections, errors, attempt };
  }
}

async function routeCase(b, [oldR, newR], W, nojs) {
  const label = `${newR}${oldR !== newR ? ` (275d20f ${oldR})` : ''} ${W}${nojs ? ' scripts off' : ''}`;
  const o = await measure(b, OLD, oldR, W, nojs), n = await measure(b, NEW, newR, W, nojs);
  check(o.ready && n.ready && o.inter && n.inter && n.url === newR, `${label}: ready old/new ${o.ready}/${n.ready}, Inter old/new ${o.inter}/${n.inter} (attempts ${o.attempt}/${n.attempt}); final path new ${n.url}`);
  const body = a => a.slice(0, -1), foot = a => a[a.length - 1];
  const ob = body(o.sections), nb = body(n.sections);
  let k = 0; while (k < ob.length && ob[k] === nb[k]) k++;
  const same = ob.length > 1 && JSON.stringify(ob) === JSON.stringify(nb);
  const text = `${label}: ${nb.length} heights (header + each main block) ${same ? '= 275d20f' : `differ; first #${k}: 275d20f « ${ob[k]} » now « ${nb[k]} »`}`;
  if (TEXT_CHANGED.has(newR)) info(text + ' (text changed this Pass: reported, not judged)');
  else check(same, text);
  info(`${label}: footer 275d20f « ${foot(o.sections)} » now « ${foot(n.sections)} »`);
  check(n.errors.length === 0, `${label}: script errors ${n.errors.length}${n.errors.length ? ' ' + JSON.stringify(n.errors.slice(0, 3)) : ''} (275d20f: ${o.errors.length})`);
}

async function redirects(b) {
  for (const from of ['/service-strategie-transformation/', '/offre-strategie-organisation-processus/']) {
    const html = await (await fetch(NEW + from)).text();
    const target = html.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1], cont = html.match(/class="btn btn--primary" href="([^"]+)"/)?.[1], canon = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    check(target === '/service-performance/' && cont === '/service-performance/' && canon === 'https://www.sourcinno.com/service-performance/', `${from}: refresh → ${target}, « Continuer » → ${cont}, canonical ${canon}`);
    const p = await b.page(1200); await p.s('Page.navigate', { url: NEW + from });
    let path = ''; for (let i = 0; i < 60 && path !== '/service-performance/'; i++) { await sleep(100); path = await p.ev('location.pathname').catch(() => ''); }
    await sleep(500);
    const docs = p.requests.filter(u => !/\.(css|js|png|jpe?g|webp|svg|woff2?|ico)(\?|$)/.test(u) && !/fonts\.(googleapis|gstatic)/.test(u)).map(u => u.replace(NEW, ''));
    check(path === '/service-performance/' && docs.length === 2 && docs[0] === from && docs[1] === '/service-performance/', `${from}: lands on ${path}; documents requested ${JSON.stringify(docs)}`);
    await p.close();
  }
}

function pgMenu() {
  const f = n => Math.round(n * 10) / 10, logo = document.querySelector('.site-logo').getBoundingClientRect();
  const items = [...document.querySelectorAll('.site-nav__list > li')].map(li => { const e = li.firstElementChild.tagName === 'DETAILS' ? li.querySelector('summary') : li.firstElementChild; const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), l: f(r.left), c: f(r.top + r.height / 2), w: f(r.width) }; });
  return { logoRight: f(logo.right), items, burger: getComputedStyle(document.querySelector('.nav-toggle') || document.body).display };
}
async function menu(b) {
  for (const W of [861, 961]) {
    const p = await b.page(W, { height: 900 }); await load(p, NEW + '/service-performance/', false);
    const m = await settled(p, `(${pgMenu})()`); await p.close();
    const c0 = m.items[0].c, oneRow = m.items.every(i => Math.abs(i.c - c0) <= 1), rising = m.items.every((i, k) => !k || i.l > m.items[k - 1].l), gap = f1(m.items[0].l - m.logoRight);
    check(m.items.length === 5 && oneRow && rising && gap > 0, `menu ${W}: ${m.items.length} items, centres ${m.items.map(i => i.c).join('/')}, lefts ${m.items.map(i => i.l).join('/')}, gap logo → « ${m.items[0].t} » ${gap} px, toggle display ${m.burger}`);
  }
}
const f1 = n => Math.round(n * 10) / 10;

async function form(b) {
  const p = await b.page(1200); await load(p, NEW + '/contact/', false);
  const opts = await p.ev(`[...document.querySelectorAll('#b-besoin option')].map(o => o.value + '=' + o.textContent)`);
  check(JSON.stringify(opts) === JSON.stringify(['=Choisir…', 'Performance=Performance', 'Entreprise IA=Entreprise IA', 'Venture Building=Venture Building', 'Autre=Autre']), `contact options ${JSON.stringify(opts)}`);
  const r = await p.ev(`(async () => {
    const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    set('b-nom', 'Test P66'); set('b-email', 'test.p66@example.org'); set('b-besoin', 'Performance'); set('b-message', 'Bonjour, essai du brouillon Pass 66 avec accents : é è à ç.');
    const rg = document.getElementById('b-rgpd'); rg.checked = true; rg.dispatchEvent(new Event('change', { bubbles: true }));
    const f = document.getElementById('form-basique'); f.querySelector('[type=submit]').click();
    await new Promise(r => setTimeout(r, 400));
    return { hidden: f.hidden, mailto: f.dataset.lastMailto || '' };
  })()`);
  const u = r.mailto ? new URL(r.mailto) : null;
  check(!r.hidden && u && u.protocol === 'mailto:' && u.pathname === 'contact@sourcinno.com' && /Performance/.test(decodeURIComponent(u.search)), `contact submission: form shown ${!r.hidden}; data-last-mailto recipient « ${u?.pathname} », body names « Performance » ${u ? /Performance/.test(decodeURIComponent(u.search)) : false}; head « ${r.mailto.slice(0, 60)}… »`);
  const texts = await p.ev(`[document.querySelector('.ticks--contact').innerText, document.querySelector('[data-form-fallback]').textContent.replace(/\\s+/g, ' ').trim()]`);
  info(`contact Coordonnées: ${JSON.stringify(texts[0])}`); info(`contact no-JS sentence: ${JSON.stringify(texts[1])}`);
  await p.close();
  for (const [route, sel] of [['/mentions-legales/', 'main'], ['/politique-confidentialite/', 'main']]) {
    const q = await b.page(1200); await load(q, NEW + route, false);
    const lines = await q.ev(`[...document.querySelectorAll('${sel} li, ${sel} p')].map(e => e.textContent.replace(/\\s+/g, ' ').trim()).filter(t => /Contact —|contact@|destinataire|propriétaire|Directeur|Capital|Téléphone|\\+370/.test(t))`);
    for (const l of lines) info(`${route}: ${JSON.stringify(l)}`);
    await q.close();
  }
}

log(`RENDER p66: old ${OLD} (275d20f copy) against new ${NEW}; ${ROUTES.length} routes x 1200/375 x scripts on/off, redirects, menu 861/961, contact draft`);
const b = await browser();
try {
  for (const nojs of [false, true]) { log(`== section heights, scripts ${nojs ? 'off' : 'on'}`); for (const r of ROUTES) for (const W of [1200, 375]) await guard(`${r[1]} ${W}`, () => routeCase(b, r, W, nojs)); }
  log('== redirects'); await guard('redirects', () => redirects(b));
  log('== desktop menu'); await guard('menu', () => menu(b));
  log('== contact draft and legal wording'); await guard('form', () => form(b));
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
log(`RENDER: ${total} checks, failing ${bad}`);
writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
