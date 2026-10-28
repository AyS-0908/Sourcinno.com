// p68 (run after the fix: `#besoin` left `.reveal`, the before-fix run is firstscreen-before-fix.txt): AGENTS Gotcha « A tall .reveal block can stay blank on the first screen » (Pass 53). `#besoin` was `.reveal` at the base and
// is now three stacked cards on phones (taller); site.js shows a .reveal block once 8 % of its height is on screen. BASE b332007
// vs NEW, Performance and Entreprise IA, scripts on, both motions, no scroll at load: `#besoin` top/height, its h2 top and
// opacity chain; then scroll down 20 px at a time: the scroll at which the h2 becomes opaque, and how much of the section was
// on screen but still blank just before (px of the window between the section top and the window bottom).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
const HERE = import.meta.dirname, NEW = process.env.P68_NEW || 'http://127.0.0.1:4176', OLD = process.env.P68_OLD || 'http://127.0.0.1:4177';
const out = []; const log = s => { out.push(s); console.log(s); };
const probe = `(() => { const s = document.getElementById('besoin'), h = s.querySelector('h2'), r = s.getBoundingClientRect(), x = h.getBoundingClientRect();
  let o = 1, e = h; while (e) { o *= +getComputedStyle(e).opacity; e = e.parentElement; }
  return { y: Math.round(scrollY), top: Math.round(r.top), height: Math.round(r.height), h2top: Math.round(x.top), o }; })()`;
const b = await browser();
try {
  for (const path of ['/service-performance/', '/service-ia-business/']) for (const [W, H, touch] of [[375, 553, true], [375, 635, true], [360, 640, true], [320, 568, true], [375, 812, true], [1200, 900, false]]) for (const reduce of [false, true]) {
    const row = [];
    for (const [name, base] of [['base', OLD], ['new', NEW]]) {
      const p = await b.page(W, { height: H, reduce, touch });
      await p.s('Page.navigate', { url: base + path });
      for (let i = 0; i < 80; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
      await sleep(1500);
      const first = await p.ev(probe);
      let at = null, blank = 0;
      for (let y = 0; y <= 4000 && at === null; y += 20) {
        await p.ev(`(scrollTo(0, ${y}), 1)`); await sleep(120);
        const r = await p.ev(probe);
        if (r.o === 1) at = r; else blank = Math.max(blank, H - r.top);
      }
      await p.close();
      row.push(`${name}: load top ${first.top} h ${first.height}, h2 top ${first.h2top} opacity ${first.o}; opaque at scroll ${at ? at.y : 'never'} (h2 top ${at ? at.h2top : '-'}), blank part on screen before ${Math.max(0, blank)} px`);
    }
    log(`${path} ${W}x${H} ${touch ? 'touch' : 'mouse'} motion ${reduce ? 'reduce' : 'no-preference'} | ${row.join(' | ')}`);
  }
} finally { await Promise.race([b.close(), sleep(8000)]); }
writeFileSync(join(HERE, 'firstscreen.txt'), out.join('\n') + '\n');
setTimeout(() => process.exit(0), 300);
