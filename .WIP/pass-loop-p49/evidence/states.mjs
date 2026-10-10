// p49 states the computed-style comparer does not see (PLAN § 49 Done When 4). Headless Chrome, no dependency.
// Base: .WIP/pass-loop-p40/evidence/computed.mjs (launch, resolver blocks, CDP helper). Both trees at 375 px,
// prefers-reduced-motion: reduce emulated (transitions settle at once). Real input events only:
//  1. `/`: mouse click on the first `.disclosure--card summary` -> the opened card;
//  2. `/portfolio/`: mouse click on the first `.portfolio-details > summary` -> its `.portfolio-card` and summary;
//  3. `/portfolio/`: Tab key presses until `#portfolio-query` has focus, then typed « agent » key by key.
// Reads background, border, radius, outline and box-shadow longhands of each element on A and B and lists differences.
// usage: node states.mjs <out.json> <profile-dir> <base-url-A> <base-url-B>
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [OUT, PROFILE, A, B] = process.argv.slice(2);
if (!OUT || !PROFILE || !A || !B) { console.error("usage: node states.mjs <out.json> <profile-dir> <base-A> <base-B>"); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${PROFILE}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950",
  "--host-resolver-rules=MAP *youtube-nocookie.com ~NOTFOUND, MAP *youtube.com ~NOTFOUND, MAP *ytimg.com ~NOTFOUND, MAP *googlevideo.com ~NOTFOUND, MAP *typebot.io ~NOTFOUND, MAP *jsdelivr.net ~NOTFOUND",
  "--no-proxy-server", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((res, rej) => {
  let buf = "";
  chrome.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  setTimeout(() => rej(new Error("Chrome did not start: " + buf.slice(0, 300))), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const pending = new Map(); const loads = new Map(); const requests = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
  if (m.method === "Network.requestWillBeSent" && requests.has(m.sessionId)) requests.get(m.sessionId).push(m.params.request.url);
  if (m.method === "Page.loadEventFired" && loads.has(m.sessionId)) loads.get(m.sessionId)();
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const ALLOWED = /^(https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/|https:\/\/fonts\.(googleapis|gstatic)\.com\/|data:|about:)/;
const PROPS = ["background-color", "background-image",
  ...["top", "right", "bottom", "left"].flatMap((s) => ["color", "style", "width"].map((p) => `border-${s}-${p}`)),
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "outline-color", "outline-style", "outline-width", "outline-offset", "box-shadow"];
const READ = (sel) => `(() => { const el = ${sel}; if (!el) return null; const cs = getComputedStyle(el);
  return Object.fromEntries(${JSON.stringify(PROPS)}.map((p) => [p, cs.getPropertyValue(p)])); })()`;

async function open(base, path) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
  await s("Network.setCacheDisabled", { cacheDisabled: true });
  await s("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const loaded = new Promise((r) => loads.set(sessionId, r));
  await s("Page.navigate", { url: base + path });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(3000);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const media = await ev(`matchMedia("(prefers-reduced-motion: reduce)").matches && innerWidth === 375`);
  const click = async (sel) => {
    const c = await ev(`(() => { const el = ${sel}; el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; })()`);
    await sleep(300);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
      await s("Input.dispatchMouseEvent", { type, x: c.x, y: c.y, button: "left", clickCount: 1 });
    await sleep(500);
    return c;
  };
  const key = (k, code, vk, text) => ["keyDown", "keyUp"].reduce((p, type) => p.then(() =>
    s("Input.dispatchKeyEvent", { type: type === "keyDown" && text ? "keyDown" : type, key: k, code, windowsVirtualKeyCode: vk, text: type === "keyDown" ? text : undefined })), Promise.resolve());
  return { s, ev, click, key, media, close: () => send("Target.closeTarget", { targetId }), sessionId };
}

async function run(base) {
  const out = {};
  let p = await open(base, "/");
  const sumD = `document.querySelector(".disclosure--card summary")`;
  out.mediaHome = p.media;
  out.disclosureClick = await p.click(sumD);
  out.disclosureOpen = await p.ev(`${sumD}.parentElement.open`);
  out.disclosure = await p.ev(READ(`${sumD}.parentElement`));
  out.disclosureSummary = await p.ev(READ(sumD));
  const homeReq = requests.get(p.sessionId); await p.close();

  p = await open(base, "/portfolio/");
  out.mediaPortfolio = p.media;
  const sumP = `document.querySelector(".portfolio-details > summary")`;
  out.portfolioClick = await p.click(sumP);
  out.portfolioOpen = await p.ev(`${sumP}.parentElement.open`);
  out.portfolioCard = await p.ev(READ(`${sumP}.closest(".portfolio-card")`));
  out.portfolioSummary = await p.ev(READ(sumP));
  // Focus by real Tab presses from the top of the document.
  await p.ev(`(document.activeElement && document.activeElement.blur(), window.scrollTo(0, 0), true)`);
  let tabs = 0;
  for (; tabs < 80; tabs++) {
    if (await p.ev(`document.activeElement && document.activeElement.id === "portfolio-query"`)) break;
    await p.key("Tab", "Tab", 9);
    await sleep(60);
  }
  out.tabsToQuery = tabs;
  for (const ch of "agent") { await p.key(ch, "Key" + ch.toUpperCase(), ch.toUpperCase().charCodeAt(0), ch); await sleep(60); }
  await sleep(500);
  out.queryValue = await p.ev(`document.getElementById("portfolio-query").value`);
  out.queryFocus = await p.ev(`(() => { const q = document.getElementById("portfolio-query"); return { active: document.activeElement === q, focusVisible: q.matches(":focus-visible") }; })()`);
  out.query = await p.ev(READ(`document.getElementById("portfolio-query")`));
  const portReq = requests.get(p.sessionId); await p.close();
  out.outside = [...homeReq, ...portReq].filter((u) => !ALLOWED.test(u));
  return out;
}

try {
  const a = await run(A), b = await run(B);
  const diffs = [];
  for (const part of ["disclosure", "disclosureSummary", "portfolioCard", "portfolioSummary", "query"])
    for (const prop of PROPS) if (a[part]?.[prop] !== b[part]?.[prop]) diffs.push({ part, prop, a: a[part]?.[prop], b: b[part]?.[prop] });
  const ok = [a, b].every((x) => x.mediaHome && x.mediaPortfolio && x.disclosureOpen && x.portfolioOpen && x.queryFocus.active && x.queryFocus.focusVisible && x.queryValue === "agent" && x.outside.length === 0);
  writeFileSync(OUT, JSON.stringify({ A: a, B: b, diffs, ok }, null, 1));
  for (const [n, x] of [["A", a], ["B", b]])
    console.log(`${n}: media ${x.mediaHome && x.mediaPortfolio}, disclosure open ${x.disclosureOpen}, portfolio card open ${x.portfolioOpen}, query focused ${x.queryFocus.active} focus-visible ${x.queryFocus.focusVisible} after ${x.tabsToQuery} Tab, value "${x.queryValue}", outside requests ${x.outside.length}`);
  console.log(`differences: ${diffs.length}`);
  for (const d of diffs) console.log(`  ${d.part} ${d.prop}: A ${d.a} | B ${d.b}`);
  console.log(ok ? "STATES REACHED on both trees" : "STATES NOT ALL REACHED");
  chrome.kill(); process.exit(ok ? 0 : 1);
} catch (e) { console.error(e); chrome.kill(); process.exit(1); }
