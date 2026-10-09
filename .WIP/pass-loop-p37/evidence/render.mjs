// p37 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p36 recipe (git show d83e26c:.WIP/pass-loop-p36/evidence/render.mjs: emulated 1200/375, right edges vs the
// emulated width, scripts-off run, request log, topmost probe below the 76 px sticky header, real Tab via Input.dispatchKeyEvent).
// YouTube, Typebot and jsdelivr hosts are mapped to NOTFOUND at the resolver; every request outside localhost / Google Fonts is listed.
// prefers-reduced-motion is set explicitly to `reduce` (stable geometry: .reveal shows without transition); reveal awaited from Node.
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = before any edit: Stratégie, IA, Venture full page at 1200 and 375 + geometry/colours of every #besoin / #experience element.
// post = the same + PLAN § 37 Done When 4 on /service-strategie-transformation/ (row 05 open capture included).
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
let seq = 0; const pending = new Map(); const requests = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); return; }
  if (m.method === "Network.requestWillBeSent" && requests.has(m.sessionId)) requests.get(m.sessionId).push(m.params.request.url);
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const ALLOWED = /^(https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/|https:\/\/fonts\.(googleapis|gstatic)\.com\/|data:|about:)/;

async function open(width, path, { noScript = false } = {}) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  if (noScript) await s("Emulation.setScriptExecutionDisabled", { value: true });
  await s("Page.navigate", { url: BASE + path }); await sleep(1800);
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
  const key = async (k, shift = false) => {
    const map = { Tab: ["Tab", 9, ""], Enter: ["Enter", 13, "\r"] };
    const [keyName, vk, text] = map[k];
    const modifiers = shift ? 8 : 0;
    await s("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: keyName, code: k, windowsVirtualKeyCode: vk, text: text || undefined, modifiers });
    await s("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code: k, windowsVirtualKeyCode: vk, modifiers });
    await sleep(120);
  };
  // Scroll every .reveal section into view, then wait from Node for opacity 1 (never inside Runtime.evaluate: scripts-off stops timers).
  const revealAll = async () => {
    const n = await ev(`document.querySelectorAll(".reveal").length`);
    for (let i = 0; i < n; i++) {
      await ev(`document.querySelectorAll(".reveal")[${i}].scrollIntoView({ block: "start" })`);
      for (let k = 0; k < 40; k++) { if (await ev(`getComputedStyle(document.querySelectorAll(".reveal")[${i}]).opacity`) === "1") break; await sleep(100); }
    }
    await ev(`scrollTo(0, 0)`); await sleep(300);
  };
  const outside = () => requests.get(sessionId).filter((u) => !ALLOWED.test(u));
  return { s, ev, shot, key, revealAll, outside, close: () => send("Target.closeTarget", { targetId }) };
}

// Geometry of every element under #besoin / #experience, in document coordinates, plus colours (IA/Venture before vs after).
const GEOMETRY = `["besoin", "experience"].flatMap((id) => [document.getElementById(id), ...document.querySelectorAll("#" + id + " *")].map((e) => {
  const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return [id, e.tagName, e.className, Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height), cs.color, cs.backgroundColor, cs.alignItems].join("|"); }))`;
// body clips overflow-x and mobile emulation widens innerWidth (AGENTS Gotcha): compare every main element's right edge to the emulated width.
const OVERFLOW_AT = (w) => `(() => { const bad = [...document.querySelectorAll("main *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > ${w} + 0.5; }).map((e) => e.tagName + "." + e.className + " " + Math.round(e.getBoundingClientRect().right));
  const max = Math.max(...[...document.querySelectorAll("main *")].map((e) => e.getBoundingClientRect().right));
  return { ok: innerWidth === ${w} && document.documentElement.scrollWidth <= ${w} && bad.length === 0, innerWidth, scrollWidth: document.documentElement.scrollWidth, maxRight: Math.round(max), bad: bad.slice(0, 5) }; })()`;
// Visible = own rectangle > 0 and topmost at the centre of its first line box (kept below the 76 px sticky header).
const VISIBLE = (expr) => `(() => { const el = ${expr}; const b = el.getBoundingClientRect(); const f = el.getClientRects()[0] || b; const cy = Math.min(Math.max(f.top + f.height / 2, 77), innerHeight - 5); const t = document.elementFromPoint(f.left + Math.min(f.width / 2, 40), cy);
  return { text: (el.textContent.trim() || el.getAttribute("aria-label") || el.getAttribute("alt") || "").replace(/\\s+/g, " ").slice(0, 60), w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), topmost: !!t && (el === t || el.contains(t)) }; })()`;
const SUMMARIES = `[...document.querySelectorAll("#besoin details.disclosure > summary")]`;
const CARDS = `[...document.querySelectorAll("#experience .service-career")]`;
const DIAGRAMS = `[...document.querySelectorAll("#reflexion .band-figure > a")]`;
const LEAD = `(() => { const cs = getComputedStyle(document.querySelector("#besoin .lead")); return { bg: cs.backgroundColor, padding: cs.paddingTop + " " + cs.paddingLeft, radius: cs.borderTopLeftRadius }; })()`;
const ROW = (i) => `document.querySelectorAll("#besoin .service-question-list details.disclosure")[${i}]`;

const PAGES = { strategie: "/service-strategie-transformation/", ia: "/service-ia-business/", venture: "/service-venture-building/" };
const result = { mode: MODE };
for (const width of [1200, 375]) {
  const r = result[width] = {};
  for (const [name, path] of Object.entries(PAGES)) {
    const t = await open(width, path);
    await t.revealAll();
    r[name] = { geometry: await t.ev(GEOMETRY), overflow: await t.ev(OVERFLOW_AT(width)), capture: await t.shot(`${MODE}-${name}`, true), outside: t.outside() };
    await t.close();
  }
  if (MODE === "pre") continue;
  const st = r.strategie;
  // 1. Lead without box, counts, row 05 open (overflow + capture); DOM-only mutation proof of the modifier hook at the end.
  let t = await open(width, PAGES.strategie);
  await t.revealAll();
  st.lead = await t.ev(LEAD);
  st.summaryAlign = await t.ev(`getComputedStyle(${SUMMARIES}[0]).alignItems`);
  st.counts = await t.ev(`({ rows: document.querySelectorAll("#besoin .service-question-list > li").length, disclosures: document.querySelectorAll("#besoin details.disclosure").length, details: document.querySelectorAll("#besoin .service-detail").length, cards: ${CARDS}.length, diagrams: ${DIAGRAMS}.map((a) => [a.getAttribute("href"), a.getAttribute("aria-label"), a.target, !!a.querySelector("img[alt]")]), h2: [...document.querySelectorAll("main h2")].map((h) => h.textContent.trim()) })`);
  await t.ev(`${ROW(4)}.open = true`); await sleep(200);
  st.row05 = { open: await t.ev(`${ROW(4)}.open`), overflow: await t.ev(OVERFLOW_AT(width)) };
  await t.ev(`${ROW(4)}.querySelector(".service-detail .ticks:last-of-type li:last-child").scrollIntoView({ block: "center" })`); await sleep(200);
  st.row05.lastItem = await t.ev(VISIBLE(`${ROW(4)}.querySelector(".service-detail .ticks:last-of-type li:last-child")`));
  await t.ev(`scrollTo(0, 0)`); await sleep(300);
  st.row05.capture = await t.shot("post-strategie-row05-open", true);
  await t.ev(`${ROW(4)}.open = false; document.getElementById("besoin").classList.remove("service-refinement--usecases")`); await sleep(100);
  st.mutation = { lead: await t.ev(LEAD), summaryAlign: await t.ev(`getComputedStyle(${SUMMARIES}[0]).alignItems`) };
  st.mutation.pass = st.mutation.lead.bg !== "rgba(0, 0, 0, 0)" && st.mutation.summaryAlign === "baseline";
  await t.close();
  // 2. Keyboard: fresh load, real Tab from the top to row 01's summary, Enter; then on to both diagram links.
  t = await open(width, PAGES.strategie);
  await t.revealAll();
  const kb = st.keyboard = {};
  let tabs = 0, hit = false;
  for (; tabs < 80 && !hit; ) { await t.key("Tab"); tabs++; hit = await t.ev(`document.activeElement === ${ROW(0)}.querySelector("summary")`); }
  kb.row01 = { tabs, reached: hit, focusVisible: hit && await t.ev(`document.activeElement.matches(":focus-visible")`) };
  if (hit) {
    await t.key("Enter"); await sleep(200);
    kb.row01.open = await t.ev(`${ROW(0)}.open`);
    for (const [k, sel] of [["question", ".service-question"], ["dataLabel", ".service-detail__label"]]) {
      await t.ev(`${ROW(0)}.querySelector("${sel}").scrollIntoView({ block: "center" })`); await sleep(200);
      kb.row01[k] = await t.ev(VISIBLE(`${ROW(0)}.querySelector("${sel}")`));
    }
    kb.overflowOpen = await t.ev(OVERFLOW_AT(width));
  }
  kb.diagrams = [];
  for (let d = 0; d < 2; d++) {
    let n = 0; hit = false;
    for (; n < 80 && !hit; ) { await t.key("Tab"); n++; hit = await t.ev(`document.activeElement === ${DIAGRAMS}[${d}]`); }
    const item = { tabs: n, reached: hit };
    if (hit) {
      item.focusVisible = await t.ev(`document.activeElement.matches(":focus-visible")`);
      item.outline = await t.ev(`(() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor; })()`);
      item.visible = await t.ev(VISIBLE(`${DIAGRAMS}[${d}]`));
      item.inViewport = await t.ev(`(() => { const b = document.activeElement.getBoundingClientRect(); return b.top < innerHeight && b.bottom > 0; })()`);
      if (d === 0) item.capture = await t.shot("post-strategie-diagram-focus");
    }
    kb.diagrams.push(item);
  }
  kb.outside = t.outside();
  kb.pass = kb.row01.reached && kb.row01.focusVisible && kb.row01.open && kb.row01.question.topmost && kb.row01.dataLabel.topmost && kb.overflowOpen.ok
    && kb.diagrams.every((d) => d.reached && d.focusVisible && d.visible.w > 0 && d.visible.h > 0 && d.visible.topmost && d.inViewport && !d.outline.startsWith("none")) && kb.outside.length === 0;
  await t.close();
  // 3. Scripts disabled: every row summary, every career card and both diagram links visible and topmost (synchronous evaluate only).
  t = await open(width, PAGES.strategie, { noScript: true });
  const ns = st.noScript = { items: [] };
  const n = await t.ev(`${SUMMARIES}.length`), c = await t.ev(`${CARDS}.length`), g = await t.ev(`${DIAGRAMS}.length`);
  for (const [list, count] of [[SUMMARIES, n], [CARDS, c], [DIAGRAMS, g]]) {
    for (let i = 0; i < count; i++) {
      await t.ev(`${list}[${i}].scrollIntoView({ block: "center" })`); await sleep(400);
      ns.items.push(await t.ev(VISIBLE(`${list}[${i}]`)));
    }
  }
  ns.counts = { summaries: n, cards: c, diagrams: g };
  ns.imgLoaded = await t.ev(`${DIAGRAMS}.map((a) => { const i = a.querySelector("img"); return i.complete && i.naturalWidth > 0; })`);
  ns.sectionOpacity = await t.ev(`[...document.querySelectorAll("#besoin, #experience, #reflexion")].map((e) => getComputedStyle(e).opacity)`);
  ns.overflow = await t.ev(OVERFLOW_AT(width));
  ns.capture = await t.shot("post-strategie-noscript", true);
  ns.outside = t.outside();
  ns.pass = n === 7 && c === 5 && g === 2 && ns.items.length === 14 && ns.items.every((v) => v.w > 0 && v.h > 0 && v.topmost) && ns.imgLoaded.every(Boolean) && ns.sectionOpacity.every((o) => o === "1") && ns.overflow.ok && ns.outside.length === 0;
  await t.close();
  st.pass = st.lead.bg === "rgba(0, 0, 0, 0)" && st.lead.padding === "0px 0px" && st.summaryAlign === "flex-start" && st.counts.rows === 7 && st.counts.disclosures === 7 && st.counts.cards === 5 && st.counts.diagrams.length === 2
    && st.row05.open && st.row05.overflow.ok && st.row05.lastItem.topmost && st.mutation.pass && st.overflow.ok && st.outside.length === 0 && kb.pass && ns.pass;
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
const brief = Object.fromEntries([1200, 375].map((w) => [w, Object.fromEntries(Object.entries(result[w]).map(([k, v]) => [k, { ...v, geometry: v.geometry.length }]))]));
console.log(JSON.stringify(brief, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
