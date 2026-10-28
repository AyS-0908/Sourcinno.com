// p67: home captures for MANUAL-V13 — whole page at 1200 and 375 in tiles of at most 2,500 px (P57 Gotcha: a taller
// captureBeyondViewport never answers), each raced against 30 s; plus the 375x553 first screen (viewport only). Inter checked first.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
const NEW = process.env.P67_NEW || 'http://127.0.0.1:4176', HERE = import.meta.dirname;
const b = await browser();
try {
  for (const [W, H, whole] of [[1200, 900, true], [375, 812, true], [375, 553, false]]) {
    const p = await b.page(W, { height: H });
    await p.s('Page.navigate', { url: NEW + '/' });
    for (let i = 0; i < 80; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
    await sleep(800);
    if (whole) { const h = await p.ev('document.documentElement.scrollHeight'); for (let y = 0; y <= h; y += 400) { await p.ev(`(scrollTo(0,${y}),1)`); await sleep(40); } await p.ev('(scrollTo(0,0),1)'); }
    await sleep(1500);
    const inter = await p.ev(`document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`);
    const total = whole ? await p.ev('document.documentElement.scrollHeight') : H;
    for (let y = 0, k = 1; y < total; y += 2500, k++) {
      const h = Math.min(2500, total - y), file = whole ? `home-${W}-${k}.jpg` : `home-${W}x${H}-first.jpg`;
      const params = whole ? { format: 'jpeg', quality: 72, captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: 1 } } : { format: 'jpeg', quality: 72 };
      const got = await Promise.race([p.s('Page.captureScreenshot', params), sleep(30000).then(() => null)]);
      if (got) writeFileSync(join(HERE, file), Buffer.from(got.data, 'base64'));
      console.log(`${file} ${W}x${H} page ${total} px, tile y ${y} h ${h}, Inter ${inter} ${got ? 'saved' : 'NO ANSWER'}`);
      if (!whole) break;
    }
    await p.close();
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
setTimeout(() => process.exit(0), 300);
