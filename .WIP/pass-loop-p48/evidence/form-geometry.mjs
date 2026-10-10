// p48: the comparer keys elements by tag:index, so removing the empty form-level `p.error` on Contact shifts the
// keys of the form's next siblings (p.hint, button, p.form-status) and they compare against their neighbours.
// This reads their rectangles and computed-style hashes on both servers, matched by role, at 1200/375/320.
import { browser } from './cdp.mjs';
const SIDES = { before: 'http://127.0.0.1:4174', after: 'http://127.0.0.1:4173' };
const read = `(()=>{const f=document.querySelector('form[data-contact-form]');const pick={consent:f.querySelector('.field--check'),hint:f.querySelector(':scope > p.hint'),button:f.querySelector('button[type="submit"]'),status:f.querySelector(':scope > .form-status')};
 const h=s=>{let x=0;for(const c of s)x=(x*31+c.charCodeAt(0))|0;return x};
 return Object.fromEntries(Object.entries(pick).map(([k,e])=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);const props=[...cs].filter(n=>!n.startsWith('--')).sort().map(n=>n+':'+cs.getPropertyValue(n)).join(';');return [k,{top:+r.top.toFixed(2),left:+r.left.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),style:h(props)}]}))})()`;
const b = await browser(); let diffs = 0;
try {
  for (const width of [1200, 375, 320]) {
    const got = {};
    for (const [side, base] of Object.entries(SIDES)) {
      const p = await b.page(width, { reduce: true });
      await p.s('Page.navigate', { url: base + '/contact/' }); await new Promise(r => setTimeout(r, 3500));
      got[side] = await p.ev(read); await p.close();
    }
    for (const k of Object.keys(got.before)) {
      const same = JSON.stringify(got.before[k]) === JSON.stringify(got.after[k]);
      if (!same) diffs++;
      console.log(`${width} ${k.padEnd(8)} ${same ? 'same' : 'DIFF'} before ${JSON.stringify(got.before[k])} after ${JSON.stringify(got.after[k])}`);
    }
  }
} finally { await b.close(); }
console.log(`FORM GEOMETRY: ${diffs} differences (320 before overflows by design: A-001)`);
