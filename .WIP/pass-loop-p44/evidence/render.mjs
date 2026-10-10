// p44 rendered checks: headless Chrome over its debugging protocol, no dependency (AGENTS recipe, base
// .WIP/pass-loop-p40/evidence/computed.mjs launch). PLAN § 44 Done When 3.
// usage: [P44_ONLY=footer,cards,venture,launch,logos,full] node render.mjs <out-dir> <profile-dir> <base-url> <tag>
// Writes <out-dir>/<tag>-render.json (measures) and PNG captures <tag>-*.png; pixel judgement is done by
// pixels.py on those PNGs. Only 127.0.0.1 and Google Fonts are reachable (YouTube/Typebot/jsdelivr NOTFOUND).
// prefers-reduced-motion is set explicitly on every page (AGENTS: headless defaults to reduce here).
// :hover is forced with CSS.forcePseudoState (a static capture cannot see it).
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const [OUT, PROFILE, BASE, TAG] = process.argv.slice(2);
if (!OUT || !PROFILE || !BASE || !TAG) { console.error("usage: node render.mjs <out-dir> <profile> <base> <tag>"); process.exit(2); }
mkdirSync(OUT, { recursive: true });
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

async function open(path, width, motion = "reduce") {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  requests.set(sessionId, []);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable"); await s("DOM.enable"); await s("CSS.enable");
  await s("Network.setCacheDisabled", { cacheDisabled: true });
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: motion }] });
  const loaded = new Promise((r) => loads.set(sessionId, r));
  await s("Page.navigate", { url: BASE + path });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(3000);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await ev(`(async () => { for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
    await document.fonts.ready; })()`);
  const media = await ev(`matchMedia("(prefers-reduced-motion: ${motion})").matches && innerWidth === ${width}`);
  const force = async (selector, on) => {
    const { root } = await s("DOM.getDocument", { depth: -1 });
    const { nodeId } = await s("DOM.querySelector", { nodeId: root.nodeId, selector });
    if (!nodeId) throw new Error("no node " + selector);
    await s("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: on ? ["hover"] : [] });
    await sleep(500);
  };
  const shot = async (file, clip) => {
    const r = await s("Page.captureScreenshot", clip ? { format: "png", clip: { ...clip, scale: 1 }, captureBeyondViewport: true } : { format: "png", captureBeyondViewport: true });
    writeFileSync(`${OUT}/${TAG}-${file}.png`, Buffer.from(r.data, "base64"));
  };
  return { ev, media, force, shot, outside: () => requests.get(sessionId).filter((u) => !ALLOWED.test(u)), close: () => send("Target.closeTarget", { targetId }) };
}

const ONLY = (process.env.P44_ONLY || "footer,cards,venture,launch,logos,full").split(",");
const want = (k) => ONLY.includes(k);
const out = { base: BASE, tag: TAG, checks: {}, media: [], outside: [] };
const done = async (p, id) => { out.media.push([id, p.media]); out.outside.push(...p.outside()); await p.close(); };
const rectOf = (sel) => `(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`;
const overflow = (w) => `[...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > ${w} + 0.5; }).slice(0, 5).map((e) => e.localName + "." + e.className + " " + Math.round(e.getBoundingClientRect().right))`;

// 1. Footer button: computed colour on two pages, then forced :hover.
if (want("footer")) for (const path of ["/", "/contact/"]) {
  const p = await open(path, 1200);
  const sel = ".site-footer .btn--primary";
  const read = `(() => { const b = document.querySelector(${JSON.stringify(sel)}); const cs = getComputedStyle(b); const r = b.getBoundingClientRect();
    return { text: b.textContent, color: cs.color, background: cs.backgroundColor, transition: cs.transitionProperty, w: r.width, h: r.height }; })()`;
  const rest = await p.ev(read);
  await p.force(sel, true);
  const hover = await p.ev(read);
  await p.force(sel, false);
  const link = await p.ev(`getComputedStyle(document.querySelector(".site-footer li a")).color`);
  await p.force(".site-footer li a", true);
  const linkHover = await p.ev(`getComputedStyle(document.querySelector(".site-footer li a")).color`);
  await p.ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: "center" })`);
  await p.shot(`footer-${path === "/" ? "home" : "contact"}-1200`, await p.ev(rectOf(".site-footer")));
  out.checks[`footer ${path}`] = { rest, hover, link, linkHover };
  await done(p, `footer ${path}`);
}

// 2. Home service cards: box-shadow and transform at rest and on forced :hover, both motion settings.
if (want("cards")) for (const motion of ["no-preference", "reduce"]) {
  const p = await open("/", 1200, motion);
  const res = [];
  const n = await p.ev(`document.querySelectorAll("#services .card--service").length`);
  for (let i = 1; i <= n; i++) {
    const sel = `#services .card--service:nth-of-type(${i})`;
    const ok = await p.ev(`!!document.querySelector(${JSON.stringify(sel)})`);
    const target = ok ? sel : `#services .grid > :nth-child(${i})`;
    const read = `(() => { const cs = getComputedStyle(document.querySelector(${JSON.stringify(target)})); return { shadow: cs.boxShadow, transform: cs.transform }; })()`;
    const rest = await p.ev(read);
    await p.force(target, true);
    const hover = await p.ev(read);
    await p.force(target, false);
    res.push({ target, rest, hover });
  }
  out.checks[`cards ${motion}`] = res;
  await done(p, `cards ${motion}`);
}

// 3. Venture: matrix words at 320/375/1200, « autour », overflow, captures.
if (want("venture")) for (const width of [320, 375, 1200]) {
  const p = await open("/service-venture-building/", width);
  const words = await p.ev(`(() => { const out = [];
    for (const cell of document.querySelectorAll(".vb-matrix__cell")) {
      const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
      const inL = cr.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), inR = cr.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
      const w = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      for (let t; (t = w.nextNode());) { const re = /[^\\s\\u00a0]+/g; let m;
        while ((m = re.exec(t.data))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length);
          const rects = [...r.getClientRects()].filter((x) => x.width > 0);
          out.push({ word: m[0], lines: new Set(rects.map((x) => Math.round(x.top))).size, rects: rects.length, fontSize: getComputedStyle(t.parentElement).fontSize,
            inContentBox: rects.every((x) => x.left >= inL - 0.5 && x.right <= inR + 0.5), width: Math.round(Math.max(0, ...rects.map((x) => x.width))), content: Math.round(inR - inL) }); } }
      out.push({ cell: cell.textContent.trim(), width: cr.width, height: cr.height, minHeight: cs.minHeight, wrap: cs.overflowWrap });
    } return out; })()`);
  const autour = await p.ev(`(() => { const s = [...document.querySelectorAll(".vb-kodak__text strong")].find((e) => e.textContent.includes("autour"));
    return { text: s.textContent, codepoints: [...s.textContent].map((c) => c.codePointAt(0).toString(16)), nbsp: [...s.textContent].filter((c) => c === "\\u00a0").length,
      line: s.parentElement.textContent.replace(/\\u00a0/g, " ") }; })()`);
  const over = await p.ev(overflow(width));
  const vw = await p.ev(`innerWidth`);
  await p.shot(`venture-matrix-${width}`, await p.ev(rectOf(".vb-kodak")));
  await p.shot(`venture-full-${width}`);
  out.checks[`venture ${width}`] = { vw, words, autour, overflow: over };
  await done(p, `venture ${width}`);
}

// 4. Launchers at 1200 and 375: box geometry + capture of each launcher (pixels.py judges the edge rows).
const LAUNCH = [["/service-ia-business/", 0, "ia"], ["/service-venture-building/", 0, "vb1"], ["/service-venture-building/", 1, "vb2"], ["/publications/", 0, "pub"]];
if (want("launch")) for (const width of [1200, 375]) {
  for (const [path, idx, name] of LAUNCH) {
    const p = await open(path, width);
    const geo = await p.ev(`(() => { const b = document.querySelectorAll(".video-launch")[${idx}]; b.scrollIntoView({ block: "center" });
      const r = b.getBoundingClientRect(); const img = b.querySelector("img"); const ir = img.getBoundingClientRect();
      return { src: img.getAttribute("src"), natural: [img.naturalWidth, img.naturalHeight], attr: [img.getAttribute("width"), img.getAttribute("height")],
        box: { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }, ratio: r.width / r.height, img: [ir.width, ir.height], fit: getComputedStyle(img).objectFit }; })()`);
    await sleep(300);
    await p.shot(`launch-${name}-${width}`, geo.box);
    out.checks[`launch ${name} ${width}`] = { ...geo, overflow: await p.ev(overflow(width)) };
    await done(p, `launch ${name} ${width}`);
  }
}

// 5. Home logo band at 1200 and 375: rects of each logo + capture at rest and with forced :hover on three logos.
if (want("logos")) for (const width of [1200, 375]) {
  const p = await open("/", width);
  const band = await p.ev(`(() => { const sec = document.querySelector("#references"); sec.scrollIntoView({ block: "center" });
    const b = document.querySelector("#references .logo-band"); const r = b.getBoundingClientRect(); const cs = getComputedStyle(sec);
    return { bg: cs.backgroundColor, rect: { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height },
      logos: [...b.querySelectorAll("img")].map((i) => { const q = i.getBoundingClientRect(); const c = getComputedStyle(i);
        return { src: i.getAttribute("src"), x: q.left + scrollX - r.left - scrollX, y: q.top - r.top, width: q.width, height: q.height,
          blend: c.mixBlendMode, filter: c.filter, opacity: c.opacity, complete: i.complete && i.naturalWidth > 0 }; }) }; })()`);
  await sleep(300);
  await p.shot(`logos-${width}-rest`, band.rect);
  const hovered = [];
  for (const name of ["accenture", "fabereo", "mazars"]) {
    const sel = `#references .logo-band img[src*="logo_${name}"]`;
    if (!(await p.ev(`!!document.querySelector(${JSON.stringify(sel)})`))) { hovered.push({ name, missing: true }); continue; }
    await p.force(sel, true);
    const c = await p.ev(`(() => { const c = getComputedStyle(document.querySelector(${JSON.stringify(sel)})); return { filter: c.filter, opacity: c.opacity, blend: c.mixBlendMode }; })()`);
    await p.shot(`logos-${width}-hover-${name}`, band.rect);
    await p.force(sel, false);
    hovered.push({ name, ...c });
  }
  out.checks[`logos ${width}`] = { ...band, hovered, overflow: await p.ev(overflow(width)) };
  await done(p, `logos ${width}`);
}

// 6. Full-page captures of the touched routes at 1200/375/320.
if (want("full")) for (const width of [1200, 375, 320]) {
  for (const [path, name] of [["/", "home"], ["/service-ia-business/", "ia"], ["/publications/", "pub"]]) {
    const p = await open(path, width);
    await p.shot(`full-${name}-${width}`);
    out.checks[`full ${name} ${width}`] = { overflow: await p.ev(overflow(width)) };
    await done(p, `full ${name} ${width}`);
  }
}

out.outside = [...new Set(out.outside)];
out.badMedia = out.media.filter(([, m]) => !m).map(([id]) => id);
writeFileSync(`${OUT}/${TAG}-render.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ tag: TAG, outside: out.outside, badMedia: out.badMedia }));
ws.close(); chrome.kill();
