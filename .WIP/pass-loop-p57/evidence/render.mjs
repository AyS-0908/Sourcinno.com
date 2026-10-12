// p57 Done When 3–5: /publications/ rendered in headless Chrome, JavaScript on and off. Copied from
// .WIP/pass-loop-p54/evidence/render.mjs and retargeted on the four Venture Building / Startup articles.
// cdp.mjs = P51 helper (resolver NOTFOUND for every host except 127.0.0.1 and Google Fonts, reduced motion set explicitly).
// JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow = every element's right edge against the
// emulated width (P34 Gotcha), not scrollWidth. Keyboard = Tab to the element, then Enter through Input.dispatchKeyEvent.
// A Venture Building / Startup post is hidden until its chip is pressed: the chip is pressed (Tab + Enter) first.
// Pictures are loading="lazy" in a closed dépliant: once open, the script scrolls through the article and waits
// for every picture before measuring or capturing. No video launcher is ever clicked.
// P57_NO_LOG=1 (red run on a scratch copy): keeps neither captures nor render.txt.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=http://127.0.0.1:4174] node .WIP/pass-loop-p57/evidence/render.mjs
import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const TILE = 2500;
import { browser, BASE, outside, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const HERE = import.meta.dirname, ROUTE = '/publications/', QUIET = !!process.env.P57_NO_LOG;
const T_NUT = 'Corporate venture BUILDING: in a nutschell', T_ENGIE = 'Corporate venture BUILDING [4] : Engie x WeFound';
const T_LONG = 'Corporate venture BUILDING [3]: “Plus long au décollage, plus rapide pour le voyage”', T_TODO = 'ToDo Startup [2]: flexibilité... structurée';
const CHIPS = ['IA', 'Venture Building', 'Startup'];
const WORDS = { [T_NUT]: 32, [T_ENGIE]: 15, [T_LONG]: 795, [T_TODO]: 398 }; // fidelity.mjs counts: the text on screen holds at least these

const LIB = `const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right}};
 const has=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const posts=()=>[...document.querySelectorAll('#blog-list [data-tag]')];
 const titleOf=p=>(p.querySelector('h3')?.textContent||'').replace(/\\s*→[\\s\\S]*$/,'').trim();
 const byTitle=t=>posts().find(p=>titleOf(p)===t);
 const isWix=p=>/^https:\\/\\/sourcinno\\.wixsite\\.com\\/blog\\/post\\//.test(p.querySelector('h3 a')?.href||'');
 const past=W=>{const bad=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width===0&&r.height===0)continue;if(r.right>W+0.5)bad.push((e.tagName+'.'+(typeof e.className==='string'?e.className:'')).slice(0,50)+' right '+r.right.toFixed(1));}return bad};`;
const state = W => `(()=>{${LIB}const ps=posts(),det=ps.filter(p=>p.tagName==='DETAILS'),art=ps.filter(p=>p.tagName==='ARTICLE'),shown=ps.filter(has);
 const tag=t=>det.filter(d=>d.dataset.tag===t).length;
 return {posts:ps.length,details:det.length,detIA:tag('IA'),detVB:tag('Venture Building'),detSU:tag('Startup'),open:det.filter(d=>d.open).length,
  shown:shown.length,shownTags:[...new Set(shown.map(p=>p.dataset.tag))],shownDetails:shown.filter(p=>p.tagName==='DETAILS').length,
  shownOpen:shown.filter(p=>p.open).length,shownWix:shown.filter(p=>p.tagName==='ARTICLE'&&isWix(p)).length,
  chips:[...document.querySelectorAll('.filters .chip')].map(c=>({t:c.textContent,p:c.getAttribute('aria-pressed')})),
  articles:art.length,wix:art.filter(isWix).length,wixInDetails:det.filter(d=>d.querySelector('a[href*="wixsite.com"]')).length,past:past(${W})}})()`;
const nth = t => `(()=>{${LIB}const d=byTitle(${JSON.stringify(t)});return d&&d.tagName==='DETAILS'?[...d.parentElement.children].indexOf(d)+1:0})()`;
const article = (t, W) => `(()=>{${LIB}const d=byTitle(${JSON.stringify(t)});if(!d||d.tagName!=='DETAILS')return {missing:true};
 const body=d.querySelector('.blog-body'),blocks=[...body.querySelectorAll(':scope > *, li')],l=body.querySelector('.video-launch'),c=body.querySelector('figcaption a');
 return {open:d.open,active:document.activeElement===d.querySelector('summary'),card:box(d),blocks:blocks.length,blocksShown:blocks.filter(has).length,
  words:body.innerText.trim().split(/\\s+/).length,imgs:[...body.querySelectorAll(':scope > img')].map(i=>({src:new URL(i.currentSrc||i.src).pathname,nat:i.naturalWidth,done:i.complete,...box(i)})),
  links:[...body.querySelectorAll('a')].filter(a=>!a.closest('figure')).map(a=>({href:a.href,text:a.firstChild.textContent,...box(a)})),
  launch:l&&{...box(l),display:getComputedStyle(l).display,play:box(l.querySelector('span')),thumb:l.querySelector('img').naturalWidth},caption:c&&box(c),past:past(${W})}})()`;
const pics = `(()=>{const im=[...document.querySelectorAll('#blog-list img')],num=(i,a)=>/^\\d+$/.test(i.getAttribute(a)||'');
 return {total:im.length,thumbs:im.filter(i=>i.closest('.video-launch')).length,alt:im.filter(i=>(i.getAttribute('alt')||'').trim()).length,
  dims:im.filter(i=>num(i,'width')&&num(i,'height')).length,lazy:im.filter(i=>i.getAttribute('loading')==='lazy').length,
  local:im.filter(i=>(i.getAttribute('src')||'').startsWith('/assets/img/blog/')).length,loaded:im.filter(i=>i.naturalWidth>0).length}})()`;
const first = `(()=>{const shown=e=>{for(let n=e;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);if(c.opacity!=='1'||c.visibility!=='visible'||c.display==='none')return false}const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const h=document.querySelector('.pub-cols h2'),c=document.querySelector('.pub-cols .card');
 return {scrollY,innerHeight,h2:h.textContent.trim(),h2Shown:shown(h),h2Top:Math.round(h.getBoundingClientRect().top),cardShown:shown(c),cardTop:Math.round(c.getBoundingClientRect().top)}})()`;
const openAll = `(()=>{for(const d of document.querySelectorAll('#blog-list details'))d.open=true;for(const i of document.querySelectorAll('#blog-list img'))i.loading='eager';return 1})()`;

const out = []; let bad = 0;
const log = s => { out.push(s); console.log(s); };
const check = (ok, text) => { if (!ok) bad++; log(`   ${ok ? 'ok  ' : 'FAIL'} ${text}`); };
const f = n => n.toFixed(1);
async function shot(p, W, name) {
  if (QUIET) return;
  // The keyboard focus ring is taken off for the picture (the owner judges the article, not the ring), then put back.
  await p.ev('window.__p57=document.activeElement,__p57&&__p57.blur(),scrollTo(0,0),1'); await sleep(300);
  const H = await p.ev('document.documentElement.scrollHeight');
  // Tiles of 2500 px stacked by stitch.py: a single capture of 6000 px or more never answers here (capture-probe.mjs).
  const parts = [];
  for (let y = 0; y < H; y += TILE) {
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: Math.min(TILE, H - y), scale: 1 } }), sleep(30000).then(() => null)]);
    if (!got) throw Error(`capture ${name}: no answer in 30 s for the tile at ${y}`);
    const part = join(HERE, `${name}.tile${parts.length}.png`); writeFileSync(part, Buffer.from(got.data, 'base64')); parts.push(part);
  }
  const st = spawnSync('python', [join(HERE, 'stitch.py'), join(HERE, name + '.png'), ...parts], { encoding: 'utf8' });
  for (const part of parts) rmSync(part);
  if (st.status !== 0) throw Error(`stitch ${name}: ${st.stderr}`);
  log(`   capture ${name}.png ${W}x${H} (${st.stdout.trim()})`);
  await p.ev('window.__p57&&__p57.focus(),1');
}
const sel = n => `#blog-list > :nth-child(${n}) > summary`;
// Scrolls through the open article one screen at a time (lazy pictures load near the viewport) and waits, from
// Node (also works with scripts off), until every picture of the article is complete or 12 s have passed.
async function walk(p, n) {
  const q = `document.querySelector('#blog-list > :nth-child(${n})')`;
  const g = await p.ev(`(()=>{const r=${q}.getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,vh:innerHeight}})()`);
  for (let y = Math.max(0, g.top - 100); y < g.bottom; y += Math.round(g.vh * 0.8)) { await p.ev(`scrollTo(0,${Math.round(y)}),1`); await sleep(180); }
  for (let i = 0; i < 60; i++) { if (await p.ev(`[...${q}.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)`)) break; await sleep(200); }
  await p.ev(`${q}.querySelector('.blog-body').scrollIntoView({block:'start',behavior:'instant'}),1`); await sleep(400);
}
function closed(g, W, js) {
  check(g.posts === 11 && g.details === 10 && g.detIA === 6 && g.detVB === 3 && g.detSU === 1 && g.open === 0, `posts ${g.posts}: ${g.details} dépliant(s) (IA ${g.detIA}, Venture Building ${g.detVB}, Startup ${g.detSU}), open on load ${g.open}`);
  check(g.articles === 1 && g.wix === 1 && g.wixInDetails === 0, `other posts ${g.articles}, with a Wix post link ${g.wix}; dépliants holding a Wix link ${g.wixInDetails}`);
  check(g.past.length === 0, `closed: elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
  if (js) {
    check(JSON.stringify(g.chips.map(c => c.t)) === JSON.stringify(CHIPS), `chips ${JSON.stringify(g.chips.map(c => c.t))}`);
    check(g.chips.filter(c => c.p === 'true').map(c => c.t).join() === 'IA' && g.shown === 6 && g.shownTags.join() === 'IA', `on load pressed ${JSON.stringify(g.chips.filter(c => c.p === 'true').map(c => c.t))}, shown ${g.shown} ${JSON.stringify(g.shownTags)}`);
  } else {
    check(g.chips.length === 0, `chips ${g.chips.length}`);
    check(g.shown === 11, `posts with a non-zero box ${g.shown} of ${g.posts}`);
  }
}
function text(a, name, t, W) {
  check(a.open, `« ${name} » open`);
  check(a.blocks > 0 && a.blocksShown === a.blocks && a.words >= WORDS[t], `text blocks with a non-zero box ${a.blocksShown} of ${a.blocks}; ${a.words} words on screen (article text ${WORDS[t]})`);
  check(a.past.length === 0, `open: elements past ${W} px: ${a.past.length}${a.past.length ? ' ' + JSON.stringify(a.past.slice(0, 6)) : ''}`);
}
// Presses a chip with the keyboard and checks what it shows.
async function chip(p, W, i, tag, n, details, wix) {
  const tabs = await p.focus(`.filters .chip:nth-child(${i})`).catch(() => -1); if (tabs < 0) { check(false, `no chip ${i}`); return false; }
  await p.key('Enter'); await sleep(300); const k = await p.ev(state(W));
  check(k.chips.filter(c => c.p === 'true').map(c => c.t).join() === tag && k.shown === n && k.shownTags.join() === tag, `Tab ×${tabs} + Enter on « ${tag} »: shown ${k.shown} ${JSON.stringify(k.shownTags)}`);
  check(k.shownDetails === details && k.shownOpen === 0 && k.shownWix === wix, `under « ${tag} »: ${k.shownDetails} dépliant(s), open ${k.shownOpen}, card(s) with a Wix post link ${k.shownWix}`);
  return true;
}
// Opens one article by Tab + Enter on its summary, loads its pictures, measures it, captures it, closes it.
async function openByKeyboard(p, W, t, name, file) {
  const n = await p.ev(nth(t)); if (!n) { check(false, `no dépliant titled « ${t} »`); return; }
  const tabs = await p.focus(sel(n)); await p.key('Enter'); await sleep(400); await walk(p, n);
  const a = await p.ev(article(t, W));
  log(`   Tab ×${tabs} + Enter on « ${name} » (summary focused: ${a.active})`); text(a, name, t, W);
  if (t === T_NUT) {
    const ok = a.imgs.filter(i => i.src.startsWith('/assets/img/blog/') && i.done && i.nat > 0 && i.w > 0 && i.h > 0);
    const inside = a.imgs.filter(i => i.w <= a.card.w + 0.5 && i.x >= a.card.x - 0.5 && i.r <= a.card.r + 0.5);
    const widths = [...new Set(a.imgs.map(i => f(i.w) + 'x' + f(i.h)))];
    check(a.imgs.length === 18 && ok.length === 18, `pictures ${a.imgs.length}: under /assets/img/blog/, loaded, non-zero box ${ok.length}; boxes ${JSON.stringify(widths)}`);
    check(inside.length === a.imgs.length, `pictures inside their card ${inside.length} of ${a.imgs.length} (card ${f(a.card.x)}–${f(a.card.r)}, ${f(a.card.w)} wide; widest picture ${f(Math.max(...a.imgs.map(i => i.w)))})`);
    const shownLinks = a.links.filter(l => l.w > 0 && l.h > 0);
    check(a.links.length === 5 && shownLinks.length === 5, `links shown ${shownLinks.length} of ${a.links.length}: ${JSON.stringify(a.links.map(l => l.text))}`);
  }
  if (t === T_LONG || t === T_TODO) {
    const i = a.imgs[0];
    check(a.imgs.length === 1 && i.src.startsWith('/assets/img/blog/') && i.nat > 0 && i.w > 0 && i.h > 0 && i.w <= a.card.w + 0.5 && i.r <= a.card.r + 0.5, `picture ${i?.src} natural ${i?.nat} px, box ${i ? f(i.w) + 'x' + f(i.h) : 'none'} in a ${f(a.card.w)} card`);
  }
  if (t === T_ENGIE) {
    const l = a.launch, ar = l ? l.h / l.w : 0;
    check(!!l && Math.abs(ar - 0.5625) <= 0.01 && l.x >= a.card.x && l.r <= a.card.r && l.thumb > 0, `launcher ${l ? f(l.w) + 'x' + f(l.h) : 'none'} ratio ${ar.toFixed(4)} inside its card, thumbnail natural ${l?.thumb} px`);
    check(!!l && Math.round(l.play.w) === 38 && Math.round(l.play.h) === 38, `▶ ${l ? f(l.play.w) + 'x' + f(l.play.h) : 'none'}`);
  }
  if (file) await shot(p, W, `publications-${W}-${file}`);
  await p.focus(sel(n)).catch(() => 0); await p.key('Enter'); await sleep(300); // closes it: one article per capture
}

const b = await browser(); const extra = [];
try {
  for (const W of [1200, 375]) {
    const H = W < 861 ? 812 : 900;
    // 1. closed page and chips
    let p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: closed, chips`);
    closed(await p.ev(state(W)), W, true);
    await chip(p, W, 2, 'Venture Building', 4, 3, 1);
    await chip(p, W, 3, 'Startup', 1, 1, 0);
    extra.push(...outside(p.requests)); await p.close();
    // 2. Venture Building articles opened by keyboard, in page order (Tab goes forward)
    p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: chip « Venture Building », articles opened by Tab + Enter`);
    if (await chip(p, W, 2, 'Venture Building', 4, 3, 1)) {
      await openByKeyboard(p, W, T_NUT, 'in a nutschell', 'nutschell');
      await openByKeyboard(p, W, T_ENGIE, 'Engie x WeFound', W === 1200 ? 'engie' : '');
      await openByKeyboard(p, W, T_LONG, 'Plus long au décollage', W === 1200 ? 'plus-long' : '');
    }
    extra.push(...outside(p.requests)); await p.close();
    // 3. Startup article opened by keyboard
    p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: chip « Startup », article opened by Tab + Enter`);
    if (await chip(p, W, 3, 'Startup', 1, 1, 0)) await openByKeyboard(p, W, T_TODO, 'ToDo Startup [2]', W === 375 ? 'todo-startup' : '');
    // 4. every article open, one chip at a time (a post of another tag has no box): overflow, then pictures (Done When 5)
    const q = await p.ev(pics); // attributes as served, read before openAll switches loading to eager for the load count
    await p.ev(openAll); await sleep(2500);
    log(`== JS on W=${W}: every article open, chip by chip`);
    for (const [i, tag, n] of [[1, 'IA', 6], [2, 'Venture Building', 3], [3, 'Startup', 1]]) {
      await p.ev(`document.querySelector('.filters .chip:nth-child(${i})').click(),scrollTo(0,0),1`); await sleep(500);
      const g = await p.ev(state(W));
      check(g.shownOpen === n && g.past.length === 0, `« ${tag} »: open and shown ${g.shownOpen}; elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
    }
    q.loaded = (await p.ev(pics)).loaded;
    check(q.total === 29 && q.thumbs === 4 && q.alt === q.total && q.dims === q.total && q.lazy === q.total && q.local === q.total, `img between the markers ${q.total} (${q.total - q.thumbs} pictures, ${q.thumbs} video thumbnails): non-empty alt ${q.alt}, width+height ${q.dims}, loading=lazy ${q.lazy}, src under /assets/img/blog/ ${q.local}`);
    check(q.loaded === q.total, `pictures loaded ${q.loaded} of ${q.total}`);
    extra.push(...outside(p.requests)); await p.close();
  }
  { // 5. first screen, not scrolled, short phone
    const p = await b.page(375, { height: 553 }); await p.go(ROUTE); await sleep(1500); const g = await p.ev(first);
    log(`== JS on 375x553, not scrolled`);
    check(g.scrollY === 0 && g.h2 === 'À lire et à suivre' && g.h2Shown && g.h2Top < g.innerHeight, `h2 « ${g.h2} » shown ${g.h2Shown}, top ${g.h2Top} of ${g.innerHeight}`);
    check(g.cardShown && g.cardTop < g.innerHeight, `first card shown ${g.cardShown}, top ${g.cardTop} of ${g.innerHeight}`);
    extra.push(...outside(p.requests)); await p.close();
  }
  for (const W of [1200, 375]) { // 6. scripts off
    const p = await b.page(W, { nojs: true, height: W < 861 ? 812 : 900 }); await p.go(ROUTE); await sleep(500);
    log(`== JS off W=${W}`);
    closed(await p.ev(state(W)), W, false);
    for (const [t, name] of [[T_LONG, 'Plus long au décollage'], [T_ENGIE, 'Engie x WeFound']]) {
      const n = await p.ev(nth(t)); if (!n) { check(false, `no dépliant titled « ${t} »`); continue; }
      await p.point(sel(n)); await sleep(300); await walk(p, n);
      const a = await p.ev(article(t, W)); log(`   mouse click on « ${name} »`); text(a, name, t, W);
      if (t === T_ENGIE) check(!!a.caption && a.caption.w > 0 && a.caption.h > 0 && a.launch?.display === 'none', `video: caption link box ${a.caption ? f(a.caption.w) + 'x' + f(a.caption.h) : 'none'}, launcher display ${a.launch?.display}`);
    }
    await shot(p, W, `publications-${W}-nojs`);
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
log(`RENDER ${BASE}${ROUTE}: failing checks ${bad}, outside requests ${extra.length}${extra.length ? ' ' + JSON.stringify([...new Set(extra)].slice(0, 10)) : ''}`);
if (!QUIET) writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad || extra.length ? 1 : 0;
