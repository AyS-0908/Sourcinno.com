// p68: captures for MANUAL-V13 — the three service pages, whole page at 1200 and 375, tiles of at most 2,500 px (P57 Gotcha),
// each raced against 30 s; Inter checked first (re-run when false). Same flow as the P67 capture.mjs.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
const NEW = process.env.P68_NEW || 'http://127.0.0.1:4176', HERE = import.meta.dirname;
const PAGES = [['performance', '/service-performance/'], ['ia', '/service-ia-business/'], ['venture', '/service-venture-building/']];
const b = await browser();
try {
  for (const [name, path] of PAGES) for (const [W, H] of [[1200, 900], [375, 812]]) {
    const p = await b.page(W, { height: H });
    await p.s('Page.navigate', { url: NEW + path });
    for (let i = 0; i < 80; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
    await sleep(800);
    const h0 = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h0; y += 400) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)');
    await sleep(1500);
    const inter = await p.ev(`document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`);
    const total = await p.ev('document.documentElement.scrollHeight');
    for (let y = 0, k = 1; y < total; y += 2500, k++) {
      const h = Math.min(2500, total - y), file = `${name}-${W}-${k}.jpg`;
      const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72, captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: 1 } }), sleep(30000).then(() => null)]);
      if (got) writeFileSync(join(HERE, file), Buffer.from(got.data, 'base64'));
      console.log(`${file} ${path} ${W}x${H} page ${total} px, tile y ${y} h ${h}, Inter ${inter} ${got ? 'saved' : 'NO ANSWER'}`);
    }
    await p.close();
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
setTimeout(() => process.exit(0), 300);
