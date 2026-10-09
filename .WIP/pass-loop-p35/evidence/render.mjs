// p35 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p34 recipe (git show 385930c:.WIP/pass-loop-p34/evidence/render.mjs: emulated 1200/375, right edges vs the
// emulated width, scripts-off run, request log, topmost probe below the 76 px sticky header).
// Wix hosts are mapped to NOTFOUND at the resolver: the page must work with Wix unreachable; requests to them are counted.
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: /publications/ full page at 1200 and 375.
// post = PLAN § 35 Done When 4 on /publications/, each element measured on its own getBoundingClientRect().
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, MODE = "post", BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${PROFILE}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950",
  "--host-resolver-rules=MAP *wixsite.com ~NOTFOUND, MAP *wixstatic.com ~NOTFOUND, MAP *youtube-nocookie.com ~NOTFOUND, MAP *youtube.com ~NOTFOUND, MAP *ytimg.com ~NOTFOUND",
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
const WIX = /wixsite|wixstatic/i;

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
  const key = async (k, shift = false) => {
    const map = { Tab: ["Tab", 9, ""], Enter: ["Enter", 13, "\r"] };
    const [keyName, vk, text] = map[k];
    const modifiers = shift ? 8 : 0;
    await s("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: keyName, code: k, windowsVirtualKeyCode: vk, text: text || undefined, modifiers });
    await s("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code: k, windowsVirtualKeyCode: vk, modifiers });
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
  const wix = () => requests.get(sessionId).filter((u) => WIX.test(u));
  return { s, ev, shot, key, click, scrollTo, wix, close: () => send("Target.closeTarget", { targetId }) };
}

const PATH = "/publications/";
const POSTS = `[...document.querySelectorAll("#blog-list article.card")]`;
const CHIPS = `[...document.querySelectorAll("#blog .chip")]`;
const CHIP = (label) => `${CHIPS}.find((c) => c.textContent === ${JSON.stringify(label)})`;
const EXPECTED_CHIPS = ["Tous", "IA", "Venture Building", "Startup"];
// One entry per post: its tag, whether it carries `hidden`, and its own rectangle.
const POST_STATE = `${POSTS}.map((p) => { const b = p.getBoundingClientRect(); return { tag: p.dataset.tag, title: p.querySelector("h3").textContent.trim(), hidden: p.hidden, w: Math.round(b.width), h: Math.round(b.height) }; })`;
const CHIP_STATE = `${CHIPS}.map((c) => ({ text: c.textContent, pressed: c.getAttribute("aria-pressed"), active: c.classList.contains("is-active"), type: c.type }))`;
// Topmost probed at the centre of the first line box, kept below the 76 px sticky header (p33 recipe).
const RECT = (expr) => `(() => { const el = ${expr}; const b = el.getBoundingClientRect(); const f = el.getClientRects()[0] || b; const cy = Math.max(f.top + f.height / 2, 76 + 1); const t = document.elementFromPoint(f.left + f.width / 2, cy);
  return { text: el.textContent.trim(), w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), left: Math.round(b.left),
    inViewport: b.width > 0 && b.height > 0 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, topmost: !!t && (el === t || el.contains(t)) }; })()`;
// body clips overflow-x and mobile emulation widens innerWidth (AGENTS Gotcha): compare every main element's right edge to the emulated width.
const OVERFLOW_AT = (w) => `(() => { const bad = [...document.querySelectorAll("main *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > ${w} + 0.5; }).map((e) => e.tagName + "." + e.className + " " + Math.round(e.getBoundingClientRect().right));
  return { ok: innerWidth === ${w} && document.documentElement.scrollWidth <= ${w} && bad.length === 0, innerWidth, scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 5) }; })()`;
// Blog section below the third Publications card.
const PLACEMENT = `(() => { const cards = [...document.querySelectorAll("main section:not(#blog) article.card")]; const blog = document.getElementById("blog");
  const third = cards[2].getBoundingClientRect(); const b = blog.getBoundingClientRect(); const h2 = blog.querySelector("h2");
  return { cards: cards.length, thirdBottom: Math.round(third.bottom + scrollY), blogTop: Math.round(b.top + scrollY), h2: h2.textContent.trim(), below: b.top >= third.bottom }; })()`;
const LINKS = `${POSTS}.map((p) => { const a = p.querySelector("h3 a"); return { href: a.getAttribute("href"), target: a.target, rel: a.rel, arrow: a.querySelector('span[aria-hidden="true"]')?.textContent, time: p.querySelector("time")?.getAttribute("datetime") }; })`;
// Visible = not hidden and a non-zero own rectangle; hidden = 0x0.
const filterOk = (posts, tag) => posts.length > 0 && posts.every((p) => {
  const want = tag === "Tous" || p.tag === tag;
  return want ? !p.hidden && p.w > 0 && p.h > 0 : p.hidden && p.w === 0 && p.h === 0;
});
const pressedOk = (chips, label) => chips.length === EXPECTED_CHIPS.length && chips.every((c, i) => c.text === EXPECTED_CHIPS[i] && c.type === "button"
  && c.pressed === String(c.text === label) && c.active === (c.text === label));

const result = { mode: MODE };
for (const width of [1200, 375]) {
  const r = result[width] = {};
  if (MODE === "pre") {
    const t = await open(width, PATH);
    await t.scrollTo(`document.querySelector("main .section.reveal")`, "start");
    r.blog = await t.ev(`!!document.getElementById("blog")`);
    r.chips = await t.ev(`document.querySelectorAll(".chip").length`);
    r.capture = await t.shot("pre-publications", true); r.wixRequests = t.wix(); await t.close(); continue;
  }
  // 1. Mouse: placement, chips, « Tous » state; click « IA »; click « Tous ».
  let t = await open(width, PATH);
  await t.scrollTo(`document.getElementById("blog")`, "start");
  r.placement = await t.ev(PLACEMENT);
  r.links = await t.ev(LINKS);
  r.linksOk = r.links.length > 0 && r.links.every((l) => /^https:\/\/sourcinno\.wixsite\.com\/blog\/post\//.test(l.href) && l.target === "_blank" && l.rel === "noopener" && l.arrow === "→" && /^\d{4}-\d{2}-\d{2}$/.test(l.time));
  const ALL = `[...document.querySelectorAll("#blog a")].pop()`;
  await t.scrollTo(ALL, "center"); r.allBlog = await t.ev(RECT(ALL)); r.allBlog.href = await t.ev(`${ALL}.getAttribute("href")`);
  await t.scrollTo(`document.getElementById("blog")`, "start");
  r.initial = { chips: await t.ev(CHIP_STATE), posts: await t.ev(POST_STATE) };
  r.initial.pass = pressedOk(r.initial.chips, "Tous") && filterOk(r.initial.posts, "Tous");
  r.overflowTous = await t.ev(OVERFLOW_AT(width));
  r.captureTous = await t.shot("post-tous", true);
  await t.scrollTo(CHIP("IA"), "center");
  r.iaChip = await t.ev(RECT(CHIP("IA")));
  const p = await t.ev(`(() => { const b = ${CHIP("IA")}.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; })()`);
  await t.click(p.x, p.y);
  r.ia = { chips: await t.ev(CHIP_STATE), posts: await t.ev(POST_STATE) };
  r.ia.visible = r.ia.posts.filter((x) => !x.hidden).length;
  r.ia.pass = pressedOk(r.ia.chips, "IA") && filterOk(r.ia.posts, "IA") && r.ia.visible < r.ia.posts.length;
  r.overflowIa = await t.ev(OVERFLOW_AT(width));
  r.captureIa = await t.shot("post-ia", true);
  await t.scrollTo(CHIP("Tous"), "center");
  const q = await t.ev(`(() => { const b = ${CHIP("Tous")}.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; })()`);
  await t.click(q.x, q.y);
  r.restored = { chips: await t.ev(CHIP_STATE), posts: await t.ev(POST_STATE) };
  r.restored.pass = pressedOk(r.restored.chips, "Tous") && filterOk(r.restored.posts, "Tous");
  r.wixMouse = t.wix();
  await t.close();
  // 2. Keyboard: fresh load, real Tab from the top until « IA » is focused, Enter; Shift+Tab to « Tous », Enter.
  t = await open(width, PATH);
  let hit = false, tabs = 0;
  for (; tabs < 120 && !hit; ) { await t.key("Tab"); tabs++; hit = await t.ev(`document.activeElement === ${CHIP("IA")}`); }
  const kb = r.keyboard = { tabs, reached: hit, focusVisible: hit && await t.ev(`document.activeElement.matches(":focus-visible")`) };
  if (hit) {
    await t.key("Enter");
    kb.ia = { chips: await t.ev(CHIP_STATE), posts: await t.ev(POST_STATE) };
    kb.capture = await t.shot("post-keyboard-ia");
    await t.key("Tab", true);
    kb.backOnTous = await t.ev(`document.activeElement === ${CHIP("Tous")}`);
    await t.key("Enter");
    kb.tous = { chips: await t.ev(CHIP_STATE), posts: await t.ev(POST_STATE) };
  }
  kb.pass = hit && kb.focusVisible && pressedOk(kb.ia.chips, "IA") && filterOk(kb.ia.posts, "IA") && kb.backOnTous && pressedOk(kb.tous.chips, "Tous") && filterOk(kb.tous.posts, "Tous");
  kb.wix = t.wix();
  await t.close();
  // 3. Scripts disabled: every post visible and topmost, 0 chip buttons (synchronous evaluate only).
  t = await open(width, PATH, { noScript: true });
  const ns = r.noScript = {};
  ns.chips = await t.ev(`document.querySelectorAll("#blog button, .chip").length`);
  ns.posts = await t.ev(POST_STATE);
  ns.visible = [];
  for (let i = 0; i < ns.posts.length; i++) {
    const e = `document.querySelectorAll("#blog-list article.card")[${i}]`;
    await t.ev(`${e}.scrollIntoView({ block: "center" })`); await sleep(250);
    const v = await t.ev(`(() => { const el = ${e}; const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, Math.min(b.top + b.height / 2, innerHeight - 10, Math.max(b.top + 20, 77))); const sec = el.closest(".reveal"); return { h: Math.round(b.height), top: Math.round(b.top), sectionOpacity: sec ? getComputedStyle(sec).opacity : "1", topmost: !!t && el.contains(t) }; })()`);
    ns.visible.push(v);
  }
  ns.placement = await t.ev(PLACEMENT);
  ns.overflow = await t.ev(OVERFLOW_AT(width));
  ns.capture = await t.shot("post-noscript", true);
  ns.wix = t.wix();
  ns.pass = ns.chips === 0 && filterOk(ns.posts, "Tous") && ns.visible.every((v) => v.h > 0 && v.topmost && v.sectionOpacity === "1") && ns.placement.below && ns.overflow.ok && ns.wix.length === 0;
  await t.close();
  r.pass = r.placement.below && r.placement.h2 === "Blog" && r.placement.cards === 3 && r.linksOk && r.allBlog.text === "Tout le blog →" && r.allBlog.href === "https://sourcinno.wixsite.com/blog" && r.allBlog.topmost
    && r.initial.pass && r.iaChip.topmost && r.ia.pass && r.restored.pass && r.overflowTous.ok && r.overflowIa.ok && r.wixMouse.length === 0 && kb.pass && kb.wix.length === 0 && ns.pass;
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
