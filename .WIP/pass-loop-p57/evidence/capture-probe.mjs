// p57 probe: the first render run hung inside Page.captureScreenshot on the page with « in a nutschell » open
// (about 10,000 px high at 1200). Which capture height answers, and how fast? Each call is raced against 25 s.
// usage (product root): P48_PROFILES=<scratch dir> node .WIP/pass-loop-p57/evidence/capture-probe.mjs
import { browser, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const b = await browser();
const race = (pr, ms) => Promise.race([pr.then(v => ['ok', v]), sleep(ms).then(() => ['timeout'])]);
try {
  const p = await b.page(1200, { height: 900 }); await p.go('/publications/');
  await p.ev(`(()=>{document.querySelector('.filters .chip:nth-child(2)').click();const d=document.querySelector('#blog-list > :nth-child(7)');d.open=true;for(const i of d.querySelectorAll('img'))i.loading='eager';return 1})()`);
  await sleep(3000);
  const H = await p.ev('document.documentElement.scrollHeight');
  console.log('page height', H, 'pictures loaded', await p.ev(`[...document.querySelectorAll('#blog-list > :nth-child(7) img')].filter(i=>i.naturalWidth>0).length`));
  for (const [y, h] of [[0, 900], [0, 3000], [3000, 3000], [0, 6000], [0, H]]) {
    const t = Date.now();
    const [r, v] = await race(p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: 1200, height: h, scale: 1 } }), 25000);
    console.log(`clip y ${y} h ${h}: ${r} in ${Date.now() - t} ms${v ? ', ' + Math.round(v.data.length * 0.75 / 1024) + ' KB' : ''}`);
    if (r === 'timeout') break;
  }
} finally { await Promise.race([b.close(), sleep(3000)]); process.exit(0); }
