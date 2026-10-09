// p32 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p31 recipe (git show 616b9d6:.WIP/pass-loop-p31/evidence/render.mjs).
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: IA and Venture video areas at 1200 and 375.
// post = PLAN § 32 Done When 3: thumbnails, no YouTube request before a click, click and real Tab+Enter
//        each load one focused iframe of their own id, no overflow, scripts disabled = launchers hidden, caption links visible.
// YouTube hosts: logged by Network.requestWillBeSent and blocked by Network.setBlockedURLs on the PAGE session only;
// that block does NOT reach the click-loaded cross-site iframe (own process): the player really loaded in r1 (review A-001).
// Chrome's resolver now maps every YouTube host to NOTFOUND (--host-resolver-rules), so no YouTube server is contacted.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, MODE = "post", BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${PROFILE}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950",
  "--host-resolver-rules=MAP *youtube-nocookie.com ~NOTFOUND, MAP *youtube.com ~NOTFOUND, MAP *ytimg.com ~NOTFOUND, MAP *googlevideo.com ~NOTFOUND, MAP *ggpht.com ~NOTFOUND",
  "--no-proxy-server", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((res, rej) => {
  let buf = "";
  chrome.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  setTimeout(() => rej(new Error("Chrome did not start: " + buf.slice(0, 300))), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const pending = new Map(); const requests = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
  if (m.method === "Network.requestWillBeSent" && requests.has(m.sessionId)) requests.get(m.sessionId).push(m.params.request.url);
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const YT = /youtube|ytimg|googlevideo/i;

async function open(width, path, { noScript = false } = {}) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
  await s("Network.setBlockedURLs", { urls: ["*youtube*", "*ytimg*", "*googlevideo*"] });
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  // Headless Chrome on this machine reports prefers-reduced-motion: reduce by default (AGENTS Gotcha): set it explicitly.
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (noScript) await s("Emulation.setScriptExecutionDisabled", { value: true });
  await s("Page.navigate", { url: BASE + path }); await sleep(1800);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = `${name}-${width}.jpg`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  const key = async (k) => {
    const map = { Tab: ["Tab", 9, ""], Enter: ["Enter", 13, "\r"] };
    const [keyName, vk, text] = map[k];
    await s("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: keyName, code: k, windowsVirtualKeyCode: vk, text: text || undefined });
    await s("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code: k, windowsVirtualKeyCode: vk });
    await sleep(120);
  };
  const click = async (x, y) => {
    await s("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await s("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await s("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    await sleep(400);
  };
  // Scroll, then wait for the .reveal section from Node (never inside Runtime.evaluate: scripts-off stops timers).
  const scrollTo = async (expr, block = "center") => {
    await ev(`(${expr}).scrollIntoView({ block: "${block}" })`);
    for (let k = 0; k < 40; k++) {
      const op = await ev(`(() => { const sec = (${expr}).closest(".reveal"); return sec ? getComputedStyle(sec).opacity : "1"; })()`);
      if (op === "1") break; await sleep(100);
    }
    await sleep(400);
  };
  const yt = () => requests.get(sessionId).filter((u) => YT.test(u));
  return { s, ev, shot, key, click, scrollTo, yt, close: () => send("Target.closeTarget", { targetId }) };
}

const PAGES = { ia: "/service-ia-business/", venture: "/service-venture-building/" };
const PRE_SEL = `[...document.querySelectorAll("[data-video-launch], iframe[srcdoc], button[data-video]")]`;
const LAUNCHERS = `[...document.querySelectorAll("button[data-video]")]`;
const L = (i) => `${LAUNCHERS}[${i}]`;
// Topmost is probed at the centre of the FIRST line box: a wrapped inline link has an empty centre.
const RECT = (expr) => `(() => { const el = ${expr}; const b = el.getBoundingClientRect(); const f = el.getClientRects()[0] || b; const t = document.elementFromPoint(f.left + f.width / 2, f.top + f.height / 2);
  return { w: Math.round(b.width), h: Math.round(b.height), inViewport: b.width > 0 && b.height > 0 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, topmost: !!t && (el === t || el.contains(t)) }; })()`;
const LAUNCHER_STATE = (i) => `(() => { const b = ${L(i)}; const img = b.querySelector("img"); const fig = b.closest("figure"); const a = fig.querySelector("figcaption a");
  return { id: b.dataset.video, ariaLabel: b.getAttribute("aria-label"), visibleText: b.innerText.trim(), img: img.getAttribute("src"), naturalWidth: img.naturalWidth, complete: img.complete,
    caption: fig.querySelector("figcaption").textContent.trim(), captionHref: a && a.href, captionTarget: a && a.target }; })()`;
const CENTER = (i) => `(() => { const r = ${L(i)}.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`;
const FRAMES = `[...document.querySelectorAll("iframe")].map((f) => ({ src: f.src, title: f.title, cls: f.className, referrerPolicy: f.referrerPolicy, focused: document.activeElement === f }))`;
const OVERFLOW = `document.documentElement.scrollWidth <= innerWidth`;

const result = { mode: MODE };
for (const width of [1200, 375]) {
  for (const [name, path] of Object.entries(PAGES)) {
    const key = `${name}-${width}`;
    if (MODE === "pre") {
      const t = await open(width, path);
      const n = await t.ev(`${PRE_SEL}.length`); const r = result[key] = { videos: n, captures: [] };
      for (let i = 0; i < n; i++) { await t.scrollTo(`${PRE_SEL}[${i}]`, "center"); r.captures.push(await t.shot(`pre-${name}-video${i + 1}`)); }
      r.ytRequests = t.yt(); await t.close(); continue;
    }
    const r = result[key] = {};
    // 1. Mouse: every launcher scrolled to, measured, then clicked; requests counted before the first click.
    let t = await open(width, path);
    const n = await t.ev(`${LAUNCHERS}.length`); r.launchers = n; r.launch = [];
    for (let i = 0; i < n; i++) {
      await t.scrollTo(L(i), "center");
      const st = await t.ev(LAUNCHER_STATE(i)); st.rect = await t.ev(RECT(L(i)));
      st.capture = await t.shot(`post-${name}-launcher${i + 1}`); r.launch.push(st);
    }
    r.noOverflowBefore = await t.ev(OVERFLOW);
    r.ytBeforeClick = t.yt().length;
    r.clicks = [];
    for (let i = 0; i < n; i++) {
      const id = await t.ev(`${L(0)}.dataset.video`); // clicked launchers are replaced: the next one is always index 0
      await t.scrollTo(L(0), "center");
      const before = (await t.ev(FRAMES)).length; const p = await t.ev(CENTER(0)); await t.click(p.x, p.y);
      const frames = await t.ev(FRAMES); const mine = frames.filter((f) => f.src.includes(id));
      const c = { id, framesAdded: frames.length - before, srcHasId: mine.length === 1, focused: mine.length === 1 && mine[0].focused, frame: mine[0] };
      if (i === 0) c.capture = await t.shot(`post-${name}-after-click`);
      c.pass = c.framesAdded === 1 && c.srcHasId && c.focused && /youtube-nocookie\.com\/embed\/[\w-]+\?autoplay=1&playsinline=1$/.test(c.frame.src) && c.frame.referrerPolicy === "origin";
      r.clicks.push(c);
    }
    r.ytAfterClicks = t.yt().length;
    r.noOverflowAfter = await t.ev(OVERFLOW);
    await t.close();
    // 2. Keyboard: fresh load per launcher, no scroll, real Tab from the top until it is document.activeElement, then Enter.
    r.keyboard = [];
    for (let i = 0; i < n; i++) {
      t = await open(width, path);
      const id = await t.ev(`${L(i)}.dataset.video`);
      let hit = false, tabs = 0;
      for (; tabs < 120 && !hit; ) { await t.key("Tab"); tabs++; hit = await t.ev(`document.activeElement === ${L(i)}`); }
      const kb = { i, id, tabs, reached: hit, focusVisible: hit && await t.ev(`document.activeElement.matches(":focus-visible")`) };
      if (hit && i === 0) kb.capture = await t.shot(`post-${name}-focus`);
      const ytBefore = t.yt().length;
      await t.key("Enter"); await sleep(300);
      const frames = await t.ev(FRAMES); const mine = frames.filter((f) => f.src.includes(id));
      kb.framesWithId = mine.length; kb.focused = mine.length === 1 && mine[0].focused; kb.ytBeforeEnter = ytBefore;
      kb.pass = hit && kb.focusVisible && kb.framesWithId === 1 && kb.focused && ytBefore === 0;
      r.keyboard.push(kb); await t.close();
    }
    // 3. Scripts disabled: launchers hidden, caption links visible (synchronous evaluate only).
    t = await open(width, path, { noScript: true });
    r.noScript = { launchers: await t.ev(`${LAUNCHERS}.map((b) => { const x = b.getBoundingClientRect(); return { w: x.width, h: x.height, display: getComputedStyle(b).display }; })`), links: [] };
    const nf = await t.ev(`${LAUNCHERS}.length`);
    for (let i = 0; i < nf; i++) {
      const A = `${L(i)}.closest("figure").querySelector("figcaption a")`;
      await t.ev(`${A}.scrollIntoView({ block: "center" })`); await sleep(500);
      r.noScript.links.push({ text: await t.ev(`${A}.textContent.trim()`), ...(await t.ev(RECT(A))) });
      if (i === 0) r.noScript.capture = await t.shot(`post-${name}-noscript`);
    }
    r.noScript.ytRequests = t.yt().length;
    r.noScript.noOverflow = await t.ev(OVERFLOW);
    r.noScript.pass = r.noScript.launchers.every((x) => x.w === 0 && x.h === 0) && r.noScript.links.length === nf && r.noScript.links.every((x) => x.inViewport && x.topmost);
    await t.close();
    r.pass = n > 0 && r.launch.every((x) => x.naturalWidth > 0 && x.rect.inViewport && x.rect.topmost && x.visibleText === "▶" && x.captionTarget === "_blank" && x.captionHref.includes(x.id))
      && r.ytBeforeClick === 0 && r.clicks.every((c) => c.pass) && r.keyboard.every((k) => k.pass) && r.noOverflowBefore && r.noOverflowAfter && r.noScript.pass;
  }
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
