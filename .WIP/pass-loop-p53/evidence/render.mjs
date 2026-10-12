// p53 Done When 2–4: /publications/ rendered in headless Chrome, JavaScript on and off.
// cdp.mjs = P51 helper (resolver NOTFOUND for every host except 127.0.0.1 and Google Fonts, reduced motion set explicitly).
// JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow = every element's right edge against the
// emulated width (P34 Gotcha), not scrollWidth. Chips: Tab to the chip then Enter through Input.dispatchKeyEvent.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=http://127.0.0.1:4174] node .WIP/pass-loop-p53/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, outside, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const HERE = import.meta.dirname, ROUTE = '/publications/';
const TWO = [1440, 1200, 961], ONE = [960, 768, 375, 320];
const ORDER = ['Du PIB au BCI', 'Engagez-vous 2.0', 'Publications LinkedIn'];
const CHIPS = ['IA', 'Venture Building', 'Startup'];

const walk = `(async()=>{const H=innerHeight*0.7;for(let y=0;y<=document.documentElement.scrollHeight;y+=H){scrollTo(0,y);await new Promise(r=>setTimeout(r,300));}
 await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,3000)})));
 scrollTo(0,0);await new Promise(r=>setTimeout(r,500));return 1})()`;
const geom = W => `(()=>{const W=${W};const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right,b:r.bottom+scrollY}};
 const wrap=document.querySelector('.pub-cols');if(!wrap)return {noWrap:true};const [a,b]=wrap.children;
 const cards=[...a.querySelectorAll('.card')];const bad=[];
 for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width===0&&r.height===0)continue;if(r.right>W+0.5)bad.push((e.tagName+'.'+(typeof e.className==='string'?e.className:'')).slice(0,50)+' right '+r.right.toFixed(1));}
 const l=document.querySelector('.video-launch'),sp=l.querySelector('span'),cap=document.querySelector('.band-figure figcaption a');
 const posts=[...document.querySelectorAll('#blog-list [data-tag]')];const shown=posts.filter(p=>{const r=p.getBoundingClientRect();return r.width>0&&r.height>0});
 return {children:wrap.children.length,blogId:b.id,a:box(a),b:box(b),order:cards.map(c=>c.querySelector('h3').textContent.replace(/\\s*→.*$/,'').trim()),lastCard:box(cards[cards.length-1]),
  past:bad.length,pastList:bad.slice(0,8),launch:box(l),launchDisplay:getComputedStyle(l).display,launchCard:box(l.closest('.card')),play:box(sp),caption:box(cap),
  chips:[...document.querySelectorAll('.filters .chip')].map(c=>({t:c.textContent,p:c.getAttribute('aria-pressed')})),
  posts:posts.length,shown:shown.length,shownTags:[...new Set(shown.map(p=>p.dataset.tag))],opacity:getComputedStyle(wrap.closest('section')).opacity}})()`;

const out = []; let bad = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); };
const f = n => n.toFixed(1);
async function shot(p, W, name) {
  if (process.env.P53_NO_LOG) return; // red run on a mutated copy: keeps neither captures nor render.txt
  await p.ev('scrollTo(0,0),1'); await sleep(300);
  const H = await p.ev('document.documentElement.scrollHeight');
  const { data } = await p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  writeFileSync(join(HERE, name + '.png'), Buffer.from(data, 'base64')); log(`   capture ${name}.png ${W}x${H}`);
}
function layout(g, W, twoCols) {
  check(g.children === 2 && g.blogId === 'blog', `wrapper holds 2 blocks, the second is #blog (${g.children}, « ${g.blogId} »)`);
  check(g.opacity === '1', `section opacity ${g.opacity}`);
  check(JSON.stringify(g.order) === JSON.stringify(ORDER), `cards order ${JSON.stringify(g.order)}`);
  if (twoCols) {
    check(Math.abs(g.a.y - g.b.y) <= 1, `two columns: tops ${f(g.a.y)} / ${f(g.b.y)} (± 1)`);
    const ratio = g.b.w / g.a.w;
    check(Math.abs(ratio - 2) <= 0.06 && g.b.x > g.a.r, `blog ${f(g.b.w)} px = ${ratio.toFixed(3)} × cards ${f(g.a.w)} px (2 ± 3 %), blog left ${f(g.b.x)} > cards right ${f(g.a.r)}`);
  } else {
    check(g.b.y >= g.lastCard.b && Math.abs(g.a.x - g.b.x) <= 1, `one column: blog top ${f(g.b.y)} ≥ last card bottom ${f(g.lastCard.b)}, lefts ${f(g.a.x)} / ${f(g.b.x)}, width ${f(g.a.w)}`);
  }
  check(g.past === 0, `elements past ${W} px: ${g.past}${g.past ? ' ' + JSON.stringify(g.pastList) : ''}`);
}

const b = await browser(); const extra = []; const jsGeom = {};
try {
  for (const W of [...TWO, ...ONE]) {
    const p = await b.page(W, { height: W < 861 ? 812 : 900 }); await p.go(ROUTE); await p.ev(walk);
    const g = await p.ev(geom(W)); jsGeom[W] = g;
    log(`== JS on W=${W}`);
    if (g.noWrap) { check(false, 'no .pub-cols wrapper'); await p.close(); continue; }
    layout(g, W, TWO.includes(W));
    const ar = g.launch.h / g.launch.w;
    check(Math.abs(ar - 0.5625) <= 0.01 && g.launch.x >= g.launchCard.x && g.launch.r <= g.launchCard.r, `launcher ${f(g.launch.w)}x${f(g.launch.h)} ratio ${ar.toFixed(4)} inside its card (${f(g.launchCard.x)}–${f(g.launchCard.r)})`);
    check(Math.round(g.play.w) === 38 && Math.round(g.play.h) === 38, `▶ ${f(g.play.w)}x${f(g.play.h)}`);
    check(JSON.stringify(g.chips.map(c => c.t)) === JSON.stringify(CHIPS), `chips ${JSON.stringify(g.chips.map(c => c.t))}`);
    check(g.chips.filter(c => c.p === 'true').map(c => c.t).join() === 'IA' && g.shown === 6 && g.shownTags.join() === 'IA', `on load pressed ${JSON.stringify(g.chips.filter(c => c.p === 'true').map(c => c.t))}, shown ${g.shown} of ${g.posts} ${JSON.stringify(g.shownTags)}`);
    if (W === 375) await shot(p, W, 'publications-375-js');
    if (W === 1200) {
      await shot(p, W, 'publications-1200-ia');
      for (const [i, tag, n] of [[2, 'Venture Building', 4], [3, 'Startup', 1]]) {
        const tabs = await p.focus(`.filters .chip:nth-child(${i})`); await p.key('Enter'); await sleep(300);
        const k = await p.ev(geom(W));
        check(k.chips.filter(c => c.p === 'true').map(c => c.t).join() === tag && k.shown === n && k.shownTags.join() === tag, `Tab ×${tabs} + Enter on « ${tag} »: pressed ${JSON.stringify(k.chips.filter(c => c.p === 'true').map(c => c.t))}, shown ${k.shown} ${JSON.stringify(k.shownTags)}`);
        if (i === 2) await shot(p, W, 'publications-1200-venture');
      }
    }
    extra.push(...outside(p.requests)); await p.close();
  }
  for (const W of [1200, 375]) {
    const p = await b.page(W, { nojs: true, height: W < 861 ? 812 : 900 }); await p.go(ROUTE); await sleep(500);
    const g = await p.ev(geom(W)), j = jsGeom[W];
    log(`== JS off W=${W}`);
    if (g.noWrap) { check(false, 'no .pub-cols wrapper'); await p.close(); continue; }
    layout(g, W, W === 1200);
    check(g.chips.length === 0, `chips ${g.chips.length}`);
    check(g.posts === 11 && g.shown === 11, `posts with a box ${g.shown} of ${g.posts}`);
    check(j && !j.noWrap && ['x', 'w'].every(k => Math.abs(g.a[k] - j.a[k]) <= 1 && Math.abs(g.b[k] - j.b[k]) <= 1), `same columns as with scripts: cards x ${f(g.a.x)} w ${f(g.a.w)}, blog x ${f(g.b.x)} w ${f(g.b.w)}`);
    check(g.caption.w > 0 && g.caption.h > 0, `BCI caption link box ${f(g.caption.w)}x${f(g.caption.h)} (launcher display ${g.launchDisplay})`);
    await shot(p, W, `publications-${W}-nojs`);
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
log(`RENDER ${BASE}${ROUTE}: failing checks ${bad}, outside requests ${extra.length}${extra.length ? ' ' + JSON.stringify([...new Set(extra)].slice(0, 10)) : ''}`);
if (!process.env.P53_NO_LOG) writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad || extra.length ? 1 : 0;
