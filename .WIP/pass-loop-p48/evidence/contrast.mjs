// p48 A-002 hero contrast capture (audit 2026-10-10 contrast.mjs + contrast-others.mjs method): for each offer
// hero and width, a screenshot as rendered and one with the h1 and .hero__sub text made transparent; rectangles
// and colours to contrast-rects-<tag>.json. Then `python contrast_pixels.py <tag>`. usage: P48_TAG=after node contrast.mjs
import { browser, ROOT, outside } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const TAG = process.env.P48_TAG || 'after';
const ROUTES = ['/service-strategie-transformation/', '/service-ia-business/', '/service-venture-building/'];
const RUNS = process.env.P48_WIDTHS ? process.env.P48_WIDTHS.split(',').map(w => [Number(w), false]) : [[320, false], [375, false], [641, false], [700, false], [768, false], [800, false], [860, false], [1200, false], [375, true]];
const ONLY = process.env.P48_ROUTES ? process.env.P48_ROUTES.split(',') : null;
// Trial only (never evidence): P48_VEIL = CSS text appended in a <style> before measuring.
const VEIL = process.env.P48_VEIL || '';
const b = await browser(), out = [], extra = [];
try {
  for (const route of ONLY || ROUTES) for (const [width, reduce] of RUNS) {
    const p = await b.page(width, { reduce, height: 1400 });
    await p.go(route);
    if (VEIL) { await p.ev(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(VEIL)};document.head.append(s)})()`); await new Promise(r => setTimeout(r, 300)); }
    const name = `${TAG}-${route.replaceAll('/', '')}-${width}${reduce ? '-reduce' : ''}`;
    await p.shot('orig-' + name);
    const items = await p.ev(`[...document.querySelectorAll('.hero h1,.hero__sub')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {sel:e.matches('h1')?'h1':'.hero__sub',x:r.x,y:r.y,width:r.width,height:r.height,color:s.color,size:s.fontSize,weight:s.fontWeight}})`);
    const veil = await p.ev(`getComputedStyle(document.querySelector('.hero--offer'),'::before').backgroundImage`);
    await p.ev(`document.querySelectorAll('.hero h1,.hero__sub').forEach(e=>e.style.color='transparent')`);
    await p.shot('bg-' + name);
    out.push({ route, width, reduce, name, veil, items });
    extra.push(...outside(p.requests));
    await p.close();
  }
  writeFileSync(join(ROOT, `contrast-rects-${TAG}.json`), JSON.stringify(out, null, 1));
  console.log(`captured ${out.length} hero renders (${TAG}); outside requests: ${extra.length}${extra.length ? ' ' + extra.join(' ') : ''}`);
} finally { await b.close(); }
