// Pass 84 render proofs (headless Chrome, dependency-free CDP over the global WebSocket).
// Base: the P83 cdp.mjs helper (git show 8a10e59:.WIP/pass-loop-p83/evidence/cdp.mjs), reduced to what this Pass needs.
// Usage: node render.mjs <mode>   modes: sandbox-local | real-local | mapped | nojs | captures
//   sandbox: stats.sourcinno.com resolves to NOTFOUND; its script.js is answered from evidence/umami-script.js
//            (the live bytes read this session); every other stats request (preflight, /api/send) is paused and
//            failed or answered locally: nothing can reach the Umami server.
//   real-local: the real script.js from the network on http://localhost:<LOCAL_PORT>/ (allowed by the prompt);
//            /api/send is still paused and failed if it were ever attempted.
// Env: LOCAL_PORT (default 4184, server bound to 127.0.0.1), MAPPED_PORT (default 80).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const DIR = import.meta.dirname;
const LOCAL_PORT = process.env.LOCAL_PORT || '4184';
const MAPPED_PORT = process.env.MAPPED_PORT || '80';
const PROFILES = process.env.P84_PROFILES || join(DIR, '..', 'profiles');
const SCRIPT = readFileSync(join(DIR, 'umami-script.js'));
const WEBSITE = '40414ae3-7634-4761-a172-3c7a95d705b6';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = [];
const log = (...a) => { const l = a.join(' '); out.push(l); console.log(l); };

async function browser({ sandbox }) {
  mkdirSync(PROFILES, { recursive: true });
  const profile = join(PROFILES, 'chrome-' + Date.now());
  const rules = sandbox
    ? `MAP www.sourcinno.com 127.0.0.1, MAP stats.sourcinno.com ~NOTFOUND, MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com`
    : `MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com, EXCLUDE stats.sourcinno.com`;
  log(`chrome: --host-resolver-rules="${rules}"`);
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-proxy-server', `--host-resolver-rules=${rules}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const url = await new Promise((r, j) => { let b = ''; const tm = setTimeout(() => j(Error('chrome timeout ' + b.slice(-300))), 15000); chrome.stderr.on('data', d => { b += d; const m = b.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(tm); r(m[1]); } }); });
  const ws = new WebSocket(url); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let seq = 0; const pending = new Map(), listeners = new Set();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.j(Error(JSON.stringify(m.error))) : p.r(m.result); } } else for (const l of listeners) l(m); };
  const send = (method, params = {}, sessionId) => new Promise((r, j) => { const id = ++seq; pending.set(id, { r, j }); ws.send(JSON.stringify({ id, method, params, sessionId })); });

  async function page(width = 1200, { nojs = false, height = 900 } = {}) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p = {}) => send(m, p, sessionId);
    const rec = { requests: [], failed: [], setCookie: [], paused: [], sends: [], errors: [] };
    const byId = new Map();
    const listener = async m => {
      if (m.sessionId !== sessionId) return;
      const p = m.params;
      if (m.method === 'Network.requestWillBeSent') { byId.set(p.requestId, p.request.url); rec.requests.push(`${p.request.method} ${p.request.url}${p.type ? ' [' + p.type + ']' : ''}`); if (/\/api\/send/.test(p.request.url) && p.request.method === 'POST') rec.posted = p.request.postData || (p.request.postDataEntries ? 'entries' : null); }
      if (m.method === 'Network.loadingFailed') rec.failed.push(`${byId.get(p.requestId) || p.requestId} ${p.errorText}${p.blockedReason ? ' ' + p.blockedReason : ''}${p.corsErrorStatus ? ' cors=' + JSON.stringify(p.corsErrorStatus) : ''}`);
      if (m.method === 'Network.responseReceived') for (const [k, v] of Object.entries(p.response.headers || {})) if (/^set-cookie$/i.test(k)) rec.setCookie.push(`${p.response.url}: ${v}`);
      if (m.method === 'Network.responseReceivedExtraInfo') for (const [k, v] of Object.entries(p.headers || {})) if (/^set-cookie$/i.test(k)) rec.setCookie.push(`extra ${byId.get(p.requestId) || p.requestId}: ${v}`);
      if (m.method === 'Runtime.exceptionThrown') rec.errors.push((p.exceptionDetails.exception?.description || p.exceptionDetails.text || '').split('\n')[0]);
      if (m.method === 'Fetch.requestPaused') {
        const r = p.request; const id = p.requestId;
        rec.paused.push(`${r.method} ${r.url}${r.method === 'OPTIONS' ? ' headers=' + JSON.stringify(r.headers) : ''}`);
        try {
          if (/\/script\.js(\?|$)/.test(new URL(r.url).pathname) && sandbox) {
            await s('Fetch.fulfillRequest', { requestId: id, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript; charset=UTF-8' }, { name: 'Access-Control-Allow-Origin', value: '*' }], body: SCRIPT.toString('base64') });
          } else if (r.method === 'OPTIONS') {
            // A CORS preflight, if Chrome hands it over: answered here, never sent.
            await s('Fetch.fulfillRequest', { requestId: id, responseCode: 204, responseHeaders: [{ name: 'Access-Control-Allow-Origin', value: r.headers.Origin || r.headers.origin || '*' }, { name: 'Access-Control-Allow-Methods', value: 'POST' }, { name: 'Access-Control-Allow-Headers', value: r.headers['Access-Control-Request-Headers'] || 'content-type' }] });
          } else if (/\/api\/send/.test(r.url)) {
            rec.sends.push({ method: r.method, url: r.url, postData: r.postData || null });
            await s('Fetch.failRequest', { requestId: id, errorReason: 'BlockedByClient' });
          } else {
            await s('Fetch.continueRequest', { requestId: id });
          }
        } catch (e) { rec.errors.push('fetch handler: ' + e.message); }
      }
    };
    listeners.add(listener);
    for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await s(m);
    await s('Fetch.enable', { patterns: [{ urlPattern: '*stats.sourcinno.com/*', requestStage: 'Request' }] });
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 861 });
    await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    if (nojs) await s('Emulation.setScriptExecutionDisabled', { value: true });
    const ev = async expression => { const x = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !nojs }); if (x.exceptionDetails) throw Error(x.exceptionDetails.exception?.description || x.exceptionDetails.text); return x.result.value; };
    const go = async (u, wait = 4000) => { const loaded = new Promise(r => { const l = m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') { listeners.delete(l); r(); } }; listeners.add(l); }); await s('Page.navigate', { url: u }); await Promise.race([loaded, sleep(15000)]); await sleep(wait); };
    return { s, ev, go, rec, close: async () => { listeners.delete(listener); await send('Target.closeTarget', { targetId }); } };
  }
  return { page, send, close: async () => { try { await send('Browser.close'); } catch {} ws.close(); } };
}

function report(label, p, extra = {}) {
  const r = p.rec;
  const stats = r.requests.filter(u => u.includes('stats.sourcinno.com'));
  log(`--- ${label}`);
  log(`requests to stats host: ${stats.length}${stats.length ? ' : ' + stats.join(' | ') : ''}`);
  log(`script.js requests: ${stats.filter(u => /\/script\.js/.test(u)).length}; /api/send in network log: ${r.requests.filter(u => u.includes('/api/send')).length}; paused: ${r.paused.length ? r.paused.join(' | ') : 'none'}`);
  log(`send attempts caught: ${r.sends.length}`);
  for (const x of r.sends) log(`  ${x.method} ${x.url} -> failed (BlockedByClient); body: ${x.postData}`);
  log(`failed loads: ${r.failed.length ? r.failed.join(' | ') : 'none'}`);
  log(`Set-Cookie headers seen: ${r.setCookie.length ? r.setCookie.join(' | ') : 'none'}`);
  log(`script errors: ${r.errors.length ? r.errors.join(' | ') : 'none'}`);
  for (const [k, v] of Object.entries(extra)) log(`${k}: ${v}`);
}

const mode = process.argv[2];
log(`# render ${mode} ${new Date().toISOString()} ; umami-script.js sha256 ${createHash('sha256').update(SCRIPT).digest('hex').slice(0, 16)}, ${SCRIPT.length} bytes`);

if (mode === 'sandbox-local' || mode === 'real-local' || mode === 'mapped') {
  const sandbox = mode !== 'real-local';
  const b = await browser({ sandbox });
  const base = mode === 'mapped' ? `http://www.sourcinno.com${MAPPED_PORT === '80' ? '' : ':' + MAPPED_PORT}/` : `http://localhost:${LOCAL_PORT}/`;
  for (const path of ['', 'politique-confidentialite/']) {
    const p = await b.page(1200);
    await p.go(base + path);
    const st = await p.ev(`({ host: location.host, cookie: JSON.stringify(document.cookie), ls: (()=>{try{return localStorage.length}catch(e){return 'error '+e.message}})(), ss: (()=>{try{return sessionStorage.length}catch(e){return 'error '+e.message}})(), tag: !!document.querySelector('footer.site-footer > script[src="https://stats.sourcinno.com/script.js"][data-website-id="${WEBSITE}"][data-domains="www.sourcinno.com"][data-do-not-track="true"]'), umami: typeof window.umami, dnt: String(navigator.doNotTrack) })`);
    const { cookies } = await p.s('Network.getAllCookies');
    report(`${mode} ${base}${path}`, p, { 'location.host': st.host, 'document.cookie': st.cookie, 'localStorage.length': st.ls, 'sessionStorage.length': st.ss, 'tag in footer (all 4 attributes)': st.tag, 'window.umami': st.umami, 'navigator.doNotTrack': st.dnt, 'browser cookie jar (all hosts)': cookies.length ? cookies.map(c => c.domain + ' ' + c.name).join(', ') : 'empty' });
    for (const x of p.rec.sends) { try { const j = JSON.parse(x.postData); log(`  payload.website = ${j.payload.website} (expected ${WEBSITE}: ${j.payload.website === WEBSITE}), hostname = ${j.payload.hostname}, url = ${j.payload.url}, type = ${j.type}`); } catch (e) { log('  payload unreadable: ' + e.message); } }
    await p.close();
  }
  await b.close();
}

if (mode === 'nojs') {
  const b = await browser({ sandbox: true });
  for (const base of [`http://localhost:${LOCAL_PORT}/`, `http://www.sourcinno.com${MAPPED_PORT === '80' ? '' : ':' + MAPPED_PORT}/`]) {
    const p = await b.page(375, { nojs: true });
    await p.go(base, 3000);
    const st = await p.ev(`({ host: location.host, tag: document.querySelectorAll('footer.site-footer > script[src="https://stats.sourcinno.com/script.js"]').length, cookie: JSON.stringify(document.cookie) })`);
    report(`nojs ${base}`, p, { 'location.host': st.host, 'tag elements in footer': st.tag, 'document.cookie': st.cookie });
    await p.close();
  }
  await b.close();
}

if (mode === 'captures') {
  const b = await browser({ sandbox: true });
  for (const w of [1200, 375]) {
    const p = await b.page(w, { height: w === 375 ? 812 : 900 });
    await p.go(`http://localhost:${LOCAL_PORT}/politique-confidentialite/`, 3000);
    await p.ev(`(async()=>{ for (let y=0; y<document.documentElement.scrollHeight; y+=400){ scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } scrollTo(0,0); await document.fonts.ready; await new Promise(r=>setTimeout(r,800)); })()`);
    const info = await p.ev(`({ h: document.documentElement.scrollHeight, inter: document.fonts.check('16px Inter'), h1font: getComputedStyle(document.querySelector('h1')).fontFamily, over: [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && r.right > ${w} + 0.5}).map(e=>e.tagName+'.'+e.className).slice(0,10), reveal: [...document.querySelectorAll('.reveal')].map(e=>getComputedStyle(e).opacity).join(',') })`);
    log(`--- capture ${w}: height ${info.h}, Inter loaded ${info.inter}, h1 font ${info.h1font}, elements past ${w}px: ${info.over.length ? info.over.join(' ') : 'none'}, .reveal opacity ${info.reveal}`);
    const tiles = [];
    for (let y = 0; y < info.h; y += 2500) {
      const h = Math.min(2500, info.h - y);
      const shot = await Promise.race([p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: w, height: h, scale: 1 } }), sleep(30000).then(() => null)]);
      if (!shot) { log(`tile y=${y} timed out`); break; }
      const f = join(DIR, `privacy-${w}-tile${tiles.length}.png`); writeFileSync(f, Buffer.from(shot.data, 'base64')); tiles.push(f);
    }
    log(`tiles ${w}: ${tiles.length}`);
    await p.close();
  }
  await b.close();
}

writeFileSync(join(DIR, `render-${mode}.txt`), out.join('\n') + '\n');
process.exit(0);
