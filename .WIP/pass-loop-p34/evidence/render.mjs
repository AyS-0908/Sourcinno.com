// p34 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p32 recipe (git show 7f5a8c4:.WIP/pass-loop-p32/evidence/render.mjs: launcher click, Tab + Enter, request log)
// and p33 recipe (git show 9bd375d:.WIP/pass-loop-p33/evidence/render.mjs: no-script topmost sampled below the sticky header).
// Every YouTube host is mapped to NOTFOUND at the resolver, so nothing reaches YouTube even after the click.
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: /publications/ section at 1200 and 375.
// post = PLAN § 34 Done When 3 on /publications/, each element measured on its own getBoundingClientRect().
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
  const shot = async (name, full = false) => {
    const params = { format: "jpeg", quality: 70 };
    if (full) { const m = await s("Page.getLayoutMetrics"); params.captureBeyondViewport = true; params.clip = { x: 0, y: 0, width, height: Math.ceil(m.cssContentSize.height), scale: 1 }; }
    const { data } = await s("Page.captureScreenshot", params);
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

const PATH = "/publications/";
const CARDS = `[...document.querySelectorAll("main article.card")]`;
const LAUNCHER = `document.querySelector('button[data-video="GEh_2faSLb0"]')`;
const LINKS = { book: `document.querySelectorAll("main article.card")[1].querySelector("h3 a")`, linkedin: `document.querySelectorAll("main article.card")[2].querySelector("h3 a")`, caption: `document.querySelector("main figure figcaption a")` };
// Topmost probed at the centre of the first line box, kept below the 76 px sticky header (p33 recipe).
const RECT = (expr) => `(() => { const el = ${expr}; const b = el.getBoundingClientRect(); const f = el.getClientRects()[0] || b; const cy = Math.max(f.top + f.height / 2, 76 + 1); const t = document.elementFromPoint(f.left + f.width / 2, cy);
  return { text: el.textContent.trim(), href: el.href || null, w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), left: Math.round(b.left), opacity: getComputedStyle(el).opacity,
    inViewport: b.width > 0 && b.height > 0 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, topmost: !!t && (el === t || el.contains(t)) }; })()`;
const CARD_STATE = `${CARDS}.map((c) => { const b = c.getBoundingClientRect(); return { title: c.querySelector("h3").textContent.trim(), left: Math.round(b.left), top: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; })`;
const FRAMES = `[...document.querySelectorAll("iframe")].map((f) => ({ src: f.src, title: f.title, cls: f.className, focused: document.activeElement === f }))`;
// body clips overflow-x and mobile emulation widens innerWidth to the content: scrollWidth <= innerWidth missed a 422 px card
// at 375 (r1, and the r2 grid mutation). Compare to the emulated width itself, and every card right edge too.
const OVERFLOW_AT = (w) => `innerWidth === ${w} && document.documentElement.scrollWidth <= ${w} && [...document.querySelectorAll("main article.card, main figure, main .video-launch, main iframe")].every((e) => e.getBoundingClientRect().right <= ${w})`;
const ORDER = ["Du PIB au BCI", "Engagez-vous 2.0", "Publications LinkedIn"];
const orderOk = (cards) => cards.length === 3 && cards.every((c, i) => c.title.startsWith(ORDER[i]))
  && cards.every((c) => c.left === cards[0].left && c.w > 0 && c.h > 0) && cards[0].top < cards[1].top && cards[1].top < cards[2].top;

const result = { mode: MODE };
for (const width of [1200, 375]) {
  const r = result[width] = {};
  if (MODE === "pre") {
    const t = await open(width, PATH);
    await t.scrollTo(`document.querySelector("main .section.reveal")`, "start");
    r.cards = await t.ev(`[...document.querySelectorAll("main article.card")].map((c) => { const b = c.getBoundingClientRect(); return { title: c.querySelector("h3").textContent.trim(), left: Math.round(b.left), top: Math.round(b.top + scrollY), w: Math.round(b.width) }; })`);
    r.chips = await t.ev(`document.querySelectorAll(".chip").length`);
    r.capture = await t.shot("pre-publications", true); r.ytRequests = t.yt(); await t.close(); continue;
  }
  // 1. Mouse: cards, links, thumbnail measured; requests counted before the click; one click on the launcher.
  let t = await open(width, PATH);
  await t.scrollTo(`document.querySelector("main .section.reveal")`, "start");
  r.cards = await t.ev(CARD_STATE); r.orderOk = orderOk(r.cards);
  r.chips = await t.ev(`document.querySelectorAll(".chip").length`);
  r.capture = await t.shot("post-publications", true);
  await t.scrollTo(LAUNCHER, "center");
  r.launcher = await t.ev(`(() => { const b = ${LAUNCHER}; const img = b.querySelector("img"); return { type: b.type, ariaLabel: b.getAttribute("aria-label"), visibleText: b.innerText.trim(), img: img.getAttribute("src"), alt: img.getAttribute("alt"), naturalWidth: img.naturalWidth, complete: img.complete }; })()`);
  r.launcher.rect = await t.ev(RECT(LAUNCHER));
  r.launcher.capture = await t.shot("post-launcher");
  r.links = {};
  for (const [k, expr] of Object.entries(LINKS)) { await t.scrollTo(expr, "center"); r.links[k] = await t.ev(RECT(expr)); r.links[k].target = await t.ev(`${expr}.target`); r.links[k].rel = await t.ev(`${expr}.rel`); }
  r.noOverflow = await t.ev(OVERFLOW_AT(width));
  r.ytBeforeClick = t.yt().length;
  await t.scrollTo(LAUNCHER, "center");
  const p = await t.ev(`(() => { const b = ${LAUNCHER}.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; })()`);
  await t.click(p.x, p.y); await sleep(300);
  const frames = await t.ev(FRAMES);
  r.click = { frames: frames.length, withId: frames.filter((f) => f.src.includes("GEh_2faSLb0")).length, frame: frames[0], capture: await t.shot("post-after-click") };
  r.click.pass = r.click.frames === 1 && r.click.withId === 1 && frames[0].focused && /youtube-nocookie\.com\/embed\/GEh_2faSLb0\?autoplay=1&playsinline=1$/.test(frames[0].src);
  r.noOverflowAfter = await t.ev(OVERFLOW_AT(width));
  await t.close();
  // 2. Keyboard: fresh load, real Tab from the top until the launcher is focused, then Enter.
  t = await open(width, PATH);
  let hit = false, tabs = 0;
  for (; tabs < 80 && !hit; ) { await t.key("Tab"); tabs++; hit = await t.ev(`document.activeElement === ${LAUNCHER}`); }
  const kb = r.keyboard = { tabs, reached: hit, focusVisible: hit && await t.ev(`document.activeElement.matches(":focus-visible")`) };
  if (hit) kb.capture = await t.shot("post-focus");
  kb.ytBeforeEnter = t.yt().length;
  await t.key("Enter"); await sleep(300);
  const kf = await t.ev(FRAMES);
  kb.frames = kf.length; kb.withId = kf.filter((f) => f.src.includes("GEh_2faSLb0")).length; kb.focused = kf.length === 1 && kf[0].focused;
  kb.pass = hit && kb.focusVisible && kb.frames === 1 && kb.withId === 1 && kb.focused && kb.ytBeforeEnter === 0;
  await t.close();
  // 3. Scripts disabled: three cards visible in the same order, launcher 0x0, caption link visible (synchronous evaluate only).
  t = await open(width, PATH, { noScript: true });
  const ns = r.noScript = {};
  ns.cards = await t.ev(CARD_STATE); ns.orderOk = orderOk(ns.cards);
  ns.cardsVisible = [];
  for (let i = 0; i < 3; i++) { const e = `document.querySelectorAll("main article.card")[${i}]`; await t.ev(`${e}.scrollIntoView({ block: "start" })`); await sleep(400); const v = await t.ev(`(() => { const el = ${e}; const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, Math.min(b.top + b.height / 2, innerHeight - 10, Math.max(b.top + 20, 77))); const sec = el.closest(".reveal"); return { h: Math.round(b.height), top: Math.round(b.top), sectionOpacity: sec ? getComputedStyle(sec).opacity : "1", topmost: !!t && el.contains(t) }; })()`); ns.cardsVisible.push(v); }
  ns.launcher = await t.ev(`(() => { const b = ${LAUNCHER}.getBoundingClientRect(); return { w: b.width, h: b.height, display: getComputedStyle(${LAUNCHER}).display }; })()`);
  await t.ev(`${LINKS.caption}.scrollIntoView({ block: "center" })`); await sleep(500);
  ns.caption = await t.ev(RECT(LINKS.caption));
  ns.capture = await t.shot("post-noscript", true);
  ns.ytRequests = t.yt().length; ns.noOverflow = await t.ev(OVERFLOW_AT(width));
  ns.pass = ns.orderOk && ns.cardsVisible.every((v) => v.h > 0 && v.topmost && v.sectionOpacity === "1") && ns.launcher.w === 0 && ns.launcher.h === 0 && ns.caption.inViewport && ns.caption.topmost && ns.ytRequests === 0;
  await t.close();
  r.pass = r.orderOk && r.chips === 0 && r.launcher.naturalWidth > 0 && r.launcher.rect.inViewport && r.launcher.rect.topmost && r.launcher.visibleText === "▶"
    && Object.values(r.links).every((l) => l.inViewport && l.topmost && l.target === "_blank" && l.w > 0 && l.h > 0) && r.ytBeforeClick === 0 && r.click.pass && kb.pass
    && r.noOverflow && r.noOverflowAfter && ns.pass;
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
