// P41 mutation ledger: each case runs `node tools/check.mjs --all` on a fresh copy.
// Usage: node mutate.mjs <product-root> <work-dir>
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const [product, work] = process.argv.slice(2);
const base = join(work, "base");
const V = "assets/js/vendor/typebot-js-0.10.11";
const CHANGED = [".gitattributes", "assets/js/ia-embeds.js", `${V}/web.js`, `${V}/LICENSE`, "tools/check.mjs",
  "tools/test-ia-embeds.mjs", "politique-confidentialite/index.html", "service-ia-business/index.html"];
const PIN = "41adb2855b0e8868b4cf304b20e3ab1f1014e8ed252ec559aaa8d4cd4ed72750";

rmSync(base, { recursive: true, force: true });
mkdirSync(base, { recursive: true });
execFileSync("git", ["-C", product, "-c", "core.autocrlf=false", "archive", "-o", join(work, "base.tar"), "c2a6025"]);
execFileSync("tar", ["-xf", "base.tar", "-C", "base"], { cwd: work });
for (const f of CHANGED) cpSync(join(product, f), join(base, f));
const sha = (b) => createHash("sha256").update(b).digest("hex");
console.log("copy web.js sha256 =", sha(readFileSync(join(base, V, "web.js"))));

const edit = (dir, rel, fn) => { const p = join(dir, rel); writeFileSync(p, fn(readFileSync(p))); };
const text = (fn) => (b) => Buffer.from(fn(b.toString("utf8")), "utf8");
const repin = (dir) => edit(dir, "tools/check.mjs", text((s) => s.replace(PIN, sha(readFileSync(join(dir, V, "web.js"))))));

const cases = [
  ["unmodified", () => {}, 0, null],
  ["vendor web.js one byte changed", (d) => edit(d, `${V}/web.js`, (b) => { const c = Buffer.from(b); c[200] = c[200] ^ 1; return c; }), 1, /empreinte SHA-256/],
  ["vendor LICENSE removed", (d) => rmSync(join(d, V, "LICENSE")), 1, /licence du script tiers absente/],
  ["specifier back to jsdelivr", (d) => edit(d, "assets/js/ia-embeds.js", text((s) => s.replace("/assets/js/vendor/typebot-js-0.10.11/web.js", "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.10.11/dist/web.js"))), 1, [/charge une ressource depuis cdn\.jsdelivr\.net/, /test-ia-embeds/]],
  ["ghost-class rule + word only in vendor web.js (pin updated)", (d) => {
    edit(d, "assets/css/style.css", text((s) => s + "\n.ghost-class { color: red; }\n"));
    edit(d, `${V}/web.js`, text((s) => s + '\nconst g="ghost-class";\n'));
    repin(d);
  }, 1, /ghost-class/],
  // own mutations beyond the plan
  ["control: ghost-class also used in ia-embeds.js string (pin updated)", (d) => {
    edit(d, "assets/css/style.css", text((s) => s + "\n.ghost-class { color: red; }\n"));
    edit(d, `${V}/web.js`, text((s) => s + '\nconst g="ghost-class";\n'));
    repin(d);
    edit(d, "assets/js/ia-embeds.js", text((s) => s.replace("(() => {", "(() => {\n  const ghost = 'ghost-class';")));
  }, 0, null],
  ["unpinned extra vendor script", (d) => { mkdirSync(join(d, "assets/js/vendor/other"), { recursive: true }); writeFileSync(join(d, "assets/js/vendor/other/x.js"), "export default 1;\n"); }, 1, /script tiers sans empreinte/],
  ["specifier to a non-pinned version path", (d) => edit(d, "assets/js/ia-embeds.js", text((s) => s.replace("typebot-js-0.10.11", "typebot-js-0.10.12"))), 1, /test-ia-embeds/],
  ["status guard removed in the try", (d) => edit(d, "assets/js/ia-embeds.js", text((s) => s.replace("      if (status) {\n        status.hidden = false;", "      {\n        status.hidden = false;"))), 1, /test-ia-embeds/],
  ["vendor web.js CRLF line endings", (d) => edit(d, `${V}/web.js`, text((s) => s.replace(/\n/g, "\r\n"))), 1, /empreinte SHA-256/],
  ["pin table emptied (vendor web.js unpinned)", (d) => edit(d, "tools/check.mjs", text((s) => s.replace(`  ["assets/js/vendor/typebot-js-0.10.11/web.js", "${PIN}"],\n`, ""))), 1, /script tiers sans empreinte/],
];

let bad = 0;
for (const [name, mutate, want, pattern] of cases) {
  const dir = join(work, "case");
  rmSync(dir, { recursive: true, force: true });
  cpSync(base, dir, { recursive: true });
  mutate(dir);
  execFileSync("node", ["tools/version.mjs"], { cwd: dir });
  let code = 0, out = "";
  try { out = execFileSync("node", ["tools/check.mjs", "--all"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120000 }); }
  catch (e) { code = e.status ?? -1; out = (e.stdout || "") + (e.stderr || ""); }
  const failures = out.split("\n").filter((l) => l.startsWith("  - ")).map((l) => l.trim());
  const named = [].concat(pattern ?? []).every((p) => p.test(failures.join("\n")));
  const ok = code === want && named;
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} exit ${code} (want ${want}) ${name}${failures.length ? "\n      " + failures.join("\n      ") : ""}`);
}
console.log(bad ? `LEDGER: ${bad} unexpected result(s)` : `LEDGER: ${cases.length}/${cases.length} as expected`);
process.exit(bad ? 1 : 0);
