// p67: « Votre enjeu » on the first screen at short phone sizes, Pass base (a64eb1b copy) against the tree; no scroll, both motions.
// Same reading as the Pass 53 recipe (rect inside the viewport, opacity of the heading and every ancestor), plus the hero height.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
const OLD = process.env.P67_OLD || 'http://127.0.0.1:4177', NEW = process.env.P67_NEW || 'http://127.0.0.1:4176';
const out = []; const log = s => { out.push(s); console.log(s); };
const b = await browser();
try {
  for (const [W, H] of [[375, 553], [375, 635], [360, 640], [320, 568], [375, 812]]) for (const reduce of [false, true]) for (const [tag, base] of [['a64eb1b', OLD], ['tree', NEW]]) {
    const p = await b.page(W, { height: H, reduce }); await p.s('Page.navigate', { url: base + '/' });
    for (let i = 0; i < 80; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
    await sleep(1500);
    const r = await p.ev(`(() => { const h = document.querySelector('#services h2'), x = h.getBoundingClientRect(); let o = 1, e = h; while (e) { o *= +getComputedStyle(e).opacity; e = e.parentElement; } const hero = document.querySelector('.hero--home').getBoundingClientRect(), head = document.querySelector('.site-header').getBoundingClientRect(); return { top: Math.round(x.top), o, header: Math.round(head.height), hero: Math.round(hero.height), sec: document.querySelector('#services').className }; })()`);
    await p.close();
    log(`${W}x${H} motion ${reduce ? 'reduce' : 'no-preference'} ${tag}: header ${r.header}, hero ${r.hero}, « Votre enjeu » top ${r.top} ${r.top < H ? 'IN' : 'below'} the ${H} px window, opacity chain ${r.o}, section class « ${r.sec} »`);
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
writeFileSync(join(import.meta.dirname, 'firstscreen.txt'), out.join('\n') + '\n');
setTimeout(() => process.exit(0), 300);
