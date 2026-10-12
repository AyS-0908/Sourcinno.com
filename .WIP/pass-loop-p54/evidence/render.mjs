// p54 Done When 3–5: /publications/ rendered in headless Chrome, JavaScript on and off.
// cdp.mjs = P51 helper (resolver NOTFOUND for every host except 127.0.0.1 and Google Fonts, reduced motion set explicitly).
// JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow = every element's right edge against the
// emulated width (P34 Gotcha), not scrollWidth. Keyboard = Tab to the element, then Enter through Input.dispatchKeyEvent.
// No video launcher is ever clicked. P54_NO_LOG=1 (red run on a mutated copy): keeps neither captures nor render.txt.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=http://127.0.0.1:4174] node .WIP/pass-loop-p54/evidence/render.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, outside, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const HERE = import.meta.dirname, ROUTE = '/publications/', QUIET = !!process.env.P54_NO_LOG;
const T_MARCHE = "L'IA modifie-t-elle déjà le marché du travail ?", T_CHATGPT = `"J'ai essayé ChatGpt une fois"`, T_CAS = "IA: cas d'usage par l'image";
const CHIPS = ['IA', 'Venture Building', 'Startup'];

const LIB = `const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right}};
 const has=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const posts=()=>[...document.querySelectorAll('#blog-list [data-tag]')];
 const titleOf=p=>(p.querySelector('h3')?.textContent||'').replace(/\\s*→[\\s\\S]*$/,'').trim();
 const byTitle=t=>posts().find(p=>titleOf(p)===t);
 const past=W=>{const bad=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width===0&&r.height===0)continue;if(r.right>W+0.5)bad.push((e.tagName+'.'+(typeof e.className==='string'?e.className:'')).slice(0,50)+' right '+r.right.toFixed(1));}return bad};`;
const state = W => `(()=>{${LIB}const ps=posts(),det=ps.filter(p=>p.tagName==='DETAILS'),art=ps.filter(p=>p.tagName==='ARTICLE'),shown=ps.filter(has);
 return {posts:ps.length,details:det.length,detIA:det.filter(d=>d.dataset.tag==='IA').length,open:det.filter(d=>d.open).length,
  shown:shown.length,shownTags:[...new Set(shown.map(p=>p.dataset.tag))],
  chips:[...document.querySelectorAll('.filters .chip')].map(c=>({t:c.textContent,p:c.getAttribute('aria-pressed')})),
  articles:art.length,wix:art.filter(p=>/^https:\\/\\/sourcinno\\.wixsite\\.com\\/blog\\/post\\//.test(p.querySelector('h3 a')?.href||'')).length,
  wixInDetails:det.filter(d=>d.querySelector('a[href*="wixsite.com"]')).length,past:past(${W})}})()`;
const nth = t => `(()=>{${LIB}const d=byTitle(${JSON.stringify(t)});return d&&d.tagName==='DETAILS'?[...d.parentElement.children].indexOf(d)+1:0})()`;
const article = (t, W) => `(()=>{${LIB}const d=byTitle(${JSON.stringify(t)});if(!d||d.tagName!=='DETAILS')return {missing:true};
 const body=d.querySelector('.blog-body'),blocks=[...body.querySelectorAll(':scope > *, li')],l=body.querySelector('.video-launch'),c=body.querySelector('figcaption a');
 return {open:d.open,active:document.activeElement===d.querySelector('summary'),card:box(d),blocks:blocks.length,blocksShown:blocks.filter(has).length,
  words:body.innerText.trim().split(/\\s+/).length,imgs:[...body.querySelectorAll(':scope > img')].map(i=>({src:new URL(i.currentSrc||i.src).pathname,nat:i.naturalWidth,...box(i)})),
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
  await p.ev('window.__p54=document.activeElement,__p54&&__p54.blur(),scrollTo(0,0),1'); await sleep(300);
  const H = await p.ev('document.documentElement.scrollHeight');
  const { data } = await p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  writeFileSync(join(HERE, name + '.png'), Buffer.from(data, 'base64')); log(`   capture ${name}.png ${W}x${H}`);
  await p.ev('window.__p54&&__p54.focus(),1');
}
const sel = n => `#blog-list > :nth-child(${n}) > summary`;
// Brings the article on screen and waits for its lazy pictures (from Node: also works with scripts off).
async function settle(p, n) { await p.ev(`document.querySelector('#blog-list > :nth-child(${n}) .blog-body').scrollIntoView({block:'center',behavior:'instant'}),1`); await sleep(1200); }
function closed(g, W, js) {
  check(g.posts === 11 && g.details === 6 && g.detIA === 6 && g.open === 0, `posts ${g.posts}: ${g.details} dépliant(s), ${g.detIA} IA, open on load ${g.open}`);
  check(g.articles === 5 && g.wix === 5 && g.wixInDetails === 0, `other posts ${g.articles}, with a Wix post link ${g.wix}; dépliants holding a Wix link ${g.wixInDetails}`);
  check(g.past.length === 0, `closed: elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
  if (js) {
    check(JSON.stringify(g.chips.map(c => c.t)) === JSON.stringify(CHIPS), `chips ${JSON.stringify(g.chips.map(c => c.t))}`);
    check(g.chips.filter(c => c.p === 'true').map(c => c.t).join() === 'IA' && g.shown === 6 && g.shownTags.join() === 'IA', `on load pressed ${JSON.stringify(g.chips.filter(c => c.p === 'true').map(c => c.t))}, shown ${g.shown} ${JSON.stringify(g.shownTags)}`);
  } else {
    check(g.chips.length === 0, `chips ${g.chips.length}`);
    check(g.shown === 11, `posts with a non-zero box ${g.shown} of ${g.posts}`);
  }
}
function text(a, name, W) {
  check(a.open, `« ${name} » open`);
  check(a.blocks > 0 && a.blocksShown === a.blocks, `text blocks with a non-zero box ${a.blocksShown} of ${a.blocks} (${a.words} words on screen)`);
  check(a.past.length === 0, `open: elements past ${W} px: ${a.past.length}${a.past.length ? ' ' + JSON.stringify(a.past.slice(0, 6)) : ''}`);
}

const b = await browser(); const extra = [];
try {
  for (const W of [1200, 375]) {
    const H = W < 861 ? 812 : 900;
    // 1. closed page and chips
    let p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: closed, chips`);
    closed(await p.ev(state(W)), W, true);
    for (const [i, tag, n] of [[2, 'Venture Building', 4], [3, 'Startup', 1]]) {
      const tabs = await p.focus(`.filters .chip:nth-child(${i})`).catch(() => -1); if (tabs < 0) { check(false, `no chip ${i}`); continue; }
      await p.key('Enter'); await sleep(300); const k = await p.ev(state(W));
      check(k.chips.filter(c => c.p === 'true').map(c => c.t).join() === tag && k.shown === n && k.shownTags.join() === tag, `Tab ×${tabs} + Enter on « ${tag} »: shown ${k.shown} ${JSON.stringify(k.shownTags)}`);
    }
    extra.push(...outside(p.requests)); await p.close();
    // 2. articles opened by keyboard
    p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: articles opened by Tab + Enter`);
    for (const [t, name, file] of [[T_CHATGPT, 'ChatGpt une fois', 'chatgpt'], [T_MARCHE, 'marché du travail', 'marche'], [T_CAS, 'cas d\'usage', 'cas-usage']]) {
      const n = await p.ev(nth(t)); if (!n) { check(false, `no dépliant titled « ${t} »`); continue; }
      const tabs = await p.focus(sel(n)); await p.key('Enter'); await sleep(400); await settle(p, n);
      const a = await p.ev(article(t, W));
      log(`   Tab ×${tabs} + Enter on « ${name} » (summary focused: ${a.active})`); text(a, name, W);
      if (t === T_MARCHE) {
        const i = a.imgs[0];
        check(a.imgs.length === 1 && i.src.startsWith('/assets/img/blog/') && i.nat > 0 && i.w > 0 && i.h > 0, `picture ${i?.src} natural ${i?.nat} px, box ${i ? f(i.w) + 'x' + f(i.h) : 'none'}`);
        check(!!i && i.w <= a.card.w + 0.5 && i.x >= a.card.x - 0.5 && i.r <= a.card.r + 0.5, `picture ${i ? f(i.x) + '–' + f(i.r) : ''} inside its card ${f(a.card.x)}–${f(a.card.r)} (card ${f(a.card.w)} wide)`);
      }
      if (t === T_CHATGPT) {
        const l = a.launch, ar = l ? l.h / l.w : 0;
        check(!!l && Math.abs(ar - 0.5625) <= 0.01 && l.x >= a.card.x && l.r <= a.card.r && l.thumb > 0, `launcher ${l ? f(l.w) + 'x' + f(l.h) : 'none'} ratio ${ar.toFixed(4)} inside its card, thumbnail natural ${l?.thumb} px`);
        check(!!l && Math.round(l.play.w) === 38 && Math.round(l.play.h) === 38, `▶ ${l ? f(l.play.w) + 'x' + f(l.play.h) : 'none'}`);
      }
      if (W === 1200 || t === T_MARCHE) await shot(p, W, `publications-${W}-${file}`);
      await p.focus(sel(n)).catch(() => 0); await p.key('Enter'); await sleep(300); // closes it: one article per capture
    }
    // 3. every article open: overflow, pictures (Done When 5)
    const q = await p.ev(pics); // attributes as served, read before openAll switches loading to eager for the load count
    await p.ev(openAll); await sleep(1500); await p.ev('scrollTo(0,0),1');
    const g = await p.ev(state(W)); q.loaded = (await p.ev(pics)).loaded;
    log(`== JS on W=${W}: the six articles open`);
    check(g.open === 6 && g.past.length === 0, `open ${g.open}; elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
    check(q.total === 8 && q.alt === q.total && q.dims === q.total && q.lazy === q.total && q.local === q.total, `img between the markers ${q.total} (${q.total - q.thumbs} pictures, ${q.thumbs} video thumbnails): non-empty alt ${q.alt}, width+height ${q.dims}, loading=lazy ${q.lazy}, src under /assets/img/blog/ ${q.local}`);
    check(q.loaded === q.total, `pictures loaded ${q.loaded} of ${q.total}`);
    extra.push(...outside(p.requests)); await p.close();
  }
  { // 4. first screen, not scrolled, short phone
    const p = await b.page(375, { height: 553 }); await p.go(ROUTE); await sleep(1500); const g = await p.ev(first);
    log(`== JS on 375x553, not scrolled`);
    check(g.scrollY === 0 && g.h2 === 'À lire et à suivre' && g.h2Shown && g.h2Top < g.innerHeight, `h2 « ${g.h2} » shown ${g.h2Shown}, top ${g.h2Top} of ${g.innerHeight}`);
    check(g.cardShown && g.cardTop < g.innerHeight, `first card shown ${g.cardShown}, top ${g.cardTop} of ${g.innerHeight}`);
    extra.push(...outside(p.requests)); await p.close();
  }
  for (const W of [1200, 375]) { // 5. scripts off
    const p = await b.page(W, { nojs: true, height: W < 861 ? 812 : 900 }); await p.go(ROUTE); await sleep(500);
    log(`== JS off W=${W}`);
    closed(await p.ev(state(W)), W, false);
    for (const [t, name] of [[T_MARCHE, 'marché du travail'], [T_CHATGPT, 'ChatGpt une fois']]) {
      const n = await p.ev(nth(t)); if (!n) { check(false, `no dépliant titled « ${t} »`); continue; }
      await p.point(sel(n)); await sleep(300); await settle(p, n);
      const a = await p.ev(article(t, W)); log(`   mouse click on « ${name} »`); text(a, name, W);
      if (t === T_CHATGPT) check(!!a.caption && a.caption.w > 0 && a.caption.h > 0 && a.launch?.display === 'none', `video: caption link box ${a.caption ? f(a.caption.w) + 'x' + f(a.caption.h) : 'none'}, launcher display ${a.launch?.display}`);
    }
    await shot(p, W, `publications-${W}-nojs`);
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
log(`RENDER ${BASE}${ROUTE}: failing checks ${bad}, outside requests ${extra.length}${extra.length ? ' ' + JSON.stringify([...new Set(extra)].slice(0, 10)) : ''}`);
if (!QUIET) writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad || extra.length ? 1 : 0;
