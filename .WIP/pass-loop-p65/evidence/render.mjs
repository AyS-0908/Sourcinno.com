// p65 Done When 3: the ten shell routes keep every section height against 4f3875c and throw no script error, scripts on and off,
// 1200 and 375 px; the home Stratégie service card keeps the background it had at 4f3875c; one capture of the service cards at 1200.
// Narrowed from the Pass 63 render (git show 4f3875c:.WIP/pass-loop-p63/evidence/render.mjs: load, settled, pgSections, otherPage);
// cdp.mjs = byte copy of the P63 helper (resolver: 127.0.0.1 and Google Fonts only).
// Both trees are measured in the same run, same browser: OLD = the 4f3875c scratch copy (git -c core.autocrlf=false archive), NEW = the tree.
// usage (product root): P48_PROFILES=<scratch> P65_OLD=http://127.0.0.1:4174 P65_NEW=http://127.0.0.1:4173 node .WIP/pass-loop-p65/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const HERE = import.meta.dirname, OLD = process.env.P65_OLD || 'http://127.0.0.1:4174', NEW = process.env.P65_NEW || 'http://127.0.0.1:4173';
// red run only: P65_ROUTES=<route,...> narrows the routes, P65_OUT names the output file, no capture (PARTIAL, said top and bottom)
const PARTIAL = !!process.env.P65_ROUTES, OUTFILE = process.env.P65_OUT || 'render.txt';
const ROUTES = PARTIAL ? process.env.P65_ROUTES.split(',') : ['/','/service-strategie-transformation/', '/service-ia-business/', '/service-venture-building/', '/portfolio/', '/publications/', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/404.html'];
const out = []; let bad = 0, total = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { total++; if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); return ok; };
async function guard(label, fn) { let tm; try { await Promise.race([fn(), new Promise((_, j) => { tm = setTimeout(() => j(Error('no answer in 240 s: case abandoned')), 240000); })]); } catch (e) { check(false, `${label}: ERROR ${e.message}`); } finally { clearTimeout(tm); } }

function pgSections() { const f = n => Math.round(n * 10) / 10, name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(/\s+/)[0] : ''); return [document.querySelector('.site-header'), ...document.querySelectorAll('main > *'), document.querySelector('.site-footer')].filter(Boolean).map(e => name(e) + ' ' + f(e.getBoundingClientRect().height)); }
const FONT = `document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`;
function pgCards() { return [...document.querySelectorAll('#services .card--service')].map(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return `${e.className} | ${cs.backgroundImage.split(location.origin).join('')} | ${Math.round(r.width)}x${Math.round(r.height)}`; }); }

async function load(p, url) {
  await p.s('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { await sleep(100); ready = await p.ev(p.nojs ? `document.readyState==='complete'` : `document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false); }
  await sleep(p.nojs ? 1500 : 700);
  const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 500) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); await sleep(900);
  return ready;
}
async function settled(p, expr) { let a = JSON.stringify(await p.ev(expr)); for (let i = 0; i < 12; i++) { await sleep(300); const b = JSON.stringify(await p.ev(expr)); if (a === b) break; a = b; } return JSON.parse(a); }
// one measure of one route on one tree; a page whose Inter did not load is measured again once (AGENTS Gotcha: fallback font changes heights)
async function measure(b, base, route, W, nojs) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const p = await b.page(W, { height: 1100, nojs }); const ready = await load(p, base + route);
    const inter = await p.ev(FONT).catch(() => false), url = await p.ev('location.pathname');
    const sections = await settled(p, `(${pgSections})()`), cards = route === '/' ? await p.ev(`(${pgCards})()`) : null, errors = [...p.errors];
    await p.close();
    if (inter || attempt === 2) return { ready, inter, url, sections, cards, errors, attempt };
  }
}

async function routeCase(b, route, W, nojs) {
  const label = `${route} ${W}${nojs ? ' scripts off' : ''}`;
  const o = await measure(b, OLD, route, W, nojs), n = await measure(b, NEW, route, W, nojs);
  check(o.ready && n.ready && o.inter && n.inter, `${label}: ready old/new ${o.ready}/${n.ready}, Inter loaded old/new ${o.inter}/${n.inter} (attempts ${o.attempt}/${n.attempt}); final path old ${o.url}, new ${n.url}`);
  let k = 0; while (k < o.sections.length && o.sections[k] === n.sections[k]) k++;
  check(o.sections.length > 1 && JSON.stringify(o.sections) === JSON.stringify(n.sections), `${label}: ${n.sections.length} heights (header, each main block, footer) = 4f3875c${k < Math.max(o.sections.length, n.sections.length) ? `; first difference #${k}: 4f3875c « ${o.sections[k]} » now « ${n.sections[k]} »` : ''}`);
  check(n.errors.length === 0, `${label}: script errors ${n.errors.length}${n.errors.length ? ' ' + JSON.stringify(n.errors.slice(0, 3)) : ''} (4f3875c: ${o.errors.length})`);
  if (o.cards) check(JSON.stringify(o.cards) === JSON.stringify(n.cards) && n.cards.length === 2, `${label}: home service cards, computed background-image and size = 4f3875c:\n        ${n.cards.join('\n        ')}`);
}

// the kept capture: home #services at 1200 (wholly inside the viewport, refused when the heading font is not Inter)
async function capture(b) {
  const file = 'services-cards-1200.jpg', p = await b.page(1200, { height: 1400 }); await load(p, NEW + '/');
  const inter = await p.ev(FONT);
  if (!check(inter, `capture ${file}: Inter loaded ${inter}`)) { await p.close(); return; }
  await p.ev(`(()=>{const X=document.getElementById('services');scrollTo(0,X.getBoundingClientRect().top+scrollY-100);return 1})()`); await sleep(800);
  const g = await p.ev(`(()=>{const r=document.getElementById('services').getBoundingClientRect();return {x:0,y:Math.floor(r.top),width:document.documentElement.clientWidth,height:Math.ceil(r.height),vh:innerHeight}})()`);
  if (check(g.y >= 0 && g.y + g.height <= g.vh, `capture ${file}: #services ${g.width}x${g.height} wholly inside the ${g.vh} px viewport`)) {
    const [sx, sy] = await p.ev('[scrollX, scrollY]');
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip: { x: g.x + sx, y: g.y + sy, width: g.width, height: g.height, scale: 1 } }), sleep(20000).then(() => null)]);
    if (!got) throw Error('capture: no answer in 20 s'); writeFileSync(join(HERE, file), Buffer.from(got.data, 'base64')); log(`        capture ${file} ${g.width}x${g.height}`);
  }
  await p.close();
}

log(`RENDER p65: old ${OLD} (4f3875c copy) against new ${NEW}; ${ROUTES.length} routes x 1200/375 x scripts on/off${PARTIAL ? ' — PARTIAL RUN' : ''}`);
const b = await browser();
try {
  for (const nojs of [false, true]) { log(`== scripts ${nojs ? 'off' : 'on'}`); for (const route of ROUTES) for (const W of [1200, 375]) await guard(`${route} ${W}`, () => routeCase(b, route, W, nojs)); }
  if (!PARTIAL) { log('== kept capture'); await guard('capture', () => capture(b)); }
} catch (e) { bad++; log('ERROR ' + (e.stack || e)); } finally { await Promise.race([b.close(), sleep(8000)]); }
log(`RENDER: ${total} checks, failing ${bad}${PARTIAL ? ` — PARTIAL RUN (routes ${ROUTES.join(', ')}, no capture): not the full render` : ''}`);
writeFileSync(join(HERE, OUTFILE), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
setTimeout(() => process.exit(bad ? 1 : 0), 500);
