// p56, AGENTS Gotcha « a tall .reveal block can stay blank on the first screen »: #besoin is a .reveal section and is
// taller in hover mode. Loaded WITHOUT scrolling: is the section title on the first screen, and is it hidden (itself or an
// ancestor at an opacity other than 1) until the first scroll? Tree against the scratch copy of cb0bfbf.
// Sizes: 1280 px wide, window 580 to 720 px high, then the sizes the reviewer measured (audit finding A-001).
// A « differs » line = the tree hides the title where cb0bfbf shows it. The script exits 1 on any such line.
// usage (product root): P48_PROFILES=<scratch> node .WIP/pass-loop-p56/evidence/first-screen.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';
const TREE = process.env.P48_BASE || 'http://127.0.0.1:4173', OLD = process.env.P56_OLD || 'http://127.0.0.1:4174';
const SIZES = [...[580, 600, 620, 640, 660, 680, 700, 720].map(H => [1280, H]), [1366, 657], [1366, 625], [1280, 649], [1024, 640]];
const out = []; let bad = 0; const log = s => { out.push(s); console.log(s); };
function pg() { const h = document.querySelector('#besoin h2'), r = h.getBoundingClientRect(), B = document.getElementById('besoin').getBoundingClientRect(), hid = []; for (let n = h; n && n.nodeType === 1; n = n.parentElement) { const o = getComputedStyle(n).opacity; if (+o !== 1) hid.push(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + ' ' + o); } return { on: r.top < innerHeight && r.bottom > 0, hid: hid.length > 0, by: hid.join(', '), secH: Math.round(B.height), shown: Math.max(0, Math.round(innerHeight - B.top)), hover: document.querySelectorAll('#besoin .hl.is-hover').length, sy: scrollY }; }
async function one(b, base, route, W, H, touch = false) {
  const p = await b.page(W, { height: H, ...(touch ? { touch: true } : {}) }); await p.s('Page.navigate', { url: base + route });
  for (let i = 0; i < 120; i++) { await sleep(100); if (await p.ev(`document.readyState==='complete'&&document.fonts.status==='loaded'`).catch(() => false)) break; }
  await sleep(2200); const g = await p.ev(`(${pg})()`); await p.close(); return g;
}
const b = await browser();
try {
  for (const route of ['/service-strategie-transformation/', '/service-ia-business/']) {
    log(`== ${route}, loaded without scrolling, read 2.2 s after the load (title « on screen » = its box inside the window; « hidden » = itself or an ancestor at an opacity other than 1)`);
    for (const [W, H] of SIZES) {
      const o = await one(b, OLD, route, W, H), t = await one(b, TREE, route, W, H), worse = t.on && t.hid && !o.hid;
      if (worse) bad++;
      log(`   ${W}x${H}: cb0bfbf section ${o.secH} high, ${o.shown} px of it on screen, title on screen ${o.on}, hidden ${o.hid}  |  tree (${t.hover} list(s) in hover mode, scrollY ${t.sy}) section ${t.secH} high, ${t.shown} px on screen, title on screen ${t.on}, hidden ${t.hid}${t.by ? ' by ' + t.by : ''}${worse ? '  ← differs: hidden where cb0bfbf shows it' : o.hid && !t.hid ? '  (shown here, hidden on cb0bfbf)' : ''}`);
    }
    // outside hover mode the scroll reveal is untouched: same reading as cb0bfbf, hidden or shown
    for (const [W, H, touch] of [[960, 600, false], [960, 640, false], [1280, 600, true], [1280, 640, true], [375, 667, true]]) {
      const o = await one(b, OLD, route, W, H, touch), t = await one(b, TREE, route, W, H, touch), same = o.hid === t.hid && o.on === t.on && t.hover === 0;
      if (!same) bad++;
      log(`   no hover mode, ${W}x${H}${touch ? ' touch' : ' fine pointer'}: cb0bfbf title on screen ${o.on}, hidden ${o.hid}  |  tree (${t.hover} list(s) in hover mode) title on screen ${t.on}, hidden ${t.hid}${same ? '' : '  ← differs from cb0bfbf'}`);
    }
  }
} finally { await b.close(); }
log(`FIRST-SCREEN: ${SIZES.length * 2} readings in hover mode and 10 outside it; title hidden where cb0bfbf shows it, or a difference outside hover mode: ${bad}`);
writeFileSync(join(import.meta.dirname, 'first-screen.txt'), out.join('\n') + '\n');
process.exitCode = bad ? 1 : 0;
