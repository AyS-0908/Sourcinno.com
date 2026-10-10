// p50 Work 3 / Done When 4: the Mentions host phone link a[href="tel:+37064503378"] on one line.
// Copied from .WIP/pass-loop-p48/evidence/a008.mjs (durable 2f438ce), probe aimed at /mentions-legales/:
// distinct line tops of the link's text range (Range.getClientRects, width > 0), its right edge vs the width.
// usage: P48_BASE=http://127.0.0.1:4174 P48_PROFILES=<scratch> node hostphone.mjs [label]
import { browser, BASE, outside } from './cdp.mjs';
const WIDTHS = (process.env.P48_WIDTHS || '320,334').split(',').map(Number);
const label = process.argv[2] || 'run';
const probe = `(()=>{const a=document.querySelector('a[href="tel:+37064503378"]');if(!a)return null;a.scrollIntoView({block:'center',behavior:'instant'});
 const r=document.createRange();r.selectNodeContents(a);const tops=[...new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top)))];
 const b=a.getBoundingClientRect();return {iw:innerWidth,text:a.textContent,html:a.innerHTML,tops,right:+b.right.toFixed(1),shown:b.width>0}})()`;
const b = await browser(); let bad = 0; const extra = [];
try {
  for (const w of WIDTHS) {
    const p = await b.page(w); await p.go('/mentions-legales/');
    const r = await p.ev(probe);
    if (!r) { console.log(`${w} host phone link NOT FOUND`); bad++; }
    else {
      if (!r.shown || r.tops.length !== 1 || r.right > w + .6) bad++;
      console.log(`${String(w).padStart(4)} /mentions-legales/ iw=${r.iw} html=${JSON.stringify(r.html)} line tops=${r.tops.length} ${JSON.stringify(r.tops)} right ${r.right} shown=${r.shown}`);
      await p.shot(`hostphone-${label}-${w}`);
    }
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
console.log(`HOSTPHONE ${label} ${BASE}: widths ${WIDTHS.join('/')}, not-one-line-or-past-width ${bad}, outside requests ${extra.length}${extra.length ? ' ' + JSON.stringify(extra) : ''}`);
process.exitCode = bad || extra.length ? 1 : 0;
