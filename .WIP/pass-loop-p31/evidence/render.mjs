// p31 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p30 recipe (git show e3d664a:.WIP/pass-loop-p30/evidence/render.mjs).
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: #experience geometry + captures at 1200 and 375.
// post = PLAN § 31 Done When 3: columns, closed-height match, visible sentences, open card 3 moves no li,
//        one column at 375, overflow closed/all open, click + real Tab/Enter on each card, nothing focusable in the timeline.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, MODE = "post", BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${PROFILE}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((res, rej) => {
  let buf = "";
  chrome.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
  setTimeout(() => rej(new Error("Chrome did not start: " + buf.slice(0, 300))), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});

async function open(width, path) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable"); await s("Runtime.enable");
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  // Headless Chrome on this machine reports prefers-reduced-motion: reduce by default (AGENTS Gotcha): set it explicitly.
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
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
    await sleep(250);
  };
  // Scroll, then wait for the .reveal section from Node (never inside Runtime.evaluate).
  const scrollTo = async (expr, block = "center") => {
    await ev(`(${expr}).scrollIntoView({ block: "${block}" })`);
    for (let k = 0; k < 40; k++) {
      const op = await ev(`(() => { const sec = (${expr}).closest(".reveal"); return sec ? getComputedStyle(sec).opacity : "1"; })()`);
      if (op === "1") break; await sleep(100);
    }
    await sleep(350);
  };
  return { s, ev, shot, key, click, scrollTo, close: () => send("Target.closeTarget", { targetId }) };
}

const LIS = `[...document.querySelectorAll("#experience ol > li")]`;
const CARDS = `[...document.querySelectorAll("#experience .experience-panel > details")]`;
const TEXT = (i) => `${LIS}[${i}].querySelector(".timeline__text, .timeline__tip")`;
const GEOM = `(() => { const R = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round((r.top + scrollY) * 10) / 10, bottom: Math.round((r.bottom + scrollY) * 10) / 10, left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
  const ol = document.querySelector("#experience ol"); const lis = ${LIS}; const cards = ${CARDS};
  const li = lis.map(R), card = cards.map(R), tl = R(ol);
  return { olClass: ol.className, timeline: tl, li, card, openCards: cards.filter((d) => d.open).length,
    titles: cards.map((d) => d.querySelector("h3").textContent.trim()),
    h2: [...document.querySelectorAll("#references h2, #experience h2")].map((h) => h.textContent.trim()),
    timelineRightMinusFirstCardLeft: Math.round((tl.right - card[0].left) * 10) / 10,
    firstTopDelta: Math.round(Math.abs(li[0].top - card[0].top) * 10) / 10,
    lastBottomDelta: Math.round(Math.abs(li[li.length - 1].bottom - card[card.length - 1].bottom) * 10) / 10,
    timelineBottomMinusFirstCardTop: Math.round((tl.bottom - card[0].top) * 10) / 10,
    focusablesInTimeline: ol.querySelectorAll("a, button, input, select, textarea, summary, [tabindex]").length,
    noOverflow: document.documentElement.scrollWidth <= innerWidth }; })()`;
const CARD_STATE = (i) => `(() => { const d = ${CARDS}[${i}]; const sm = d.querySelector("summary"); const body = d.querySelector(":scope > :not(summary)"); const br = body.getBoundingClientRect();
  return { open: d.open, after: getComputedStyle(sm, "::after").content, bodyVisible: d.open && br.width > 0 && br.height > 0 }; })()`;
const SUMMARY_PT = (i) => `(() => { const r = ${CARDS}[${i}].querySelector("summary").getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 2, 30)) }; })()`;

const result = { mode: MODE };
for (const width of [1200, 375]) {
  const t = await open(width, "/");
  const r = result["home-" + width] = {};
  await t.scrollTo(`document.querySelector("#experience")`, "start");
  r.closed = await t.ev(GEOM);
  await t.ev(`window.scrollBy(0, -90)`); await sleep(300);
  r.captureClosed = await t.shot(MODE + "-experience-closed");
  if (width === 1200) { await t.scrollTo(`document.querySelector("#experience .experience-panel")`, "center"); r.captureClosedPanel = await t.shot(MODE + "-experience-closed-panel"); }
  if (MODE === "pre") { await t.close(); continue; }

  // Each former tooltip sentence: scrolled to, own rect non-zero and inside the viewport, topmost at its centre.
  r.sentences = [];
  for (let i = 0; i < 5; i++) {
    await t.scrollTo(TEXT(i), "center");
    r.sentences.push(await t.ev(`(() => { const el = ${TEXT(i)}; const b = el.getBoundingClientRect(); const top = document.elementFromPoint(b.left + Math.min(b.width / 2, 40), b.top + b.height / 2);
      return { text: el.textContent.trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height), inViewport: b.width > 0 && b.height > 0 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, topmost: !!top && el.contains(top) }; })()`));
  }

  // Open card 3 by mouse: no timeline li may move by more than 2 px.
  const before = r.closed.li.map((x) => x.top);
  await t.scrollTo(`${CARDS}[2].querySelector("summary")`, "center");
  const p3 = await t.ev(SUMMARY_PT(2)); await t.click(p3.x, p3.y);
  r.openThird = await t.ev(GEOM);
  r.openThird.maxLiTopShift = Math.max(...r.openThird.li.map((x, i) => Math.abs(x.top - before[i])));
  await t.scrollTo(`document.querySelector("#experience")`, "start"); await t.ev(`window.scrollBy(0, -90)`); await sleep(300);
  r.captureThirdOpen = await t.shot("post-experience-third-open");
  if (width === 1200) { await t.scrollTo(`${CARDS}[2]`, "center"); r.captureThirdOpenPanel = await t.shot("post-experience-third-open-panel"); }
  await t.scrollTo(`${CARDS}[2].querySelector("summary")`, "center");
  const p3b = await t.ev(SUMMARY_PT(2)); await t.click(p3b.x, p3b.y);
  r.thirdClosedAgain = await t.ev(CARD_STATE(2));

  r.noOverflowAllOpen = await t.ev(`(() => { ${CARDS}.forEach((d) => { d.open = true; }); const ok = document.documentElement.scrollWidth <= innerWidth; return ok; })()`);
  await t.scrollTo(`document.querySelector("#experience .experience-panel")`, "start");
  r.captureAllOpen = await t.shot("post-experience-all-open");
  await t.ev(`${CARDS}.forEach((d) => { d.open = false; })`);

  // Mouse click open + close on each card.
  r.clicks = [];
  for (let i = 0; i < 5; i++) {
    await t.scrollTo(`${CARDS}[${i}].querySelector("summary")`, "center");
    const p = await t.ev(SUMMARY_PT(i));
    await t.click(p.x, p.y); const c1 = await t.ev(CARD_STATE(i));
    await t.click(p.x, p.y); const c2 = await t.ev(CARD_STATE(i));
    r.clicks.push({ i, c1, c2, pass: c1.open && c1.after === '"−"' && c1.bodyVisible && !c2.open && c2.after === '"+"' });
  }

  // Keyboard: real Tab presses from the top until each summary is document.activeElement, then Enter, Enter.
  await t.ev(`window.scrollTo(0, 0); document.activeElement && document.activeElement.blur()`);
  r.keyboard = []; let tabs = 0;
  for (let i = 0; i < 5; i++) {
    let hit = false;
    for (let n = 0; n < 80 && !hit; n++) { await t.key("Tab"); tabs++; hit = await t.ev(`document.activeElement === ${CARDS}[${i}].querySelector("summary")`); }
    const kb = { i, reached: hit, focusVisible: hit && await t.ev(`document.activeElement.matches(":focus-visible")`) };
    if (i === 0) kb.capture = await t.shot("post-focus-card1");
    await t.key("Enter"); kb.enter1 = await t.ev(CARD_STATE(i));
    await t.key("Enter"); kb.enter2 = await t.ev(CARD_STATE(i));
    kb.pass = hit && kb.enter1.open && kb.enter1.after === '"−"' && !kb.enter2.open && kb.enter2.after === '"+"';
    r.keyboard.push(kb);
  }
  r.tabPresses = tabs;
  r.activeInTimelineEver = false; // nothing focusable there: counted by focusablesInTimeline
  await t.close();
}

// Informal robustness probe (not a Done When item): closed-height match at intermediate desktop widths.
if (MODE === "post") {
  result.extraWidths = {};
  for (const width of [961, 1024, 1440]) {
    const t = await open(width, "/");
    await t.scrollTo(`document.querySelector("#experience")`, "start");
    const g = await t.ev(GEOM);
    result.extraWidths[width] = { firstTopDelta: g.firstTopDelta, lastBottomDelta: g.lastBottomDelta, timelineRightMinusFirstCardLeft: g.timelineRightMinusFirstCardLeft, liH: g.li.map((x) => x.h), cardH: g.card.map((x) => x.h), noOverflow: g.noOverflow };
    await t.close();
  }
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
