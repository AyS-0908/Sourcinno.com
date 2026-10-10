// p48 A-008 (owner Option 2): on the 10 shell pages, which links the scoped rule reaches (selector matches and
// computed overflow-wrap: anywhere on mailto links), and on Contact (JS on and off) the main phone links: one line box
// each, inside the width. Mentions' phone is not in the Pass (its file is not edited).
// usage: P48_BASE=... node a008.mjs
import { browser, BASE, outside } from './cdp.mjs';
const PAGES = ['/', '/404.html', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/portfolio/', '/publications/',
  '/service-ia-business/', '/service-strategie-transformation/', '/service-venture-building/'];
const WIDTHS = (process.env.P48_WIDTHS || '320,334,375,1200').split(',').map(Number);
const probe = `(()=>{const sel=[...document.querySelectorAll('.ticks a[href^="mailto:"]')].map(a=>(a.closest('main')?'main':'other')+':'+a.closest('li').textContent.trim().slice(0,12));
 const any=[...document.querySelectorAll('a[href^="mailto:"]')].filter(a=>getComputedStyle(a).overflowWrap==='anywhere').map(a=>a.getAttribute('href').slice(0,12));
 const tel=[...document.querySelectorAll('#contact-main a[href^="tel:"], main a[href^="tel:"]')].filter(()=>location.pathname==='/contact/').map(a=>{const r=document.createRange();r.selectNodeContents(a);const tops=new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top)));const b=a.getBoundingClientRect();return {text:a.textContent,lines:tops.size,right:+b.right.toFixed(1),shown:b.width>0}});
 return {iw:innerWidth,sel,any,tel}})()`;
const b = await browser(); let total = 0, bad = 0; const extra = [];
try {
  const runs = [];
  for (const w of WIDTHS) { for (const route of PAGES) runs.push({ w, route }); runs.push({ w, route: '/contact/', nojs: true }); }
  for (const { w, route, nojs } of runs) {
    const p = await b.page(w, { nojs }); await p.go(route);
    const r = await p.ev(probe);
    if (w === WIDTHS[0] && !nojs) total += r.sel.length;
    const telBad = r.tel.filter(t => t.shown && (t.lines !== 1 || t.right > w + .6));
    if (r.sel.length !== r.any.length || telBad.length) bad++;
    if (r.sel.length || r.any.length || r.tel.length) console.log(`${String(w).padStart(4)} ${(route + (nojs ? ' no-JS' : '')).padEnd(30)} iw=${r.iw} rule=${JSON.stringify(r.sel)} anywhere=${JSON.stringify(r.any)} tel=${r.tel.map(t => `${t.shown ? t.lines + ' line' : 'hidden'} right ${t.right}`).join(', ')}`);
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
console.log(`A008 ${BASE}: ${PAGES.length} pages, .ticks mailto links at ${WIDTHS[0]} = ${total}, bad ${bad} (bad = computed anywhere on a link the rule does not name, or a shown main phone link on > 1 line / past the width), outside ${extra.length}`);
process.exitCode = bad || extra.length ? 1 : 0;
