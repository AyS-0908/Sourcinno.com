import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
const ROOT = process.argv[2] || process.cwd();
const SKIP = new Set([".git", "node_modules", ".github", "tools"]);
const walk = (d, o = []) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(join(d, e.name), o); } else o.push(join(d, e.name)); } return o; };
const h8 = (s) => createHash("sha1").update(s.replace(/\r\n/g, "\n")).digest("hex").slice(0, 8);
for (const f of walk(ROOT).filter((f) => f.endsWith(".html")).sort()) {
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  const b = readFileSync(f); const s = b.toString("utf8");
  const crlf = (s.match(/\r\n/g) || []).length, lf = (s.match(/\n/g) || []).length - crlf;
  const stub = /http-equiv="refresh"/i.test(s);
  const head = s.slice(0, s.indexOf("</head>"));
  const nsHead = (head.match(/<noscript>/g) || []).length, nsAll = (s.match(/<noscript>/g) || []).length;
  const hdr = (s.match(/<header class="site-header">/g) || []).length, ftr = (s.match(/<footer class="site-footer">/g) || []).length;
  const nsb = head.match(/<noscript>[\s\S]*?<\/noscript>/);
  const hb = s.match(/<header class="site-header">[\s\S]*?<\/header>/), fb = s.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  console.log(rel.padEnd(52), `crlf=${crlf} lf=${lf} stub=${stub} hdr=${hdr} ftr=${ftr} nsHead=${nsHead} nsAll=${nsAll} ns=${nsb ? h8(nsb[0]) : "-"} H=${hb ? h8(hb[0]) : "-"} F=${fb ? h8(fb[0]) : "-"} bom=${b[0] === 0xef}`);
}
