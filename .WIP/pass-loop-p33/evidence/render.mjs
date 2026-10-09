// p33 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p32 recipe (git show 7f5a8c4:.WIP/pass-loop-p32/evidence/render.mjs): same launch flags (every YouTube host
// mapped to NOTFOUND at the resolver), explicit reduced-motion, scroll then wait for the reveal from Node.
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: one capture per Venture <main> section at 1200 and 375.
// post = PLAN § 33 Done When 3 on /service-venture-building/ (+ IA caption link cue), each element on its own rect.
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
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = `${name}-${width}.jpg`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  // Scroll, then wait for the .reveal section from Node (never inside Runtime.evaluate: scripts-off stops timers).
  const scrollTo = async (expr, block = "start") => {
    await ev(`(${expr}).scrollIntoView({ block: "${block}" })`);
    for (let k = 0; k < 40; k++) {
      const op = await ev(`(() => { const sec = (${expr}).closest(".reveal"); return sec ? getComputedStyle(sec).opacity : "1"; })()`);
      if (op === "1") break; await sleep(100);
    }
    await sleep(700);
  };
  return { s, ev, shot, scrollTo, reqs: () => requests.get(sessionId), close: () => send("Target.closeTarget", { targetId }) };
}

const VB = "/service-venture-building/";
const SECTIONS = `[...document.querySelectorAll("main > section")]`;
const OVERFLOW = `({ scrollWidth: document.documentElement.scrollWidth, innerWidth })`;
// WCAG relative luminance from computed colours; background = nearest ancestor with an opaque computed background-color.
const CONTRAST = (sel) => `(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  return [...document.querySelectorAll(${JSON.stringify(sel)})].map((el) => {
    const fg = parse(getComputedStyle(el).color); let n = el, bg = null, from = null;
    while (n && n.nodeType === 1) { const c = parse(getComputedStyle(n).backgroundColor); if (c.a === 1) { bg = c; from = n.className || n.tagName; break; } n = n.parentElement; }
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    return { text: el.textContent.trim(), color: getComputedStyle(el).color, background: \`rgb(\${bg.r}, \${bg.g}, \${bg.b})\`, bgFrom: from, fgAlpha: fg.a, ratio: Math.round(ratio * 100) / 100 };
  });
})()`;
// Every element of the matrix that owns a text node: computed font size, own rect, and (for quadrant texts) its quadrant rect.
const MATRIX_TEXTS = `(() => {
  const els = [...document.querySelectorAll(".vb-matrix *")].filter((el) => [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()));
  return els.map((el) => {
    const r = el.getBoundingClientRect(); const q = el.closest(".vb-matrix__cell"); const qr = q && q.getBoundingClientRect();
    const inside = !q || (r.left >= qr.left - 0.5 && r.right <= qr.right + 0.5 && r.top >= qr.top - 0.5 && r.bottom <= qr.bottom + 0.5);
    return { text: el.textContent.trim(), cls: el.className, fontPx: parseFloat(getComputedStyle(el).fontSize), w: Math.round(r.width), h: Math.round(r.height), quadrant: q ? q.querySelector(".vb-matrix__name").textContent.trim() : null, inside };
  });
})()`;
const LAYOUT = `(() => {
  const ids = ["kodak", "besoin", "experience", "reflexion"]; const tops = ids.map((id) => { const el = document.getElementById(id); return el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; });
  const m = document.querySelector(".vb-matrix")?.getBoundingClientRect(); const t = document.querySelector(".vb-kodak__text")?.getBoundingClientRect();
  return { order: ids, tops, ordered: tops.every((v, i) => v !== null && (i === 0 || v > tops[i - 1])), firstSectionAfterHero: document.querySelector("main > section:nth-of-type(2)")?.id,
    matrix: m && { left: Math.round(m.left), right: Math.round(m.right), top: Math.round(m.top), width: Math.round(m.width) }, text: t && { left: Math.round(t.left), top: Math.round(t.top), width: Math.round(t.width) },
    matrixLeftOfText: !!(m && t && m.right <= t.left), matrixAboveText: !!(m && t && m.bottom <= t.top),
    ariaRole: document.querySelector(".vb-matrix")?.getAttribute("role"), ariaLabel: document.querySelector(".vb-matrix")?.getAttribute("aria-label") };
})()`;
const CAPTIONS = `[...document.querySelectorAll(".band-figure figcaption a")].map((a) => ({ text: a.textContent.trim(), deco: getComputedStyle(a).textDecorationLine, color: getComputedStyle(a).color }))`;
const VISIBLE = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = Math.min(r.top + r.height / 2, innerHeight / 2 + 76 / 2); /* centre, below the 76 px sticky header */ const t = document.elementFromPoint(cx, cy);
  return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), opacity: getComputedStyle(el).opacity, inViewport: r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0, topmost: !!t && el.contains(t) }; })()`;

const result = { mode: MODE };
for (const width of [1200, 375]) {
  if (MODE === "pre") {
    const t = await open(width, VB);
    const n = await t.ev(`${SECTIONS}.length`); const r = result[`venture-${width}`] = { sections: await t.ev(`${SECTIONS}.map((s) => s.id || s.className)`), captures: [] };
    for (let i = 0; i < n; i++) { await t.scrollTo(`${SECTIONS}[${i}]`); r.captures.push(await t.shot(`pre-venture-s${i + 1}`)); }
    r.overflow = await t.ev(OVERFLOW); await t.close(); continue;
  }
  const r = result[`venture-${width}`] = {};
  let t = await open(width, VB);
  const n = await t.ev(`${SECTIONS}.length`); r.captures = [];
  for (let i = 0; i < n; i++) { await t.scrollTo(`${SECTIONS}[${i}]`); r.captures.push(await t.shot(`post-venture-s${i + 1}`)); }
  await t.scrollTo(`document.querySelector(".vb-matrix")`, "center"); r.captures.push(await t.shot("post-venture-matrix"));
  r.layout = await t.ev(LAYOUT);
  r.layout.matrixWideEnough = width < 861 || r.layout.matrix.width >= 420;
  r.overflow = await t.ev(OVERFLOW); r.noOverflow = r.overflow.scrollWidth <= r.overflow.innerWidth;
  r.matrixTexts = await t.ev(MATRIX_TEXTS);
  r.matrixTextsOk = r.matrixTexts.length > 0 && r.matrixTexts.every((x) => x.fontPx >= 14 && x.inside && x.w > 0 && x.h > 0);
  r.exploration = await t.ev(CONTRAST(".vb-matrix__cell--hot p"));
  r.explorationOk = r.exploration.length > 0 && r.exploration.every((x) => x.ratio >= 4.5 && x.fgAlpha === 1);
  r.captions = await t.ev(CAPTIONS); r.captionsOk = r.captions.length === 2 && r.captions.every((c) => c.deco.includes("underline"));
  r.youtubeRequests = t.reqs().filter((u) => /youtube|ytimg|googlevideo/i.test(u)).length;
  await t.close();
  // IA page: its one video caption gets the same cue.
  t = await open(width, "/service-ia-business/");
  r.iaCaptions = await t.ev(CAPTIONS); r.iaCaptionsOk = r.iaCaptions.length === 1 && r.iaCaptions[0].deco.includes("underline");
  await t.close();
  // Scripts disabled: the Kodak section is visible (synchronous evaluate only; wait from Node).
  t = await open(width, VB, { noScript: true });
  await t.ev(`document.getElementById("kodak").scrollIntoView({ block: "center" })`); await sleep(600);
  r.noScriptKodak = await t.ev(VISIBLE("#kodak")); r.noScriptMatrix = await t.ev(VISIBLE(".vb-matrix"));
  r.noScriptOk = [r.noScriptKodak, r.noScriptMatrix].every((v) => v.inViewport && v.topmost && v.h > 0) && r.noScriptKodak.opacity === "1";
  r.captures.push(await t.shot("post-venture-noscript"));
  await t.close();
  r.pass = r.layout.ordered && r.layout.firstSectionAfterHero === "kodak" && (width < 861 ? r.layout.matrixAboveText : r.layout.matrixLeftOfText) && r.layout.matrixWideEnough
    && r.noOverflow && r.matrixTextsOk && r.explorationOk && r.captionsOk && r.iaCaptionsOk && r.noScriptOk && r.youtubeRequests === 0;
}
writeFileSync(join(OUT, `result-${MODE}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
ws.close(); chrome.kill();
process.exit(0);
