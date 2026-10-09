// p30 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p29 recipe (git show 44a5966:.WIP/pass-loop-p29/evidence/render.mjs).
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit (IA first row closed height, home closed heights, démarche number vs title).
// post = PLAN § 30 Done When 4: click, real Tab + Enter/Space, tap, hover, ::after, scripts disabled, IA row, overflow.
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

async function open(width, path, { scripts = true } = {}) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable"); await s("Runtime.enable");
  const mobile = width < 500;
  await s("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 812 : 900, deviceScaleFactor: 1, mobile });
  // Headless Chrome on this machine reports prefers-reduced-motion: reduce by default (AGENTS Gotcha): set it explicitly.
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (!scripts) await s("Emulation.setScriptExecutionDisabled", { value: true });
  await s("Page.navigate", { url: BASE + path }); await sleep(1800);
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    const file = `${name}-${width}.jpg`; writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  const key = async (k) => {
    const map = { Tab: ["Tab", 9, ""], Enter: ["Enter", 13, "\r"], Space: [" ", 32, " "] };
    const [keyName, vk, text] = map[k];
    const code = k === "Space" ? "Space" : k;
    await s("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: keyName, code, windowsVirtualKeyCode: vk, text: text || undefined });
    await s("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code, windowsVirtualKeyCode: vk });
    await sleep(120);
  };
  const click = async (x, y) => {
    await s("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await s("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await s("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    await sleep(200);
  };
  const move = async (x, y) => { await s("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await sleep(600); };
  const tap = async (x, y) => {
    await s("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await s("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(500);
  };
  const touch = () => s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  return { s, ev, shot, key, click, move, tap, touch, close: () => send("Target.closeTarget", { targetId }) };
}

const HOME_SEL = `[...document.querySelectorAll("#experience details, #demarche .chevrons details")]`;
// Scroll disclosure i to the viewport centre (its .reveal section revealed), return summary centre + state.
const AT = (i) => `(async () => { const d = ${HOME_SEL}[${i}]; const sm = d.querySelector("summary");
  sm.scrollIntoView({ block: "center" }); const sec = d.closest(".reveal");
  for (let k = 0; k < 40 && sec && getComputedStyle(sec).opacity !== "1"; k++) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 300)); const r = sm.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 2, 30)) }; })()`;
const STATE = (i) => `(() => { const d = ${HOME_SEL}[${i}]; const sm = d.querySelector("summary"); const after = getComputedStyle(sm, "::after").content;
  const body = d.querySelector(":scope > :not(summary)"); const br = body.getBoundingClientRect();
  const x = br.left + br.width / 2, y = br.top + Math.min(br.height / 2, 20); const top = document.elementFromPoint(x, y);
  return { open: d.open, after, bodyVisible: d.open && br.width > 0 && br.height > 0 && br.top >= 0 && br.bottom <= innerHeight + br.height && !!top && body.contains(top) }; })()`;

// Geometry of every home disclosure: classes, title, subtitle, summary grid tracks ("+" column), card rect, numbering offset.
const GEOM = `(() => { return ${HOME_SEL}.map((d) => { const sm = d.querySelector("summary"); const h3 = sm.querySelector("h3"); const cs = getComputedStyle(sm);
  const r = d.getBoundingClientRect(), hr = h3.getBoundingClientRect(), sr = sm.getBoundingClientRect(); const li = d.closest(".chevron");
  const sub = h3.nextElementSibling; const sb = sub && sub.getBoundingClientRect();
  return { cls: d.className, title: h3.textContent.trim(), subtitle: sub ? sub.textContent.trim() : null, display: cs.display, cols: cs.gridTemplateColumns, rows: cs.gridTemplateRows,
    after: getComputedStyle(sm, "::after").content, afterCol: getComputedStyle(sm, "::after").gridColumnStart, afterRow: getComputedStyle(sm, "::after").gridRowStart,
    card: { top: Math.round(r.top + scrollY), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height), w: Math.round(r.width) },
    h3: { top: Math.round(hr.top - sr.top), right: Math.round(sr.right - hr.right), h: Math.round(hr.height) }, subtitleBelowTitle: !!sb && sb.top >= hr.bottom - 1,
    summaryMinHeight: cs.minHeight, padding: cs.padding,
    numberCentreMinusTitleCentre: li ? Math.round((li.getBoundingClientRect().top + 16 + 16) - (hr.top + hr.height / 2)) : null }; }); })()`;
const IA_ROW = `(() => { const d = document.querySelector(".service-question-list details"); const r = d.getBoundingClientRect(); const sm = d.querySelector("summary");
  return { cls: d.className, h: Math.round(r.height * 10) / 10, summaryH: Math.round(sm.getBoundingClientRect().height * 10) / 10, open: d.open, after: getComputedStyle(sm, "::after").content, display: getComputedStyle(sm).display }; })()`;

const result = { mode: MODE };
if (MODE === "pre") {
  for (const width of [1200, 375]) {
    const t = await open(width, "/");
    await t.ev(`document.querySelector("#experience").scrollIntoView()`); await sleep(1200);
    await t.ev(`document.querySelector("#demarche").scrollIntoView()`); await sleep(1200);
    result["home-" + width] = await t.ev(GEOM);
    await t.ev(`document.querySelector("#experience .experience-panel").scrollIntoView({ block: "start" })`); await sleep(600);
    result["home-" + width].captureExperience = await t.shot("pre-experience");
    await t.ev(`document.querySelector("#demarche").scrollIntoView({ block: "start" })`); await sleep(600);
    result["home-" + width].captureDemarche = await t.shot("pre-demarche");
    await t.close();
    const ia = await open(width, "/service-ia-business/");
    result["ia-" + width] = await ia.ev(IA_ROW);
    await ia.close();
  }
} else {
  for (const width of [1200, 375]) {
    const t = await open(width, "/");
    const r = result["home-" + width] = {};
    await t.ev(`document.querySelector("#experience").scrollIntoView()`); await sleep(1200);
    await t.ev(`document.querySelector("#demarche").scrollIntoView()`); await sleep(1200);
    r.count = await t.ev(`${HOME_SEL}.length`);
    r.geometry = await t.ev(GEOM);
    r.noOverflowClosed = await t.ev(`document.documentElement.scrollWidth <= innerWidth`);
    await t.ev(`document.querySelector("#experience .experience-panel").scrollIntoView({ block: "start" })`); await sleep(600);
    r.captureExperience = await t.shot("experience-closed");
    await t.ev(`document.querySelector("#demarche").scrollIntoView({ block: "start" })`); await sleep(600);
    r.captureDemarche = await t.shot("demarche-closed");
    r.items = [];
    for (let i = 0; i < r.count; i++) {
      const it = { i };
      const p = await t.ev(AT(i));
      await t.move(p.x, p.y); it.hover = await t.ev(STATE(i));
      await t.click(p.x, p.y); it.click1 = await t.ev(STATE(i));
      await t.click(p.x, p.y); it.click2 = await t.ev(STATE(i));
      await t.move(5, 5);
      it.pass = !it.hover.open && it.hover.after === '"+"' && it.click1.open && it.click1.after === '"−"' && it.click1.bodyVisible && !it.click2.open && it.click2.after === '"+"';
      r.items.push(it);
    }
    // Open one of each kind for the open-state captures, then close them again.
    await t.ev(`(async () => { ${HOME_SEL}[0].open = true; ${HOME_SEL}[5].open = true; })()`); await sleep(300);
    await t.ev(`document.querySelector("#experience .experience-panel").scrollIntoView({ block: "start" })`); await sleep(500);
    r.captureExperienceOpen = await t.shot("experience-open");
    await t.ev(`document.querySelector("#demarche").scrollIntoView({ block: "start" })`); await sleep(500);
    r.captureDemarcheOpen = await t.shot("demarche-open");
    r.noOverflowOpen = await t.ev(`(() => { ${HOME_SEL}.forEach((d) => { d.open = true; }); const ok = document.documentElement.scrollWidth <= innerWidth; ${HOME_SEL}.forEach((d) => { d.open = false; }); return ok; })()`);
    // Keyboard: real Tab presses from the top of the page until each summary is the active element; Enter, Enter, Space, Space.
    await t.ev(`window.scrollTo(0, 0); document.activeElement && document.activeElement.blur()`);
    r.keyboard = [];
    let tabs = 0;
    for (let i = 0; i < r.count; i++) {
      const kb = { i };
      let hit = false;
      for (let n = 0; n < 80 && !hit; n++) {
        await t.key("Tab"); tabs++;
        hit = await t.ev(`document.activeElement === ${HOME_SEL}[${i}].querySelector("summary")`);
      }
      kb.reached = hit; kb.focusVisible = hit && await t.ev(`document.activeElement.matches(":focus-visible")`);
      if (i === 0 || i === 5) kb.capture = await t.shot(`focus-${i}`);
      await t.key("Enter"); kb.enter1 = await t.ev(STATE(i));
      await t.key("Enter"); kb.enter2 = await t.ev(STATE(i));
      await t.key("Space"); kb.space1 = await t.ev(STATE(i));
      await t.key("Space"); kb.space2 = await t.ev(STATE(i));
      kb.pass = hit && kb.enter1.open && kb.enter1.after === '"−"' && !kb.enter2.open && kb.enter2.after === '"+"' && kb.space1.open && !kb.space2.open && kb.space2.after === '"+"';
      r.keyboard.push(kb);
    }
    r.tabPresses = tabs;
    await t.close();
    if (width === 375) {
      const tt = await open(375, "/");
      await tt.touch();
      await tt.ev(`document.querySelector("#experience").scrollIntoView()`); await sleep(1200);
      await tt.ev(`document.querySelector("#demarche").scrollIntoView()`); await sleep(1200);
      r.tap = [];
      for (let i = 0; i < r.count; i++) {
        const p = await tt.ev(AT(i));
        await tt.tap(p.x, p.y); const t1 = await tt.ev(STATE(i));
        await tt.tap(p.x, p.y); const t2 = await tt.ev(STATE(i));
        r.tap.push({ i, t1, t2, pass: t1.open && t1.after === '"−"' && t1.bodyVisible && !t2.open && t2.after === '"+"' });
      }
      await tt.close();
    }
    // Scripts disabled before navigation: the shared <noscript> reveal must leave each section and each opened body visible.
    const nj = await open(width, "/", { scripts: false });
    r.noJs = { scriptsDisabled: await nj.ev(`typeof window.__p30probe === "undefined" && !document.querySelector(".is-visible")`), items: [] };
    for (let i = 0; i < r.count; i++) {
      // Scripts disabled: page timers never fire, so an awaited setTimeout hangs (measured). Scroll synchronously, wait from Node.
      await nj.ev(`${HOME_SEL}[${i}].querySelector("summary").scrollIntoView({ block: "center" })`); await sleep(400);
      const p = await nj.ev(`(() => { const r = ${HOME_SEL}[${i}].querySelector("summary").getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 2, 30)) }; })()`);
      const sec = await nj.ev(`(() => { const sec = ${HOME_SEL}[${i}].closest(".reveal"); const sr = ${HOME_SEL}[${i}].querySelector("summary").getBoundingClientRect(); const top = document.elementFromPoint(sr.left + sr.width / 2, sr.top + Math.min(sr.height / 2, 30));
        return { sectionOpacity: getComputedStyle(sec).opacity, summaryInViewport: sr.top >= 0 && sr.bottom <= innerHeight + sr.height && sr.width > 0, summaryTopmost: !!top && ${HOME_SEL}[${i}].querySelector("summary").contains(top) }; })()`);
      await nj.click(p.x, p.y); const o = await nj.ev(STATE(i));
      await nj.click(p.x, p.y); const c = await nj.ev(STATE(i));
      r.noJs.items.push({ i, sec, open: o, closed: c, pass: sec.sectionOpacity === "1" && sec.summaryTopmost && o.open && o.bodyVisible && !c.open });
    }
    await nj.ev(`(() => { ${HOME_SEL}[1].open = true; ${HOME_SEL}[6].open = true; document.querySelector("#demarche").scrollIntoView({ block: "start" }); })()`); await sleep(500);
    r.captureNoJs = await nj.shot("nojs-demarche-open");
    await nj.close();
    const ia = await open(width, "/service-ia-business/");
    const ir = result["ia-" + width] = { closed: await ia.ev(IA_ROW) };
    const ip = await ia.ev(`(async () => { const sm = document.querySelector(".service-question-list details summary"); sm.scrollIntoView({ block: "center" }); const sec = sm.closest(".reveal");
      for (let k = 0; k < 40 && sec && getComputedStyle(sec).opacity !== "1"; k++) await new Promise((r) => setTimeout(r, 100)); await new Promise((r) => setTimeout(r, 300));
      const r = sm.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    ir.captureClosed = await ia.shot("ia-row-closed");
    await ia.click(ip.x, ip.y); ir.opened = await ia.ev(IA_ROW);
    ir.captureOpen = await ia.shot("ia-row-open");
    await ia.click(ip.x, ip.y); ir.closedAgain = await ia.ev(IA_ROW);
    ir.noOverflow = await ia.ev(`document.documentElement.scrollWidth <= innerWidth`);
    await ia.close();
  }
}
writeFileSync(join(OUT, "render-result.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await send("Browser.close").catch(() => {});
process.exit(0);
