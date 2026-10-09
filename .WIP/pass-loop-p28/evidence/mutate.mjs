// p28 mutation ledger: each mutation on its own copy of the closing tree, outside the repository.
import { cpSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const [SRC, BASE] = process.argv.slice(2);
mkdirSync(BASE, { recursive: true });
const copy = (name) => {
  const dst = join(BASE, name);
  cpSync(SRC, dst, { recursive: true, filter: (s) => !/[\\/](\.git|\.WIP)([\\/]|$)/.test(s.slice(SRC.length)) });
  return dst;
};
const run = (dir, ...a) => { const r = spawnSync(process.execPath, a, { cwd: dir, encoding: "utf8" }); return { code: r.status, out: (r.stdout + r.stderr).trim() }; };
const edit = (dir, rel, fn) => { const p = join(dir, rel); const s = readFileSync(p, "utf8"); const n = fn(s); if (n === s) throw new Error("mutation did nothing: " + rel); writeFileSync(p, n); };
const treeHash = (dir) => { const h = createHash("sha256"); const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else h.update(p.slice(dir.length) + "\0").update(readFileSync(p)); } }; walk(dir); return h.digest("hex").slice(0, 16); };
const lines = (o, re) => o.split("\n").filter((l) => re.test(l)).map((l) => l.trim()).join(" | ");

// control
let d = copy("control");
let r1 = run(d, "tools/shell.mjs", "--check"), r2 = run(d, "tools/check.mjs", "--all");
console.log(`CONTROL shell --check exit ${r1.code}; check --all exit ${r2.code}`);

// M1 one footer link removed from contact/index.html
d = copy("m1");
edit(d, "contact/index.html", (s) => s.replace('          <li><a href="/publications/">Publications</a></li>\n', ""));
r1 = run(d, "tools/shell.mjs", "--check"); r2 = run(d, "tools/check.mjs");
console.log(`M1 footer link removed (contact): shell --check exit ${r1.code} [${lines(r1.out, /contact/)}]; check exit ${r2.code} [${lines(r2.out, /contact/)}]`);

// M2 duplicate header marker in publications/index.html: default run refuses, writes nothing
d = copy("m2");
edit(d, "publications/index.html", (s) => s.replace("<main id=\"main\">", "<main id=\"main\">\n<header class=\"site-header\"></header>"));
edit(d, "contact/index.html", (s) => s.replace("<h2>Pages</h2>", "<h2>Plan</h2>"));
let before = treeHash(d); r1 = run(d, "tools/shell.mjs"); let after = treeHash(d);
console.log(`M2 duplicate header (publications) + one drifted page elsewhere: shell default exit ${r1.code} [${lines(r1.out, /publications|aucune/)}]; tree ${before} -> ${after} ${before === after ? "UNCHANGED" : "CHANGED"}`);

// M2b missing noscript in <head> (portfolio)
d = copy("m2b");
edit(d, "portfolio/index.html", (s) => s.replace(/<noscript>[\s\S]*?<\/noscript>\n/, ""));
before = treeHash(d); r1 = run(d, "tools/shell.mjs"); after = treeHash(d);
console.log(`M2b noscript removed from head (portfolio): shell default exit ${r1.code} [${lines(r1.out, /portfolio/)}]; tree ${before === after ? "UNCHANGED" : "CHANGED"}`);

// M3 noscript edited in 404.html only
d = copy("m3");
edit(d, "404.html", (s) => s.replace(".ia-video-launch { display:none; }", ".ia-video-launch { display:none; }\n    .x { color: red; }"));
r1 = run(d, "tools/shell.mjs", "--check"); r2 = run(d, "tools/check.mjs");
console.log(`M3 noscript edited (404): shell --check exit ${r1.code}; check exit ${r2.code} [${lines(r2.out, /404/)}]`);

// M3b same noscript edit with shell.mjs --check neutralised: check.mjs's own identity still fails
d = copy("m3b");
edit(d, "404.html", (s) => s.replace(".ia-video-launch { display:none; }", ".ia-video-launch { display:none; }\n    .x { color: red; }"));
writeFileSync(join(d, "tools/shell.mjs"), "console.log('  SHELL: neutralised');\n");
r2 = run(d, "tools/check.mjs");
console.log(`M3b noscript edited, shell check neutralised: check exit ${r2.code} [${lines(r2.out, /404/)}]`);

// M4 CRLF page keeps CRLF: mentions-legales converted to CRLF, its footer drifted, default run restamps
d = copy("m4");
edit(d, "mentions-legales/index.html", (s) => s.replace(/\n/g, "\r\n").replace("<h2>Pages</h2>", "<h2>Plan</h2>"));
r1 = run(d, "tools/shell.mjs"); r2 = run(d, "tools/shell.mjs", "--check");
const m = readFileSync(join(d, "mentions-legales/index.html"), "latin1");
const crlf = m.split("\r\n").length - 1, lf = m.split("\n").length - 1;
console.log(`M4 CRLF page restamped: default exit ${r1.code} [${lines(r1.out, /reecrite/)}]; --check after exit ${r2.code}; mentions-legales CRLF ${crlf} / LF ${lf} ${crlf === lf ? "ALL CRLF" : "MIXED"}; Pages restored ${m.includes("<h2>Pages</h2>")}`);
