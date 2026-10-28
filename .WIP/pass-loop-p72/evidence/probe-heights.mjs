// Mockup option A: height of each Méthodologie panel and of the tree, per width (decides the height reserve).
import { browser, sleep } from './cdp.mjs';
const b = await browser();
try {
  for (const W of [1200, 961, 768, 375, 320]) {
    const p = await b.page(W, { reduce: true });
    await p.s('Page.navigate', { url: 'http://127.0.0.1:4182/maquette-v13/#e=a&m=a' }); await sleep(1500);
    await p.ev('document.fonts.ready');
    const h = await p.ev(`(() => { const M = '.v13-opt[data-block=m][data-opt=a]'; const tabs = [...document.querySelectorAll(M + ' [role=tab]')]; return tabs.map(t => { t.click(); return Math.round(document.getElementById(t.getAttribute('aria-controls')).getBoundingClientRect().height); }); })()`);
    console.log(W, 'panels', h.join(' / '));
    await p.close();
  }
} finally { await b.close(); }
