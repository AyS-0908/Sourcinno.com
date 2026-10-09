// p42 rendered check (recipe: P27/P41 render.mjs). No dependency.
// usage: node render.mjs <out-dir> <new-base> <old-base>
//   new-base: this tree served on 127.0.0.1; old-base: a scratch export of 1ebc699 served on another port.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, NEW, OLD] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const profile = join(OUT, `chrome-profile-${Date.now()}`);
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", ["--headless=new", "--remote-debugging-port=0",
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950", "about:blank"],
  { stdio: ["ignore", "ignore", "pipe"] });
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

const out = { new: NEW, old: OLD, pages: {}, names: [], linkBoxes: [], hero375: {} };
try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  const hosts = new Set();
  listeners.add((m) => { if (m.sessionId === sessionId && m.method === "Network.requestWillBeSent") { try { hosts.add(new URL(m.params.request.url).host); } catch {} } });
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable"); await s("DOM.enable"); await s("Accessibility.enable");
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const size = (width) => s("Emulation.setDeviceMetricsOverride", { width, height: width === 375 ? 812 : 900, deviceScaleFactor: 1, mobile: width === 375 });
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const go = async (url) => { await s("Page.navigate", { url }); await sleep(1800); };
  const shot = async (name) => { const { data } = await s("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, name), Buffer.from(data, "base64")); return name; };

  // 1. No eyebrow, no overflow, hero geometry: 4 pages x 2 widths (new), hero geometry at 375 also on old.
  const GEO = `(() => { const w = innerWidth, h = document.querySelector("main .hero"), h1 = h && h.querySelector("h1");
    const wider = [...document.querySelectorAll("body *")].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > w + 0.5; })
      .map((el) => el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : "")).slice(0, 8);
    const hr = h.getBoundingClientRect(), r1 = h1.getBoundingClientRect();
    return { innerWidth: w, eyebrows: document.querySelectorAll(".hero__eyebrow, .section__eyebrow").length, wider,
      hero: { height: Math.round(hr.height), h1Top: Math.round(r1.top - hr.top), padTop: getComputedStyle(h).paddingTop } }; })()`;
  for (const page of ["/contact/", "/mentions-legales/", "/politique-confidentialite/", "/portfolio/"]) {
    for (const width of [1200, 375]) {
      await size(width); await go(NEW + page);
      out.pages[`${page} ${width}`] = await ev(GEO);
      if (width === 375) {
        await ev("scrollTo(0, 0)"); await sleep(300);
        await shot(`hero-${page.replace(/\//g, "")}-375-new.png`);
        await go(OLD + page);
        out.hero375[page] = { old: (await ev(GEO)).hero, new: out.pages[`${page} ${width}`].hero };
        await ev("scrollTo(0, 0)"); await sleep(300);
        await shot(`hero-${page.replace(/\//g, "")}-375-old.png`);
      }
    }
  }

  // 2. Accessible names (CDP Accessibility.getPartialAXTree) at 1200, and visible link boxes new vs old.
  await size(1200);
  const LINKS = [
    ["/publications/", "blog", '#blog-list a[href*="gpts-attention-1"]'],
    ["/publications/", "footer", '.site-footer a[href*="linkedin.com"]'],
    ["/publications/", "card", '.card h3 a[href*="engagezvous2-0"]'],
    ["/service-strategie-transformation/", "aria-label", 'a[href="/assets/img/strategy-original.png"]'],
    ["/contact/", "in-text", 'main a[href*="linkedin.com"]'],
  ];
  const BOX = (sel) => `(() => { const a = document.querySelector(${JSON.stringify(sel)}); a.scrollIntoView({ block: "center" });
    const r = a.getBoundingClientRect(), hid = a.querySelector(".visually-hidden"), hr = hid && hid.getBoundingClientRect();
    return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, hidden: hid ? [hr.width, hr.height, getComputedStyle(hid).clip] : null }; })()`;
  for (const [page, kind, sel] of LINKS) {
    await go(NEW + page);
    const { root } = await s("DOM.getDocument", { depth: 0 });
    const { nodeId } = await s("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
    const { nodes } = await s("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
    const node = nodes.find((n) => !n.ignored) || nodes[0];
    const boxNew = await ev(BOX(sel));
    await go(OLD + page);
    const boxOld = await ev(BOX(sel));
    out.names.push({ page, kind, role: node.role?.value, name: node.name?.value });
    out.linkBoxes.push({ page, kind, new: boxNew, old: boxOld, same: boxNew.w === boxOld.w && boxNew.h === boxOld.h });
  }
  out.hosts = [...hosts];
  console.log(JSON.stringify(out, null, 1));
} catch (e) { console.log(JSON.stringify(out, null, 1)); console.error("RENDER ERROR: " + (e.stack || e)); process.exitCode = 1; }
finally { try { await send("Browser.close"); } catch {} chrome.kill(); }
