// p40 computed-style comparison: headless Chrome over its debugging protocol, no dependency.
// Base: p38 recipe (git show 19a4518:.WIP/pass-loop-p38/evidence/render.mjs). PLAN § 40 Done When 4.
// Every element of the 10 shell pages (document order, keyed by its tag:index path), plus its ::before and
// ::after, at 1200 and 375 px, prefers-reduced-motion: reduce emulated (static page: no transition, no drift).
// Each element's style = every property of getComputedStyle, page origin replaced by ORIGIN, hashed in the page.
// Before reading: lazy images switched to eager and awaited, document.fonts.ready awaited, 3 s after load so the
// 2.5 s reveal-wait timer has run. Only 127.0.0.1 and Google Fonts are reachable: YouTube, Typebot and jsdelivr
// hosts are mapped to NOTFOUND at the resolver (same on both sides); any other request is listed.
// usage: node computed.mjs capture <out.json> <profile-dir> <base-url>
//        node computed.mjs compare <out.json> <profile-dir> <base-url-A> <base-url-B> [saved-capture.json]
//   compare loads A and B side by side; for every element whose hash differs, it reads both full styles and
//   lists the differing properties. With a saved capture, A's hashes are also compared with it (determinism).
// Properties are sorted by name (Chrome's custom-property order varies between loads). Standard and custom (--x)
// properties are hashed apart: a custom property absent in A and named in P40_NEW_TOKENS (comma list) is counted
// under newTokensAdded, never as a difference; any other change counts. P40_ONLY=/a/,/b/ limits the pages.
// Exit 0 only with 0 differences, A = saved capture, media/width emulated everywhere and no outside request.
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";

const [MODE, OUT, PROFILE, A, B, SAVED] = process.argv.slice(2);
if (!["capture", "compare"].includes(MODE) || !OUT || !PROFILE || !A || (MODE === "compare" && !B)) {
  console.error("usage: node computed.mjs capture|compare <out.json> <profile-dir> <base-A> [<base-B> [saved.json]]");
  process.exit(2);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGES = ["/", "/404.html", "/contact/", "/mentions-legales/", "/politique-confidentialite/", "/portfolio/",
  "/publications/", "/service-ia-business/", "/service-strategie-transformation/", "/service-venture-building/"];
const WIDTHS = [1200, 375];
if (process.env.P40_ONLY) PAGES.splice(0, PAGES.length, ...process.env.P40_ONLY.split(","));

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
let seq = 0; const pending = new Map(); const requests = new Map(); const loads = new Map();
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

// In the page: one entry per element, [key, hash of standard properties, hash of custom properties (--x)];
// window.__styles keeps the six strings (standard ×3 parts, custom ×3 parts) for detail reads.
const COLLECT = `(async () => {
  for (const img of document.images) img.loading = "eager";
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const origin = location.origin;
  const keyOf = (el) => { const parts = []; for (let e = el; e; e = e.parentElement) { const p = e.parentElement; parts.unshift(e.localName + (p ? ":" + Array.prototype.indexOf.call(p.children, e) : "")); } return parts.join(">"); };
  // Properties sorted by name: Chrome lists custom properties (--x) in an order that varies from one load to the next.
  const ser = (cs) => { const names = []; for (let i = 0; i < cs.length; i++) names.push(cs[i]); names.sort();
    const str = (list) => list.map((n) => n + ":" + cs.getPropertyValue(n) + ";").join("").split(origin).join("ORIGIN");
    return [str(names.filter((n) => !n.startsWith("--"))), str(names.filter((n) => n.startsWith("--")))]; };
  const hash = (str) => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0"); };
  const snap = () => { const m = new Map(); for (const el of document.querySelectorAll("*")) {
    const [e, b, a] = [getComputedStyle(el), getComputedStyle(el, "::before"), getComputedStyle(el, "::after")].map(ser);
    m.set(keyOf(el), [e[0], b[0], a[0], e[1], b[1], a[1]]); } return m; };
  // Settle: read again every 700 ms until two reads in a row are identical (at most 15 reads); the last change is reported.
  let prev = snap(), reads = 1, lastChange = null;
  for (; reads < 15; reads++) {
    await new Promise((r) => setTimeout(r, 700));
    const cur = snap();
    let changed = null;
    for (const [k, v] of cur) { const p = prev.get(k); if (!p) { changed = { key: k, added: true }; break; } for (let j = 0; j < 6; j++) if (p[j] !== v[j]) {
      const a = p[j].split(";"), b = v[j].split(";"); changed = { key: k, part: j, props: b.filter((x, i) => x !== a[i]).slice(0, 4), was: a.filter((x, i) => x !== b[i]).slice(0, 4) }; break; } if (changed) break; }
    if (!changed && cur.size === prev.size) { prev = cur; break; }
    lastChange = changed; prev = cur;
  }
  window.__styles = prev;
  return { reads, lastChange, entries: [...prev].map(([k, s]) => [k, hash(s.slice(0, 3).join("|")), hash(s.slice(3).join("|"))]) };
})()`;

async function open(base, path, width) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
  await s("Network.setCacheDisabled", { cacheDisabled: true });
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
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
  const media = await ev(`matchMedia("(prefers-reduced-motion: reduce)").matches && innerWidth === ${width}`);
  const { reads, lastChange, entries } = await ev(COLLECT);
  if (reads >= 15) throw new Error(`${base}${path} @${width}: styles never settled; last change ${JSON.stringify(lastChange).slice(0, 400)}`);
  const outside = requests.get(sessionId).filter((u) => !ALLOWED.test(u));
  return { ev, media, entries, reads, lastChange, outside, close: () => send("Target.closeTarget", { targetId }) };
}

const PART = ["element", "::before", "::after"];
function diffProps(sa, sb, from) {
  const out = [];
  for (let k = from; k < from + 3; k++) {
    if (sa[k] === sb[k]) continue;
    const parse = (str) => new Map(str.split(";").filter(Boolean).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i), x.slice(i + 1)]; }));
    const ma = parse(sa[k]), mb = parse(sb[k]);
    for (const n of new Set([...ma.keys(), ...mb.keys()])) if (ma.get(n) !== mb.get(n)) out.push({ part: PART[k - from], prop: n, a: ma.get(n), b: mb.get(n) });
  }
  return out;
}

// Custom properties this Pass adds to :root (inherited by every element): listed apart, never counted as a difference.
const NEW_TOKENS = new Set((process.env.P40_NEW_TOKENS || "").split(",").filter(Boolean));
const saved = SAVED ? JSON.parse(readFileSync(SAVED, "utf8")) : null;
const result = { mode: MODE, A, B: B || null, saved: SAVED || null, newTokens: [...NEW_TOKENS], pages: {} };
const tokenAdds = new Map();
let totalElements = 0, totalDiffs = 0, totalSavedDiffs = 0, badMedia = 0, outsideAll = [];
for (const width of WIDTHS) {
  for (const path of PAGES) {
    const id = `${path} @${width}`;
    const ta = await open(A, path, width);
    const r = { elements: ta.entries.length, media: ta.media, reads: ta.reads, lastChange: ta.lastChange };
    if (!ta.media) badMedia++;
    outsideAll.push(...ta.outside);
    totalElements += ta.entries.length;
    if (MODE === "capture") r.hashes = ta.entries;
    if (saved) {
      const prev = saved.pages[id]?.hashes || [];
      const same = prev.length === ta.entries.length && prev.every((e, i) => e[0] === ta.entries[i][0] && e[1] === ta.entries[i][1] && e[2] === ta.entries[i][2]);
      r.savedMatch = same;
      if (!same) totalSavedDiffs++;
    }
    if (MODE === "compare") {
      const tb = await open(B, path, width);
      if (!tb.media) badMedia++;
      outsideAll.push(...tb.outside);
      r.elementsB = tb.entries.length;
      const keysA = ta.entries.map((e) => e[0]).join("\n"), keysB = tb.entries.map((e) => e[0]).join("\n");
      r.sameStructure = keysA === keysB;
      const hb = new Map(tb.entries.map(([k, h, hc]) => [k, [h, hc]]));
      r.differing = [];
      r.tokenOnly = 0;
      const EMPTY = `["", "", "", "", "", ""]`;
      for (const [k, h, hc] of ta.entries) {
        const [h2, hc2] = hb.get(k) || [];
        if (h === h2 && hc === hc2) continue;
        const sa = await ta.ev(`window.__styles.get(${JSON.stringify(k)}) || ${EMPTY}`);
        const sb = await tb.ev(`window.__styles.get(${JSON.stringify(k)}) || ${EMPTY}`);
        const props = h === h2 ? [] : diffProps(sa, sb, 0);
        for (const d of hc === hc2 ? [] : diffProps(sa, sb, 3)) {
          if (d.a === undefined && NEW_TOKENS.has(d.prop)) { const t = `${d.prop}: ${d.b}`; tokenAdds.set(t, (tokenAdds.get(t) || 0) + 1); }
          else props.push(d);
        }
        if (props.length || !hb.has(k)) r.differing.push({ key: k, props }); else r.tokenOnly++;
      }
      totalDiffs += r.differing.length + (r.sameStructure ? 0 : 1);
      await tb.close();
    }
    await ta.close();
    result.pages[id] = r;
    console.log(`${id}: ${r.elements} elements${MODE === "compare" ? `, B ${r.elementsB}, structure ${r.sameStructure ? "same" : "DIFFERENT"}, ${r.differing.length} differing` : ""}${saved ? `, saved ${r.savedMatch ? "match" : "MISMATCH"}` : ""}${r.media ? "" : ", MEDIA/WIDTH NOT EMULATED"}`);
  }
}
result.summary = { pagesWidths: Object.keys(result.pages).length, totalElements, totalDiffs, totalSavedDiffs, badMedia, outside: [...new Set(outsideAll)],
  newTokensAdded: Object.fromEntries(tokenAdds) };
writeFileSync(OUT, JSON.stringify(result, null, MODE === "capture" ? 0 : 1));
console.log(JSON.stringify(result.summary));
ws.close(); chrome.kill();
process.exit(totalDiffs || totalSavedDiffs || badMedia || result.summary.outside.length ? 1 : 0);
