// p58 Done When 4–6: /publications/ rendered in headless Chrome, JavaScript on and off. Copied from
// .WIP/pass-loop-p57/evidence/render.mjs and retargeted on « Startup Studios: Corporate vs Pure players » and its table.
// cdp.mjs = P51 helper (resolver NOTFOUND for every host except 127.0.0.1 and Google Fonts, reduced motion set explicitly).
// JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow = every element's right edge against the
// emulated width (P34 Gotcha), not scrollWidth. Keyboard = Tab to the element, then Enter through Input.dispatchKeyEvent.
// The post is hidden until the « Venture Building » chip is pressed: the chip is pressed (Tab + Enter) first.
// Pictures are loading="lazy" in a closed dépliant: once open, the script scrolls through the article and waits
// for every picture before measuring or capturing. No video launcher is ever clicked.
// Table: every th/td box is read. From 641 px: three columns. Below: stacked rows; the column title above each cell
// is generated text (no box): read with getComputedStyle(cell, '::before').content and compared with the column title.
// Captures (the owner's three): 1200 px full page; 375 px from the top of the blog block to the end of the open
// article, once as built (stacked) and once with a COMPARISON style injected here only (sideways-scrolling frame).
// A capture is refused when the title font is not Inter (AGENTS Gotcha: a capture can come out without the site font).
// P58_NO_LOG=1 (red run on a scratch copy): keeps neither captures nor render.txt.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=http://127.0.0.1:4174] node .WIP/pass-loop-p58/evidence/render.mjs
import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser, BASE, outside, sleep } from '../../pass-loop-p51/evidence/cdp.mjs';
const TILE = 2500;
const HERE = import.meta.dirname, ROUTE = '/publications/', QUIET = !!process.env.P58_NO_LOG;
const TITLE = 'Startup Studios: Corporate vs Pure players', NAME = 'Startup Studios';
const CHIPS = ['IA', 'Venture Building', 'Startup'];
const WORDS = 773, HEAD_WORDS = 9; // fidelity.mjs count; the 9 words of the two column titles are generated text on a phone
const COLS = ['Studios CORPORATE ("Corporate Venture Building", CVB)', 'Studios PURE PLAYER'];
const ROWS = ['Acteur type', 'Enjeu', 'Approche', 'Avantages', 'Défis'];
// Comparison only, never in the tree: the same table kept in three columns inside a frame that scrolls sideways.
const SCROLL_CSS = `@media (max-width: 640px) {
 #blog-list .blog-body table { display: block; overflow-x: auto; background: none; }
 #blog-list .blog-body tbody { display: table; width: 100%; min-width: 670px; table-layout: fixed; border-collapse: collapse; background: var(--white); }
 #blog-list .blog-body tr, #blog-list .blog-body tr:has(> th[scope="col"]) { display: table-row; margin: 0; border: 0; border-radius: 0; }
 #blog-list .blog-body th, #blog-list .blog-body td { display: table-cell; border: 1px solid var(--grey-300); }
 #blog-list .blog-body tr > :first-child { width: 7.5rem; }
 #blog-list .blog-body td[data-label]::before { content: none; }
}`;

const LIB = `const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height,r:r.right}};
 const has=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const flat=s=>s.replace(/\\s+/g,' ').trim();
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
 const body=d.querySelector('.blog-body'),blocks=[...body.querySelectorAll(':scope > :not(table), li, td > p, th')].filter(e=>!e.closest('tr')||getComputedStyle(e.closest('tr')).display!=='none'),tb=body.querySelector('table');
 const cell=c=>{const st=getComputedStyle(c,'::before'),f=c.firstElementChild;return {tag:c.tagName,scope:c.getAttribute('scope'),label:c.getAttribute('data-label'),text:flat(c.textContent).slice(0,40),shown:has(c),
   before:st.content,beforeDisplay:st.display,firstTop:f?f.getBoundingClientRect().top+scrollY:null,...box(c)}};
 return {open:d.open,active:document.activeElement===d.querySelector('summary'),card:box(d),blocks:blocks.length,blocksShown:blocks.filter(has).length,
  words:body.innerText.trim().split(/\\s+/).length,imgs:[...body.querySelectorAll(':scope > img')].map(i=>({src:new URL(i.currentSrc||i.src).pathname,nat:i.naturalWidth,done:i.complete,...box(i)})),
  links:[...body.querySelectorAll('a')].length,tables:body.querySelectorAll('table').length,
  table:tb&&{...box(tb),display:getComputedStyle(tb).display,scrollW:tb.scrollWidth,clientW:tb.clientWidth,rows:[...tb.querySelectorAll('tr')].map(r=>[...r.children].map(cell))},
  font:document.fonts.check('700 20px Inter'),h3Font:getComputedStyle(d.querySelector('h3')).fontFamily.split(',')[0],blogTop:document.querySelector('#blog').getBoundingClientRect().top+scrollY,past:past(${W})}})()`;
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
const f = n => n.toFixed(1), near = (a, b) => Math.abs(a - b) <= 1;
// Captures the page from y0 to y1 (default: the whole page) in tiles of 2500 px stacked by stitch.py: a single capture
// of 6000 px or more never answers here (P57 capture-probe.mjs).
async function shot(p, W, name, y0 = 0, y1 = null) {
  if (QUIET) return;
  // The keyboard focus ring is taken off for the picture (the owner judges the article, not the ring), then put back.
  await p.ev('window.__p58=document.activeElement,__p58&&__p58.blur(),scrollTo(0,0),1'); await sleep(300);
  const H = y1 ?? await p.ev('document.documentElement.scrollHeight'), parts = [];
  for (let y = Math.round(y0); y < H; y += TILE) {
    const got = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: Math.min(TILE, H - y), scale: 1 } }), sleep(30000).then(() => null)]);
    if (!got) throw Error(`capture ${name}: no answer in 30 s for the tile at ${y}`);
    const part = join(HERE, `${name}.tile${parts.length}.png`); writeFileSync(part, Buffer.from(got.data, 'base64')); parts.push(part);
  }
  const st = spawnSync('python', [join(HERE, 'stitch.py'), join(HERE, name + '.png'), ...parts], { encoding: 'utf8' });
  for (const part of parts) rmSync(part);
  if (st.status !== 0) throw Error(`stitch ${name}: ${st.stderr}`);
  log(`   capture ${name}.png, page y ${Math.round(y0)}–${Math.round(H)} (${st.stdout.trim()})`);
  await p.ev('window.__p58&&__p58.focus(),1');
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
  check(g.posts === 11 && g.details === 11 && g.detIA === 6 && g.detVB === 4 && g.detSU === 1 && g.open === 0, `posts ${g.posts}: ${g.details} dépliant(s) (IA ${g.detIA}, Venture Building ${g.detVB}, Startup ${g.detSU}), open on load ${g.open}`);
  check(g.articles === 0 && g.wix === 0 && g.wixInDetails === 0, `cards that are not dépliants ${g.articles}, with a Wix post link ${g.wix}; dépliants holding a Wix link ${g.wixInDetails}`);
  check(g.past.length === 0, `closed: elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
  if (js) {
    check(JSON.stringify(g.chips.map(c => c.t)) === JSON.stringify(CHIPS), `chips ${JSON.stringify(g.chips.map(c => c.t))}`);
    check(g.chips.filter(c => c.p === 'true').map(c => c.t).join() === 'IA' && g.shown === 6 && g.shownTags.join() === 'IA', `on load pressed ${JSON.stringify(g.chips.filter(c => c.p === 'true').map(c => c.t))}, shown ${g.shown} ${JSON.stringify(g.shownTags)}`);
  } else {
    check(g.chips.length === 0, `chips ${g.chips.length}`);
    check(g.shown === 11, `posts with a non-zero box ${g.shown} of ${g.posts}`);
  }
}
// The open article: text, picture, table (three columns from 641 px, stacked rows below).
function opened(a, W) {
  const stacked = W < 641, want = WORDS - (stacked ? HEAD_WORDS : 0);
  check(a.open, `« ${NAME} » open`);
  check(a.blocks > 0 && a.blocksShown === a.blocks && a.words >= want, `text blocks with a non-zero box ${a.blocksShown} of ${a.blocks}; ${a.words} words on screen (article ${WORDS}${stacked ? `, less the ${HEAD_WORDS} words of the column titles, shown as generated text` : ''})`);
  check(a.links === 0, `links inside the article ${a.links} (the 5 old sourcinno.com links are gone, their words stay)`);
  const i = a.imgs[0];
  check(a.imgs.length === 1 && i.src.startsWith('/assets/img/blog/') && i.done && i.nat > 0 && i.w > 0 && i.h > 0 && i.w <= a.card.w + 0.5 && i.x >= a.card.x - 0.5 && i.r <= a.card.r + 0.5, `picture ${i?.src} natural ${i?.nat} px, box ${i ? f(i.w) + 'x' + f(i.h) : 'none'} inside a ${f(a.card.w)} card`);
  const t = a.table;
  if (!t || a.tables !== 1) { check(false, `tables in the article ${a.tables}`); return; }
  const rows = t.rows, cells = rows.flat(), inCard = c => c.x >= a.card.x - 0.5 && c.r <= a.card.r + 0.5;
  check(rows.length === 6 && rows.every(r => r.length === 3), `table ${f(t.w)}x${f(t.h)} (display ${t.display}): ${rows.length} rows of ${[...new Set(rows.map(r => r.length))].join('/')} cells`);
  if (rows.length !== 6 || !rows.every(r => r.length === 3)) return;
  const head = rows[0], colT = [head[1], head[2]], rowT = rows.slice(1).map(r => r[0]), data = rows.slice(1).flatMap(r => [r[1], r[2]]);
  check(colT.every((c, k) => c.tag === 'TH' && c.scope === 'col' && c.text === COLS[k].slice(0, 40)) && rowT.every((c, k) => c.tag === 'TH' && c.scope === 'row' && c.text === ROWS[k]) && head[0].tag === 'TD' && head[0].text === '', `header cells: column titles ${JSON.stringify(colT.map(c => c.text))}, row titles ${JSON.stringify(rowT.map(c => c.text))}, corner « ${head[0].text} »`);
  check(data.every((c, k) => c.tag === 'TD' && c.label === COLS[k % 2]), `the 10 other cells carry the title of their column (data-label): ${data.filter((c, k) => c.label === COLS[k % 2]).length} of ${data.length}`);
  if (!stacked) {
    check(cells.every(c => c.shown) && cells.every(inCard), `three columns: cell boxes shown ${cells.filter(c => c.shown).length} of 18, inside the card (${f(a.card.x)}–${f(a.card.r)}) ${cells.filter(inCard).length} of 18`);
    check(near(colT[0].y, colT[1].y) && near(colT[0].h, colT[1].h) && colT[1].x >= colT[0].r - 1, `both column titles on one line of boxes: tops ${f(colT[0].y)} / ${f(colT[1].y)}, heights ${f(colT[0].h)} / ${f(colT[1].h)}, lefts ${f(colT[0].x)} / ${f(colT[1].x)}`);
    check(rowT.every(c => near(c.x, head[0].x) && c.r <= colT[0].x + 1) && rowT.every((c, k) => k === 0 || c.y >= rowT[k - 1].y + rowT[k - 1].h - 1), `the five row titles in the first column, one under the other: lefts ${JSON.stringify([...new Set(rowT.map(c => f(c.x)))])}, first column ${f(head[0].w)} wide`);
    check(rows.slice(1).every(r => near(r[1].x, colT[0].x) && near(r[2].x, colT[1].x) && near(r[0].y, r[1].y) && near(r[1].y, r[2].y)), `each row: its two cells under their column title, beside their row title (columns ${f(head[0].w)} / ${f(colT[0].w)} / ${f(colT[1].w)})`);
    check(data.every(c => c.before === 'none'), `no generated column title in a cell: ${data.filter(c => c.before === 'none').length} of 10`);
  } else {
    const hidden = head.filter(c => !c.shown), others = rows.slice(1).flat();
    check(hidden.length === 3, `row of column titles not shown (its titles are repeated above each cell): ${hidden.length} of 3 boxes empty`);
    check(others.every(c => c.shown) && others.every(inCard), `stacked: cell boxes shown ${others.filter(c => c.shown).length} of 15, inside the card (${f(a.card.x)}–${f(a.card.r)}) ${others.filter(inCard).length} of 15; widths ${JSON.stringify([...new Set(others.map(c => f(c.w)))])}`);
    const order = rows.slice(1).filter(r => near(r[0].x, r[1].x) && near(r[1].x, r[2].x) && r[0].y + r[0].h <= r[1].y + 0.5 && r[1].y + r[1].h <= r[2].y + 0.5);
    check(order.length === 5, `each row title once, above its two cells, one under the other: ${order.length} of 5 rows`);
    const labelled = data.filter((c, k) => { try { return JSON.parse(c.before) === COLS[k % 2] && c.beforeDisplay === 'block' && c.firstTop - c.y >= 25; } catch { return false; } });
    check(labelled.length === 10, `column title generated above the text of its cell (::before content = the column title, a block, first text ${JSON.stringify([...new Set(data.map(c => f(c.firstTop - c.y)))])} px under the top of the cell): ${labelled.length} of 10`);
    if (labelled.length !== 10) log(`        ::before read: ${JSON.stringify(data.slice(0, 2).map(c => [c.before, c.beforeDisplay]))}`);
  }
  check(a.past.length === 0, `open: elements past ${W} px: ${a.past.length}${a.past.length ? ' ' + JSON.stringify(a.past.slice(0, 6)) : ''}`);
}
// Presses a chip with the keyboard and checks what it shows.
async function chip(p, W, i, tag, n) {
  const tabs = await p.focus(`.filters .chip:nth-child(${i})`).catch(() => -1); if (tabs < 0) { check(false, `no chip ${i}`); return false; }
  await p.key('Enter'); await sleep(300); const k = await p.ev(state(W));
  check(k.chips.filter(c => c.p === 'true').map(c => c.t).join() === tag && k.shown === n && k.shownTags.join() === tag, `Tab ×${tabs} + Enter on « ${tag} »: shown ${k.shown} ${JSON.stringify(k.shownTags)}`);
  check(k.shownDetails === n && k.shownOpen === 0 && k.shownWix === 0, `under « ${tag} »: ${k.shownDetails} dépliant(s), open ${k.shownOpen}, card(s) with a Wix post link ${k.shownWix}`);
  return true;
}

const b = await browser(); const extra = [];
try {
  for (const W of [1200, 375, 320]) {
    const H = W < 861 ? 812 : 900;
    // 1. closed page and chips
    let p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: closed, chips`);
    closed(await p.ev(state(W)), W, true);
    await chip(p, W, 2, 'Venture Building', 4);
    await chip(p, W, 3, 'Startup', 1);
    extra.push(...outside(p.requests)); await p.close();
    // 2. the article opened by keyboard under its chip
    p = await b.page(W, { height: H }); await p.go(ROUTE);
    log(`== JS on W=${W}: chip « Venture Building », « ${NAME} » opened by Tab + Enter`);
    if (await chip(p, W, 2, 'Venture Building', 4)) {
      const n = await p.ev(nth(TITLE));
      if (!n) check(false, `no dépliant titled « ${TITLE} »`);
      else {
        const tabs = await p.focus(sel(n)); await p.key('Enter'); await sleep(400); await walk(p, n);
        const a = await p.ev(article(TITLE, W));
        log(`   Tab ×${tabs} + Enter on its summary (summary focused: ${a.active})`); opened(a, W);
        check(a.font && /Inter/.test(a.h3Font), `title font ${a.h3Font}, Inter loaded: ${a.font}`);
        const end = a.card.y + a.card.h + 24;
        if (W === 1200) await shot(p, W, 'publications-1200-startup-studios');
        if (W === 375) {
          await shot(p, W, 'publications-375-startup-studios', a.blogTop - 16, end);
          // comparison capture: style injected for this picture only, then removed
          await p.ev(`(()=>{const s=document.createElement('style');s.id='p58-scroll';s.textContent=${JSON.stringify(SCROLL_CSS)};document.head.append(s);return 1})()`); await sleep(400);
          const c = await p.ev(article(TITLE, W));
          log(`   comparison style injected (not in the tree): table ${f(c.table.w)} wide in a ${f(c.card.w)} card, its content ${c.table.scrollW} px (scrolls sideways: ${c.table.scrollW > c.table.clientW}), elements past ${W} px: ${c.past.length} (the cells inside the frame count: they are reached by sliding)`);
          await shot(p, W, 'publications-375-startup-studios-scroll', c.blogTop - 16, c.card.y + c.card.h + 24);
          await p.ev(`document.getElementById('p58-scroll').remove(),1`); await sleep(300);
          const back = await p.ev(article(TITLE, W));
          check(back.past.length === 0 && near(back.card.h, a.card.h), `comparison style removed: card ${f(back.card.h)} high (${f(a.card.h)} before), elements past ${W} px: ${back.past.length}`);
        }
      }
    }
    // 3. every article open, one chip at a time (a post of another tag has no box): overflow, then pictures (Done When 6)
    const q = await p.ev(pics); // attributes as served, read before openAll switches loading to eager for the load count
    await p.ev(openAll); await sleep(2500);
    log(`== JS on W=${W}: every article open, chip by chip`);
    for (const [i, tag, n] of [[1, 'IA', 6], [2, 'Venture Building', 4], [3, 'Startup', 1]]) {
      await p.ev(`document.querySelector('.filters .chip:nth-child(${i})').click(),scrollTo(0,0),1`); await sleep(500);
      const g = await p.ev(state(W));
      check(g.shownOpen === n && g.past.length === 0, `« ${tag} »: open and shown ${g.shownOpen}; elements past ${W} px: ${g.past.length}${g.past.length ? ' ' + JSON.stringify(g.past.slice(0, 6)) : ''}`);
    }
    q.loaded = (await p.ev(pics)).loaded;
    check(q.total === 30 && q.thumbs === 4 && q.alt === q.total && q.dims === q.total && q.lazy === q.total && q.local === q.total, `img between the markers ${q.total} (${q.total - q.thumbs} pictures, ${q.thumbs} video thumbnails): non-empty alt ${q.alt}, width+height ${q.dims}, loading=lazy ${q.lazy}, src under /assets/img/blog/ ${q.local}`);
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
    const n = await p.ev(nth(TITLE));
    if (!n) check(false, `no dépliant titled « ${TITLE} »`);
    else { await p.point(sel(n)); await sleep(300); await walk(p, n); log(`   mouse click on its summary`); opened(await p.ev(article(TITLE, W)), W); }
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
log(`RENDER ${BASE}${ROUTE}: failing checks ${bad}, outside requests ${extra.length}${extra.length ? ' ' + JSON.stringify([...new Set(extra)].slice(0, 10)) : ''}`);
if (!QUIET) writeFileSync(join(HERE, 'render.txt'), out.join('\n') + '\n');
process.exitCode = bad || extra.length ? 1 : 0;
