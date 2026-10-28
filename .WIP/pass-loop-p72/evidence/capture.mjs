// Pass 72 captures (DW4): home « Votre enjeu » (tree closed / open) and « Méthodologie type » (step 1 / step 3) at 1200 and 375.
// usage (from the product): P72_NEW=http://127.0.0.1:4181 P48_PROFILES=<scratch> node .WIP/pass-loop-p72/evidence/capture.mjs
// Clip in DOCUMENT coordinates (AGENTS Gotcha P56); the sticky header is hidden during the shot so it does not cover the section top.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const NEW = process.env.P72_NEW || 'http://127.0.0.1:4181';
const OUT = import.meta.dirname;
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

async function click(p, sel) {
  await p.ev(`document.querySelector('${sel}').scrollIntoView({ block: 'center' })`); await sleep(300);
  const c = await p.ev(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await p.s('Input.dispatchMouseEvent', { type, x: c[0], y: c[1], button: 'left', clickCount: 1 });
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
  await sleep(1000);
}
async function shot(p, sel, file) {
  await p.ev(`(() => { const st = document.createElement('style'); st.id = 'capstyle'; st.textContent = '.site-header{visibility:hidden!important}'; document.head.append(st); })()`);
  const h = Math.ceil(await p.ev(`document.querySelector('${sel}').getBoundingClientRect().height`));
  if (h > 2500) throw Error(`${sel} is ${h} px: tile it`);
  await p.s('Emulation.setDeviceMetricsOverride', { width: p.width, height: h, deviceScaleFactor: 1, mobile: p.width < 861 });
  await sleep(300);
  await p.ev(`window.scrollTo(0, document.querySelector('${sel}').getBoundingClientRect().top + scrollY)`); await sleep(900);
  const y = await p.ev(`document.querySelector('${sel}').getBoundingClientRect().top + scrollY`);
  const h2 = Math.ceil(await p.ev(`document.querySelector('${sel}').getBoundingClientRect().height`));
  const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 88, clip: { x: 0, y, width: p.width, height: h2, scale: 1 } });
  writeFileSync(join(OUT, file), Buffer.from(data, 'base64'));
  await p.ev(`document.getElementById('capstyle').remove()`);
  await p.s('Emulation.setDeviceMetricsOverride', { width: p.width, height: 900, deviceScaleFactor: 1, mobile: p.width < 861 });
  log(`${file} ${p.width}x${h2} (doc y ${Math.round(y)})`);
}

const b = await browser();
try {
  for (const W of [1200, 375]) {
    const p = await b.page(W, { reduce: false, height: 900 });
    await p.s('Page.navigate', { url: NEW + '/' }); await sleep(1500);
    const inter = await p.ev('document.fonts.ready.then(() => document.fonts.check("700 16px Inter"))');
    log(`== ${W}: Inter ${inter}`);
    await shot(p, '#services', `home-enjeu-${W}-ferme.jpg`);
    await click(p, '#services .vx-node');
    await shot(p, '#services', `home-enjeu-${W}-ouvert.jpg`);
    await p.ev(`document.querySelector('#demarche').scrollIntoView()`); await sleep(1200);
    await shot(p, '#demarche', `home-methodo-${W}-etape1.jpg`);
    await click(p, '#mA-t3');
    await shot(p, '#demarche', `home-methodo-${W}-etape3.jpg`);
    log(`   errors: ${p.errors.length ? p.errors.join(' | ') : 0}`);
    await p.close();
  }
} finally { await b.close(); }
writeFileSync(join(OUT, 'capture.txt'), lines.join('\n') + '\n');
