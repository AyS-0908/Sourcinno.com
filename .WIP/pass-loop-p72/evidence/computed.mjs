// Pass 72 AUTO-7: computed style of the ported blocks vs the mockup's option A (« Pass 40 method »: sorted names,
// standard and custom properties apart, settle loop, ::before/::after when generated).
// MOCK = previews/v13 page served over the BASE export (b9df13a style.css, as the owner saw it), option A of each block;
// NEW = working tree home page. Elements paired by DOM order inside: section, .section__head subtree, .vx / .mA subtree.
// usage (from the product): P72_NEW=http://127.0.0.1:4181 P72_BASE=http://127.0.0.1:4182 P48_PROFILES=<scratch> node .WIP/pass-loop-p72/evidence/computed.mjs [--mutate]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, sleep } from './cdp.mjs';

const NEW = process.env.P72_NEW || 'http://127.0.0.1:4181';
const BASE = process.env.P72_BASE || 'http://127.0.0.1:4182';
const MUTATE = process.argv.includes('--mutate');
const out = [];
const log = (s) => { out.push(s); console.log(s); };

const BLOCKS = {
  mock: { e: '.v13-opt[data-block=e][data-opt=a]', m: '.v13-opt[data-block=m][data-opt=a]', vx: '.vx', mA: '.mA', node: '.v13-opt[data-block=e][data-opt=a] .vx-node', tab3: '.v13-opt[data-block=m][data-opt=a] #mA-t3' },
  new: { e: '#services', m: '#demarche', vx: '.vx', mA: '.mA', node: '#services .vx-node', tab3: '#demarche #mA-t3' },
};
// Snapshot: list of [label, {std:{}, custom:{}}] per element and generated pseudo-element, sorted property names.
const SNAP = (k) => { const B = BLOCKS[k]; return `(() => {
  const els = [];
  for (const [sec, inner] of [['${B.e}', '${B.vx}'], ['${B.m}', '${B.mA}']]) {
    const s = document.querySelector(sec);
    els.push(s);
    const h = s.querySelector('.section__head'); els.push(h, ...h.querySelectorAll('*'));
    const r = s.querySelector(inner); els.push(r, ...r.querySelectorAll('*'));
  }
  const read = (cs) => { const std = {}, custom = {}; const names = [...cs].sort(); for (const n of names) (n.startsWith('--') ? custom : std)[n] = cs.getPropertyValue(n); return { std, custom }; };
  const rows = [];
  els.forEach((e, i) => {
    const label = i + ' ' + e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + [...e.classList].filter(c => !/^(v13-opt|m-services|vx--a|vx-src|section|reveal|is-visible|is-live)$/.test(c)).join('.');
    rows.push([label, read(getComputedStyle(e))]);
    for (const pe of ['::before', '::after']) { const cs = getComputedStyle(e, pe); if (cs.content !== 'none' && cs.content !== 'normal') rows.push([label + pe, read(cs)]); }
  });
  return rows;
})()`; };

async function settle(p, expr) {
  let prev = '', cur = '';
  for (let i = 0; i < 30; i++) { cur = JSON.stringify(await p.ev(expr)); if (cur === prev) return JSON.parse(cur); prev = cur; await sleep(250); }
  throw Error('did not settle');
}
async function click(p, sel) {
  await p.ev(`document.querySelector('${sel}').scrollIntoView({ block: 'center' })`); await sleep(250);
  const c = await p.ev(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await p.s('Input.dispatchMouseEvent', { type, x: c[0], y: c[1], button: 'left', clickCount: 1 });
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
}
async function open(b, k, W) {
  const p = await b.page(W, { height: 900, reduce: false, touch: false });
  await p.s('Page.navigate', { url: k === 'mock' ? BASE + '/maquette-v13/#e=a&m=a' : NEW + '/' }); await sleep(1500);
  await p.ev('document.fonts.ready.then(() => true)');
  if (k === 'new') await p.ev(`document.querySelector('#demarche').scrollIntoView(); document.querySelector('#demarche').classList.add('is-visible')`);
  if (k === 'new' && MUTATE) await p.ev(`(() => { const st = document.createElement('style'); st.textContent = '.mA-dot { border-width: 3px; }'; document.head.append(st); })()`);
  await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
  return p;
}
const cut = (v) => (v.length > 70 ? v.slice(0, 67) + '…' : v);

const b = await browser();
let totalDiff = 0;
try {
  for (const W of [1200, 961, 768, 375, 320]) {
    const pm = await open(b, 'mock', W), pn = await open(b, 'new', W);
    for (const state of ['closed, step 1', 'open, step 1', 'open, step 3']) {
      // Each page brought to front before its click and kept there 1.5 s: a background tab runs no requestAnimationFrame
      // (the mockup's lines then stay where the entering branches started, 14 px low: first run, artefact of the probe).
      for (const [p, k] of [[pm, 'mock'], [pn, 'new']]) {
        if (state === 'closed, step 1') break;
        await p.s('Page.bringToFront');
        await click(p, state === 'open, step 1' ? BLOCKS[k].node : BLOCKS[k].tab3); await sleep(1500);
      }
      for (const p of [pm, pn]) await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
      await sleep(300);
      const [a, n] = [await settle(pm, SNAP('mock')), await settle(pn, SNAP('new'))];
      log(`\n== ${W} px · ${state}: ${a.length} mockup rows, ${n.length} port rows`);
      if (a.length !== n.length || a.some((r, i) => r[0].replace(/^\d+ /, '').replace(/#[\w-]+/, '') !== n[i][0].replace(/^\d+ /, '').replace(/#[\w-]+/, ''))) {
        const i = a.findIndex((r, j) => !n[j] || r[0].replace(/^\d+ /, '').replace(/#[\w-]+/, '') !== n[j][0].replace(/^\d+ /, '').replace(/#[\w-]+/, ''));
        log(`   STRUCTURE differs at row ${i}: mockup ${a[i] && a[i][0]} / port ${n[i] && n[i][0]}`);
      }
      let rowsDiff = 0;
      for (let i = 0; i < Math.min(a.length, n.length); i++) {
        const [la, sa] = a[i], [ln, sn] = n[i];
        const d = [];
        for (const part of ['std', 'custom']) {
          const names = [...new Set([...Object.keys(sa[part]), ...Object.keys(sn[part])])].sort();
          for (const nm of names) if (sa[part][nm] !== sn[part][nm]) d.push(`${part === 'custom' ? 'custom ' : ''}${nm}: ${cut(String(sa[part][nm]))} → ${cut(String(sn[part][nm]))}`);
        }
        if (d.length) { rowsDiff++; log(`   ${ln}  (mockup ${la.replace(/^\d+ /, '')})`); d.forEach((x) => log(`      ${x}`)); }
      }
      totalDiff += rowsDiff;
      log(`   rows with a difference: ${rowsDiff} of ${Math.min(a.length, n.length)}`);
    }
    await pm.close(); await pn.close();
  }
} finally { await b.close(); }
log(`\nTOTAL rows with a difference: ${totalDiff}${MUTATE ? ' (mutation run: .mA-dot { border-width: 3px } injected in the port)' : ''}`);
writeFileSync(join(import.meta.dirname, MUTATE ? 'computed-mutated.txt' : 'computed.txt'), out.join('\n') + '\n');
