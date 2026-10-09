// p38 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p37 recipe (git show 4cebf8a:.WIP/pass-loop-p37/evidence/render.mjs: emulated 1200/375, scripts-off run, request log,
// real input via CDP). YouTube, Typebot and jsdelivr hosts are mapped to NOTFOUND at the resolver; every request outside
// localhost / Google Fonts is listed. prefers-reduced-motion is set explicitly to `no-preference` on every page (AGENTS Gotcha:
// headless defaults to reduce here, which would hide nothing and prove nothing).
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// PLAN § 38 Done When 1 on /, /contact/, /service-strategie-transformation/ at 1200 and 375:
//   blocked  = /assets/js/site.js blocked (Network.setBlockedURLs *site.js*): every .reveal opacity 1 and own height > 0
//              within 4 s of `load`, no scrolling (polled from Node; elapsed measured in the page from loadEventEnd);
//   noscript = scripts disabled: same, evaluated synchronously (timers stop with scripts off: AGENTS Gotcha); .video-launch hidden;
//   normal   = a .reveal below the fold has opacity < 1 before scrolling and 1 after scrolling to it;
//   flash    = 1200 only: a requestAnimationFrame sampler installed before the document records every .reveal opacity per
//              frame; a drop of more than 0.3 after a painted value is a flash. Also run with site.js delayed by 3.5 s (Fetch),
//              i.e. after the 2.5 s fallback already showed the sections.
// post adds Done When 3: /contact/ 1,600 characters sent by Input.insertText leave 1,500 in #b-message.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, MODE = "post", BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

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
let seq = 0; const pending = new Map(); const requests = new Map(); const loads = new Map(); const paused = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
  if (m.method === "Network.requestWillBeSent" && requests.has(m.sessionId)) requests.get(m.sessionId).push(m.params.request.url);
  if (m.method === "Page.loadEventFired" && loads.has(m.sessionId)) loads.get(m.sessionId)();
  if (m.method === "Fetch.requestPaused" && paused.has(m.sessionId)) paused.get(m.sessionId)(m.params);
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const ALLOWED = /^(https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/|https:\/\/fonts\.(googleapis|gstatic)\.com\/|data:|about:)/;
const SAMPLER = `window.__rv = [];
(function loop() {
  const els = document.querySelectorAll(".reveal");
  if (els.length) window.__rv.push([Math.round(performance.now()), document.documentElement.className, [...els].map((e) => +getComputedStyle(e).opacity)]);
  if (performance.now() < 7000) requestAnimationFrame(loop);
})();`;

async function open(width, path, { noScript = false, block = false, delaySite = 0, sampler = false } = {}) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
  await s("Network.setCacheDisabled", { cacheDisabled: true });
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (noScript) await s("Emulation.setScriptExecutionDisabled", { value: true });
  if (block) await s("Network.setBlockedURLs", { urls: ["*site.js*"] });
  if (delaySite) {
    paused.set(sessionId, (p) => setTimeout(() => s("Fetch.continueRequest", { requestId: p.requestId }).catch(() => {}), delaySite));
    await s("Fetch.enable", { patterns: [{ urlPattern: "*site.js*" }] });
  }
  if (sampler) await s("Page.addScriptToEvaluateOnNewDocument", { source: SAMPLER });
  const loaded = new Promise((r) => loads.set(sessionId, r));
  await s("Page.navigate", { url: BASE + path });
  await Promise.race([loaded, sleep(15000)]);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name, full = false) => {
    const params = { format: "png" };
    if (full) { const m = await s("Page.getLayoutMetrics"); params.captureBeyondViewport = true; params.clip = { x: 0, y: 0, width, height: Math.ceil(m.cssContentSize.height), scale: 1 }; }
    const { data } = await s("Page.captureScreenshot", params);
    const file = `${name}-${width}.png`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  const outside = () => requests.get(sessionId).filter((u) => !ALLOWED.test(u));
  return { s, ev, shot, outside, close: () => send("Target.closeTarget", { targetId }) };
}

// Every .reveal: computed opacity and own rectangle (never the HTML); elapsed since loadEventEnd, measured in the page.
const REVEALS = `(() => ({ sinceLoad: Math.round(performance.now() - performance.getEntriesByType("navigation")[0].loadEventEnd),
  scrollY, html: document.documentElement.className,
  items: [...document.querySelectorAll(".reveal")].map((e) => { const b = e.getBoundingClientRect(); return { id: e.id || e.className, op: getComputedStyle(e).opacity, h: Math.round(b.height), top: Math.round(b.top) }; }) }))()`;
const allShown = (r) => r.items.length > 0 && r.items.every((i) => i.op === "1" && i.h > 0);
const OVERFLOW_AT = (w) => `(() => { const bad = [...document.querySelectorAll("main *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > ${w} + 0.5; }).map((e) => e.tagName + "." + e.className + " " + Math.round(e.getBoundingClientRect().right));
  return { ok: innerWidth === ${w} && document.documentElement.scrollWidth <= ${w} && bad.length === 0, innerWidth, scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 5) }; })()`;

const PAGES = { home: "/", contact: "/contact/", strategie: "/service-strategie-transformation/" };
const result = { mode: MODE };
for (const width of [1200, 375]) {
  const r = result[width] = {};
  for (const [name, path] of Object.entries(PAGES)) {
    const p = r[name] = {};
    // (a) site.js blocked: poll from Node until every .reveal is shown, or 6 s after load (to record the failure time too).
    let t = await open(width, path, { block: true });
    let snap;
    for (let k = 0; k < 60; k++) { snap = await t.ev(REVEALS); if (allShown(snap) || snap.sinceLoad > 6000) break; await sleep(100); }
    p.blocked = { shown: allShown(snap), sinceLoad: snap.sinceLoad, scrollY: snap.scrollY, html: snap.html, count: snap.items.length,
      notShown: snap.items.filter((i) => !(i.op === "1" && i.h > 0)), siteJsRequested: (await t.ev(`performance.getEntriesByType("resource").filter((e) => /site\\.js/.test(e.name)).length`)) };
    p.blocked.pass = p.blocked.shown && p.blocked.sinceLoad <= 4000 && p.blocked.scrollY === 0;
    p.blocked.capture = await t.shot(`${MODE}-${name}-blocked`, true);
    p.blocked.outside = t.outside();
    await t.close();
    // (b) scripts disabled: synchronous evaluates only, waited from Node.
    t = await open(width, path, { noScript: true });
    await sleep(800);
    snap = await t.ev(REVEALS);
    p.noscript = { shown: allShown(snap), sinceLoad: snap.sinceLoad, count: snap.items.length, notShown: snap.items.filter((i) => !(i.op === "1" && i.h > 0)),
      videoLaunch: await t.ev(`[...document.querySelectorAll(".video-launch")].map((e) => getComputedStyle(e).display)`), outside: t.outside() };
    p.noscript.pass = p.noscript.shown && p.noscript.sinceLoad <= 4000 && p.noscript.videoLaunch.every((d) => d === "none") && p.noscript.outside.length === 0;
    await t.close();
    // (c) normal run: a section below the fold is hidden before scrolling and shown after scrolling to it.
    t = await open(width, path, { sampler: width === 1200 });
    await sleep(1500);
    snap = await t.ev(REVEALS);
    const below = snap.items.findIndex((i) => i.top > (width < 500 ? 812 : 900));
    p.normal = { html: snap.html, belowIndex: below, belowBefore: below >= 0 ? snap.items[below].op : null };
    if (below >= 0) {
      await t.ev(`document.querySelectorAll(".reveal")[${below}].scrollIntoView({ block: "center" })`);
      let op = null; for (let k = 0; k < 40; k++) { op = await t.ev(`getComputedStyle(document.querySelectorAll(".reveal")[${below}]).opacity`); if (op === "1") break; await sleep(100); }
      p.normal.belowAfter = op;
    }
    p.normal.pass = below >= 0 && Number(p.normal.belowBefore) < 1 && p.normal.belowAfter === "1";
    if (width === 1200) p.normal.frames = await t.ev(`window.__rv`);
    p.normal.outside = t.outside();
    await t.close();
    if (width === 1200) {
      // (d) flash: per element, a drop of more than 0.3 after a painted value. Normal load, then site.js delayed 3.5 s.
      const drops = (frames) => { const out = []; if (!frames || !frames.length) return ["no frames"]; const n = frames[0][2].length;
        for (let i = 0; i < n; i++) { let max = 0; for (const f of frames) { const o = f[2][i]; if (o === undefined) continue; if (max - o > 0.3) { out.push({ i, at: f[0], from: max, to: o }); break; } max = Math.max(max, o); } } return out; };
      p.flash = { normal: { frames: p.normal.frames.length, drops: drops(p.normal.frames) } };
      delete p.normal.frames;
      t = await open(width, path, { sampler: true, delaySite: 3500 });
      await sleep(5000);
      const fr = await t.ev(`window.__rv`);
      const firstShown = fr.find((f) => f[2].some((o) => o > 0.05));
      p.flash.late = { frames: fr.length, drops: drops(fr), firstShownAt: firstShown ? firstShown[0] : null, htmlAtEnd: fr.length ? fr[fr.length - 1][1] : null };
      await t.close();
      p.flash.pass = p.flash.normal.drops.length === 0 && p.flash.late.drops.length === 0;
    }
    p.pass = p.blocked.pass && p.noscript.pass && p.normal.pass && p.blocked.outside.length === 0 && p.normal.outside.length === 0 && (width !== 1200 || p.flash.pass);
  }
  // .video-launch hidden with scripts off: the three routes may carry none, so Entreprise IA (two launchers) is measured too.
  let t = await open(width, "/service-ia-business/", { noScript: true });
  await sleep(500);
  r.iaVideoNoscript = await t.ev(`[...document.querySelectorAll(".video-launch")].map((e) => getComputedStyle(e).display)`);
  await t.close();
  if (MODE === "pre") continue;
  // Done When 3: real text input into the message field.
  t = await open(width, "/contact/");
  await sleep(500);
  const c = r.contactInput = {};
  c.formShown = await t.ev(`!document.getElementById("form-basique").hidden`);
  c.maxlength = await t.ev(`document.getElementById("b-message").maxLength`);
  c.label = await t.ev(`document.querySelector('label[for="b-message"]').textContent.replace(/\\s+/g, " ").trim()`);
  await t.ev(`document.getElementById("b-message").scrollIntoView({ block: "center" }); document.getElementById("b-message").focus()`);
  await t.s("Input.insertText", { text: "a".repeat(1600) });
  await sleep(200);
  c.length = await t.ev(`document.getElementById("b-message").value.length`);
  c.overflow = await t.ev(OVERFLOW_AT(width));
  c.capture = await t.shot("post-contact-message");
  c.outside = t.outside();
  c.pass = c.formShown && c.maxlength === 1500 && c.length === 1500 && c.overflow.ok && c.outside.length === 0;
  await t.close();
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
