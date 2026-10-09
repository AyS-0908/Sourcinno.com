// p29 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p28 recipe (git show a298a12:.WIP/pass-loop-p28/evidence/render.mjs).
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

async function open(width, path, { reducedMotion = false } = {}) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable"); await s("Runtime.enable");
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  // Headless Chrome on this machine reports prefers-reduced-motion: reduce by default (OS animations off): set it explicitly both ways.
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }] });
  await s("Page.navigate", { url: BASE + path }); await sleep(1500);
  await s("DOM.enable"); await s("CSS.enable");
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  // Forces :hover on the first match, waits past the 0.25 s transitions, returns the computed values asked.
  const hover = async (selector, props) => {
    const { root } = await s("DOM.getDocument", { depth: 0 });
    const { nodeId } = await s("DOM.querySelector", { nodeId: root.nodeId, selector });
    if (!nodeId) return { selector, found: false };
    const read = () => ev(`(() => { const cs = getComputedStyle(document.querySelector(${JSON.stringify(selector)})); return Object.fromEntries(${JSON.stringify(props)}.map((p) => [p, cs.getPropertyValue(p)])); })()`);
    const rest = await read();
    await s("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] }); await sleep(600);
    const hovered = await read();
    await s("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] }); await sleep(400);
    return { selector, found: true, rest, hovered };
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = `${name}-${width}.jpg`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  return { ev, hover, shot, close: () => send("Target.closeTarget", { targetId }) };
}

// Runs in the page: scroll an element to the viewport centre, wait for its .reveal section, measure its own rectangle.
const SEE = (sel) => `(async () => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return { sel: ${JSON.stringify(sel)}, found: false };
  el.scrollIntoView({ block: "center" }); const sec = el.closest(".reveal");
  for (let i = 0; i < 40 && sec && getComputedStyle(sec).opacity !== "1"; i++) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 300)); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y);
  return { sel: ${JSON.stringify(sel)}, found: true, text: el.textContent.trim(), sectionOpacity: sec ? getComputedStyle(sec).opacity : "no .reveal", sectionRevealed: sec ? sec.classList.contains("is-visible") || getComputedStyle(sec).opacity === "1" : null,
    rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) },
    insideViewport: r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth, topmost: !!top && (el.contains(top) || top.contains(el)) }; })()`;

const HOME = `(async () => { await new Promise((r) => { requestAnimationFrame(() => r()); setTimeout(r, 1500); });
  const h1 = document.querySelector(".hero h1"); const rg = document.createRange(); rg.selectNodeContents(h1);
  const tops = [...rg.getClientRects()].map((r) => Math.round(r.top)); const lines = []; tops.forEach((t) => { if (!lines.some((l) => Math.abs(l - t) <= 4)) lines.push(t); });
  const cs = getComputedStyle(h1); const span = h1.querySelector("span");
  const cards = [...document.querySelectorAll("#services .card--service")].map((c) => { const r = c.getBoundingClientRect(); return { title: c.querySelector("h3").textContent.trim(), top: Math.round(r.top + scrollY), left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom + scrollY), h: Math.round(r.height), w: Math.round(r.width) }; });
  return { innerWidth, scrollWidth: document.documentElement.scrollWidth, noOverflow: document.documentElement.scrollWidth <= innerWidth,
    h1: { text: h1.textContent, lineTops: lines, lineCount: lines.length, height: Math.round(h1.getBoundingClientRect().height), lineHeight: cs.lineHeight, fontSize: cs.fontSize, maxWidth: cs.maxWidth, spanText: span && span.textContent, spanColor: span && getComputedStyle(span).color, eyebrow: !!document.querySelector(".hero__eyebrow") },
    servicesH2: document.querySelector("#services h2").textContent, leadBold: !!document.querySelector("#services .lead strong"), gridClass: document.querySelector("#services .grid").className,
    cards, sideBySide: cards.length === 2 && cards[0].top === cards[1].top && cards[0].right < cards[1].left, equalHeights: cards.length === 2 && cards[0].h === cards[1].h, stacked: cards.length === 2 && cards[1].top >= cards[0].bottom }; })()`;

const result = {};
for (const width of [1200, 375]) {
  const t = await open(width, "/");
  const r = result["home-" + width] = await t.ev(HOME);
  r.reducedMotionMatches = await t.ev(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
  r.captureHero = await t.shot("home-hero");
  await t.ev(`document.querySelector("#services").scrollIntoView({ block: "start" })`); await sleep(1200);
  r.captureServices = await t.shot("home-services");
  r.linkLine = await t.ev(SEE("#services .container > p > a"));
  r.linkLineHref = await t.ev(`document.querySelector("#services .container > p > a").getAttribute("href")`);
  r.linkLineGapBelowGrid = await t.ev(`Math.round(document.querySelector("#services .container > p").getBoundingClientRect().top - document.querySelector("#services .grid").getBoundingClientRect().bottom)`);
  r.captureLinkLine = await t.shot("home-linkline");
  r.ctaBand = await t.ev(SEE('main > section[aria-label="Contact"] .cta-band .btn'));
  r.ctaAfterDemarche = await t.ev(`(() => { const d = document.querySelector("#demarche"), c = document.querySelector('main > section[aria-label="Contact"]'); return !!d && !!c && (d.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) > 0 && c.previousElementSibling === d; })()`);
  r.captureCta = await t.shot("home-cta");
  r.noOverflowAfterScroll = await t.ev(`document.documentElement.scrollWidth <= innerWidth`);
  if (width === 1200) {
    r.hoverServiceCard = await t.hover("#services .card--service", ["transform", "box-shadow"]);
    r.hoverHeaderBtn = await t.hover(".site-header .btn--primary", ["transform", "background-color"]);
    await t.ev(`document.querySelector(".site-footer").scrollIntoView({ block: "end" })`); await sleep(400);
    r.hoverFooterCta = await t.hover(".site-footer__cta .btn", ["color", "transform"]);
    r.hoverFooterLink = await t.hover(".site-footer ul a", ["color"]);
    r.footerCtaColourUnchanged = r.hoverFooterCta.rest.color === r.hoverFooterCta.hovered.color;
    await t.ev(`window.scrollTo(0, 0); document.querySelector(".nav-drop").open = true`); await sleep(400);
    r.dropdown = await t.ev(`(() => { const m = document.querySelector(".nav-drop__menu"); const r = m.getBoundingClientRect(); return { boxShadow: getComputedStyle(m).boxShadow, visible: r.width > 0 && r.height > 0, items: [...m.querySelectorAll("a")].map((a) => a.textContent) }; })()`);
    r.captureDropdown = await t.shot("home-dropdown");
  } else {
    await t.ev(`window.scrollTo(0, 0)`); await sleep(300);
    await t.ev(`document.querySelector(".nav-toggle").click()`); await sleep(800);
    r.mobileMenu = await t.ev(`(() => { const n = document.querySelector("#site-nav"); const cs = getComputedStyle(n); return { boxShadow: cs.boxShadow, opacity: cs.opacity, visibility: cs.visibility, items: [...n.querySelectorAll(".site-nav__list > li > a, .site-nav__list > li summary")].map((a) => a.textContent.trim()) }; })()`);
    r.captureMenu = await t.shot("home-menu");
  }
  await t.close();
}
{
  const t = await open(1200, "/service-ia-business/");
  result["ia-1200"] = { hoverCareer: await t.hover(".card.service-career", ["transform", "box-shadow", "border-color"]), hoverPhase: await t.hover(".card.service-phase", ["transform"]) };
  await t.close();
}
{
  const t = await open(1200, "/publications/");
  result["publications-1200"] = { hoverProfile: await t.hover(".card.publication-profile", ["transform", "box-shadow", "border-color"]) };
  await t.close();
}
{
  const t = await open(1200, "/portfolio/");
  result["portfolio-1200"] = await t.ev(`(() => { const b = document.querySelector("#portfolio-reset"); const cs = getComputedStyle(b); return { className: b.className, borderTopWidth: cs.borderTopWidth, borderTopStyle: cs.borderTopStyle, borderColor: cs.borderTopColor, color: cs.color }; })()`);
  await t.close();
}
{
  const t = await open(1200, "/", { reducedMotion: true });
  result["home-1200-reduced-motion"] = { matches: await t.ev(`matchMedia("(prefers-reduced-motion: reduce)").matches`), hoverServiceCard: await t.hover("#services .card--service", ["transform"]) };
  await t.close();
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
