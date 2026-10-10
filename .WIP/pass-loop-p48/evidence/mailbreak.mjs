// p48 A-008: how each displayed email address breaks across lines (text of each line box, by character Range
// rectangles), on the 10 shell pages at 320/334/375/768/1200, plus innerWidth and elements past the edge.
// P48_TRIAL = optional CSS appended before measuring (trial only, never evidence). usage: node mailbreak.mjs
import { browser, BASE, outside } from './cdp.mjs';
const PAGES = ['/', '/404.html', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/portfolio/', '/publications/',
  '/service-ia-business/', '/service-strategie-transformation/', '/service-venture-building/'];
const TRIAL = process.env.P48_TRIAL || '';
const WIDTHS = (process.env.P48_WIDTHS || '320,334,375,768,1200').split(',').map(Number);
const probe = w => `(()=>{const out=[];for(const a of document.querySelectorAll('a[href^="mailto:"]')){const t=a.textContent;if(!t.includes('@')||a.getBoundingClientRect().width===0)continue;const n=a.firstChild;if(!n||n.nodeType!==3)continue;const lines=[];let cur='',top=null;for(let i=0;i<n.length;i++){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const b=r.getBoundingClientRect();if(top!==null&&Math.abs(b.top-top)>2){lines.push(cur);cur='';}top=b.top;cur+=n.data[i];}lines.push(cur);const rr=a.getBoundingClientRect();out.push({where:a.closest('footer')?'footer':a.closest('main')?'main':'other',lines,right:+rr.right.toFixed(1)})}
 const past=[...document.body.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&!e.closest('.visually-hidden,.skip-link')&&(r.right>${w}+.6||r.left<-.6)}).length;return {iw:innerWidth,past,out,h:document.documentElement.scrollHeight}})()`;
const b = await browser(); let bad = 0; const extra = [];
try {
  for (const w of WIDTHS) for (const route of PAGES) {
    const p = await b.page(w);
    await p.go(route);
    if (TRIAL) { await p.ev(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(TRIAL)};document.head.append(s)})()`); await new Promise(r => setTimeout(r, 300)); }
    const r = await p.ev(probe(w));
    const split = r.out.filter(m => m.lines.length > 1);
    const wrong = split.filter(m => !(m.lines.length === 2 && m.lines[0].endsWith('@')));
    if (r.iw !== w || r.past || wrong.length) bad++;
    console.log(`${String(w).padStart(4)} ${route.padEnd(34)} iw=${r.iw} past=${r.past} h=${r.h} ${r.out.map(m => `${m.where}:${m.lines.join(' / ')}`).join(' | ')}`);
    extra.push(...outside(p.requests));
    await p.close();
  }
} finally { await b.close(); }
console.log(`MAILBREAK ${BASE}${TRIAL ? ' (trial)' : ''}: runs ${WIDTHS.length * PAGES.length}, bad ${bad} (bad = width/overflow wrong, or an address split anywhere but right after « @ »), outside ${extra.length}`);
process.exitCode = bad || extra.length ? 1 : 0;
