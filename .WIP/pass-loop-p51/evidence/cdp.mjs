// p48 headless Chrome helper: the audit 2026-10-10 cdp.mjs (PLAN § Audit fixes 2026-10-10, evidence root),
// adapted: base URL from P48_BASE (default http://127.0.0.1:4173), outputs next to this file, Chrome profile
// under P48_PROFILES (session scratchpad). Resolver maps every host to NOTFOUND except 127.0.0.1 and Google Fonts.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
export const ROOT = import.meta.dirname;
export const BASE = process.env.P48_BASE || 'http://127.0.0.1:4173';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function browser() {
  const profile = join(process.env.P48_PROFILES || ROOT, 'chrome-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const url = await new Promise((r, j) => { let b = ''; const tm = setTimeout(() => j(Error('chrome timeout ' + b.slice(-300))), 15000); chrome.stderr.on('data', d => { b += d; const m = b.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(tm); r(m[1]); } }); });
  const ws = new WebSocket(url); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let seq = 0; const pending = new Map(), listeners = new Set();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.j(Error(JSON.stringify(m.error))) : p.r(m.result); } } else for (const l of listeners) l(m); };
  const send = (method, params = {}, sessionId) => new Promise((r, j) => { const id = ++seq; pending.set(id, { r, j }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  async function page(width = 1200, { nojs = false, reduce = false, height = 900 } = {}) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p = {}) => send(m, p, sessionId);
    const requests = []; const listener = m => { if (m.sessionId === sessionId && m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url); }; listeners.add(listener);
    for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await s(m);
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 861 });
    await s('Emulation.setTouchEmulationEnabled', { enabled: width < 861 });
    await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] });
    if (nojs) await s('Emulation.setScriptExecutionDisabled', { value: true });
    const ev = async expression => { const x = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !nojs }); if (x.exceptionDetails) throw Error(x.exceptionDetails.exception?.description || x.exceptionDetails.text); return x.result.value; };
    async function go(route) { await s('Page.navigate', { url: BASE + route }); for (let i = 0; i < 70; i++) { await sleep(100); if (await ev('document.readyState==="complete"')) break; } await sleep(350); if (!nojs) await ev('document.fonts.ready.then(()=>1)'); await sleep(nojs ? 600 : 2800); }
    async function key(key, mods = 0) { const codes = { Tab: 9, Enter: 13, ' ': 32 }; await s('Input.dispatchKeyEvent', { type: 'keyDown', key, modifiers: mods, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: codes[key], text: key === ' ' ? ' ' : key === 'Enter' ? '\r' : undefined }); await s('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers: mods, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: codes[key] }); await sleep(30); }
    async function focus(sel) { for (let i = 0; i < 250; i++) { if (await ev(`!!document.activeElement?.matches(${JSON.stringify(sel)})`)) return i; await key('Tab'); } throw Error('Tab did not reach ' + sel); }
    async function point(sel) { await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(320); const p = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,top:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()`); if (!p.top) throw Error('occluded ' + sel); await s('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 }); await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 }); await sleep(320); }
    async function shot(name) { const { data } = await s('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(ROOT, name + '.png'), Buffer.from(data, 'base64')); }
    return { s, ev, go, key, focus, point, shot, requests, width, close: async () => { listeners.delete(listener); await send('Target.closeTarget', { targetId }); } };
  }
  return { page, close: async () => { await send('Browser.close'); ws.close(); } };
}
// Outside requests: anything not 127.0.0.1, Google Fonts, data: or about:.
export const outside = urls => urls.filter(u => !/^(https?:\/\/127\.0\.0\.1(:\d+)?\/|https:\/\/fonts\.(googleapis|gstatic)\.com\/|data:|about:)/.test(u));
