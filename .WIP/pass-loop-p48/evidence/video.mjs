// p48 A-007: the four video launchers, each launched by a real mouse click and, in a fresh page, by real Tab +
// Enter. Reads the inserted frame's title (no « nouvel onglet », = the caption's text without its hidden span) and
// whether it holds focus. Every host except 127.0.0.1 and Google Fonts resolves to NOTFOUND (cdp.mjs), so the
// YouTube player cannot load. usage: node video.mjs
import { browser, BASE, outside } from './cdp.mjs';
const LAUNCHERS = [['/publications/', 'GEh_2faSLb0'], ['/service-ia-business/', 'hDFiKEFv5kA'],
  ['/service-venture-building/', '7qO3G7tCHr8'], ['/service-venture-building/', 'QtzlMHaUGyM']];
const b = await browser(); let fails = 0; const extra = [];
try {
  for (const [route, id] of LAUNCHERS) for (const how of ['mouse', 'keyboard']) {
    const p = await b.page(1200);
    await p.go(route);
    const sel = `button[data-video="${id}"]`;
    const expected = await p.ev(`(()=>{const c=document.querySelector('${sel}').closest('figure').querySelector('figcaption').cloneNode(true);c.querySelectorAll('.visually-hidden').forEach(e=>e.remove());return c.textContent.trim()})()`);
    if (how === 'mouse') await p.point(sel); else { await p.focus(sel); await p.key('Enter'); await new Promise(r => setTimeout(r, 400)); }
    const r = await p.ev(`(()=>{const f=document.querySelector('iframe.video-frame');return f?{title:f.title,src:f.src,focused:document.activeElement===f}:null})()`);
    const ok = r && !/nouvel onglet/.test(r.title) && r.title === expected && r.focused && r.src.includes(id);
    if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${route.padEnd(28)} ${id} ${how.padEnd(8)} title="${r?.title}" focused=${r?.focused}`);
    extra.push(...outside(p.requests).filter(u => !/youtube|ytimg|googlevideo/.test(u)));
    await p.close();
  }
} finally { await b.close(); }
console.log(`VIDEO ${BASE}: 8 launches, FAILURES ${fails}, outside non-YouTube requests ${extra.length} (YouTube hosts resolve to NOTFOUND)`);
process.exitCode = fails || extra.length ? 1 : 0;
