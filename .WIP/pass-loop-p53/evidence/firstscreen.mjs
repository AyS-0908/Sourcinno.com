// p53 audit fix A-001: /publications/ loaded and NOT scrolled, scripts on, motion allowed: the first heading under the
// hero and all its ancestors are at opacity 1 on short phone screens; at 1200x900 both columns are shown.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=…] node .WIP/pass-loop-p53/evidence/firstscreen.mjs
import { browser, BASE, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const SIZES = [[375, 553], [375, 635], [360, 640], [320, 568], [1200, 900]];
const probe = `(()=>{const shown=e=>{for(let n=e;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);if(c.opacity!=='1'||c.visibility!=='visible'||c.display==='none')return false}const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const hs=[...document.querySelectorAll('.pub-cols h2')];const r=hs[0].getBoundingClientRect();
 return {scrollY,heads:hs.map(h=>h.textContent.trim()+':'+shown(h)),firstTop:Math.round(r.top),innerHeight,allShown:hs.every(shown)}})()`;
const b = await browser(); let bad = 0;
try {
  for (const [W, H] of SIZES) {
    const p = await b.page(W, { height: H }); await p.go('/publications/'); await sleep(1500);
    const g = await p.ev(probe); const ok = g.allShown && g.scrollY === 0; if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${W}x${H} scrollY ${g.scrollY} first h2 top ${g.firstTop} of ${g.innerHeight}: ${g.heads.join(' | ')}`);
    await p.close();
  }
} finally { await b.close(); }
console.log(`FIRSTSCREEN ${BASE}: failing sizes ${bad}`);
process.exitCode = bad ? 1 : 0;
