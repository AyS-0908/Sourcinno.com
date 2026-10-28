// p56 headless Chrome helper: the P51 cdp.mjs (.WIP/pass-loop-p51/evidence/cdp.mjs) plus two things:
//  - page(width, { touch }) turns touch emulation on at any width (default: under 861 px, as before);
//  - page.errors collects Runtime.exceptionThrown (script errors of the page).
// Base URL from P48_BASE (default http://127.0.0.1:4173), Chrome profile under P48_PROFILES (session scratchpad).
// Resolver maps every host to NOTFOUND except 127.0.0.1 and Google Fonts.
import { spawn } from 'node:child_process';
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
  async function page(width = 1200, { nojs = false, reduce = false, height = 900, touch = width < 861 } = {}) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p = {}) => send(m, p, sessionId);
    const requests = [], errors = [];
    const listener = m => {
      if (m.sessionId !== sessionId) return;
      if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
      if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push(((d.exception && d.exception.description) || d.text || 'exception').split('\n')[0] + ' @' + (d.url || '').replace(/^https?:\/\/[^/]+/, '') + ':' + d.lineNumber); }
    };
    listeners.add(listener);
    for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await s(m);
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 861 });
    await s('Emulation.setTouchEmulationEnabled', { enabled: touch });
    await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] });
    if (nojs) await s('Emulation.setScriptExecutionDisabled', { value: true });
    // Scripts disabled: page timers are stopped too, so every evaluate is synchronous and waits happen in Node (P30 Gotcha).
    const ev = async expression => { const x = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !nojs }); if (x.exceptionDetails) throw Error(x.exceptionDetails.exception?.description || x.exceptionDetails.text); return x.result.value; };
    async function key(key, mods = 0) { const codes = { Tab: 9, Enter: 13 }; await s('Input.dispatchKeyEvent', { type: 'keyDown', key, modifiers: mods, code: key, windowsVirtualKeyCode: codes[key], text: key === 'Enter' ? '\r' : undefined }); await s('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers: mods, code: key, windowsVirtualKeyCode: codes[key] }); await sleep(40); }
    return { s, ev, key, requests, errors, width, height, nojs, touch, close: async () => { listeners.delete(listener); await send('Target.closeTarget', { targetId }); } };
  }
  return { page, close: async () => { await send('Browser.close'); ws.close(); } };
}
