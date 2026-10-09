// p41 rendered check (recipe: P27 render.mjs + P32 browser-level blocking). No dependency.
// usage: node render.mjs <out-dir> <live|blocked|localblocked> [base]
//   live         : real Typebot (creates ONE result in the owner's Typebot), 1200 px, then the same page re-laid at 375 px
//   blocked      : typebot.io unresolvable at the browser (--host-resolver-rules), no Typebot contact possible
//   localblocked : the local web.js request refused (Network.setBlockedURLs), typebot.io unresolvable too
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, MODE, BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const profile = join(OUT, `chrome-profile-${MODE}-${Date.now()}`);
const flags = ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
  "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950", "--no-proxy-server"];
if (MODE !== "live") flags.push("--host-resolver-rules=MAP typebot.io ~NOTFOUND, MAP *.typebot.io ~NOTFOUND, MAP cdn.jsdelivr.net ~NOTFOUND");
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [...flags, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((res, rej) => {
  let buf = "";
  chrome.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  setTimeout(() => rej(new Error("Chrome did not start: " + buf.slice(0, 300))), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const pending = new Map(); const listeners = new Set();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
  else for (const l of listeners) l(m);
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const out = { mode: MODE, base: BASE, flags: flags.filter((f) => f.startsWith("--host-resolver") || f === "--no-proxy-server") };
try {
  // Browser-wide target discovery: also logs requests made by out-of-process frames.
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  const events = []; listeners.add((m) => { if (m.sessionId === sessionId) events.push({ t: Date.now(), ...m }); });
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable"); await s("Log.enable");
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  const size = (width) => s("Emulation.setDeviceMetricsOverride", { width, height: width === 375 ? 812 : 900, deviceScaleFactor: 1, mobile: width === 375 });
  await size(1200);
  if (MODE === "localblocked") await s("Network.setBlockedURLs", { urls: ["*/assets/js/vendor/*"] });
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "png" });
    const file = `${name}.png`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  const requests = (since = 0) => events.filter((e) => e.method === "Network.requestWillBeSent" && e.t >= since).map((e) => e.params.request.url);
  const hosts = (since = 0) => [...new Set(requests(since).map((u) => { try { return new URL(u).host; } catch { return u.slice(0, 20); } }))];
  const failed = (since = 0) => events.filter((e) => e.method === "Network.loadingFailed" && e.t >= since).map((e) => {
    const req = events.find((q) => q.method === "Network.requestWillBeSent" && q.params.requestId === e.params.requestId);
    return { url: req ? req.params.request.url.slice(0, 120) : "?", error: e.params.blockedReason || e.params.errorText };
  });

  await s("Page.navigate", { url: BASE + "/service-ia-business/" }); await sleep(2500);
  out.hostsBeforeClick = hosts();
  const clickAt = Date.now();
  const p = await ev(`(() => { const s = document.querySelector("details[data-chat] > summary"); s.scrollIntoView({ block: "start" }); scrollBy(0, -80); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) await s("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1 });
  const READ = `(() => { const d = document.querySelector("details[data-chat]"), tb = document.querySelector("typebot-standard"), st = document.querySelector("[data-chat-status]");
    const root = tb && tb.shadowRoot; const box = root && root.querySelector(".typebot-container"); const r = tb ? tb.getBoundingClientRect() : null;
    return { open: d.open, statusHidden: st.hidden, statusText: st.textContent, typebotHidden: tb ? tb.hidden : null, hasShadow: !!root, hasContainer: !!box,
      rect: r ? [r.left, r.top, r.width, r.height].map(Math.round) : null,
      text: root ? ((box ? box.innerText : root.textContent) || "").replace(/\\s+/g, " ").trim().slice(0, 400) : null,
      buttons: root ? [...root.querySelectorAll("button")].map((b) => b.innerText.trim()).filter(Boolean).slice(0, 6) : [] }; })()`;
  let chat = null;
  for (let i = 0; i < 40; i++) { // up to 20 s
    await sleep(500);
    chat = await ev(READ);
    if (MODE === "live" ? chat.hasContainer && chat.text && chat.text.length > 20 : !chat.statusHidden && /indisponible/.test(chat.statusText)) break;
  }
  await sleep(MODE === "live" ? 2500 : 1000);
  out.chat1200 = await ev(READ);
  const webjs = events.filter((e) => e.method === "Network.responseReceived" && /typebot-js-0\.10\.11\/web\.js/.test(e.params.response.url))
    .map((e) => ({ url: e.params.response.url, status: e.params.response.status, mimeType: e.params.response.mimeType, remote: `${e.params.response.remoteIPAddress}:${e.params.response.remotePort}` }));
  out.webjsResponses = webjs;
  out.hostsAfterClick = hosts(clickAt);
  out.requestsAfterClick = requests(clickAt).map((u) => u.slice(0, 120)).slice(0, 40);
  out.requestsAfterClickCount = requests(clickAt).length;
  out.failedAfterClick = failed(clickAt).slice(0, 20);
  out.console = events.filter((e) => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded" || (e.method === "Runtime.consoleAPICalled" && /error|warn/.test(e.params.type)))
    .map((e) => JSON.stringify(e.params).slice(0, 240)).slice(0, 12);
  await ev(`document.querySelector("details[data-chat]").scrollIntoView({ block: "start" }); scrollBy(0, -80)`); await sleep(400);
  out.capture1200 = await shot(`ia-chat-${MODE}-1200`);
  if (MODE === "live") {
    await size(375); await sleep(1500);
    await ev(`document.querySelector("details[data-chat]").scrollIntoView({ block: "start" }); scrollBy(0, -60)`); await sleep(600);
    out.chat375 = await ev(READ);
    out.overflow375 = await ev(`(() => { const w = innerWidth; return { innerWidth: w, wider: [...document.querySelectorAll("body *")].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > w + 0.5; }).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "")).slice(0, 8) }; })()`);
    out.capture375 = await shot(`ia-chat-${MODE}-375`);
    out.hostsTotal = hosts();
  }
  console.log(JSON.stringify(out, null, 1));
} catch (e) { console.log(JSON.stringify(out, null, 1)); console.error("RENDER ERROR: " + (e.stack || e)); process.exitCode = 1; }
finally { try { await send("Browser.close"); } catch {} chrome.kill(); }
