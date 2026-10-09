// p31 rendered checks: headless Chrome over its debugging protocol, no dependency.
// Base: p30 recipe (git show e3d664a:.WIP/pass-loop-p30/evidence/render.mjs).
// usage: node render.mjs <captures-dir> <profile-dir> <pre|post> [base-url]
// pre  = baseline before any edit: #experience geometry + captures at 1200 and 375.
// post = PLAN § 31 Done When 3: columns, closed-height match, visible sentences, open card 3 moves no li,
//        one column at 375, overflow closed/all open, click + real Tab/Enter on each card, nothing focusable in the timeline.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, PROFILE, MODE = "probe", BASE = "http://127.0.0.1:4174"] = process.argv.slice(2);
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
const out = {};
for (const width of [641, 800, 960, 961, 1100]) {
  const t = await open(width, "/");
  await t.scrollTo(`document.querySelector("#experience")`, "start");
  out[width] = await t.ev(`(() => { const g = getComputedStyle(document.querySelector("#experience .grid--2")).gridTemplateColumns;
    const lis = [...document.querySelectorAll("#experience ol > li")]; const cards = [...document.querySelectorAll("#experience .experience-panel > details")];
    const st = document.createElement("style"); st.textContent = "#experience .timeline > li, #experience .disclosure--card summary { min-height: 0 !important; }"; document.head.appendChild(st);
    const natLi = lis.map((l) => Math.round(l.getBoundingClientRect().height)); const natCard = cards.map((c) => Math.round(c.getBoundingClientRect().height)); st.remove();
    return { cols: g, natLi, natCard, noOverflow: document.documentElement.scrollWidth <= innerWidth }; })()`);
  await t.close();
}
console.log(JSON.stringify(out));
await send("Browser.close").catch(() => {});
process.exit(0);
