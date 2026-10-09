// p28 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p27 recipe (git show 27b136c:.WIP/pass-loop-p27/evidence/render.mjs).
// usage: node render.mjs <captures-dir> <profile-dir> [base-url]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, BASE = "http://127.0.0.1:4173"] = process.argv.slice(2);
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
  await s("Page.navigate", { url: BASE + path }); await sleep(1500);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = `${name}-${width}.jpg`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  return { ev, shot, close: () => send("Target.closeTarget", { targetId }) };
}

// Runs in the page: header geometry. Items = top-level <li>; the button is the last one.
const NAV = `(async () => { let raf = false; await new Promise((r) => { requestAnimationFrame(() => { raf = true; r(); }); setTimeout(r, 1500); });
  const lis = [...document.querySelectorAll(".site-nav__list > li")];
  const items = lis.map((li) => { const el = li.querySelector("a, summary"); const r = el.getBoundingClientRect();
    return { text: el.textContent.trim(), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), h: Math.round(r.height), offsetTop: li.offsetTop, visible: r.width > 0 && r.height > 0 }; });
  const btn = items[items.length - 1], last = items[items.length - 2];
  const logo = document.querySelector(".site-logo").getBoundingClientRect();
  const header = document.querySelector(".site-header").getBoundingClientRect();
  return { innerWidth, raf, scrollWidth: document.documentElement.scrollWidth, noOverflow: document.documentElement.scrollWidth <= innerWidth,
    toggleDisplay: getComputedStyle(document.querySelector(".nav-toggle")).display, headerHeight: Math.round(header.height),
    logoRight: Math.round(logo.right), items, gapLastToButton: btn.left - last.right, lastRightLtButtonLeft: last.right < btn.left,
    offsetTops: lis.map((li) => li.offsetTop), centres: items.map((i) => i.top + i.h / 2),
    oneRow: Math.max(...items.map((i) => i.top + i.h / 2)) - Math.min(...items.map((i) => i.top + i.h / 2)) <= 2 && items.every((i, k) => k === 0 || i.left > items[k - 1].right), buttonInside: btn.right <= innerWidth, logoClear: logo.right < items[0].left,
    textWraps: lis.map((li) => li.querySelector("a, summary")).filter((el) => { const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].map((r) => Math.round(r.top))).size > 1; }).map((el) => el.textContent.trim()) }; })()`;

const result = {};
for (const width of [1200, 1000, 900, 880, 861]) {
  const t = await open(width, "/");
  result["home-" + width] = await t.ev(NAV);
  result["home-" + width].capture = await t.shot("header-home");
  await t.close();
}
{ // active state on the Venture Building page, desktop
  const t = await open(1200, "/service-venture-building/");
  result["venture-1200"] = await t.ev(`(() => { const a = document.querySelector('.site-nav__list > li > a[href="/service-venture-building/"]');
    const summary = document.querySelector(".nav-drop > summary");
    const dropVenture = document.querySelector('.nav-drop__menu a[href="/service-venture-building/"]');
    return { linkAriaCurrent: a && a.getAttribute("aria-current"), linkColor: a && getComputedStyle(a).color, summaryAriaCurrent: summary.getAttribute("aria-current"),
      dropdownHasVenture: !!dropVenture, current: [...document.querySelectorAll("#site-nav [aria-current]")].map((e) => e.textContent.trim()) }; })()`);
  result["venture-1200"].capture = await t.shot("header-venture");
  await t.close();
}
{ // mobile menu order + active state, 375
  const t = await open(375, "/service-venture-building/");
  await t.ev(`document.querySelector(".nav-toggle").click()`); await sleep(700);
  result["venture-375-menu"] = await t.ev(`(() => { const nav = document.querySelector("#site-nav"); const cs = getComputedStyle(nav);
    const lis = [...document.querySelectorAll(".site-nav__list > li")].map((li) => { const el = li.querySelector("a, summary"); const r = el.getBoundingClientRect();
      return { text: el.textContent.trim(), top: Math.round(r.top), h: Math.round(r.height), insideViewport: r.width > 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        topmost: (() => { const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return !!e && el.contains(e); })(),
        ariaCurrent: el.getAttribute("aria-current") }; });
    return { innerWidth, navOpacity: cs.opacity, navVisibility: cs.visibility, toggleExpanded: document.querySelector(".nav-toggle").getAttribute("aria-expanded"),
      noOverflow: document.documentElement.scrollWidth <= innerWidth, items: lis }; })()`);
  result["venture-375-menu"].capture = await t.shot("menu-venture");
  await t.close();
}
{ // footer "Pages" column, 1200
  const t = await open(1200, "/");
  result["footer-1200"] = await t.ev(`(() => { const f = document.querySelector(".site-footer"); f.scrollIntoView({ block: "end" });
    const col = [...f.querySelectorAll("h2")].find((h) => h.textContent.trim() === "Pages").parentElement;
    return { headings: [...f.querySelectorAll("h2")].map((h) => h.textContent.trim()), pages: [...col.querySelectorAll("a")].map((a) => a.textContent.trim()),
      cta: f.querySelector(".site-footer__cta a").textContent.trim(), noOverflow: document.documentElement.scrollWidth <= innerWidth }; })()`);
  await sleep(300); result["footer-1200"].capture = await t.shot("footer-home");
  await t.close();
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
