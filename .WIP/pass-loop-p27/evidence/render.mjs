// p27 rendered checks: headless Chrome driven over its debugging protocol. No dependency.
// usage: node render.mjs <captures-dir> <label> [contact] [ia] [privacy]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const [OUT, LABEL, ...WHAT] = process.argv.slice(2);
const BASE = "http://localhost:4173";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const profile = join(HERE, "chrome-profile");
rmSync(profile, { recursive: true, force: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--window-size=1300,950", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
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

async function open(width) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  const events = []; const on = (m) => { if (m.sessionId === sessionId) events.push(m); }; listeners.add(on);
  await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable"); await s("Log.enable");
  await s("Emulation.setDeviceMetricsOverride", { width, height: width === 375 ? 812 : 900, deviceScaleFactor: 1, mobile: width === 375 });
  const ev = async (expression) => {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await s("Page.captureScreenshot", { format: "jpeg", quality: 62 });
    const file = `${name}-${width}${LABEL ? "-" + LABEL : ""}.jpg`;
    writeFileSync(join(OUT, file), Buffer.from(data, "base64")); return file;
  };
  const hosts = () => [...new Set(events.filter((e) => e.method === "Network.requestWillBeSent").map((e) => { try { return new URL(e.params.request.url).host; } catch { return "?"; } }).filter((h) => h && !h.startsWith("localhost")))];
  const close = async () => { listeners.delete(on); await send("Target.closeTarget", { targetId }); };
  return { s, ev, shot, events, hosts, close, width };
}

// Runs in the page: rectangle, display, and what is topmost at the centre of the visible part.
const PROBE = `(sel) => { const el = document.querySelector(sel); if (!el) return { missing: true };
  el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect();
  const x = Math.max(r.left, 0) + (Math.min(r.right, innerWidth) - Math.max(r.left, 0)) / 2;
  const y = Math.max(r.top, 0) + (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / 2;
  const top = r.width && r.height ? document.elementFromPoint(x, y) : null;
  let sec = el.closest(".reveal");
  return { rect: [r.left, r.top, r.width, r.height].map(Math.round), display: getComputedStyle(el).display, hiddenAttr: el.hidden,
    topmostInside: !!top && el.contains(top), topmost: top ? top.tagName.toLowerCase() + (top.className ? "." + top.className : "") : null,
    sectionOpacity: sec ? getComputedStyle(sec).opacity : null, insideWidth: r.left >= 0 && r.right <= innerWidth + 0.5 }; }`;
const ENV = `(async () => { let raf = false; await new Promise((r) => { requestAnimationFrame(() => { raf = true; r(); }); setTimeout(r, 1500); });
  return { innerWidth, innerHeight, visibility: document.visibilityState, raf, scrollWidth: document.documentElement.scrollWidth, noOverflow: document.documentElement.scrollWidth <= innerWidth }; })()`;
const visibleForms = `[...document.querySelectorAll("form")].filter((f) => { const r = f.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length`;
const fallbackText = `document.querySelector("[data-form-fallback]").innerText.replace(/\\s+/g, " ").trim()`;

const out = {};
async function contact(width) {
  const res = {};
  { // normal + valid submission in a sandboxed frame
    const t = await open(width);
    await t.s("Page.navigate", { url: BASE + "/contact/" }); await sleep(1800);
    res.normal = { env: await t.ev(ENV), form: await t.ev(`(${PROBE})("form[data-contact-form]")`), fallback: await t.ev(`(${PROBE})("[data-form-fallback]")`), visibleForms: await t.ev(visibleForms) };
    await t.ev(`document.querySelector("form[data-contact-form]").scrollIntoView({ block: "start" })`); await sleep(300);
    res.normal.capture = await t.shot("contact-normal");
    res.submit = await t.ev(`(async () => { const SANDBOX = ${JSON.stringify(process.env.P27_SANDBOX || "allow-scripts allow-same-origin allow-forms")};
      const f = document.createElement("iframe"); f.setAttribute("sandbox", SANDBOX); f.src = "/contact/";
      f.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:99999"; document.body.append(f);
      await new Promise((r) => f.addEventListener("load", r, { once: true })); await new Promise((r) => setTimeout(r, 900));
      const d = f.contentDocument, form = d.querySelector("form[data-contact-form]");
      const set = (id, v) => { const el = d.getElementById(id); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
      set("b-nom", "Test P27"); set("b-besoin", "Autre"); set("b-message", "Message de test local P27, aucun envoi."); set("b-email", "test@example.com");
      d.getElementById("b-rgpd").checked = true;
      const before = f.contentWindow.location.href;
      form.querySelector("button[type=submit]").click(); await new Promise((r) => setTimeout(r, 900));
      const st = form.querySelector(".form-status"); st.scrollIntoView({ block: "center" });
      const r = st.getBoundingClientRect(); let after; try { after = f.contentWindow.location.href; } catch (e) { after = "unreadable: " + e.message; }
      return { sandbox: f.getAttribute("sandbox"), status: st.innerText.replace(/\\s+/g, " ").trim(), state: st.dataset.state, statusRect: [r.width, r.height].map(Math.round),
        links: [...st.querySelectorAll("a")].map((a) => a.getAttribute("href").slice(0, 60)), lastMailto: (form.dataset.lastMailto || "").slice(0, 120),
        lastMailtoBodyHasName: decodeURIComponent(form.dataset.lastMailto || "").includes("Nom : Test P27"), frameUrlBefore: before, frameUrlAfter: after,
        invalid: [...d.querySelectorAll("[aria-invalid]")].length }; })()`);
    await sleep(300); res.submit.capture = await t.shot("contact-submit");
    res.submit.console = t.events.filter((e) => e.method === "Runtime.consoleAPICalled" || e.method === "Log.entryAdded").map((e) => JSON.stringify(e.params).slice(0, 200));
    await t.close();
  }
  { // forms.js request blocked
    const t = await open(width);
    await t.s("Network.setBlockedURLs", { urls: ["*/assets/js/forms.js*"] });
    await t.s("Page.navigate", { url: BASE + "/contact/" }); await sleep(1800);
    const failed = t.events.filter((e) => e.method === "Network.loadingFailed").map((e) => e.params.blockedReason || e.params.errorText);
    res.blocked = { requestBlocked: failed, env: await t.ev(ENV), fallback: await t.ev(`(${PROBE})("[data-form-fallback]")`), form: await t.ev(`(${PROBE})("form[data-contact-form]")`),
      visibleForms: await t.ev(visibleForms), fallbackText: await t.ev(fallbackText) };
    await t.ev(`document.querySelector("[data-form-fallback]").scrollIntoView({ block: "center" })`); await sleep(300);
    res.blocked.capture = await t.shot("contact-blocked");
    await t.close();
  }
  { // forms.js response held 3 s
    const t = await open(width);
    await t.s("Fetch.enable", { patterns: [{ urlPattern: "*/assets/js/forms.js*", requestStage: "Request" }] });
    let heldAt = 0, releasedAt = 0;
    const hold = (m) => { if (m.method === "Fetch.requestPaused") { heldAt = Date.now(); setTimeout(() => { releasedAt = Date.now(); t.s("Fetch.continueRequest", { requestId: m.params.requestId }).catch(() => {}); }, 3000); } };
    listeners.add(hold);
    t.s("Page.navigate", { url: BASE + "/contact/" }).catch(() => {});
    await sleep(1500);
    res.delayed = { during: { msSinceHeld: Date.now() - heldAt, released: !!releasedAt, readyState: await t.ev("document.readyState"),
      fallback: await t.ev(`(${PROBE})("[data-form-fallback]")`), visibleForms: await t.ev(visibleForms), fallbackText: await t.ev(fallbackText) } };
    await sleep(200); res.delayed.during.capture = await t.shot("contact-delayed-during");
    res.delayed.during.stillHeldAtCapture = !releasedAt;
    await sleep(2600);
    res.delayed.heldMs = releasedAt - heldAt;
    res.delayed.after = { form: await t.ev(`(${PROBE})("form[data-contact-form]")`), fallback: await t.ev(`(${PROBE})("[data-form-fallback]")`), visibleForms: await t.ev(visibleForms) };
    listeners.delete(hold); await t.close();
  }
  return res;
}

async function ia(width) {
  const t = await open(width); const res = {};
  await t.s("Page.navigate", { url: BASE + "/service-ia-business/" }); await sleep(2200);
  res.env = await t.ev(ENV);
  res.notice = await t.ev(`(${PROBE})(".ia-chat__notice")`);
  res.noticeText = await t.ev(`document.querySelector(".ia-chat__notice").innerText`);
  res.hostsBeforeClick = t.hosts();
  await sleep(300); res.noticeCapture = await t.shot("ia-notice");
  const p = await t.ev(`(() => { const s = document.querySelector("details[data-chat] > summary"); s.scrollIntoView({ block: "start" }); scrollBy(0, -80); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) await t.s("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1 });
  let chat = null;
  for (let i = 0; i < 40; i++) { // up to 20 s for the first screen
    await sleep(500);
    chat = await t.ev(`(() => { const d = document.querySelector("details[data-chat]"), tb = document.querySelector("typebot-standard"), st = document.querySelector("[data-chat-status]");
      const root = tb && tb.shadowRoot; const box = root && root.querySelector(".typebot-container");
      const r = tb ? tb.getBoundingClientRect() : null;
      return { open: d.open, statusHidden: st.hidden, statusText: st.textContent, typebotHidden: tb ? tb.hidden : null, rect: r ? [r.left, r.top, r.width, r.height].map(Math.round) : null,
        background: box ? getComputedStyle(box).backgroundColor : null, text: root ? (root.querySelector(".typebot-container") || root).innerText.replace(/\\s+/g, " ").trim().slice(0, 400) : null,
        buttons: root ? [...root.querySelectorAll("button")].map((b) => b.innerText.trim()).filter(Boolean) : [], iframes: root ? [...root.querySelectorAll("iframe")].map((f) => new URL(f.src).host) : [] }; })()`);
    if (chat.buttons.length >= 2) break;
  }
  await sleep(1200);
  res.chat = chat; res.envAfter = await t.ev(ENV); res.hostsAfterClick = t.hosts();
  res.chatCapture = await t.shot("ia-chat");
  await t.close(); return res;
}

async function privacy(width) {
  const t = await open(width); const res = {};
  await t.s("Page.navigate", { url: BASE + "/politique-confidentialite/" }); await sleep(1800);
  res.env = await t.ev(ENV);
  res.paragraph = await t.ev(`(() => { const el = [...document.querySelectorAll("main p")].find((p) => p.textContent.includes("Typebot")); el.id = "p27-typebot"; return (${PROBE})("#p27-typebot"); })()`);
  res.paragraphText = await t.ev(`document.getElementById("p27-typebot").innerText`);
  await sleep(300); res.capture = await t.shot("privacy-typebot");
  await t.close(); return res;
}

try {
  for (const w of [1200, 375]) {
    out[w] = {};
    if (WHAT.includes("contact")) out[w].contact = await contact(w);
    if (WHAT.includes("ia")) out[w].ia = await ia(w);
    if (WHAT.includes("privacy")) out[w].privacy = await privacy(w);
  }
  console.log(JSON.stringify(out, null, 1));
} catch (e) { console.log(JSON.stringify(out, null, 1)); console.error("RENDER ERROR: " + (e.stack || e)); process.exitCode = 1; }
finally { try { await send("Browser.close"); } catch {} chrome.kill(); }
