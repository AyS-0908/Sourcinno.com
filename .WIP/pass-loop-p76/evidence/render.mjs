// Coder P76 fix A-001: Publications rendered HEAD (4173) vs 6244769 export (4174); open() copied from the auditor contrast.mjs.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SCR = process.argv[2];
const BASE = "http://127.0.0.1:4173";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = join(SCR, "chrome-" + Date.now());
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--no-proxy-server",
  "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com",
  "about:blank"], { stdio: "ignore" });
let port, path;
for (let i = 0; i < 200; i++) {
  const f = join(profile, "DevToolsActivePort");
  if (existsSync(f)) { const [p, w] = readFileSync(f, "utf8").split("\n"); if (p && w) { port = p.trim(); path = w.trim(); break; } }
  await sleep(100);
}
if (!port) { console.error("chrome timeout"); proc.kill(); process.exit(2); }
const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const listeners = new Set();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  else listeners.forEach((f) => f(m));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const evalIn = async (s, expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: false }, s); if (r.exceptionDetails) return { evalError: r.exceptionDetails.exception?.description || r.exceptionDetails.text }; return r.result.value; };
const key = async (s, k, code, vk) => {
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk }, s);
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk }, s);
};

async function open(url, width, height, js) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await send("Target.attachToTarget", { targetId, flatten: true });
  const ev = { exceptions: [], console: [], requests: [], bad: [] };
  const h = (m) => {
    if (m.sessionId !== s) return;
    if (m.method === "Runtime.exceptionThrown") ev.exceptions.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && /error|warn/.test(m.params.type)) ev.console.push(m.params.type + ": " + m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") ev.console.push("log: " + m.params.entry.text + " " + (m.params.entry.url || ""));
    if (m.method === "Network.requestWillBeSent") ev.requests.push(m.params.request.url);
    if (m.method === "Network.responseReceived" && m.params.response.status >= 400) ev.bad.push(m.params.response.status + " " + m.params.response.url);
  };
  listeners.add(h);
  for (const d of ["Runtime", "Log", "Network", "Page"]) await send(d + ".enable", {}, s);
  await send("Network.setCacheDisabled", { cacheDisabled: true }, s);
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 }, s);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] }, s);
  if (!js) await send("Emulation.setScriptExecutionDisabled", { value: true }, s);
  const loaded = new Promise((r) => { const f = (m) => { if (m.sessionId === s && m.method === "Page.loadEventFired") { listeners.delete(f); r(); } }; listeners.add(f); });
  await send("Page.navigate", { url }, s);
  await Promise.race([loaded, sleep(20000)]);
  await sleep(1500);
  return { s, targetId, ev, close: async () => { listeners.delete(h); await send("Target.closeTarget", { targetId }); } };
}

const SNAP = `(() => {
  const hash = (t) => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36); };
  const out = [];
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e); const props = [];
    for (let i = 0; i < cs.length; i++) { const n = cs[i]; if (!n.startsWith('--')) props.push(n); }
    props.sort();
    const all = props.map((n) => n + ':' + cs.getPropertyValue(n)).join(';');
    const noOp = props.filter((n) => n !== 'opacity').map((n) => n + ':' + cs.getPropertyValue(n)).join(';');
    const rects = e.getClientRects(); const b = e.getBoundingClientRect();
    out.push([e.tagName + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).join('.') : ''),
      rects.length ? [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)].join(',') : 'no box', hash(all), hash(noOp), cs.opacity]);
  }
  return { n: out.length, h: document.documentElement.scrollHeight, fontsOk: document.fonts.check('16px Inter'), out };
})()`;
const META = `(() => { const e = document.querySelector('#blog-list .card__meta'); if (!e) return null; let o = 1; for (let p = e; p; p = p.parentElement) o *= parseFloat(getComputedStyle(p).opacity); return { opacity: getComputedStyle(e).opacity, effective: o, color: getComputedStyle(e).color, count: document.querySelectorAll('#blog-list .card__meta').length }; })()`;
let fails = 0;
for (const [w, h] of [[1200, 900], [375, 812]]) for (const js of [true, false]) {
  const snaps = [];
  for (const base of ["http://127.0.0.1:4173", "http://127.0.0.1:4174"]) {
    console.error(`load ${base} ${w} ${js}`); const t = await open(base + "/publications/", w, h, js);
    if (js) { await evalIn(t.s, "document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-visible'))"); await sleep(1500); }
    const s = await evalIn(t.s, SNAP); s.meta = await evalIn(t.s, META); s.ev = t.ev; snaps.push(s); await t.close();
  }
  const [a, b] = snaps; const diffs = [];
  if (a.n !== b.n) diffs.push(`element count ${a.n} vs ${b.n}`);
  for (let i = 0; i < Math.min(a.n, b.n); i++) {
    const x = a.out[i], y = b.out[i];
    if (x[0] !== y[0]) { diffs.push(`#${i} tag ${x[0]} vs ${y[0]}`); continue; }
    if (x[1] !== y[1]) diffs.push(`#${i} ${x[0]} box: ${x[1]} vs ${y[1]}`);
    if (x[3] !== y[3]) diffs.push(`#${i} ${x[0]} style-other-than-opacity: differs`);
    else if (x[2] !== y[2]) diffs.push(`#${i} ${x[0]} opacity: ${x[4]} (HEAD) vs ${y[4]} (6244769)`);
  }
  const props = {}; for (const d of diffs) { const m = d.match(/^#\d+ (\S+) ([a-z-]+): /); const k = m ? m[1] + ' ' + m[2] : d; props[k] = (props[k] || 0) + 1; }
  const unexpected = Object.keys(props).filter((k) => !/card__meta opacity$/.test(k));
  const errs = [...a.ev.exceptions, ...b.ev.exceptions, ...a.ev.bad, ...b.ev.bad];
  if (unexpected.length || errs.length || !a.fontsOk) fails++;
  console.log(`${w}px js=${js ? 'on' : 'off'}: elements ${a.n}/${b.n}, height ${a.h}/${b.h}, Inter ${a.fontsOk}/${b.fontsOk}, errors ${errs.length}; diffs ${JSON.stringify(props)}; unexpected ${unexpected.length}; HEAD meta ${JSON.stringify(a.meta)}; base meta ${JSON.stringify(b.meta)}`);
}
console.log(fails ? `FAIL ${fails} of 4` : "PASS 4 of 4");
ws.close(); proc.kill();
