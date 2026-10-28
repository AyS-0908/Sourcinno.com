// p66: three viewport captures (no beyond-viewport: AGENTS Gotcha) of the changed places, Inter checked first.
import { writeFileSync } from 'node:fs';
import { browser, sleep } from './cdp.mjs';
const NEW = process.env.P66_NEW || 'http://127.0.0.1:4176';
const SHOTS = [['perf-1200.jpg', 1200, 900, '/service-performance/', null], ['contact-375.jpg', 375, 812, '/contact/', '.ticks--contact'], ['footer-375.jpg', 375, 812, '/service-performance/', '.site-footer']];
const b = await browser();
try {
  for (const [file, W, H, route, sel] of SHOTS) {
    const p = await b.page(W, { height: H }); await p.s('Page.navigate', { url: NEW + route });
    for (let i = 0; i < 80; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
    if (sel) { await p.ev(`(scrollTo(0, document.querySelector('${sel}').getBoundingClientRect().top + scrollY - 160), 1)`); }
    await sleep(1500);
    const inter = await p.ev(`document.fonts.check('700 16px Inter') && [...document.fonts].some(x => x.family.includes('Inter') && x.status === 'loaded')`);
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'jpeg', quality: 72 }), sleep(20000).then(() => null)]);
    if (got) writeFileSync(file, Buffer.from(got.data, 'base64'));
    console.log(`${file} ${W}x${H} ${route} Inter ${inter} ${got ? 'saved' : 'NO ANSWER'}`);
    await p.close();
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
setTimeout(() => process.exit(0), 300);
